

// import packages
const mongoose = require('mongoose');

// import external validator method
const { isEmail } = require('validator');


// create schema
const userSchema = new mongoose.Schema({
	name: {
		type: String,
		// validate using mongoose's native validator
		required: [ true, 'Name field is required' ]
	},
	email: {
		type: String,
		required: [ true, 'Email field is required' ],
		index: 1, // to speed up finding users
		lowercase: true, // to make emails lowercase
		// validate with our imported external validator
		validate: [ isEmail, 'Invalid email address' ]
	},
	avatar: String, // since it's url
	password: { // not required - user might use auth providers like Google
		type: String,
		default: null
	},
	newPassword: { // for future password reset
		type: String,
		default: null
	},
	isVerified: { // to makes sure the email belongs to them
		type: Boolean,
		default: false
	},
	userRole: { // to differentiate user actions
		type: String,
		enum: [ 'user', 'admin' ],
		default: 'user'
	},

	// for later emails for daily or timely emails
	// conditionally put this as - if(user.getEmail)
	getMarketingEmail: {
		type: Boolean,
		default: true
	},
	authProvider: Array, // to store what user used to Log-In
	// auth provider unique ids coming from auth prividers
	googleId: String,
	// to verify emails under specified period of time
	verificationToken: String,
	verificationDate: Date,
	// to verify password reset verification tokens with specified period of time
	resetToken: String,
	resetDate: Date,
	wishlist: {
		type: Array,
		default: []
	},
	// email verification date
	verifiedAt: {
		type: Date,
		default: null
	}
}, { timestamps: true } ); // enable mongoose's native creatdAt and updatedAt timestamps


// export the model
module.exports = mongoose.model('User', userSchema);
