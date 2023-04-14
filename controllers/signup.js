const passport = require('passport');

const SignUpLink = (req, res, next) => {
  const { email, name, password } = req.body;
  console.log(req.body);
  if (!email || !name || !password) {
    return res.status(400).json('Incorrect submission.');
  }

  passport.authenticate('local-signup', function(err, user, info) {
    if (err) {
      return res.status(400).json({ message: 'Unable to sign up', error: err });
    } else if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    } else {
      // Log the user in and return the user object to the client
      req.logIn(user, function(err) {
        if (err) {
          return res.status(400).json({ message: 'Unable to sign up', error: err });
        } else {
          return res.json(user);
        }
      });
    }
  })(req, res, next);
};

module.exports = {
  SignUpLink: SignUpLink
};
