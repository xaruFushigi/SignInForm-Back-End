//---------importing dependecies from './dependecies'------------------//
const { GoogleStrategy, express, expressSession, app,
        pgSession, dotenv, pg, knex, db, pool, cors,
        passport, passportLocal, localStrategy, bcrypt, jwt, 
        crypto, cookieParser, csrf, csrfProtection} = require('./dependencies');
//---------END OF importing dependecies from './dependecies'------------//

//---------importing Routes from controllers folder---------------------//
const RootLink   = require('./controllers/Root/root');
const SignInLink = require('./controllers/SignIn/signin');
const SignUpLink = require('./controllers/SignUp/signup');
const { OAuth } = require('./controllers/SignIn/OAuth');
//---------END OF importing Routes from controllers folder--------------//
OAuth();
//------------------------------Middleware------------------------------//
        app.use(express.json());                        // incoming JSON payloads to be parsed and set on the request.body property.
        app.use(express.urlencoded({extended: false})); // middleware function parses incoming requests with urlencoded payloads (i.e., key-value pairs) 
                                                        //  -> and populates the req.body object with the parsed data. 
        app.use(expressSession({
            secret: 'secretcode',
            resave:  false,
            saveUninitialized: false,
            store: new pgSession({
                pool: pool,
                tableName: 'session'               //necessary to create separate 'sesion' table in the database
            }),
            cookie: { maxAge: 30 * 1000,
                      secure: true,     //this ensures that the cookie can only be trasnmitted over HTTPS
                      sameSite: 'none',
                      httpOnly: true
            } //set cookie max age to 30 seconds
        }
        ));      

        app.use(cors({
            origin: 'http://localhost:3000',            //should be same port as in React-App port
            credentials: true                           //must be true
        }));                                            //middleware: for OpenSSL

                                                        //  -> The extended option is set to false, which tells the parser to use the classic encoding,
                                                        //  -> where values can be only strings or arrays, and not any other type.
                                                        //  -> In short, this line of code enables the server to parse incoming request
                                                        //  -> data in the URL-encoded format and make it available in the req.body object.
        app.use(cookieParser('secretcode', {sameSite: 'lax'}));            //should be same 'secret' as in expressSession
//------------------------------END OF Middleware------------------------------//

const isLoggedIn = (req, res, next) => {
    req.user ? next() : res.sendStatus(401);
};
//------------------------------Routes-----------------------------------------//
        //ROOT
        app.get('/', (req, res)=>{RootLink.RootLink(req, res, db);});
        //SIGNIN
        app.post('/signin', (req, res, next)=> {SignInLink.SignInLink(req, res, next, passport, express, passportLocal, app, pool, dotenv)});  // Define a new route for handling POST requests to '/signin'
        // Authenticate the user using Google OAuth2.0
        //     //GOOGLE OAUTH2.0
        app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email']}));
            //GOOGLE OAUTH2.0 Success ROUTE
            app.get('/auth/google/callback',
                passport.authenticate('google', 
                                            { failureRedirect: 'http://localhost:3000/signin', 
                                              failureMessage: true,
                                              successRedirect: 'http://localhost:3050/protected' 
                                            }
                                     ),
                );
            //GOOGLE OAUTH2.0 Failure ROUTE
            app.get('/auth/failure/', (req, res) => {res.send('something went wrong..')})  
        //PROTECTED
        app.get('/protected', isLoggedIn, (req, res) => {
                try {
                    res.send('protected route has been accessed')
                }
                catch(error) {
                    console.log(error)
                }
        });
        //LOGOUT
        app.get('/logout', (req, res)=> {
            if(req.user) {
                req.logout();
            }
            req.session.destroy();
            res.send('Goodbye');
        });
        //SIGNUP||REGISTER
        // When the server receives a POST request to the '/signup' route, it will execute the following code:
        app.post('/signup', (req, res) => { SignUpLink.SignUpLink(req, res, db, bcrypt)});    
//------------------------------END OF Routes--------------------------------//
//Start of server
app.listen(`${process.env.PORT}`, ()=>{console.log(`app is running in port ${process.env.PORT}`)});