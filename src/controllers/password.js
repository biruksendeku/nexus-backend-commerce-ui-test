

// import custom modules
const User = require('../models/user');

const { formatName, getFirstName } = require('../utils/string/formatName');
const generateToken = require('../utils/math/generateToken');
const generateHash = require('../utils/math/generateHash');
const tokenExpiration = require('../utils/date/tokenExpiration');

const emailService = require('../services/emailService');
const extractDeviceInfo = require('../services/extractDeviceInfo');
const getLocationFromIp = require('../services/geolocationService');

const withAbortCheck = require('../utils/helpers/abortCheck');

const {
	NotFoundError,
	BadRequestError,
	AppError
} = require('../middlewares/errors/customErrors');




/* ===================================================
   ===================================================
                   * POST-RESET EMAIL
   ===================================================
   =================================================== */
exports.forgotPassword = async (req, res, next) => {

		// passing req to extract and check signal with the client
		const guard = withAbortCheck(req);


		const { email, newPassword, confirmNewPassword } = req.body;
		
		// make sure credentials are available before continuing
		if(!email || !newPassword || !confirmNewPassword) {
			throw new BadRequestError('Missing credentials');
		}

		const lowerCaseEmail = email.toLowerCase();
		const user = await User.findOne({ email: lowerCaseEmail });

		// checking user existence
		if(!user) {
			throw new AppError('Invalid credentials', 401);
		}

		// check if user is verified - prevent unverified 
		// users from accessing this
		if(!user.isVerified) {
			throw new BadRequestError('Email not verified, please verify email first');
		}

		// check if user has password - meaning logs in via "Local" strategy
		if(user.password.length === 0) {
			let authProvider = user.authProvider[user.authProvider.length - 1];
			// to format it like - "Google" instead of "google" we set before
			authProvider = formatName(authProvider);
			
			// since the user doesn't have Local-Strategy set
			throw new BadRequestError(`Signup or use your last Auth Provider ${authProvider}`);
		}

		if(newPassword !== confirmNewPassword) {
			throw new BadRequestError('Password mismatch');
		}

		const resetToken = generateToken(process.env.TOKEN_STRING_LENGTH || 32);
		const resetDate = tokenExpiration(process.env.TOKEN_EXPIRATION_DAY || 1);
		const newHash = await generateHash(newPassword, process.env.SALT || 10);

		user.resetToken = resetToken;
		user.resetDate = resetDate;
		user.newPassword = newHash;

		// check client connection before saving
		guard.check();

		// save changes to db
		await user.save();

		
		// format name like "John" rather than "john" or "JOHN"
		const firstName = getFirstName(user.name);
		const userName = formatName(firstName);

		// device and location information for the reset-password request
		const deviceInfo = extractDeviceInfo(req);
		const locationData = await getLocationFromIp(deviceInfo.ip);
		deviceInfo.location = locationData;

		// send the email		
		await emailService.resetApprovalEmail(email, resetToken, deviceInfo, userName);

		// check client connection to prevent response if aborted
		guard.check();

		// send the response as json
		res.status(201).json({
			success: true,
			message: 'Reset approval link sent, check your email to approve password reset'
		});
		
};



/* ===================================================
   ===================================================
                   * GET-RESET TOKEN
   ===================================================
   =================================================== */
exports.getResetToken = async (req, res, next) => {

		// passing req to extract and check signal with the client
		const guard = withAbortCheck(req);


		const token = req.params.token.trim().toString();
		// check token existence
		if(!token) {
			throw new AppError('Invalid token', 401);
		}

		// check client status
		guard.check();

		const user = await User.findOne({
			resetToken: token,
			resetDate: { $gt: Date.now() }
		});

		// check user existence
		if(!user) {
			throw new AppError('Invalid or expired verification link', 401);
		}

		// OPTIONAL - prevent unverified users from abusing password reset
		if(!user.isVerified) {
			throw new AppError('Unverified users cannot reset password, verify first', 401);
		}

		const newPassword = user.newPassword;
		if(!newPassword) {
			throw new BadRequestError('No new password found, try setting it again');
		}

		// replace the old password with the new one
		user.password = newPassword;

		// remove the token and it's expiration date
		user.resetToken = null;
		user.resetDate = null;

		// reset the newPassword holder for future requests
		user.newPassword = null;


		// save changes
		await user.save();

		// format user name to something like "John" rather than "john" or "JOHN"
		const firstName = getFirstName(user.name);
		const userName = formatName(firstName);

		// send the email
		await emailService.resetSuccessEmail(user.email, userName);

		// check user connection to prevent response if aborted
		guard.check();


		// send json response
		res.status(200).json({
			success: true,
			message: 'Password updated successfully, now login with your new password'
		});
};
