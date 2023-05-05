const { GoogleStrategy, GitHubStrategy, express, expressSession, app,
    pgSession, dotenv, pg, knex, db, pool, cors,
    passport, passportLocal, localStrategy, bcrypt, jwt, 
    crypto, cookieParser, csrf, csrfProtection} = require('../../dependencies');
    const { serialization } = require('./serialization');
const GitHubOAuth = () => {
    passport.use(new GitHubStrategy({
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: "http://localhost:3050/auth/github/callback"
      },
    //callback function
    async (accessToken, refreshToken, profile, done) => {
        const account = profile._json;
        let user = {};
        try {
          const currentUserQuery = await pool.query(
            'SELECT * FROM users WHERE githubid = $1', 
             [account.id]
          );
          //if no such user exists in the database
          if(currentUserQuery.rows.length === 0) {
            //create user
            await pool.query(
              'INSERT INTO users (name, githubid, joined, email) VALUES ($1, $2, $3, $4)',
              [account.login, account.id, new Date(), account.url]
            );
            const id = await pool.query('SELECT id FROM users WHERE githubid = $1', [account.id]);
            user = {
              id: id.rows[0].id,
              name: account.rows[0].name
            }
          } //END OF if no such user exists
          else {
            // if user exists in the database
            user = {id : currentUserQuery.rows[0].id, name: currentUserQuery.rows[0].name};
          }// end OF else block
          done(null, user);                                         
        } // END OF try block
        catch (error) {
          done(error)
        } // END OF catch block
      }// END OF callback function
    ));

    // passport.serializeUser((user, done) => {
    //     // loads into req.session.passport.user
    //     done(null, user);
    //   });
      
    //   passport.deserializeUser((user, done) => {
    //     // loads into req.user
    //     done(null, user);
    //   });
    serialization();
};

module.exports = {
    GitHubOAuth : GitHubOAuth
}