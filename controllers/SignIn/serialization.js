const { GoogleStrategy, express, expressSession, app,
    pgSession, dotenv, pg, knex, db, pool, cors,
    passport, passportLocal, localStrategy, bcrypt, jwt, 
    crypto, cookieParser, csrf, csrfProtection} = require('../../dependencies');

// serialization.js
// Contains the serializeUser and deserializeUser functions
// storing the user ID when serializing, and finding the user by ID when deserializing.
const serialization = (req, res) => {
//serializeUser determines which data of the user object should be stored in the session
passport.serializeUser((user, done)=> {
  let userData = {
      id: user.id,
      provider: user.provider
    };
    console.log('serializeUser', userData);
    done(null, userData);
});
// takes that cookie and unravels it and returns a user from it
// ->Take a user that we got cfrom a localStrategy and create a cookie
// ->with User ID inside of it 
passport.deserializeUser((user, done)=> {
  console.log(user);
  //handles Password authentication
  let userData = {
    id: user.id,
    provider: user.provider.type,
    providerGithub: user.provider
  };

  console.log('deserializeUser',user)

  if (userData.provider === 'local') {
    console.log('inside local')
      db.select('name').from('users').where('id', '=', userData.id) //restrciting to retrieve only user name from database
      .then(user => {
          //  done(null, user[0]);
          const userInformation = {name : user[0].name}
          console.log("deserializeUser", userInformation)
              done(null, userInformation);
      })
      .catch(error => done(error));
  }// end of if
  else{
    console.log('not local provider')
  }
  //handles Google OAuth 2.0 authentication
  if (userData.provider === 'google') {
      console.log("inside google")
      // handle Google user object
      db.select('name', 'id').from('users').where('id', '=', userData.id)
          .then(user => {
              const userInformation = { name: user[0].name };
              console.log('deserializeUser', user)
              done(null, userInformation);
          })
          .catch(error => done(error));
      } //end of else if
    else {
      console.log('not google provider')
    }
     //handles Github OAuth 2.0 authentication
  if (userData.providerGithub === 'github') {
    console.log("inside github")
    // handle Google user object
    db.select('name', 'id').from('users').where('id', '=', userData.id)
        .then(user => {
            const userInformation = { name: user[0].name };
            console.log('deserializeUser', user)
            done(null, userInformation);
        })
        .catch(error => done(error));
    } //end of else if
  else {
    console.log('not github provider')
  }
  }//end of deserializeUser
)//end of deserizeUser
}//end of cosnt serialization

module.exports = serialization;



// const serialization = () => {
//     passport.serializeUser((user, done)=> {
//         done(null, user.id);
//     });
//     //takes that cookie and unravels it and returns a user from it
//     // ->Take a user that we got cfrom a localStrategy and create a cookie
//     // ->with User ID inside of it 
//     passport.deserializeUser((id, done)=> {
//         db.select('name').from('users').where('id', '=', id) //restrciting to retrieve only user name from database
//           .then(user => {
//             //  done(null, user[0]);
//             const userInformation = {name : user[0].name}
//                   done(null, userInformation);
//           })
//           .catch(error => done(error));
//     });
    



  //stores user data, and entire user data is being stored in done function with 'user' object
  // passport.serializeUser((user, done) => {
  //   // loads into req.session.passport.user
  //   console.log('serializeUser',user)
  //   console.log('serializeUser', user.provider)
  //   done(null, user.id, user.provider);
  // });
  // //retriveing user data from the session using the 'user' parameter and use it to fetch data 
  // //->from the database and then passes it to 'done' function. 
  // passport.deserializeUser((user, done) => {
  //   console.log('deserializeUser',user)
  //   done(null, user);
  // });




  // const { GoogleStrategy, express, expressSession, app,
  //   pgSession, dotenv, pg, knex, db, pool, cors,
  //   passport, passportLocal, localStrategy, bcrypt, jwt, 
  //   crypto, cookieParser, csrf, csrfProtection} = require('../../dependencies');

// serialization.js
// Contains the serializeUser and deserializeUser functions

// //serializeUser determines which data of the user object should be stored in the session
//     const serializeUser = (user, done) => {
//       let userData = {
//         id: user.id,
//         provider: user.provider
//       };
//       console.log('serializeUser', userData);
//       done(null, userData);
//     };

    
//     const deserializeUser = async (id, done) => {
//       console.log(id)
//       let userData = {
//         id: id.id,
//         provider: id.provider
//       };
    
//       console.log('deserializeUser', userData);
    
//       if (userData.provider === 'local') {
//         try {
//           const user = await db.select('name').from('users').where('id', '=', userData.id.id);
//           if (user.length > 0) {
//             const userInformation = { name: user[0].name };
//             done(null, userInformation);
//           } else {
//             done(new Error('User not found'));
//           }
//         } catch (error) {
//           done(error);
//         }
//       } 
//       else if (userData.provider === 'google') {
//         try {
//           const user = await db.select('name').from('users').where('id', '=', userData.id);
//           if (user.length > 0) {
//             const userInformation = { name: user[0].name };
//             console.log('deserializeUser', user);
//             done(null, userInformation);
//           } else {
//             done(new Error('User not found'));
//           }
//         } catch (error) {
//           done(error);
//         }
//       } else {
//         done(new Error('Provider not supported'));
//       }
//     };
    
//     module.exports = {
//       serializeUser,
//       deserializeUser
//     };