const { PassportConfig } = require("./PassportConfig"); //configuration of passport
const serialization = require("./serialization");
//need to confirm when i use https instead of http whether cookies created when signed in or not
// since currently i am using http cookies are not created

const SignInLink = (req, res, next, passport) => {
  //  console.log('getHeaders',res.getHeaders());                // logs the headers
  //  console.log('Signin request received:', req.body.email)
  PassportConfig(req, res);
  serialization();
  const clientCSRFToken = req.clientCSRFToken; // Get CSRF token from request header
  const serverCSRFToken = req.serverCSRFToken; // Get CSRF token stored on the server
  if (clientCSRFToken === serverCSRFToken) {
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
  }
  // Call the authenticate function with the current request and response objects as arguments
};

module.exports = {
  SignInLink: SignInLink,
};
