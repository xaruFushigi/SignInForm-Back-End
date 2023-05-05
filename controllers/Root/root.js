const { GoogleStrategy, express, expressSession, app,
    pgSession, dotenv, pg, knex, db, pool, cors,
    passport, passportLocal, localStrategy, bcrypt, jwt, 
    crypto, cookieParser, csrf, csrfProtection} = require('../../dependencies');

const RootLink = (req, res, db) => {
    
};

module.exports = {
    RootLink: RootLink
};
