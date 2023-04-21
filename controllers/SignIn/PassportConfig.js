const { serialization } =  require('./serialization'); 

const { GoogleStrategy, express, expressSession, app,
  pgSession, dotenv, pg, knex, db, pool, cors,
  passport, passportLocal, localStrategy, bcrypt, jwt, 
  crypto, cookieParser, csrf, csrfProtection} = require('../../dependecies');

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
     serialization(passport);
};

module.exports = {
    PassportConfig : PassportConfig
};
