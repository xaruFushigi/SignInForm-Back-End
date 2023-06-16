// Importing dependencies
const express = require('express');
const expressSession = require('express-session');
const app = express();
const cookieParser = require('cookie-parser');
const cors = require('cors');
const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const { Strategy: GitHubStrategy } = require('passport-github2');
const knex = require('knex');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const sessionStore = new expressSession.MemoryStore();

// Importing JS files from controllers folder
const { GoogleOAuth } = require('./controllers/SignIn/GoogleOAuth');
const { GitHubOAuth } = require('./controllers/SignIn/GitHubOAuth');
const serialization = require('./controllers/SignIn/serialization');

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
serialization();
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
