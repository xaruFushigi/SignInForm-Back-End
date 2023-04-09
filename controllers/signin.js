const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const SignInLink = (req, res, db, bcrypt) => {

  const { email, password } = req.body;      // Retrieve the email and password from the request body
                                             // -> req.body is used ONLY for POST requests

  // Set up the local strategy for Passport, which will be used for authenticating users
  passport.use(new LocalStrategy({
      usernameField: 'email',   // Use the email field as the username field
      passwordField: 'password' // Use the password field as the password field
    },
    function(email, password, done) {  // This is the authentication function that Passport will use to verify the user's credentials

      // Check the database for a user with the provided email
      db.select('email', 'hash')
        .from('login')
        .where('email', '=', email)
        .then(data => {
          const isValid = bcrypt.compareSync(password, data[0].hash);  // Use bcrypt to compare the provided password with the hashed password from the database
          if (isValid) {
            // If the password is correct, retrieve the user from the 'users' table
            return db.select('*')
                     .from('users')
                     .where('email', '=', email)
                     .then(user => {
                       done(null, user[0]);  // Return the first matching user as an authenticated user to Passport
                     })
                     .catch(err => done(err));  // If there is an error, return the error to Passport
          } else {
            // If the password is incorrect, return an error message to Passport
            done(null, false, { message: 'Invalid password' });
          }
        })
        .catch(err => done(err));  // If there is an error, return the error to Passport
    }
  ));

  // Authenticate the user using Passport
  passport.authenticate('local', function(err, user, info) {
    if (err) {
      // If there is an error, return the error to the client
      res.status(400).json({ message: 'Unable to sign in', error: err });
    } else if (!user) {
      // If the user cannot be authenticated, return an error message to the client
      res.status(400).json({ message: 'Invalid email or password' });
    } else {
      // If the user is authenticated, log them in
      req.logIn(user, function(err) {
        if (err) {
          // If there is an error, return the error to the client
          res.status(400).json({ message: 'Unable to sign in', error: err });
        } else {
          // If the user is logged in, return the user object to the client
          res.json(user);
        }
      });
    }
  })(req, res);  // Call the authenticate function with the current request and response objects as arguments
};

module.exports = {
  SignInLink: SignInLink
};


