

// import packages
const { param, body, query } = require('express-validator'); // ← was "required"

// custom validator to sanitize input
const sanitizeInput = require('../../utils/string/sanitize');


// Shared validators
const paramId = [
  param('id')
    .trim()
    .notEmpty()
    .withMessage('Product id is required')
    .isMongoId()
    .withMessage('Invalid product id format'),
];

const quantityBody = [
  body('quantity')
    .trim()
    .notEmpty()
    .withMessage('Quantity is required')
    .isInt({ min: 1, max: 999 })
    .withMessage('Quantity must be a positive integer') // ← was "intiger"
    .toInt(),
];



// for products route
const products = [
  query('name')
    .optional()
    .trim()
    .customSanitizer(value => sanitizeInput(value)),

  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer')
    .toInt(),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1-100')
    .toInt(),

  query('sort')
    .optional()
    .trim()
    .isIn(['newest', 'oldest', 'price_high', 'price_low'])
    .withMessage('Invalid sort option'),

  query('category')
    .optional()
    .trim()
    .customSanitizer(value => sanitizeInput(value)),
];



// for addToCart route
const addToCart = [...paramId, ...quantityBody];



// for updateCart route
const updateCart = [...paramId, ...quantityBody];



// for removeFromCart route
const removeFromCart = [...paramId];



// for singleOrderHistory route
const singleOrderHistory = [
  param('id')
    .trim()
    .notEmpty()
    .withMessage('Order id is required')
    .isMongoId()
    .withMessage('Invalid order id format'),
];



// for addToWishlist route
const addToWishlist = [
  param('id')
    .trim()
    .notEmpty()
    .withMessage('Product id is required')
    .isMongoId()
    .withMessage('Invalid product id format'),
];



// wrap in one object
const productValidator = {
  products,
  addToCart,
  updateCart,
  removeFromCart,
  singleOrderHistory,
  addToWishlist,
};


// export the object
module.exports = productValidator;
