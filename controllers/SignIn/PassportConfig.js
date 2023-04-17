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

const PassportConfig = () => { 
    passport.use(
        new localStrategy({
            usernameField: 'email',
            passwordField: 'password'
            },
            function(email, password, done) {
                // Check the database for a user with the provided email
                db.select('email', 'hash')
                  .from('login')
                  .where('email', '=', email)
                  .then(data => {
                    const isValid = bcrypt.compare(password, data[0].hash);  // Use bcrypt to compare the provided password with the hashed password from the database
                    if (isValid) {
                      // If the password is correct, retrieve the user from the 'users' table
                      return db.select('*')
                               .from('users')
                               .where('email', '=', email)
                               .then(user => {
                                 done(null, user[0]);  // Return the first matching user as an authenticated user to Passport
                               })
                               .catch(err => done(err));  // If there is an error, return the error to Passport
                    }   //end of if 
                    else {
                      // If the password is incorrect, return an error message to Passport
                      done(null, false, { message: 'Invalid password' });
                    } //end of else
                  })//end of then of data parameter
                  .catch(error => console.log(error)) //end of caatch
            }
        )
    )
    //stores a cookie inside the browser. 
    // ->Take a user that we got cfrom a localStrategy and create a cookie
    // ->with User ID inside of it
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
};

module.exports = {
    PassportConfig : PassportConfig
};
