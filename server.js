const GoogleStrategy = require("passport-google-oauth20").Strategy;
const GitHubStrategy = require("passport-github").Strategy;
//back-end related imports
const express = require("express");
const expressSession = require("express-session"); //middleware: to call to generate a new session ID. 'In Memory' sessions handled with express, passport requires this
const app = express(); //represents entire web application. Used for setting middleware and handle HTTP requests and initializes express
const pgSession = require("connect-pg-simple")(expressSession);
//environmental configurations
const dotenv = require("dotenv"); //Access Env Vairiables
dotenv.config(); //runs .env file
//Database related imports
const pg = require("pg"); //PostgreSQL client for Node.js. allows communication between PostgreSQL and Node.js
const knex = require("knex"); // a SQL query builder for Node.js. allows to write SQL queries using JavaScript syntax, and provides a set of functions to build and execute queries, handle transactions.
const db = knex({
  client: "pg",
  connection: {
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
  },
});
//checking connection to the database
const pool = new pg.Pool({
  user: process.env.DATABASE_USER,
  host: process.env.DATABASE_HOST,
  database: process.env.DATABASE_NAME,
  password: process.env.DATABASE_PASSWORD,
  port: process.env.DATABASE_PORT,
});
pool.connect((err, client, release) => {
  if (err) {
    console.error("error connecting to database:", err);
    return;
  }
  client.query("SELECT NOW()", (err, result) => {
    release(); // release the client back to the pool
    if (err) {
      console.error("error executing query:", err);
      return;
    }
    console.log("database connected:", result.rows[0].now);
  });
});

pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.error("Error connecting to database", err.stack);
  } else {
    console.log("Database connected:", res.rows[0].now);
  }
});
const sessionStore = new pgSession({
  pool: pool,
  tableName: "session",
  sidFieldName: "sid",
  sessionColumnName: "sess",
  expireColumnname: "expire",
  schemaName: "public",
  prineSessionInterval: false,
  generateSid: undefined,
});
//Connection related imports
const cors = require("cors"); //middleware: Cross Origin Security
//Security related imports
const passport = require("passport"); //
const passportLocal = require("passport-local").Strategy; //local authentication strategy for passport
const localStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt"); //hashing password
//cookies
const cookieParser = require("cookie-parser");
// csrf
const csrf = require("csurf");
const csrfProtection = csrf({ cookie: true });
const pruneSessionInterval = BigInt(24 * 60 * 60 * 0);
//---------importing Routes from controllers folder---------------------//
const RootLink = require("./controllers/Root/root");
const SignInLink = require("./controllers/SignIn/signin");
const SignUpLink = require("./controllers/SignUp/signup");
const Logout = require("./controllers/Logout/Logout");
const Protected = require("./controllers/Protected/Protected");
//---------END OF importing Routes from controllers folder--------------//
//---------importing JS files from controllers folder-------------------//
const { GoogleOAuth } = require("./controllers/SignIn/GoogleOAuth");
const { GitHubOAuth } = require("./controllers/SignIn/GitHubOAuth");
const serialization = require("./controllers/SignIn/serialization");
//---------END OF importing JS files from controllers folder------------//
//---------Middlewear------------------//
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(
  cookieParser(process.env.SESSION_SECRET, {
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
  })
);
app.use(
  cors({
    origin: process.env.FRONT_END_URL,
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token"],
    methods: ["GET", "POST"],
  })
);
app.use(csrfProtection);
app.use(
  expressSession({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    name: "session_cookie",
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
      secure: process.env.NODE_ENV === "production" ? true : "auto",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      httpOnly: true,
      resave: false,
      saveUninitialized: false,
    },
  })
);
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  next();
});
app.set("trust proxy", true);
//---------END OF Middlewear------------------//
const setCSRFToken = (req, res, next) => {
  // Get the CSRF token from the request header
  req.clientCSRFToken = req.headers["x-csrf-token"];

  // Get the CSRF token stored on the server
  req.serverCSRFToken = req.session.csrfToken;
  // Call the next middleware or route handler
  next();
};
// ---------- Initializing Passport ----------- //
serialization(db, passport);
app.use(passport.initialize());
app.use(passport.session());
// ------ Initializing Google and GitHub OAuth ----//
GoogleOAuth(req, res, pool, passport, GoogleStrategy);
GitHubOAuth(req, res, pool, passport, GitHubStrategy);
// ---------------- ROUTES ----------------- //
app.get("/csrf-token", (req, res) => {
  const csrfToken = req.csrfToken(); // Generates the CSRF token
  req.session.csrfToken = csrfToken; // token in the session
  res.json({ csrfToken: csrfToken });
});
app.get("/", csrfProtection, setCSRFToken, (req, res) => {
  RootLink.RootLink(req, res);
});

app.post("/signin", csrfProtection, setCSRFToken, (req, res) => {
  SignInLink.SignInLink(req, res, next, db, passport);
});

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    successRedirect: `${FRONT_END_URL}`,
    failureRedirect: "/auth/failure",
  })
);

app.get("/auth/failure/", (req, res) => {
  res.send("something went wrong..");
});

app.get("/auth/github", passport.authenticate("github"));

app.get(
  "/auth/github/callback",
  passport.authenticate("github", {
    failureRedirect: `${FRONT_END_URL}/signin`,
    successRedirect: `${FRONT_END_URL}/`,
  })
);

app.get(
  "/protected",
  (req, res, next) => {
    if (req.isAuthenticated()) {
      next();
    } else {
      res.send("You are not authorized for this");
    }
  },
  (req, res) => {
    Protected.Protected();
  }
);

app.delete("/logout", csrfProtection, setCSRFToken, (req, res, next) => {
  req.logout();
  res.clearCookie("session_cookie");
  res.send("Logged out successfully");
});

app.post("/signup", csrfProtection, setCSRFToken, (req, res) => {
  SignUpLink.SignUpLink(req, res, db, bcrypt);
});
// ---------------- END OF ROUTES ----------------- //

// Start the server
app.listen(process.env.PORT, () => {
  console.log(`App is running on port ${process.env.PORT}`);
});
