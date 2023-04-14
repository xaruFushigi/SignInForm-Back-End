//back-end related imports
const express = require('express');
const app     = express();          //represents entire web application. Used for setting middleware and handle HTTP requests
const expressSession = require('express-session'); //middleware: to call to generate a new session ID
//Database related imports
const pg      = require('pg');      //PostgreSQL client for Node.js. allows communication between PostgreSQL and Node.js
const knex    = require('knex');    // a SQL query builder for Node.js. allows to write SQL queries using JavaScript syntax, and provides a set of functions to build and execute queries, handle transactions.
const db      = knex({              //database details
    client: 'pg',                   //postgreSQL database
    connection: {                   //details of database
        host:     'localhost',      
        port:      5432,
        user:     'postgres',
        password: 'myselfmyself11',
        database: 'smart-brain'
    }
});
//checking whether database is connected or not
const pool = new pg.Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'smart-brain',
    password: 'myselfmyself11',
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
const cors    = require('cors');    //middleware: OpenSSL
//Security related imports
const passport = require('passport'); //
const passportLocal = require('passport-local').Strategy;
const bcrypt   = require('bcrypt');  //hashing password
const jwt      = require('jsonwebtoken');//jsonwebtoken for creating unique access point for each user 
const crypto   = require('crypto');     
const dotenv   = require('dotenv');
//cookies
const cookieParser = require('cookie-parser');
//PORT
const PORT    = 3050;   //bash -> PORT=3050 node server.cjs
//importing functions from controllers folder
const RootLink   = require('./controllers/root');
const SignInLink = require('./controllers/signin');
const SignUpLink = require('./controllers/signup');
///////////////////////////////////////////////////////////////
//Middleware
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
                resave:  true,
                saveUninitialized: true
        }));
        app.use(cookieParser('secretcode'));            //should be same 'secret' as in expressSession
//Routes
        //ROOT
        app.get('/', (req, res)=>{RootLink.RootLink(req, res, db, bcrypt)});
        //SIGNIN
        app.post('/signin', (req, res)=> {SignInLink.SignInLink(req, res, db, bcrypt)});  // Define a new route for handling POST requests to '/signin'
        //SIGNUP||REGISTER
//SIGNUP||REGISTER
// When the server receives a POST request to the '/signup' route, it will execute the following code:
        app.post('/signup', async (req, res) => {
            try {
            // Extract the name, email, and password fields from the request body sent by the client:
            const { name, email, password } = req.body;
        
            // Check if a user with the given email already exists in the 'login' table of the database:
            const existingUser = await db('login').where({ email }).first();
            if (existingUser) {
                // If such a user exists, send an HTTP response with status code 400 and an error message:
                return res.status(400).json({ error: 'User already exists' });
            }
        
            // If the user does not already exist, insert a new user with the given name, email, and registration date into the 'users' table of the database:
            const newUser = await db('users').insert({
                name,
                email,
                joined: new Date()
            }).returning('*');
        
            // Insert the hashed password into the 'login' table of the database along with the user's email:
            await db('login').insert({
                email,
                hash: password
            });
        
            // Send an HTTP response with status code 201, the newly created user object, and a success message:
            res.status(201).json({ user: newUser[0], message: 'User created successfully' });
            } catch (error) {
            // If there was an error during this process, log the error and send an HTTP response with status code 500 and an error message:
            console.log(error);
            res.status(500).json({ error: 'Internal Server Error' });
            }
        });    
        // Define a new route for handling POST requests to '/signin'
//Start of server
app.listen(PORT, ()=>{console.log(`app is running in port ${PORT}`)});

  