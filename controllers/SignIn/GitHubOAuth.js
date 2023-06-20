const GitHubOAuth = (pool, passport, GitHubStrategy) => {
  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: `${process.env.BACK_END_URL}/auth/github/callback`,
      },
      //callback function
      async (accessToken, refreshToken, profile, done) => {
        console.log(profile);
        const account = profile;
        let user = {};
        try {
          const currentUserQuery = await pool.query(
            "SELECT * FROM users WHERE githubid = $1",
            [account.id]
          );
          //if no such user exists in the database
          if (currentUserQuery.rows.length === 0) {
            //create user
            await pool.query(
              "INSERT INTO users (name, githubid, joined, email) VALUES ($1, $2, $3, $4)",
              [account.login, account.id, new Date(), account.url]
            );
            const id = await pool.query(
              "SELECT id FROM users WHERE githubid = $1",
              [account.id]
            );
            user = {
              id: id.rows[0].id,
              name: account.name,
            };
          } //END OF if no such user exists
          else {
            // if user exists in the database
            user = {
              id: currentUserQuery.rows[0].id,
              name: currentUserQuery.rows[0].name,
              provider: "github",
            };
          } // end OF else block
          done(null, user);
        } catch (error) {
          // END OF try block
          done(error);
        } // END OF catch block
      } // END OF callback function
    )
  );
};

module.exports = {
  GitHubOAuth: GitHubOAuth,
};
