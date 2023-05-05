const { GoogleStrategy, express, app} = require('../../dependencies');
const cookieSession = require('cookie-session');
const passport = require('passport');
const expressSession = require('express-session');
const pgSession = require('connect-pg-simple')(expressSession);

const Logout = (req, res, next, passport) => {
    console.log('Logout route hit');
    console.log("beginning of logout block");
    
    req.session.destroy((err) => {
        if (err) {
          console.log(err);
        } else {
          res.clearCookie('connect.sid');
          req.logout((err)=>{if(err){return console.log(err)}});
          
        }
      });

    // res.clearCookie('connect.sid', { sameSite: true });
    //     res.send({data: "Logout was done"})
    
    // req.logout(function(err) {
    //     if (err) { return next(err); }
    //     console.log("logout block");
    // });
    console.log("end of logout block",req.session)
};

module.exports = {
    Logout : Logout
};