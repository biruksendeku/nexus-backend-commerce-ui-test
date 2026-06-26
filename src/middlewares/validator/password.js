

// import packages
const { body, param } = require('express-validator');
const User = require('../../models/user');

// custom validator to sanitize input
const sanitizeInput = require('../../utils/string/sanitize');


// for forgotPassword route
const forgotPassword = [
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

  body('newPassword')
    .trim()
    .notEmpty()
    .withMessage('New password is required')
    .isLength({ min: 8, max: 50 })
    .withMessage('Password must be between 8-50 characters')
    .matches(/^(?=.*[A-Za-z])(?=.*\d)/)
    .withMessage('Password must contain at least one letter and one number'),

  body('confirmNewPassword')
    .trim()
    .notEmpty()
    .withMessage('Password confirmation is required')
    .custom((value, { req }) => value === req.body.newPassword)
    .withMessage('Password mismatch'),
];



// for getResetToken route
const getResetToken = [
  param('token')
    .trim()
    .notEmpty()
    .withMessage('Token is required')
    .matches(/^[A-Za-z0-9-_]+$/)
    .withMessage('Token contains invalid characters'),
];



// wrap in one object
const passwordValidator = {
  forgotPassword,
  getResetToken,
};


// export the object
module.exports = passwordValidator;
