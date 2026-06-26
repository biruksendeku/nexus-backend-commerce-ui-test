

// import packages
const { body, query, param } = require('express-validator');

// custom validator to sanitize input
const sanitizeInput = require('../../utils/string/sanitize');
const { BadRequestError } = require('../../middlewares/errors/customErrors');


// Shared pagination/sort validators to avoid structuredClone
const listQueryValidators = [
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
    .isIn(['newest', 'oldest', 'price_asc', 'price_desc', 'name_asc', 'name_desc'])
    .withMessage('Invalid sort option'),
];



// for createProduct route
const createProduct = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Product name is required')
    .isLength({ min: 2, max: 200 })
    .withMessage('Product name must be between 2-200 characters long')
    .customSanitizer(value => sanitizeInput(value)),

  body('price')
    .trim()
    .notEmpty()
    .withMessage('Price is required')
    .isFloat({ min: 0, max: 999999.99 })
    .withMessage('Price must be a positive number between 0-999999.99')
    .toFloat(),

  body('quantity')
    .trim()
    .notEmpty()
    .withMessage('Quantity is required')
    .isInt({ min: 0 })
    .withMessage('Quantity must be a positive integer')
    .toInt(),

  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required')
    .isLength({ max: 100 })
    .withMessage('Category cannot exceed 100 characters')
    .customSanitizer(value => sanitizeInput(value)),

  body('deliveryTime')
    .optional()
    .trim()
    .matches(/^\d+-\d+\s+(?:days|hours|weeks)$/)
    .withMessage('Invalid delivery time format (e.g., "2-3 days")'),

  body('productInfo')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Product info cannot exceed 2000 characters')
    .customSanitizer(value => sanitizeInput(value)),

  body('status')
    .optional()
    .trim()
    .isIn(['in stock', 'out of stock', 'pre-order'])
    .withMessage('Invalid product status value'),
];



// for getAllProducts route
const getAllProducts = [
  ...listQueryValidators,

  query('name')
    .optional()
    .trim()
    .customSanitizer(value => sanitizeInput(value)),

  query('category')
    .optional()
    .trim()
    .customSanitizer(value => sanitizeInput(value)),
];



// for getOneProduct route
const getOneProduct = [
  param('id')
    .trim()
    .notEmpty()
    .withMessage('Invalid product id')
    .isMongoId()
    .withMessage('Invalid product id format'),
];



// for getAllOrders route
const getAllOrders = [
  ...listQueryValidators,
  
  query('status')
    .optional()
    .trim()
	.isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'])
	.withMessage('Invalid order status'),
];



// for getOneOrder route
const getOneOrder = [
  param('id')
    .trim()
	.notEmpty()
	.withMessage('Order ID is required')
	.isMongoId()
	.withMessage('Invalid order ID format'),
];


const updateOrder = [
  param('id')
    .trim()
	.notEmpty()
	.withMessage('Order ID is required')
	.isMongoId()
	.withMessage('Invalid order ID format'),
	
  body('orderStatus')
	.optional()
	.trim()
	.isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'])
	.withMessage('Invalid order status'),

  body('paymentStatus')
    .optional()
	.trim()
	.isIn(['pending', 'paid', 'failed', 'refunded'])
	.withMessage('Invalid payment status')
];


// for updateProduct route
const updateProduct = [
  param('id')
    .trim()
    .notEmpty()
    .withMessage('Invalid product ID')
    .isMongoId()
    .withMessage('Invalid product ID format'),

  body('name')
    .optional({ checkFalsy: true })
    .trim()
    .notEmpty()
    .withMessage('Product name is required')
    .customSanitizer(value => sanitizeInput(value)),

  body('price')
    .optional({ checkFalsy: true })
    .trim()
    .isFloat({ min: 0, max: 999999.99 })
    .withMessage('Price must be a positive number')
    .toFloat(),

  body('quantity')
    .optional({ checkFalsy: true })
    .trim()
    .isInt({ min: 0 })
    .withMessage('Quantity must be a positive integer')
    .toInt(),

  body('category')
    .optional({ checkFalsy: true })
    .trim()
    .notEmpty()
    .withMessage('Category is required')
    .customSanitizer(value => sanitizeInput(value)),

  body('deliveryTime')
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^\d+-\d+\s+(?:days|hours|weeks)$/)
    .withMessage('Invalid delivery time format'),

  body('productInfo')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Product info cannot exceed 2000 characters')
    .customSanitizer(value => sanitizeInput(value)),

  body('status')
    .optional({ checkFalsy: true })
    .trim()
    .isIn(['in stock', 'out of stock', 'pre-order'])
    .withMessage('Invalid status value'),

  body('deleteImages')
    .optional({ checkFalsy: true })
    .isArray()
    .withMessage('Delete-Images must be an array'),

  body('order')
    .optional({ checkFalsy: true })
    .isArray()
    .withMessage('Image-IDs for sort must be given as an array'),
    

  // custom validation for image limit
  body().custom((value, { req }) => {
    const currentImages = req.product?.images?.length || 0;
    const newImages = req.files?.length || 0;
    const deletedImages = (req.body.deleteImages || []).length;

    const finalImageCount = currentImages - deletedImages + newImages;

    if (finalImageCount > parseInt(process.env.MAX_IMAGE_LIMIT)) {
      throw new BadRequestError(`Total images cannot exceed ${process.env.MAX_IMAGE_LIMIT} (would be ${finalImageCount})`);
    }

    if (finalImageCount < 1) {
      throw new BadRequestError('Product must have at least one image');
    }

    return true;
  }),
];



// for deleteProduct route
const deleteProduct = [
  param('id')
    .trim()
    .notEmpty()
    .withMessage('Product ID required')
    .isMongoId()
    .withMessage('Invalid product ID format'),
];

// for get one user
const getOneUser = [
  param('id')
	.trim()
	.notEmpty()
	.withMessage('User ID required')
	.isMongoId()
	.withMessage('Invalid user ID format'),
];

// for update user
const updateUser = [
  param('id')
  	.trim()
  	.notEmpty()
  	.withMessage('User ID required')
  	.isMongoId()
  	.withMessage('Invalid user ID format'),

  body('userRole')
  	.optional()
  	.trim()
  	.isIn(['user', 'admin'])
  	.withMessage('Invalid user role format'),

  body('getEmail')
  	.optional()
  	.trim()
  	.isBoolean()
  	.withMessage('Invalid value, only true or false are accepted')
];

// for delete user
const deleteUser = [
  param('id')
  	.trim()
  	.notEmpty()
  	.withMessage('User ID required')
  	.isMongoId()
  	.withMessage('Invalid user ID format'),
];


// to delete single error - after fixing
const deleteError = [
    param('id')
    	.trim()
        .isMongoId()
        .withMessage('Invalid MongoDB ID format')
];


// to get single error
const getErrorDetail = [
	param('id')
		.trim()
		.isMongoId()
		.withMessage('Invalid MongoDB ID format')
];



// wrap in one object
const adminValidator = {
  createProduct,
  getAllProducts,
  getOneProduct,
  getAllOrders,
  getOneOrder,
  updateOrder,
  updateProduct,
  deleteProduct,
  getOneUser,
  updateUser,
  deleteUser,
  deleteError,
  getErrorDetail
};


// export the validator
module.exports = adminValidator;
