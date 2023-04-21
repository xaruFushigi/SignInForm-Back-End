const bcrypt        = require('bcrypt');
const localStrategy = require('passport-local').Strategy;
const passport = require('passport');
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

const serialization = () => {
    passport.serializeUser((user, done)=> {
        done(null, user.id);
    });
    //takes that cookie and unravels it and returns a user from it 
    passport.deserializeUser((id, done)=> {
        db.select('name').from('users').where('id', '=', id) //restrciting to retrieve only user name from database
          .then(user => {
            //  done(null, user[0]);
            const userInformation = {name : user[0].name}
                  done(null, userInformation);
          })
          .catch(error => done(error));
    });
}

module.exports = {
    serialization : serialization
}