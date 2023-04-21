//---------importing dependecies from './dependecies'------------------//
const { GoogleStrategy, express, expressSession, app,
        pgSession, dotenv, pg, knex, db, pool, cors,
        passport, passportLocal, localStrategy, bcrypt, jwt, 
        crypto, cookieParser} = require('./dependecies');
//---------END OF importing dependecies from './dependecies'------------//

//---------importing Routes from controllers folder---------------------//
const RootLink   = require('./controllers/Root/root');
const SignInLink = require('./controllers/SignIn/signin');
const SignUpLink = require('./controllers/SignUp/signup');
const { OAuth } = require('./controllers/SignIn/OAuth');
//---------END OF importing Routes from controllers folder--------------//

//------------------------------Middleware------------------------------//
        app.use(cors({
            origin: 'http://localhost:3000',            //should be same port as in React-App port
            credentials: true                           //must be true
        }));                                            //middleware: for OpenSSL
        app.use(express.urlencoded({extended: false})); // middleware function parses incoming requests with urlencoded payloads (i.e., key-value pairs) 
                                                        //  -> and populates the req.body object with the parsed data. 
                                                        //  -> The extended option is set to false, which tells the parser to use the classic encoding,
                                                        //  -> where values can be only strings or arrays, and not any other type.
                                                        //  -> In short, this line of code enables the server to parse incoming request
                                                        //  -> data in the URL-encoded format and make it available in the req.body object.
        app.use(express.json());                        // incoming JSON payloads to be parsed and set on the request.body property.
        app.use(expressSession({
                secret: 'secretcode',
                resave:  false,
                saveUninitialized: false,
                store: new pgSession({
                    pool: pool,
                    tableName: 'session'               //necessary to create separate 'sesion' table in the database
                }),
                cookie: { maxAge: 30 * 1000 } //set cookie max age to 1 day
        }
        ));
        app.use(cookieParser('secretcode', {sameSite: 'lax'}));            //should be same 'secret' as in expressSession
//------------------------------END OF Middleware------------------------------//
OAuth(passport);

const isLoggedIn = (req, res, next) => {
    req.user ? next() : res.status(400).json('user is not logged in');
};
//------------------------------Routes-----------------------------------------//
        //ROOT
        app.get('/', (req, res)=>{
            
            RootLink.RootLink(req, res, db); 
            // Set a cookie with SameSite=None
            res.setHeader('Set-Cookie', cookie.serialize('myCookie', 'myValue', {
                sameSite: 'none',
                secure: true }))
        });
        //SIGNIN
        app.post('/signin', (req, res, next)=> {SignInLink.SignInLink(req, res, next, passport, express, passportLocal, app, pool, dotenv)});  // Define a new route for handling POST requests to '/signin'
        // Authenticate the user using Google OAuth2.0
        app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email']}));
        
        app.get('/auth/google/callback',
                passport.authenticate('google', 
                                            { failureRedirect: '/signup', 
                                              failureMessage: true,
                                              successRedirect: '/protected' 
                                            }
                                     ),
                );
        app.get('/auth/failure/', (req, res) => {res.send('something went wrong..')})  
        
        app.get('/protected',isLoggedIn, (req, res) => {
            try{
                res.send("<p> Hello </p>");
            }
            catch (error) {
                res.send(error).status(400);
            }
        })
        //SIGNUP||REGISTER
        // When the server receives a POST request to the '/signup' route, it will execute the following code:
        app.post('/signup', (req, res) => { SignUpLink.SignUpLink(req, res, db, bcrypt)});    
        // Define a new route for handling POST requests to '/signin'
//------------------------------END OF Routes--------------------------------//
//Start of server
app.listen(`${process.env.PORT}`, ()=>{console.log(`app is running in port ${process.env.PORT}`)});