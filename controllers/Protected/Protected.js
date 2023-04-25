const { GoogleStrategy, express, expressSession, app,
    pgSession, dotenv, pg, knex, db, pool, cors,
    passport, passportLocal, localStrategy, bcrypt, jwt, 
    crypto, cookieParser, csrf, csrfProtection} = require('../../dependencies');

const Protected = (req, res, app) => {
   
    try { 
        console.log(req.session.passport.user)
        res.send(req.session.passport.user); 
    }
    catch(error) { console.log(error) }
};

module.exports = {
    Protected : Protected
}