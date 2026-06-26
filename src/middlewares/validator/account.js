

// import packages
const { body } = require('express-validator');

// custom validator to sanitize input
const sanitizeInput = require('../../utils/string/sanitize');


// for updateProfile route
const updateProfile = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2-100 characters')
    .customSanitizer(value => sanitizeInput(value)),

  body('avatar')
    .optional()
    .trim()
    .isURL()
    .withMessage('Avatar must be a valid URL'),
];



// for changePassword route
const changePassword = [
  body('currentPassword')
    .trim()
    .notEmpty()
    .withMessage('Current password is required'),

  body('newPassword')
    .trim()
    .notEmpty()
    .withMessage('New password is required')
    .isLength({ min: 8, max: 50 })
    .withMessage('New password must be between 8-50 characters')
    .matches(/^(?=.*[A-Za-z])(?=.*\d)/)
    .withMessage('New password must contain at least one letter and one number'),

  body('confirmNewPassword')
    .trim()
    .notEmpty()
    .withMessage('Confirm password is required')
    .custom((value, { req }) => value === req.body.newPassword)
    .withMessage('Password mismatch'),
];



// for addPassword route
const addPassword = [
  body('password')
    .trim()
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8, max: 50 })
    .withMessage('Password must be between 8-50 characters long')
    .matches(/^(?=.*[A-Za-z])(?=.*\d)/)
    .withMessage('Password must contain one letter and one number'),

  body('confirmPassword')
    .trim()
    .notEmpty()
    .withMessage('Confirm password is required')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Password mismatch'),
];



// for deleteAccount route
const deleteAccount = [
  body('password')
    .trim()
    .notEmpty()
    .withMessage('Password is required'),
];



// wrap them in an object
const accountValidator = {
  updateProfile,
  changePassword,
  addPassword,
  deleteAccount,
};


// export the object
module.exports = accountValidator;
