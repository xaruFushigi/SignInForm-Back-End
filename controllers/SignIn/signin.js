const { PassportConfig }     =  require('./PassportConfig');      //configuration of passport
 
const express = require('express');
const passport = require('passport');
const passportLocal = require('passport-local');
const cookieParser = require('cookie-parser');

const app = express();
app.use(passport.initialize());                 //initializes passport
app.use(passport.session());                    //initializes session part of passport
app.use(express.json());
app.use(cookieParser('secretcode'));

const SignInLink = (req, res, next, passport, express, passportLocal, app) => {
//  console.log(res.getHeaders());                // logs the headers 
//console.log('Signin request received:', req.body.email);
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
      req.logIn(user, function(err) {
        if (err) {
          // If there is an error, return the error to the client
          res.status(400).json({ message: 'Unable to sign in', error: err });
        } else {
          // If the user is logged in, return the user object to the client
          res.status(200).json({message: 'success',  user: { name: user.name }});     //including re.json is crucial. otherwise front-end will not receive json format
        };                                           //restricting to back-end to send only name of the user
      });
    }
  })(req, res, next);  // Call the authenticate function with the current request and response objects as arguments
};

module.exports = {
  SignInLink: SignInLink
};

