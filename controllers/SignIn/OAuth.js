const { GoogleStrategy, express, expressSession, app, pgSession, dotenv, pg, knex, db, pool, cors, passport, passportLocal, localStrategy, bcrypt, jwt, crypto, cookieParser, csrf, csrfProtection } = require('../../dependencies');
const { v4: uuidv4 } = require('uuid');
const { PassportConfig } =  require('./PassportConfig');      //configuration of passport
const { serialization } = require('./serialization');
const { verify } = require('crypto');

const OAuth = (req, res) => {

passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: 'http://localhost:3050/auth/google/callback', //should be same as Google's Authorized redirect URIs
      scope: [ 'profile', 'email' ],                             //what is going to be visible of user's account
      state: true
    },
    //callback function
    async (accessToken, refreshToken, profile, done) => {
      const account = profile._json;
      let user = {};
      try {
        const currentUserQuery = await pool.query(
          'SELECT * FROM users WHERE googleid = $1', 
           [account.sub]
        );
        //if no such user exists in the database
        if(currentUserQuery.rows.length === 0) {
          //create user
          await pool.query(
            'INSERT INTO users (name, email, joined, googleid, displayname) VALUES ($1, $2, $3, $4, $5)',
            [account.given_name, account.email, new Date(), account.sub, account.name]
          );
          const id = await pool.query('SELECT id FROM users WHERE googleid = $1', [account.sub]);
          user = {
            id: id.rows[0].id,
            name: account.name
          }
        } //END OF if no such user exists
        else {
          // if user exists in the database
          user = {id : currentUserQuery.rows[0].id, name: currentUserQuery.given_name};
        }// end OF else block
        done(null, user);                                         
      } // END OF try block
      catch (error) {
        done(error)
      } // END OF catch block
    }// END OF callback function

      ) //end of GoogleStrategy round block  
  ); // end of OAuth round block
  passport.serializeUser((user, done) => {
    // loads into req.session.passport.user
    done(null, user);
  });
  
  passport.deserializeUser((user, done) => {
    // loads into req.user
    done(null, user);
  });
  
};

module.exports = {
  OAuth : OAuth
}
