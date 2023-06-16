const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github').Strategy;
const RememberMeStrategy = require('passport-remember-me').Strategy;
//back-end related imports
const express = require('express');
const expressSession = require('express-session');              //middleware: to call to generate a new session ID. 'In Memory' sessions handled with express, passport requires this
const app     = express();                                      //represents entire web application. Used for setting middleware and handle HTTP requests and initializes express
const  pgSession = require('connect-pg-simple')(expressSession)
//environmental configurations
const dotenv   = require('dotenv');                              //Access Env Vairiables
      dotenv.config();                                           //runs .env file 
//Database related imports
const pg      = require('pg');                                   //PostgreSQL client for Node.js. allows communication between PostgreSQL and Node.js
const knex    = require('knex');                                 // a SQL query builder for Node.js. allows to write SQL queries using JavaScript syntax, and provides a set of functions to build and execute queries, handle transactions.
const db      = knex({                                           //database details
    client: 'pg',                                                //postgreSQL database
    connection: {                                                //details of database
        host:     process.env.DATABASE_HOST,      
        port:     process.env.DATABASE_PORT,
        user:     process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_NAME
    }
});
//checking whether database is connected or not
const pool = new pg.Pool({
    user:     process.env.DATABASE_USER,
    host:     process.env.DATABASE_HOST,
    database: process.env.DATABASE_NAME,
    password: process.env.DATABASE_PASSWORD,
    port:     process.env.DATABASE_PORT,
  });
  
       pool.query('SELECT NOW()', (err, res) => {
            if (err) {
            console.error('Error connecting to database', err.stack);
            } else {
            console.log('Database connected:', res.rows[0].now);
            }
        });
const sessionStore = new pgSession({
        pool: pool,
        tableName: 'session'
});
//Connection related imports
const cors    = require('cors');    //middleware: Cross Origin Security
//Security related imports
const passport = require('passport'); //
const passportLocal = require('passport-local').Strategy; //local authentication strategy for passport
const localStrategy = require('passport-local').Strategy;
const bcrypt   = require('bcrypt');  //hashing password
const jwt      = require('jsonwebtoken');   //jsonwebtoken for creating unique access point for each user 
const crypto   = require('crypto');     
//cookies
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });
const pruneSessionInterval = BigInt(24 * 60 * 60 * 0);
//---------importing Routes from controllers folder---------------------//
const RootLink   = require('./controllers/Root/root');
const SignInLink = require('./controllers/SignIn/signin');
const SignUpLink = require('./controllers/SignUp/signup');
const Logout     = require('./controllers/Logout/Logout');
const Protected  = require('./controllers/Protected/Protected');
const  serialization   = require('./controllers/SignIn/serialization');
//---------END OF importing Routes from controllers folder--------------//
//---------importing JS files from controllers folder-------------------//
const { GoogleOAuth }  = require('./controllers/SignIn/GoogleOAuth');
const { GitHubOAuth }  = require('./controllers/SignIn/GitHubOAuth');
const { serialization }  = require('./controllers/SignIn/serialization');
//---------END OF importing JS files from controllers folder------------//
// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser(process.env.SESSION_SECRET, { sameSite: 'Lax' }));
app.use(
  cors({
    origin: process.env.FRONT_END_URL,
    credentials: true,
    allowedHeaders: ['Content-Type'],
    methods: ['GET', 'POST', 'DELETE'],
  })
);
app.use(
  expressSession({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    name: 'session_cookie',
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
      secure: true,
      sameSite: 'none',
      httpOnly: true,
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Google OAuth configuration
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/auth/google/callback',
    },
    (accessToken, refreshToken, profile, done) => {
      // Add your Google authentication logic here
      // Call the done() function to indicate success or failure
    }
  )
);

// GitHub OAuth configuration
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: '/auth/github/callback',
    },
    (accessToken, refreshToken, profile, done) => {
      // Add your GitHub authentication logic here
      // Call the done() function to indicate success or failure
    }
  )
);

// Routes
app.get('/', (req, res) => {
  // Handle root route
});

app.post('/signin', (req, res, next) => {
  // Handle sign-in route
});

app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback', passport.authenticate('google', {
  successRedirect: 'http://localhost:3000/',
  failureRedirect: '/auth/failure',
}));

app.get('/auth/failure/', (req, res) => {
  res.send('something went wrong..');
});

app.get('/auth/github', passport.authenticate('github'));

app.get('/auth/github/callback', passport.authenticate('github', {
  failureRedirect: 'http://localhost:3000/signin',
  successRedirect: 'http://localhost:3000/',
}));

app.get('/protected', (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.send('You are not authorized for this');
  }
}, (req, res) => {
  // Handle protected route
});

app.delete('/logout', (req, res, next) => {
  req.logout();
  res.clearCookie('session_cookie');
  res.send('Logged out successfully');
});

app.post('/signup', (req, res) => {
  // Handle sign-up route
});

// Start the server
app.listen(process.env.PORT, () => {
  console.log(`App is running on port ${process.env.PORT}`);
});
// Initializing Google and GitHub OAuth
GoogleOAuth();
GitHubOAuth();
