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
const Logout     = require('./controllers/Logout/Logout');
const Protected  = require('./controllers/Protected/Protected');
const { OAuth }  = require('./controllers/SignIn/OAuth');
//---------END OF importing Routes from controllers folder--------------//

//------------------------------Middleware------------------------------//
        app.use(cors({
            origin: process.env.FRONT_END_URL,          //should be same port as in React-App port
            credentials: true                           //must be true. Communicate  cookies with other domain
        }));                                            //middleware: for OpenSSL

        app.use(express.json());                        // incoming JSON payloads to be parsed and set on the request.body property.
        app.use(express.urlencoded({extended: false})); // middleware function parses incoming requests with urlencoded payloads (i.e., key-value pairs) 
                                                        //  -> and populates the req.body object with the parsed data. 
        app.use(expressSession({
            secret: process.env.SESSION_SECRET,
            resave:  false,
            saveUninitialized: false,
            store: new pgSession({
                pool: pool,
                tableName: 'session'               //necessary to create separate 'sesion' table in the database
            }),
            cookie: { maxAge: 30 * 1000,
                      secure: process.env.NODE_ENV === 'production'? 'true' : 'auto',     //this ensures that the cookie can only be trasnmitted over HTTPS. 'auto' makes it identify between HTTP and HTTPS
                      sameSite: process.env.NODE_ENV === 'production'? 'none' : 'lax',    //'lax' is for local environemnt before pusshing to production. After pusshing to production should be set to 'none'
                      httpOnly: true,
                      resave: false,
                      saveUninitialized: false
            } //set cookie max age to 30 seconds
        }
        ));      

                                                        //  -> The extended option is set to false, which tells the parser to use the classic encoding,
                                                        //  -> where values can be only strings or arrays, and not any other type.
                                                        //  -> In short, this line of code enables the server to parse incoming request
                                                        //  -> data in the URL-encoded format and make it available in the req.body object.
        app.use(cookieParser(process.env.SESSION_SECRET, {sameSite: process.env.NODE_ENV === 'production'? 'none' : 'lax'}));            //should be same 'secret' as in expressSession
//------------------------------END OF Middleware------------------------------//

const isLoggedIn = (req, res, next) => {
    req.session.passport.user ? next() : res.status(400).json('you are not authorized for this');
};

OAuth(); //initializing Google OAuth 2.0 JavaScript file
//------------------------------Routes-----------------------------------------//
        //ROOT
        app.get('/', (req, res)=>{RootLink.RootLink(req, res, db);});
        //SIGNIN
        app.post('/signin', (req, res, next)=> {SignInLink.SignInLink(req, res, next)});  // Define a new route for handling POST requests to '/signin'
        // Authenticate the user using Google OAuth2.0
            //GOOGLE OAUTH2.0
        app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email']}));
            //GOOGLE OAUTH2.0 Success ROUTE
            app.get('/auth/google/callback',
                passport.authenticate('google', 
                                            { 
                                                successRedirect: 'http://localhost:3000/',
                                                failureRedirect: '/auth/failure',
                                                failureMessage : true
                                            }
                                     ),
                );
            //GOOGLE OAUTH2.0 Failure ROUTE
            app.get('/auth/failure/', (req, res) => {res.send('something went wrong..')})  
        //PROTECTED
        app.get('/protected', isLoggedIn, (req, res) => { Protected.Protected(req, res, passport, app)});
        //LOGOUT
        app.get('/logout', (req, res)=> {Logout.Logout(req, res)});
        //SIGNUP||REGISTER
        // When the server receives a POST request to the '/signup' route, it will execute the following code:
        app.post('/signup', (req, res) => { SignUpLink.SignUpLink(req, res, db, bcrypt)});    
//------------------------------END OF Routes--------------------------------//
//Start of server
app.listen(`${process.env.PORT}`, ()=>{console.log(`app is running in port ${process.env.PORT}`)});