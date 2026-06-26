

// import custom packages
const User = require('../models/user');

const { formatName, getFirstName } = require('../utils/string/formatName');

const generateHash = require('../utils/math/generateHash');
const comparePassword = require('../utils/math/comparePassword');

const withAbortCheck = require('../utils/helpers/abortCheck');
const promisify = require('../utils/helpers/promisify');

const emailService = require('../services/emailService');
const extractDeviceInfo = require('../services/extractDeviceInfo');
const getLocationFromIp = require('../services/geolocationService');

const {
	NotFoundError,
	BadRequestError,
	AppError
} = require('../middlewares/errors/customErrors');



/* ===================================================
   ===================================================
                   * GET PROFILE
   ===================================================
   =================================================== */
exports.getProfile = async (req, res) => {
    
    	// passing req to extract and check signal with the client
    	const guard = withAbortCheck(req);
    
        const userId = req.user._id;
        
        const user = await User.findById(userId)
            .select('-password -newPassword -verificationToken -resetToken -resetDate -verificationDate');
        
        if (!user) {
            throw new AppError('Invalid credentials', 401);
        }
        
        // check client connection to prevent response if aborted
        guard.check();
        
        // send json response
        res.status(200).json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    avatar: user.avatar,
                    isVerified: user.isVerified,
                    userRole: user.userRole,
                    authProvider: user.authProvider,
                    verifiedAt: user.verifiedAt,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt
                }
            }
        });
};



/* ===================================================
   ===================================================
                   * UPDATE PROFILE
   ===================================================
   =================================================== */
exports.updateProfile = async (req, res) => {
    
    	// passing req to extract and check signal with the client
    	const guard = withAbortCheck(req);
    
        const userId = req.user._id;
        const { name, avatar } = req.body;
        
        // check if at least one field is provided
        if (!name && !avatar) {
        	throw new BadRequestError('Update fields required');
        }
        
        const updateData = {};
        
        if (name) {
            updateData.name = formatName(name);
        }
        
        if (avatar) {
            updateData.avatar = avatar;
        }
        
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true, runValidators: true }
        ).select('-password -newPassword -verificationToken -resetToken -resetDate -verificationDate');
        
        if (!updatedUser) {
        	throw new NotFoundError('Updated User');
        }
        
        // check client connection to prevent response if aborted
        guard.check();
        
        // send json response
        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: {
                user: updatedUser
            }
        });

};



/* ===================================================
   ===================================================
                   * CHANGE PASSWORD
   ===================================================
   =================================================== */
exports.changePassword = async (req, res) => {
    
    	// passing req to extract and check signal with the client
    	const guard = withAbortCheck(req);
    
        const userId = req.user._id;
        const { currentPassword, newPassword, confirmNewPassword } = req.body;
        
        // validate required fields
        if (!currentPassword || !newPassword || !confirmNewPassword) {
        	throw new BadRequestError('Missing credentials');
        }
        
        // check if new password matches confirmation
        if (newPassword !== confirmNewPassword) {
        	throw new BadRequestError('Password mismatch');
        }
        
        // check password length/strength
        if (newPassword.length < 8 || newPassword.length > 32) {
        	throw new BadRequestError('Password length must be between 8-32 characters');
        }
        
        const user = await User.findById(userId);
        
        // check client existence
        if (!user) {
        	throw new AppError('Invalid credentials', 401);
        }
        
        // check if user has local auth provider
        if (!user.authProvider.includes('local')) {
            throw new BadRequestError('This account uses social login only. Add password first.');
        }
        
        // verify current password
        const isPasswordValid = await comparePassword(currentPassword, user.password);
        
        if (!isPasswordValid) {
            throw new BadRequestError('Incorrect current password');
        }

        // check if new is same as old
        const isPasswordSameAsBefore = await comparePassword(newPassword, user.password);
        
        if(isPasswordSameAsBefore) {
        	throw new BadRequestError('New password cannot be same as old password');
        }
        
        // hash new password
        const newHash = await generateHash(newPassword, process.env.SALT || 10);
        
        // update password
        user.password = newHash;
        await user.save();
        
        // format user name for email
        const firstName = getFirstName(user.name);
        const userName = formatName(firstName);

        // device & location data of the client
        const deviceInfo = extractDeviceInfo(req);
        const locationData = await getLocationFromIp(deviceInfo.ip);
        deviceInfo.location = locationData;
        
        // send confirmation email
        await emailService.passwordChangedEmail(user.email, userName, deviceInfo);
        
        // check client connection to prevent response if aborted
        guard.check();
        
        // send json response
        res.status(200).json({
            success: true,
            message: 'Password changed successfully'
        });

};



/* ===================================================
   ===================================================
                   * DELETE ACCOUNT
   ===================================================
   =================================================== */
exports.deleteAccount = async (req, res, next) => {
    
    	// passing req to extract and check signal with the client
    	const guard = withAbortCheck(req);
    
        const userId = req.user._id;
        const { password } = req.body;
        
        const user = await User.findById(userId);
        
        if (!user) {
        	throw new AppError('Invalid credentials', 401);
        }
        
        // if user has local auth, verify password before deletion
        if (user.authProvider.includes('local')) {
            if (!password) {
                throw new BadRequestError('Password required to delete account');
            }

            // check password validity
            const isPasswordValid = await comparePassword(password, user.password);
            
            if (!isPasswordValid) {
                throw new AppError('Invalid credentials', 401);
            }
        }
        
        // format user name for email
        const firstName = getFirstName(user.name);
        const userName = formatName(firstName);
        
        // send farewell email👋👋
        await emailService.accountDeletedEmail(user.email, userName);
        
        // delete user
        await User.findByIdAndDelete(userId);

        // promisify the callback for express-async-errors
        // to catch it
        await promisify((cb) => req.logout(cb));

        // destroy session
        req.session.destroy();
        
        // check client connection to prevent response if aborted
        guard.check();
        
        // send json response
        res.status(204).json({
            success: true,
            message: 'Account deleted successfully'
        });

};



/* ===================================================
   ===================================================
                   * GET ACCOUNT SETTINGS
   ===================================================
   =================================================== */
exports.getSettings = async (req, res) => {
    
    	// passing req to extract and check signal with the client
    	const guard = withAbortCheck(req);
    
        const userId = req.user._id;
        
        const user = await User.findById(userId)
            .select('isVerified userRole authProvider email verifiedAt');
        
        if (!user) {
            throw new AppError('Invalid credentials', 401);
        }
        
        // check client connection to prevent response if aborted
        guard.check();
        
        // send json response
        res.status(200).json({
            success: true,
            data: {
                settings: {
                    email: user.email,
                    isVerified: user.isVerified,
                    userRole: user.userRole,
                    authProvider: user.authProvider,
                    verifiedAt: user.verifiedAt,
                    hasPassword: user.authProvider.includes('local')
                }
            }
        });
};



/* ===================================================
   ===================================================
                   * ADD PASSWORD TO SOCIAL ACCOUNT
   ===================================================
   =================================================== */
exports.addPasswordToSocialAccount = async (req, res) => {

    	// passing req to extract and check signal with the client
    	const guard = withAbortCheck(req);
    
        const userId = req.user._id;
        const { password, confirmPassword } = req.body;
        
        // validate required fields
        if (!password || !confirmPassword) {
            throw new BadRequestError('Missing credentials');
        }
        
        // check if passwords match
        if (password !== confirmPassword) {
            throw new BadRequestError('Password mismatch');
        }
        
        // check password strength
        if (password.length < 8 || password.length > 32) {
            throw new BadRequestError('Password length must be between 8-32 characters');
        }
        
        const user = await User.findById(userId);
        
        if (!user) {
            throw new AppError('Invalid credentials', 401);
        }
        
        // check if user already has local auth
        if (user.authProvider.includes('local')) {
            throw new BadRequestError('Password already set for this account');
        }
        
        // hash password
        const hash = await generateHash(password, process.env.SALT || 10);
        
        // add local auth provider
        user.password = hash;
        user.authProvider.push('local');
        await user.save();
        
        // format user name for email
        const firstName = getFirstName(user.name);
        const userName = formatName(firstName);
        
        // send confirmation email
        await emailService.passwordAddedEmail(user.email, userName);
        
        // check client connection to prevent response if aborted
        guard.check();
        
        // send json response
        res.status(200).json({
            success: true,
            message: 'Password added successfully. You can now login with email and password.'
        });
};



/* ===================================================
   ===================================================
                   * UNSUBSCRIBE-FROM-EMAIL-SERVICES
   ===================================================
   =================================================== */
exports.unsubscribeEmail = async (req, res) => {

	const guard = withAbortCheck(req);
	const userId = req.user._id;

	const user = await User.findById(userId);

	// check user existence
	if(!user) {
		throw new NotFoundError('User');
	}

	// check if already unsubscribed
	if(!user.getEmail) {
		throw new AppError('You already unsubscribed from marketing email services!', 400);
	}

	// unsubscribe from email services
	user.getEmail = false;

	// save changes
	await user.save();

	// check client connection before response
	guard.check();

	// send json response
	res.status(200).json({
		success: true,
		message: 'Successfully unsubscribed from email services',
	});
};
