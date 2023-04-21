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
        password: `${process.env.DATABASE_PASSWORD}`,
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
//---------importing Routes from controllers folder---------------------//
const RootLink   = require('./controllers/Root/root');
const SignInLink = require('./controllers/SignIn/signin');
const SignUpLink = require('./controllers/SignUp/signup');
//---------END OF importing Routes from controllers folder--------------//
require('./controllers/SignIn/OAuth');
//------------------------------Middleware------------------------------//
        app.use(cors({
            origin: 'http://localhost:3000',            //should be same port as in React-App port
            credentials: true                           //must be true
        }));                                            //middleware: for OpenSSL
        app.use(express.urlencoded({extended: false})); // middleware function parses incoming requests with urlencoded payloads (i.e., key-value pairs) 
                                                        //  -> and populates the req.body object with the parsed data. 
                                                        //  -> The extended option is set to false, which tells the parser to use the classic encoding,
                                                        //  -> where values can be only strings or arrays, and not any other type.
                                                        //  -> In short, this line of code enables the server to parse incoming request
                                                        //  -> data in the URL-encoded format and make it available in the req.body object.
        app.use(express.json());                        // incoming JSON payloads to be parsed and set on the request.body property.
        app.use(expressSession({
                secret: 'secretcode',
                resave:  false,
                saveUninitialized: false,
                store: new pgSession({
                    pool: pool,
                    tableName: 'session'               //necessary to create separate 'sesion' table in the database
                }),
                cookie: { maxAge: 30 * 1000 } //set cookie max age to 1 day
        }
        ));
        app.use(cookieParser('secretcode'));            //should be same 'secret' as in expressSession
//------------------------------END OF Middleware------------------------------//

//------------------------------Routes-----------------------------------------//
        //ROOT
        app.get('/', (req, res)=>{RootLink.RootLink(req, res, db)});
        //SIGNIN
        app.post('/signin', (req, res, next)=> {SignInLink.SignInLink(req, res, next, passport, express, passportLocal, app, pool, dotenv)});  // Define a new route for handling POST requests to '/signin'
        // Authenticate the user using Google OAuth2.0
        app.get('/auth/google', passport.authenticate('google'));
        
        app.get('/oauth2/redirect/google',
                passport.authenticate('google', { failureRedirect: '/signup', failureMessage: true }),
                function(req, res) {
                    //Successful authentication, redirect home
                    res.redirect('/');
                });
        //SIGNUP||REGISTER
        // When the server receives a POST request to the '/signup' route, it will execute the following code:
        app.post('/signup', (req, res) => { SignUpLink.SignUpLink(req, res, db, bcrypt)});    
        // Define a new route for handling POST requests to '/signin'
//------------------------------END OF Routes--------------------------------//
//Start of server
app.listen(`${process.env.PORT}`, ()=>{console.log(`app is running in port ${process.env.PORT}`)});