const RememberMeStrategy = require('passport-remember-me').Strategy;
const knex = require('knex');
const db = knex({
    client: 'pg',
    connection: {
        host: 'localhost',
        user: 'postgres',
        password: 'myselfmyself11',
        database: 'smart-brain'
    }
});
const crypto = require('crypto');

const RememberMePassport = (passport) => {
    passport.use(new RememberMeStrategy(
        function(token, done) {
            db.select('id', 'email')
            .from('users')
            .where('remembermetoken', '=', token)
            .then(data => {
                if (!data.length) {
                    return done(null, false);
                }
                return done(null, { id: data[0].id, email: data[0].email });
            })
            .catch(err => done(err));
        },
        function(user, done) {
            const token = crypto.randomBytes(32).toString('hex');
            db('users')
            .where('email', '=', user.email)
            .update('remembermetoken', token)
            .then(() => {
                return done(null, token);
            })
            .catch(err => done(err));
        },
        // Optional configuration
        {
            cookieName: 'remember_me',
            // How long should the cookie be valid for (7 days in milliseconds)
            cookieLifetime: 604800000,
            // Secure flag for cookies served over HTTPS
            cookieSecure: false,
            // Validate user function
            validate: function(token, done) {
                db.select('id', 'email')
                .from('users')
                .where('remembermetoken', '=', token)
                .then(data => {
                    if (!data.length) {
                        return done(null, false);
                    }
                    return done(null, { id: data[0].id, email: data[0].email });
                })
                .catch(err => done(err));
            }
        }
    ));
};

module.exports = {
    RememberMePassport: RememberMePassport
};
