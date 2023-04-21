const { GoogleStrategy, express, expressSession, app,
    pgSession, dotenv, pg, knex, db, pool, cors,
    passport, passportLocal, localStrategy, bcrypt, jwt, 
    crypto, cookieParser} = require('../../dependecies');

const serialization = () => {
    passport.serializeUser((user, done)=> {
        done(null, user.id);
    });
    //takes that cookie and unravels it and returns a user from it
    // ->Take a user that we got cfrom a localStrategy and create a cookie
    // ->with User ID inside of it 
    passport.deserializeUser((id, done)=> {
        db.select('name').from('users').where('id', '=', id) //restrciting to retrieve only user name from database
          .then(user => {
            //  done(null, user[0]);
            const userInformation = {name : user[0].name}
                  done(null, userInformation);
          })
          .catch(error => done(error));
    });
}

module.exports = {
    serialization : serialization
}