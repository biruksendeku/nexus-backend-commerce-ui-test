

// import custom modules
const User = require('../models/user');

const emailService = require('../services/emailService');

const generateToken = require('../utils/math/generateToken');
const tokenExpiration = require('../utils/date/tokenExpiration');

const { formatName, getFirstName } = require('../utils/string/formatName');
const withAbortCheck = require('../utils/helpers/abortCheck');
const promisify = require('../utils/helpers/promisify');

const {
	NotFoundError,
	BadRequestError,
	AppError
} = require('../middlewares/errors/customErrors');



/* ===================================================
   ===================================================
                   * GET-VERIFY EMAIL
   ===================================================
   =================================================== */
exports.verifyEmail = async (req, res, next) => {

		// passing req to extract and check signal with the client
		const guard = withAbortCheck(req);


		const token = req.params.token.trim().toString();

		// check token existence
		if(!token) {
			throw new AppError('Invalid token', 401);
		}

		// check client connection
		guard.check();

		// using the tokens data looking for user
		const user = await User.findOne({
			verificationToken: token,
			verificationDate: { $gt: Date.now() }
		});

		// check user existence
		if(!user) {
			throw new AppError('Invalid or expired verification link, request new link on /api/verify/resend-verification', 401);
		}

		// check if user was already verified
		if(user.isVerified) { // we have this in our User model
			user.verificationToken = null;
			user.verificationDate = null;

			throw new BadRequestError('Email already verified');
		}

		// if the code reaches here - user is verifying new email
		user.verificationToken = null;
		user.verificationDate = null;
		user.isVerified = true;
		user.verifiedAt = new Date();
		await user.save();

		// make the req.login function async function
		await promisify((cb) => req.login(user, cb));

		// check client connection to prevent response
		guard.check();

		// if the client gets here - login successful
		res.redirect('/');
};



/* ===================================================
   ===================================================
                   * RESEND VERIFICATION EMAIL
   ===================================================
   =================================================== */
exports.resendVerification = async (req, res, next) => {

		// passing req to extract and check signal with the client
		const guard = withAbortCheck(req);


		// extract email from request body
		const { email } = req.body;

		// make sure credentials are available before continuing
		if(!email) {
			throw new AppError('Invalid credentials', 401);
		}

		// make sure email is lowercased - since in our db it's lowercased
		const lowerCaseEmail = email.toLowerCase();
		const user = await User.findOne({ email: lowerCaseEmail })

		// checking user existence
		if(!user) {
			throw new AppError('Invalid credentials', 401);
		}

		// check if user was already verified
		if(user.isVerified) {
			throw new BadRequestError('Email already verified');
		}

		const verificationToken = generateToken(process.env.TOKEN_STRING_LENGTH || 32);
		const verificationDate = tokenExpiration(process.env.TOKEN_EXPIRATION_DAY || 1);

		// add to user object in db
		user.verificationToken = verificationToken;
		user.verificationDate = verificationDate;
		
		// format user name as "John" rather than "john" or "JOHN"
		const firstName = getFirstName(user.name);
		const userName = formatName(firstName);
		
		// check client connection before saving to db
		guard.check();

		// save the user and send the email
		await user.save();
		await emailService.sendVerificationEmail(email, verificationToken, userName);
		
		
		// prevent response if connection aborted
		guard.check();


		// send json response
		res.status(200).json({
			success: false,
			message: 'Verification link sent, check your email to verify'
		});
};
