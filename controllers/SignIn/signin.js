const SignInLink = (req, res, next, db, passport) => {
  const clientCSRFToken = req.clientCSRFToken; // Get CSRF token from request header
  const serverCSRFToken = req.serverCSRFToken; // Get CSRF token stored on the server
  if (clientCSRFToken === serverCSRFToken) {
    // ---------- passport configuration ------------ //
    passport.use(
      new passportLocal(
        {
          usernameField: "email",
          passwordField: "password",
        },
        function (email, password, done) {
          if (!email || !password) {
            return res
              .send(400)
              .json({ message: "wrong input of email or password" });
          }
          // Check the database for a user with the provided email
          db.select("email", "hash")
            .from("login")
            .where("email", "=", email)
            .then((data) => {
              const isValid = bcrypt.compare(password, data[0].hash); // Use bcrypt to compare the provided password with the hashed password from the database

              if (isValid) {
                // If the password is correct, retrieve the user from the 'users' table
                return db
                  .select("*")
                  .from("users")
                  .where("email", "=", email)
                  .then((user) => {
                    const provider = { type: "local" };
                    user[0].provider = provider;
                    done(null, user[0]); // Return the first matching user as an authenticated user to Passport
                  })
                  .catch((err) => done(err)); // If there is an error, return the error to Passport
              } //end of if
              else {
                // If the password is incorrect, return an error message to Passport
                done(null, false, { message: "Invalid password" });
              } //end of else
            }) //end of then of data parameter
            .catch((error) => console.log(error)); //end of caatch
        }
      )
    );
    // -------END OF passport configuration -------- //

    // -- -- //
    // Authenticate the user using Passport
    passport.authenticate("local", function (err, user, info) {
      if (err) {
        // If there is an error, return the error to the client
        res.status(400).json({ message: "Unable to sign in", error: err });
      } else if (!user) {
        // If the user cannot be authenticated, return an error message to the client
        res.status(400).json({ message: "Invalid email or password" });
      } else {
        // If the user is authenticated, log them in
        req.logIn(user, function (err) {
          //while logging in
          if (err) {
            // If there is an error, return the error to the client
            res.status(400).json({ message: "Unable to sign in", error: err });
          }
          //user object is being inserted into a session
          req.session.user = user;
          return res
            .status(200)
            .json({ message: "success", user: { name: user.name } }); //restricting to back-end to send only name of the user
        });
      }
    })(req, res, next);
    // Call the authenticate function with the current request and response objects as arguments
    // -- END OF -- //
  }
};

module.exports = {
  SignInLink: SignInLink,
};
