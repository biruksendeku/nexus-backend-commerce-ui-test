

// import packages
const GoogleStrategy = require('passport-google-oauth20').Strategy;

// our exported model
const User = require('../../models/user');

// configure Google-passport

// passing "passport" parameter in the configurePassportGoogle function to later
// pass it with the imported passport module as an argument
module.exports = function passportGoogle(passport) {
	passport.use(new GoogleStrategy(
		{
			// follow the user-guide or README.md file for more 
			// instructions on how to get these credentials
			clientID: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
			callbackURL: process.env.GOOGLE_CALLBACK_URL,
			// what we want to extract from the returned user data
			profileFields: [ 'email', 'displayName', 'id', 'avatar' ]
		},
		async (accessToken, refreshToken, profile, done) => {
			try {
				// extracting email from profile
				const email = profile.emails[0]?.value;
				// looking for user using email
				const user = await User.findOne({ email });
				if(user) {
				// first check if the user already uses Google or not
					if(!user.googleId) {
						// user is adding Google to the provider list
						user.googleId = profile.id;
						user.isVerified = true;
						user.verifiedAt = new Date();
						user.authProvider.push('google');
						await user.save();
						done(null, user);
					} else {
						// user already uses Google
						done(null, user);
					}
				}

				// a brand new user just creating account and using Google
				const newUser = new User({
					name: profile.displayName ? profile.displayName : `GoogleUser-${Date.now()}`,
					email,
					// adding the provider id to later track the user providers
					googleId: profile.id,
					avatar: profile.photos ? profile.photos[0]?.value : null,
					isVerified: true,
					verifiedAt: new Date(),
				});
				// add provider to the array for the records
				newUser.authProvider.push('google');
				await newUser.save();
				// pass the new user in successand null for error
				done(null, newUser);
			} catch(err) {
				// pass error to the callback if something goes wrong
				done(err);
			}
		}
	));

	// storing important data for later use case to reduce DB queries
	passport.serializeUser((user, done) => {
		done(null, {
			_id: user._id,
			email: user.email,
			isVerified: user.isVerified,
			userRole: user.userRole
		});
	});

	// we accept the id (what we passed onto serialize) and deserialize it to provide the full info 
	passport.deserializeUser((userData, done) => {
		try {
			done(null, userData);
		} catch(err) {
			done(err, null);
		}
	});
};
