const { GoogleStrategy, express, expressSession, app, pgSession, dotenv, pg, knex, db, pool, cors, passport, passportLocal, localStrategy, bcrypt, jwt, crypto, cookieParser, csrf, csrfProtection } = require('../../dependencies');
const { v4: uuidv4 } = require('uuid');
const { PassportConfig } =  require('./PassportConfig');      //configuration of passport
const { serialization } = require('./serialization');
const { verify } = require('crypto');



const isLoggedIn = (req, res, next) => {
  req.user ? next() : res.sendStatus(401);
};

const OAuth = () => {
  app.use(expressSession({
    store: new pgSession({
      pool: pool,
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: true, httpOnly: true, domain: 'localhost', maxAge: 1 * 60 * 60 * 1000 }
  }));
  app.use(express.urlencoded({extended: true}));
  app.use(express.json());
  app.use(cookieParser());
  app.use(cors());

  PassportConfig(passport); 
  serialization(passport);
  passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: 'http://localhost:3050/auth/google/callback', //should be same as Google's Authorized redirect URIs
      scope: [ 'profile', 'email' ],                             //what is going to be visible of user's account
      state: true
    },
    function verify(accessToken, refreshToken, profile, done) {
      console.log('accessToken:', accessToken);
      console.log('refreshToken:', refreshToken);
      console.log('profile:', profile);
        // First, we check if the user with this Google ID exists in the database.
        pool.query('SELECT * FROM users WHERE googleid = $1', [profile.id])
          .then((result) => {
            if (result.rows.length == 0) {
              // If the user with this Google ID does not exist in the database, we create a new user with this Google ID.
              return pool.query('INSERT INTO users (id, googleid, displayname, givenname, familyname, email, created, picture) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *', 
                     [profile.id, profile.displayName, profile.name.givenName, profile.name.familyName, profile.emails[0].value, new Date(), profile.photos[0].value]);
            } else {
              return result.rows[0];
            }
          })
          // If a user with this Google ID already exists in the database, we return that user.
          .then((user) => {
            done(null, user);
          }) 
          //If error
          .catch((err) => {
            done(err);
          });


        } //end of verify function curly blcok


        
      ) //end of GoogleStrategy round block  
  ) // end of OAuth round block
} //end of OAuth curly block

module.exports = {
  OAuth: OAuth
};




// const { GoogleStrategy, express, expressSession, app,
//   pgSession, dotenv, pg, knex, db, pool, cors,
//   passport, passportLocal, localStrategy, bcrypt, jwt, 
//   crypto, cookieParser, csrf, csrfProtection} = require('../../dependencies');

// const { v4: uuidv4 } = require('uuid');
// // Initialize passport
// app.use(passport.initialize());
// //
// app.use(expressSession({
//   store: new pgSession({
//     pool: pool,
//   }),
//   secret: process.env.SESSION_SECRET,
//   resave: false,
//   saveUninitialized: false,
//   cookie: { secure: true, httpOnly: true, domain: 'localhost', maxAge: 1 * 60 * 60 * 1000 }
// }));
// //
// app.use(express.urlencoded({extended: true}));
// app.use(express.json());
// app.use(cookieParser());
// app.use(cors());

// const OAuth = () => {
//   passport.use(new GoogleStrategy({
//       clientID: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//       callbackURL: 'http://localhost:3050/auth/google/callback', //should be same as Google's Authorized redirect URIs
//       scope: [ 'profile', 'email' ],                             //what is going to be visible of user's account
//       state: true
//     },
//     function verify(accessToken, refreshToken, profile, done) {
//         //Called on Successful Authentication
//           //insert into database

//           // First, we check if the user with this Google ID exists in the database.
//           pool.query('SELECT * FROM users WHERE googleid = $1', [profile.id], (err, res) => {
//             // If error  
//             if (err) {
//                 return done(err);
//             }
//             // If a user with this Google ID already exists in the database, we return that user.
//             if (res.rows.length) {
//                 return done(null, res.rows[0]);
//             } 
//             // If the user with this Google ID does not exist in the database, we create a new user with this Google ID.
//             else {
//                 // We insert the new user's information into the database and return the newly created user.
//                 pool.query('INSERT INTO users (googleid, displayname, name, email, joined) VALUES ($1, $2, $3, $4, $5) RETURNING *',
//                   [uuidv4(), profile.id, profile.displayName, profile.name.givenName, profile.emails[0].value, new Date()], (err, res) => {
//                     if (err) { return done(err); }
//                     // If there is an error in the database query, we return the error.
//                     return done(null, res.rows[0]);
//                   });
//             }
//           })
//           .catch((err) => {
//             return done(err);
//           })
//       }
//   ));
// };

// module.exports = {
//   OAuth: OAuth
// };
