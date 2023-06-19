const GoogleStrategy = require("passport-google-oauth20").Strategy;
const GitHubStrategy = require("passport-github").Strategy;
//back-end related imports
const express = require("express");
const expressSession = require("express-session"); //middleware: to call to generate a new session ID. 'In Memory' sessions handled with express, passport requires this
const app = express(); //represents entire web application. Used for setting middleware and handle HTTP requests and initializes express
//environmental configurations
const dotenv = require("dotenv"); //Access Env Vairiables
dotenv.config(); //runs .env file
//Database related imports
const pg = require("pg"); //PostgreSQL client for Node.js. allows communication between PostgreSQL and Node.js
const pgSession = require("connect-pg-simple")(expressSession);
const knex = require("knex"); // a SQL query builder for Node.js. allows to write SQL queries using JavaScript syntax, and provides a set of functions to build and execute queries, handle transactions.
const db = knex({
  client: "pg",
  connection: {
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: true },
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
const pruneSessionInterval = BigInt(24 * 60 * 60 * 0);
//Connection related imports
const cors = require("cors"); //middleware: Cross Origin Security
//LogIn related imports
const passport = require("passport"); //
const passportLocal = require("passport-local").Strategy; //local authentication strategy for passport
const bcrypt = require("bcrypt"); //hashing password
//cookies
const cookieParser = require("cookie-parser");
// csrf
const csrf = require("csurf");
const csrfProtection = csrf({ cookie: true });

//---------Implementation Middlewear------------------//
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
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
    methods: ["GET", "POST", "OPTIONS"],
  })
);
app.use(csrfProtection);

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", `${process.env.FRONT_END_URL}`);
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  next();
});
app.set("trust proxy", true);
//---------END OF Implementation Middlewear------------------//

// ---------- Initializing Passport ----------- //
app.use(passport.initialize());
app.use(passport.session());
// ---------- END OF Initializing Passport ----------- //

//-------- Creating csrf token -----------//
const setCSRFToken = (req, res, next) => {
  // Get the CSRF token from the request header
  req.clientCSRFToken = req.headers["x-csrf-token"];

  // Get the CSRF token stored on the server
  req.serverCSRFToken = req.session.csrfToken;
  // Call the next middleware or route handler
  next();
};
//-------- END OF Creating csrf token -----------//

// ---------- serializaiton of passport ------------ //
const Serialization = (passport, db) => {
  passport.serializeUser((user, done) => {
    // loads into req.session.passport.user
    console.log("serializeUser", user);
    done(null, user);
  });
  //retriveing user data from the session using the 'user' parameter and use it to fetch data
  //->from the database and then passes it to 'done' function.
  passport.deserializeUser((user, done) => {
    console.log("deserialize", user);
    // Retrieve user data from the database using the user ID
    db("users")
      .where({ id: user.id })
      .first()
      .then((user) => {
        done(null, user);
      })
      .catch((err) => {
        done(err, null);
      });
  });
};
Serialization(passport, db);
// -------END OF serialization of passport -------- //

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
GoogleOAuth(pool, passport, GoogleStrategy);
GitHubOAuth(pool, passport, GitHubStrategy);
//---------END OF importing JS files from controllers folder------------//

// ------ Initializing Google and GitHub OAuth ----//

// ---------------- ROUTES ----------------- //
// CSRF TOKEN
app.get("/csrf-token", (req, res) => {
  const csrfToken = req.csrfToken(); // Generates the CSRF token
  req.session.csrfToken = csrfToken; // token in the session
  res.json({ csrfToken: csrfToken });
});
// ROOT
app.get("/", (req, res) => {
  RootLink.RootLink(req, res);
});
// SIGNUP
app.post("/signup", (req, res) => {
  SignUpLink.SignUpLink(req, res, db, bcrypt);
});
// SIGNIN
app.post("/signin", csrfProtection, setCSRFToken, (req, res, next) => {
  SignInLink(req, res, next, passport, passportLocal, db, bcrypt);
});
// GOOGLE OAUTH2.0
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    successRedirect: `${process.env.FRONT_END_URL}`,
    failureRedirect: "/auth/failure",
  })
);

app.get("/auth/failure/", (req, res) => {
  res.send("something went wrong..");
});
// GITHUB OAUTH2.0
app.get("/auth/github", passport.authenticate("github"));

app.get(
  "/auth/github/callback",
  passport.authenticate("github", {
    failureRedirect: `${process.env.FRONT_END_URL}/signin`,
    successRedirect: `${process.env.FRONT_END_URL}/`,
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
// LOGOUT
app.post("/logout", (req, res, next) => {
  Logout.Logout(req, res);
});
// ALL ROUTE CATCH
app.all("*", (req, res) => {
  res.status(404).json({ message: "Route not found" });
});
// ---------------- END OF ROUTES ----------------- //

// Start the server
app.listen(process.env.PORT, () => {
  console.log(`App is running on port ${process.env.PORT}`);
});
