const { GoogleStrategy, express, expressSession, app,
    pgSession, dotenv, pg, knex, db, pool, cors,
    passport, passportLocal, localStrategy, bcrypt, jwt, 
    crypto, cookieParser, csrf, csrfProtection} = require('../../dependencies');

const Protected = (req, res, app) => {
   
    try { 
        res.send('Protected route accessed successfully');
    }
    catch(error) { console.log(error) }
};

module.exports = {
    Protected : Protected
}