const { GoogleStrategy, express, expressSession, app,
    pgSession, dotenv, pg, knex, db, pool, cors,
    passport, passportLocal, localStrategy, bcrypt, jwt, 
    crypto, cookieParser, csrf, csrfProtection} = require('../../dependencies');

const Logout = (req, res) => {
    app.use(expressSession());
    console.log('logout: ',req.expressSession.passport.user)
    if(req.user) req.logout();
       req.session.destroy();
       res.send('Goodbye: ', req.expressSession.passport.user);
};

module.exports = {
    Logout : Logout
}