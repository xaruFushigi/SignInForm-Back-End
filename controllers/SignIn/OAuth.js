const GoogleStrategy = require('passport-google-oauth20').Strategy;
//back-end related imports
const express = require('express');
const expressSession = require('express-session'); //middleware: to call to generate a new session ID. 'In Memory' sessions handled with express, passport requires this
const app     = express();          //represents entire web application. Used for setting middleware and handle HTTP requests
const  pgSession = require('connect-pg-simple')(expressSession)
//environmental configurations
const dotenv   = require('dotenv');             //Access Env Vairiables
dotenv.config();                                //runs .env file 
//Database related imports
const pg      = require('pg');      //PostgreSQL client for Node.js. allows communication between PostgreSQL and Node.js
const knex    = require('knex');    // a SQL query builder for Node.js. allows to write SQL queries using JavaScript syntax, and provides a set of functions to build and execute queries, handle transactions.
const db      = knex({              //database details
    client: 'pg',                   //postgreSQL database
    connection: {                   //details of database
        host:     'localhost',      
        port:      5432,
        user:     `${process.env.DATABASE_USER}`,
        password: `${process.env.DATABASE_PASSWOR}`,
        database: `${process.env.DATABASE_NAME}`
    }
});
//checking whether database is connected or not
const pool = new pg.Pool({
    user: `${process.env.DATABASE_USER}`,
    host: 'localhost',
    database: `${process.env.DATABASE_NAME}`,
    password: `${process.env.DATABASE_PASSWOR}`,
    port: 5432,
  });
  
       pool.query('SELECT NOW()', (err, res) => {
            if (err) {
            console.error('Error connecting to database', err.stack);
            } else {
            console.log('Database connected:', res.rows[0].now);
            }
        });
//Connection related imports
const cors    = require('cors');    //middleware: Cross Origin Security
//Security related imports
const passport = require('passport'); //
const passportLocal = require('passport-local').Strategy; //local authentication strategy for passport
        // the google strategy for  passport
        // twitter authentication strategy with passport
        // github authentication with passport
const bcrypt   = require('bcrypt');  //hashing password
const jwt      = require('jsonwebtoken');   //jsonwebtoken for creating unique access point for each user 
const crypto   = require('crypto');     

//cookies
const cookieParser = require('cookie-parser');
const OAuth = () => {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: 'http://localhost:3050/oauth2/redirect/google',
        scope: [ 'profile', 'email' ],
        state: true
      },
      function verify(accessToken, refreshToken, profile, cb) {
          //Called on Successful Authentication
            //insert into database
        // db.get('SELECT * FROM federated_credentials WHERE provider = ? AND subject = ?', [
        //   'https://accounts.google.com',
        //   profile.id
        // ], function(err, cred) {
        //   if (err) { return cb(err); }
        //   console.log(profile);
        //   if (!cred) {
        //     // The account at Google has not logged in to this app before.  Create a
        //     // new user record and associate it with the Google account.
        //     db.run('INSERT INTO users (name) VALUES (?)', [
        //       profile.displayName
        //     ], function(err) {
        //       if (err) { return cb(err); }
    
        //       var id = this.lastID;
        //       db.run('INSERT INTO federated_credentials (user_id, provider, subject) VALUES (?, ?, ?)', [
        //         id,
        //         'https://accounts.google.com',
        //         profile.id
        //       ], function(err) {
        //         if (err) { return cb(err); }
        //         var user = {
        //           id: id,
        //           name: profile.displayName
        //         };
        //         return cb(null, user);
        //       });
        //     });
        //   } else {
        //     // The account at Google has previously logged in to the app.  Get the
        //     // user record associated with the Google account and log the user in.
        //     db.get('SELECT * FROM users WHERE id = ?', [ cred.user_id ], function(err, row) {
        //       if (err) { return cb(err); }
        //       if (!row) { return cb(null, false); }
        //       return cb(null, row);
        //     });
        //   }
        // });
            return cb(err, profile);
        }
    ));
    
    passport.serializeUser(function(user, done) {
        done(null, user);
    });

    passport.deserializeUser(function(user, done){
        done(null, user);
    });
    app.use(passport.initialize());
};

module.exports = {
    OAuth : OAuth
};