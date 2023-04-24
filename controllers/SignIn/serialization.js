const { GoogleStrategy, express, expressSession, app,
    pgSession, dotenv, pg, knex, db, pool, cors,
    passport, passportLocal, localStrategy, bcrypt, jwt, 
    crypto, cookieParser, csrf, csrfProtection} = require('../../dependencies');

const serialization = () => {
    passport.serializeUser((user, done)=> {
        let userData = {
            id: user.id,
            provider: user.provider
          };
          console.log('user ',user);
          console.log('userData ', userData);
          done(null, userData);
    });
    //takes that cookie and unravels it and returns a user from it
    // ->Take a user that we got cfrom a localStrategy and create a cookie
    // ->with User ID inside of it 
    passport.deserializeUser((userData, done)=> {
        //handles Password authentication
        if (userData.provider === 'local') {
            db.select('name').from('users').where('id', '=', id) //restrciting to retrieve only user name from database
            .then(user => {
                //  done(null, user[0]);
                const userInformation = {name : user[0].name}
                    done(null, userInformation);
            })
            .catch(error => done(error));
        }// end of if
        //handles Google OAuth 2.0 authentication
        else if (userData.provider === 'google') {
            // handle Google user object
            db.select('name', 'googleid').from('users').where('googleid', '=', userData.id)
                .then(user => {
                    const userInformation = { name: user[0].name };
                    done(null, userInformation);
                })
                .catch(error => done(error));
            } //end of else if
        }//end of deserializeUser
    )//end of deserizeUser
}//end of cosnt serialization

module.exports = {
    serialization : serialization
}



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
// }