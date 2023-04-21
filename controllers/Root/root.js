const { GoogleStrategy, express, expressSession, app,
    pgSession, dotenv, pg, knex, db, pool, cors,
    passport, passportLocal, localStrategy, bcrypt, jwt, 
    crypto, cookieParser, csrf, csrfProtection} = require('../../dependecies');

const RootLink = (req, res, db) => {
        db.select('*')
          .from('users')
          .then(response => {
              res.json(response);
              res.send('<a href="/auth/google">Authenticate with Google </a>');
            // Set a cookie with SameSite=None
            res.setHeader('Set-Cookie', cookie.serialize('myCookie', 'myValue', {
                sameSite: 'none',
                secure: true }))
          })
          .catch(error => {
              res.status(400).json('there has been an error: ', error);
          });
};

module.exports = {
    RootLink: RootLink
};
