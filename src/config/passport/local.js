

// import packages
const LocalStrategy = require('passport-local').Strategy;

// our user model
const User = require('../../models/user');
const { formatName } = require('../../utils/string/formatName');

// to compare password using bcryptjs
const comparePassword = require('../../utils/math/comparePassword');
const { BadRequestError } = require('../../middlewares/errors/customErrors');


// configuring local provider for Login and Signup using passwords
module.exports = function passportLocal(passport) {
	passport.use(new LocalStrategy(
		{
			// we choose email as our unique username-field
			usernameField: 'email',
			passwordField: 'password',
			// passing "req" object for "req.flash" usage purpose to display errors at ease
			passReqToCallback: true
		},
		async (req, email, password, done) => {
			try {
				// making sure the user provided both
				if(!email || !password) {
					// if you prefer flash middleware enable this
					// req.flash('error', 'Missing credentials');
					throw new BadRequestError('Missing credentials');
					return done(null, false);
				}
				// since it's Login we want to use Passport-Local for 
				// the user must exist
				const user = await User.findOne({ email });
				if(!user) {
					// it's because we are using for LOGIN only not for 
					// user registration

					// if you use flash for error and success notification enable this
					// req.flash('error', 'Email not registered');
					throw new BadRequestError('Email not registered');
					// passing false since req.flash handles the error display
					return done(null, false);
				}
				// lastUsed is to remind the user what they used last time and give them 
				// a choice to use the provider (Google, Facebook ) or Signup to 
				// setup password which is required to Login
				let lastUsed = user.authProvider[user.authProvider.length - 1];
				const lastUsedFormatted = formatName(lastUsed);
				if(user.password === null) {

					// enable this if you prefer flash middleware
					// req.flash('error', `Signup or use your last Auth Provider ${lastUsed}`);
					throw new BadRequestError(`Signup to set password or use your last Auth Provider ${lastUsedFormatted}`);
					return done(null, false);
				}
				// check password validity using bcrypt native method - compare
				const isValid = await comparePassword(password, user.password);
				if(!isValid) {
					// req.flash('error', 'Incorrect email or password');
					throw new BadRequestError('Incorrect email or password');
					return done(null, false);
				}
				done(null, user);
			} catch(err) {
				done(err);
			}
		}
	));

	// storing important data to session for later use to reduce DB queries
	passport.serializeUser((user, done) => {
		done(null, {
			_id: user._id,
			email: user.email,
			isVerified: user.isVerified,
			userRole: user.userRole
		});
	});

	// deserialize user from the id
	passport.deserializeUser((userData, done) => {
		try {
			done(null, userData);
		} catch(err) {
			done(err, null);
		}
	});
};
