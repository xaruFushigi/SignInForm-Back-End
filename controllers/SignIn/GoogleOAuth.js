const GoogleOAuth = (pool, passport, GoogleStrategy) => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.BACK_END_URL}/auth/google/callback`, //should be same as Google's Authorized redirect URIs
        scope: ["profile", "email"], //what is going to be visible of user's account
        state: true,
      },
      //callback function
      async (accessToken, refreshToken, profile, done) => {
        const account = profile._json;
        let user = {};
        try {
          const currentUserQuery = await pool.query(
            "SELECT * FROM users WHERE googleid = $1",
            [account.sub]
          );
          //if no such user exists in the database
          if (currentUserQuery.rows.length === 0) {
            //create user
            await pool.query(
              "INSERT INTO users (name, email, joined, googleid, displayname) VALUES ($1, $2, $3, $4, $5)",
              [
                account.given_name,
                account.email,
                new Date(),
                account.sub,
                account.name,
              ]
            );
            const id = await pool.query(
              "SELECT id, name FROM users WHERE googleid = $1",
              [account.sub]
            );
            user = {
              id: id.rows[0].id,
              name: currentUserQuery.rows[0].name,
            };
          } //END OF if no such user exists
          else {
            // if user exists in the database
            user = {
              id: currentUserQuery.rows[0].id,
              name: currentUserQuery.rows[0].name,
              provider: "google",
            };
          } // end OF else block
          done(null, user);
        } catch (error) {
          // END OF try block
          done(error);
        } // END OF catch block
      } // END OF callback function
    ) //end of GoogleStrategy round block
  ); // end of OAuth round block
};

module.exports = {
  GoogleOAuth: GoogleOAuth,
};
