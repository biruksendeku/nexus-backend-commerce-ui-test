

// import packages
const { body } = require('express-validator');
const User = require('../../models/user');

// custom validator to sanitize input
const sanitizeInput = require('../../utils/string/sanitize');
const { BadRequestError } = require('../errors/customErrors');


// for register route
const register = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2-100 characters')
    .customSanitizer(value => sanitizeInput(value)),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email address')
    .normalizeEmail()
    .customSanitizer(value => sanitizeInput(value)),

  body('password')
    .trim()
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8, max: 50 })
    .withMessage('Password must be between 8-50 characters')
    .matches(/^(?=.*[A-Za-z])(?=.*\d)/)
    .withMessage('Password must contain at least one letter and one number'),

  body('confirmPassword')
    .trim()
    .notEmpty()
    .withMessage('Confirm password is required')
    .custom((value, { req }) => value === req.body.password) // ← was equals()
    .withMessage('Password mismatch'),
];



// for login route
const login = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Missing credentials')
    .isEmail()
    .withMessage('Invalid email address')
    .normalizeEmail()
    .customSanitizer(value => sanitizeInput(value)),

  body('password')
    .trim()
    .notEmpty()
    .withMessage('Missing credentials'),
];



// wrap in one object
const authValidator = {
  register,
  login
};



// export the object
module.exports =  authValidator;
