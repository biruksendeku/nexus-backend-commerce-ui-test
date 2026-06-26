

// import packages
const User = require('../models/user');

const emailService = require('../services/emailService');
const { formatName, getFirstName } = require('../utils/string/formatName');

const generateHash = require('../utils/math/generateHash');
const generateToken = require('../utils/math/generateToken');
const comparePassword = require('../utils/math/comparePassword');
const tokenExpiration = require('../utils/date/tokenExpiration');

const withAbortCheck = require('../utils/helpers/abortCheck');
const promisify = require('../utils/helpers/promisify');

const {
    NotFoundError,
    BadRequestError,
    AppError
} = require('../middlewares/errors/customErrors');



/* ===================================================
   ===================================================
                   * REGISTER
   ===================================================
   =================================================== */
exports.register = async (req, res) => {
    const guard = withAbortCheck(req);
    
    const { name, email, password, confirmPassword } = req.body;
    if (!name || !email || !password || !confirmPassword) {
        throw new BadRequestError('Missing credentials');
    }
    
    const lowerCaseEmail = email.toLowerCase();
    const user = await User.findOne({ email: lowerCaseEmail });
    const hash = await generateHash(password, process.env.SALT || 10);
    
    // check user existence
    if (user) {
        if (user.password) {
            // user already has password (Local strategy)
            throw new BadRequestError('Email already registered, Login to continue');
        } else {
            // user registered via OAuth, now adding password
            user.password = hash;
            user.authProvider.push('local');
            await user.save();
            
            // log the user in
            await promisify((cb) => req.login(user, cb));
            
            guard.check();
            return res.redirect('/');
        }
    }
    
    // new user registration
    const verificationToken = generateToken(process.env.TOKEN_STRING_LENGTH || 32);
    const verificationDate = tokenExpiration(process.env.TOKEN_EXPIRATION_DAY || 1);

    // formatting name
    const firstName = getFirstName(name);
    const userName = formatName(name);

    // creating new user
    const newUser = new User({
        name: userName,
        email: lowerCaseEmail,
        password: hash,
        verificationToken,
        verificationDate,
        isVerified: false
    });

    // TODO TO Remove - in PRODUCTION
    if(process.env.NODE_ENV === 'development') {
    	newUser.userRole = req.body.userRole.trim();
    }
    newUser.authProvider.push('local');

    // save user and send email notification
    await newUser.save();
    await emailService.sendVerificationEmail(email, verificationToken, userName);

    // check client status
    guard.check();

    // send json response
    res.status(201).json({
        success: true,
        message: 'User created successfully, please check your email to verify your account!'
    });
};



/* ===================================================
   ===================================================
                   * LOGIN
   ===================================================
   =================================================== */
exports.login = (passport) => {
    return async (req, res, next) => {
        // promisify passport.authenticate
        const authenticate = promisify((cb) => {
            passport.authenticate('local', (err, user, info) => {
                if (err) return cb(err);
                if (!user) return cb(new AppError(info?.message || 'Login failed', 401));
                cb(null, user);
            })(req, res);
        });
        
        try {
            const user = await authenticate;
            await promisify((cb) => req.login(user, cb));
            res.redirect('/');
        } catch (err) {
            next(err);
        }
    };
};



/* ===================================================
   ===================================================
                   * GOOGLE-OAUTH
   ===================================================
   =================================================== */
exports.google = (passport) => {
    return (req, res, next) => {
        passport.authenticate('google', {
            scope: ['profile', 'email']
        })(req, res, next);
    };
};



/* ===================================================
   ===================================================
                   * GOOGLE-OAUTH-CALLBACK
   ===================================================
   =================================================== */
exports.googleCallback = (passport) => {
    return async (req, res, next) => {
        try {
            const authenticate = promisify((cb) => {
                passport.authenticate('google', (err, user, info) => {
                    if (err) return cb(err);
                    if (!user) return cb(new AppError('Authentication failed', 401));
                    cb(null, user);
                })(req, res);
            });
            
            const user = await authenticate;
            await promisify((cb) => req.login(user, cb));
            
            const guard = withAbortCheck(req);
            guard.check();
            
            res.redirect('/');
        } catch (err) {
            next(err);
        }
    };
};


/* ===================================================
   ===================================================
                   * LOGOUT
   ===================================================
   =================================================== */
exports.logout = async (req, res) => {
    await promisify((cb) => req.logout(cb));
    req.session.destroy();
    res.redirect('/auth/login');
};
