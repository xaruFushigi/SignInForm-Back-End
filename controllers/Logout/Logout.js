const { GoogleStrategy, express, app} = require('../../dependencies');
const cookieSession = require('cookie-session');
const passport = require('passport');
const expressSession = require('express-session');
const pgSession = require('connect-pg-simple')(expressSession);

const Logout = (req, res, next, passport) => {
    console.log('Logout route hit');
    //clearing cookies
    res.clearCookie('session_cookie', { path: "/" })
    // Destroy the session
    req.session.destroy((err) => {
      if (err) { console.log('Error destroying session:', err); } 
      else { console.log('Session destroyed'); }
  });
    //to check whether session has been destoyed
      if(req.session) { console.log('session is still active', req.session) }
      else{ console.log('session has been destroyed') }
      return res.status(200).json({message: 'succesfully logged out'})
};

module.exports = {
    Logout : Logout
};