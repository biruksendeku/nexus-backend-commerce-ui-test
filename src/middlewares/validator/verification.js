

// import packages
const { param, body } = require('express-validator');
const User = require('../../models/user');

// custom validator to sanitize input
const sanitizeInput = require('../../utils/string/sanitize');


// for resendVerification route
const resendVerification = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email address')
    .normalizeEmail()
    .customSanitizer(value => sanitizeInput(value))
    .custom(async (email) => {
      const existingUser = await User.findOne({ email });
      if (!existingUser) {
        throw new Error('Incorrect email address, make sure you entered the correct email');
      }
      return true;
    }),
];



// for verifyEmail route
const verifyEmail = [
  param('token')
    .trim()
    .notEmpty()
    .withMessage('Token is required')
    .matches(/^[A-Za-z0-9-_]+$/)
    .withMessage('Token contains invalid characters'),
];



// wrap in one object
const verificationValidator = {
  resendVerification,
  verifyEmail,
};


// export the object
module.exports = verificationValidator;
