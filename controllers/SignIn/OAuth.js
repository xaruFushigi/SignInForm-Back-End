const { GoogleStrategy, express, expressSession, app,
    pgSession, dotenv, pg, knex, db, pool, cors,
    passport, passportLocal, localStrategy, bcrypt, jwt, 
    crypto, cookieParser} = require('../../dependecies');

const OAuth = () => {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: 'http://localhost:3000/auth/google/callback', //should be same as Google's Authorized redirect URIs
        scope: [ 'profile', 'email' ],                             //what is going to be visible of user's account
        state: true
      },
      function verify(accessToken, refreshToken, profile, cb) {
          //Called on Successful Authentication
            //insert into database
            pool.query('SELECT * FROM users WHERE googleId = $1', [profile.id], (err, res) => {
                if (err) {
                  return done(err);
                }
          
                if (res.rows.length) {
                  return done(null, res.rows[0]);
                } else {
                  pool.query('INSERT INTO users (googleId, displayName, email) VALUES ($1, $2, $3) RETURNING *',
                    [profile.id, profile.displayName, profile.emails[0].value], (err, res) => {
                      if (err) {
                        return done(err);
                      }
          
                      return done(null, res.rows[0]);
                    });
                }
            return cb(err, profile);
        }
    )}));
    
};

module.exports = {
    OAuth : OAuth
};