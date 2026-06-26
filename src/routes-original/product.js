

// import packages
const router = require('express').Router();

// import custom modules
const productController = require('../controllers/product');
const productValidator = require('../middlewares/validator/product');
const handleValidationErrors = require('../middlewares/errors/handleValidationErrors');
const abortSignal = require('../middlewares/abort');



// routes
// TODO FOR /
/**
 * @swagger
 * /shop:
 *   get:
 *     summary: Get list of products
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Items per page
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [price_asc, price_desc, newest, popular]
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Array of products
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                 pagination:
 *                   type: object
 */
router.get('/',
	abortSignal,
	...productValidator.products,
	handleValidationErrors,
	productController.products
);

router.post('/add-to-cart/:id',
	...productValidator.addToCart,
	handleValidationErrors,
	productController.addToCart
);

router.get('/cart',
	productController.cart
);

router.patch('/update-cart/:id',
	...productValidator.updateCart,
	handleValidationErrors,
	productController.updateCart
);

router.post('/remove-from-cart/:id',
	...productValidator.removeFromCart,
	handleValidationErrors,
	productController.removeFromCart
);

router.get('/orders',
	abortSignal,
	productController.orderHistory
);

router.get('/orders/:id',
	...productValidator.singleOrderHistory,
	handleValidationErrors,
	productController.singleOrderHistory
);

router.post('/add-to-wishlist/:id',
	...productValidator.addToWishlist,
	handleValidationErrors,
	productController.addToWishlist
);


// export the configure
module.exports = router;
