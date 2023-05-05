const { GoogleStrategy, express, expressSession, app,
    pgSession, dotenv, pg, knex, db, pool, cors,
    passport, passportLocal, localStrategy, bcrypt, jwt, 
    crypto, cookieParser, csrf, csrfProtection} = require('../../dependencies');

const Protected = (req, res, app) => {
   
    try { 
        console.log(`isLoggedIn gave access for ${req.session.passport.user} to Protected Route`)
    }
    catch(error) { console.log(error) }
};

module.exports = {
    Protected : Protected
}