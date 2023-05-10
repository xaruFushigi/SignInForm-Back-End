//---------importing dependecies from './dependecies'------------------//
const { GoogleStrategy, express, expressSession, app,
        pgSession, dotenv, pg, knex, db, pool, cors,
        passport, passportLocal, localStrategy, bcrypt, jwt, sessionStore, cookieSession,
        crypto, cookieParser, csrf, csrfProtection} = require('./dependencies');
//---------END OF importing dependecies from './dependecies'------------//

//---------importing JS files from controllers folder-------------------//
const { GoogleOAuth }  = require('./controllers/SignIn/GoogleOAuth');
const { GitHubOAuth }  = require('./controllers/SignIn/GitHubOAuth');
const { serialization }  = require('./controllers/SignIn/serialization');
//---------END OF importing JS files from controllers folder------------//
const pruneSessionInterval = BigInt(24 * 60 * 60 * 0);
//------------------------------Middleware------------------------------//
        app.use(express.urlencoded({extended: false})); // middleware function parses incoming requests with urlencoded payloads (i.e., key-value pairs) 
        app.use(express.json());                        // incoming JSON payloads to be parsed and set on the request.body property.
        app.use(cookieParser(process.env.SESSION_SECRET, 
            {sameSite: process.env.NODE_ENV === 'production'? 'None' : 'Lax'}));   //should be same 'secret' as in expressSession
        app.use(cors({
            origin: process.env.FRONT_END_URL,          //should be same port as in React-App port
            credentials: true,                           //must be true. Communicate  cookies with other domain
            allowedHeaders: ['Content-Type'],
            methods: ['GET', 'POST', 'DELETE'],
        }));                                            //middleware
                                                        //  -> and populates the req.body object with the parsed data. 
        app.use(expressSession({
            secret: process.env.SESSION_SECRET,
            resave:  false,
            saveUninitialized: false,
            store: sessionStore,
            name : 'session_cookie',
            cookie: { maxAge: 24 * 60 * 60 * 1000,
                      secure: process.env.NODE_ENV === 'production'? 'true' : 'auto',     //this ensures that the cookie can only be trasnmitted over HTTPS. 'auto' makes it identify between HTTP and HTTPS
                      sameSite: process.env.NODE_ENV === 'production'? 'none' : 'lax',    //'lax' is for local environemnt before pusshing to production. After pusshing to production should be set to 'none'
                      httpOnly: true,
                      resave: false,
                      saveUninitialized: false
            }                                           //set cookie max age to 30 seconds
        }
        ));       

                                                        //  -> The extended option is set to false, which tells the parser to use the classic encoding,
                                                        //  -> where values can be only strings or arrays, and not any other type.
                                                        //  -> In short, this line of code enables the server to parse incoming request
                                                        //  -> data in the URL-encoded format and make it available in the req.body object.
                                                        app.use((req, res, next) => {
                                                            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
                                                            next();
                                                          });
        app.use(function(req, res, next) {
            res.header("Access-Control-Allow-Origin", "*"); // This will allow requests from all domains. You can set it to a specific domain as well.
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
            next();
        });
        app.use(passport.initialize());
        app.use(passport.session());                        
//------------------------------END OF Middleware------------------------------//

//---------importing Routes from controllers folder---------------------//
const RootLink   = require('./controllers/Root/root');
const SignInLink = require('./controllers/SignIn/signin');
const SignUpLink = require('./controllers/SignUp/signup');
const Logout     = require('./controllers/Logout/Logout');
const Protected  = require('./controllers/Protected/Protected');
//---------END OF importing Routes from controllers folder--------------//
const isLoggedIn = (req, res, next) => {
    if(req.session.passport.user) { next() }
    return  res.send('you are not authorized for this');
};

GoogleOAuth();                                          //initializing Google OAuth 2.0 JavaScript file
GitHubOAuth();                                          //initializing GitHub OAuth 2.0 JavaScript file
//------------------------------Routes-----------------------------------------//
        //ROOT
        app.get('/', (req, res)=>{RootLink.RootLink(req, res, db);});
        //SIGNIN
        app.post('/signin', express.urlencoded({extended: false}), (req, res, next)=> {SignInLink.SignInLink(req, res, next)});  // Define a new route for handling POST requests to '/signin'
        
        //-------------------------Google---------------------//
        // Authenticate the user using Google OAuth2.0
            //GOOGLE OAUTH2.0
        app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email']}));
            //GOOGLE OAUTH2.0 Success/failure redirect ROUTE
            app.get('/auth/google/callback',
                passport.authenticate('google', { successRedirect: 'http://localhost:3000/',
                                                  failureRedirect: '/auth/failure',
                                                  failureMessage : true }));
            //GOOGLE/GITHUB OAUTH2.0 Failure ROUTE
            app.get('/auth/failure/', (req, res) => {res.send('something went wrong..')}) 
        //-------------------------END OF Google---------------------//

        //-------------------------Github---------------------//
        //Authenticate the user using GITHUB OAuth 2.0
            //GITHUB OAUTH2.0
        app.get('/auth/github', passport.authenticate('github'));
            //GITHUB OAUTH2.0 Success redirect ROUTE
            app.get('/auth/github/callback', 
                passport.authenticate('github', { failureRedirect: 'http://localhost:3000/signin', 
                                                  successRedirect: 'http://localhost:3000/'})); 
        //-------------------------END OF Github---------------------//       
        //PROTECTED
        app.get('/protected', (req, res) => { Protected.Protected(req, res, passport, app)});
        //LOGOUT
        app.delete('/logout', (req, res, next)=> {Logout.Logout(req, res, next, passport)});
        //SIGNUP||REGISTER
        // When the server receives a POST request to the '/signup' route, it will execute the following code:
        app.post('/signup', (req, res) => { SignUpLink.SignUpLink(req, res, db, bcrypt)});   
//------------------------------END OF Routes--------------------------------//
//Start of server
app.listen(`${process.env.PORT}`, ()=>{console.log(`app is running in port ${process.env.PORT}`)});