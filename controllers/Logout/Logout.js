const { GoogleStrategy, express, expressSession, app,
    pgSession, dotenv, pg, knex, db, pool, cors,
    passport, passportLocal, localStrategy, bcrypt, jwt, 
    crypto, cookieParser, csrf, csrfProtection} = require('../../dependencies');

const Logout = (req, res) => {
    console.log('logout: ',req.session.passport.user)
    if(req.user) {req.logout()};
        req.session.destroy();
        res.send('Goodbye: ', req.session.passport.user);
};

module.exports = {
    Logout : Logout
}