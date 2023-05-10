const { PassportConfig } =  require('./PassportConfig');      //configuration of passport
const { serialization } = require('./serialization');

const { GoogleStrategy, express, expressSession, app,
        pgSession, dotenv, pg, knex, db, pool, cors,
        passport, passportLocal, localStrategy, bcrypt, jwt, 
        crypto, cookieParser, csrf, csrfProtection} = require('../../dependencies');
//need to confirm when i use https instead of http whether cookies created when signed in or not
// since currently i am using http cookies are not created
const SignInLink = (req, res, next) => { 
//  console.log('getHeaders',res.getHeaders());                // logs the headers 
//  console.log('Signin request received:', req.body.email);
PassportConfig(passport);
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
      req.logIn(user, function(err) { //while logging in
        if (err) {
          // If there is an error, return the error to the client
          res.status(400).json({ message: 'Unable to sign in', error: err });
        }                                        
        // This condition checks if the user has selected the 'remember me' checkbox
        // if(req.body.remember) {
        //   // This object contains options for the cookie, including how long it should be stored for
        //   const cookieOpts = { maxAge: 30 * 1000, httpOnly: true };

        //   // If the app is in production, the cookie should be secure and encrypted
        //   if (process.env.NODE_ENV === 'production') {// process.env.NODE_ENV is an environment variable that is set by the Node.js runtime, and it can have different values depending on the environment in which the Node.js application is running.
        //     cookieOpts.secure = true;
        //   }

        //   // This sets the 'remember_me' cookie in the browser, with the user's id as the value
        //   res.cookie('remember_me', user.id, cookieOpts);
        // }
        req.session.user = user;
        return res.status(200).json({ message: 'success', user: { name: user.name } }); //restricting to back-end to send only name of the user
      });
    }
  })(req, res, next);  // Call the authenticate function with the current request and response objects as arguments
  
  serialization();
};

module.exports = {
  SignInLink: SignInLink
};

