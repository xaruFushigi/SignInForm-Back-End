const serialization = require("./serialization");

const { db, passport, localStrategy, bcrypt } = require("../../dependencies");

const PassportConfig = (req, res) => {
  serialization(db, passport);

  passport.use(
    new localStrategy(
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
};

module.exports = {
  PassportConfig: PassportConfig,
};
