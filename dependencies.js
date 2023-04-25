const GoogleStrategy = require('passport-google-oauth20').Strategy;
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
    password: process.env.DATABASE_PASSWOR,
    port:     process.env.DATABASE_PORT,
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
const localStrategy = require('passport-local').Strategy;
const bcrypt   = require('bcrypt');  //hashing password
const jwt      = require('jsonwebtoken');   //jsonwebtoken for creating unique access point for each user 
const crypto   = require('crypto');     
//cookies
const cookieParser = require('cookie-parser');

const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });


module.exports = {
    GoogleStrategy,
    express,
    expressSession,
    app,
    pgSession,
    dotenv,
    pg,
    knex,
    db,
    pool,
    cors,
    passport,
    passportLocal,
    localStrategy,
    bcrypt,
    jwt,
    crypto,
    cookieParser,
    csrf,
    csrfProtection
}