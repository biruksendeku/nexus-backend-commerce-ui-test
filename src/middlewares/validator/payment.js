

// import packages
const { body } = require('express-validator');


// create the validator and exporting it
const createPayment = [
  body('items')
    .isArray({ min: 1 })
    .withMessage('At least one item is required'),
  
  body('items.*.productId')
    .trim()
    .notEmpty()
    .withMessage('Product ID is required')
    .isMongoId()
    .withMessage('Invalid product ID format'),
  
  body('items.*.quantity')
    .isInt({ min: 1, max: 100 })
    .withMessage('Quantity must be between 1 and 100'),
  
  body('items.*.variant')  // Optional: if products have variants (size, color)
    .optional()
    .trim()
    .isString()
    .withMessage('Variant must be a string'),
  
  body('shippingAddress')
    .optional()
    .isObject()
    .withMessage('Shipping address must be an object'),
  
  body('shippingAddress.street')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Street address is required'),
  
  body('shippingAddress.city')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('City is required'),
  
  body('shippingAddress.state')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('State is required'),
  
  body('shippingAddress.zipCode')
    .optional()
    .trim()
    .matches(/^[0-9]{4,10}$/)
    .withMessage('Invalid zip code format'),
  
  body('shippingAddress.country')
    .optional()
    .trim()
    .isLength({ min: 2, max: 60 })
    .withMessage('Country is required'),
  
  body('couponCode')  // optional: discount coupons
    .optional()
    .trim()
    .isString()
    .withMessage('Invalid coupon code'),
  
  body('notes')  // optional: customer notes
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes must be under 500 characters')
];



// wrap in object for consistent structure
const paymentValidator = {
	createPayment
};


// export the object
module.exports = paymentValidator;
