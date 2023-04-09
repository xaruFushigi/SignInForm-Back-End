const express = require('express');
const pg      = require('pg');      //PostgreSQL client for Node.js. allows communication between PostgreSQL and Node.js
const app     = express();          //represents entire web application. Used for setting middleware and handle HTTP requests
const knex    = require('knex');    // a SQL query builder for Node.js. allows to write SQL queries using JavaScript syntax, and provides a set of functions to build and execute queries, handle transactions.
const cors    = require('cors');    //OpenSSL
const bcrypt  = require('bcrypt');  //hashing password
const jwt     = require('jsonwebtoken');//jsonwebtoken for creating unique access point for each user 
const crypto  = require('crypto');
const dotenv  = require('dotenv');
const passport = require('passport');
const PORT    = process.env.PORT;   //bash -> PORT=3050 node server.cjs
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
//importing functions
const RootLink   = require('./controllers/root');
const SignInLink = require('./controllers/signin');
        app.use(cors());                                // cors middlewear for OpenSSL
        app.use(express.urlencoded({extended: false})); // middleware function parses incoming requests with urlencoded payloads (i.e., key-value pairs) 
                                                        //  -> and populates the req.body object with the parsed data. 
                                                        //  -> The extended option is set to false, which tells the parser to use the classic encoding,
                                                        //  -> where values can be only strings or arrays, and not any other type.
                                                        //  -> In short, this line of code enables the server to parse incoming request
                                                        //  -> data in the URL-encoded format and make it available in the req.body object.
        app.use(express.json());                        // incoming JSON payloads to be parsed and set on the request.body property.
        //ROOT
        app.get('/', (req, res)=>{RootLink.RootLink(req, res, db, bcrypt)});
        //SIGNIN
        app.post('/signin', (req, res)=> {SignInLink.SignInLink(req, res, db, bcrypt)});  // Define a new route for handling POST requests to '/signin'


app.listen(PORT, ()=>{console.log(`app is running in port ${PORT}`)});

  