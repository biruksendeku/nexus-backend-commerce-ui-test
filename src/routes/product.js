

// import packages
const router = require('express').Router();

// import custom modules
const productController = require('../controllers/product');
const productValidator = require('../middlewares/validator/product');
const handleValidationErrors = require('../middlewares/errors/handleValidationErrors');
const abortSignal = require('../middlewares/abort');

// ---------- SWAGGER COMMENTS ----------

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Get list of products (shop)
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
 *         description: Array of products with pagination
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *                 pagination:
 *                   type: object
 */
router.get('/',
    abortSignal,
    ...productValidator.products,
    handleValidationErrors,
    productController.products
);

/**
 * @swagger
 * /products/add-to-cart/{id}:
 *   post:
 *     summary: Add a product to the session cart
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity:
 *                 type: integer
 *                 default: 1
 *     responses:
 *       201:
 *         description: Item added to cart
 *       400:
 *         description: Out of stock
 *       404:
 *         description: Product not found
 */
router.post('/add-to-cart/:id',
    ...productValidator.addToCart,
    handleValidationErrors,
    productController.addToCart
);

/**
 * @swagger
 * /products/cart:
 *   get:
 *     summary: Get current session cart
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Cart contents
 *       204:
 *         description: Cart is empty
 */
router.get('/cart',
    productController.cart
);

/**
 * @swagger
 * /products/update-cart/{id}:
 *   patch:
 *     summary: Update quantity of an item in cart
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID in cart
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Cart updated
 *       204:
 *         description: Item removed (quantity <= 0)
 */
router.patch('/update-cart/:id',
    ...productValidator.updateCart,
    handleValidationErrors,
    productController.updateCart
);

/**
 * @swagger
 * /products/remove-from-cart/{id}:
 *   post:
 *     summary: Remove an item from cart
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       204:
 *         description: Item removed
 *       404:
 *         description: Product not found
 */
router.post('/remove-from-cart/:id',
    ...productValidator.removeFromCart,
    handleValidationErrors,
    productController.removeFromCart
);

/**
 * @swagger
 * /products/order-history:
 *   get:
 *     summary: Get order history of the authenticated user
 *     tags: [Products]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of orders
 *       204:
 *         description: No orders yet
 */
router.get('/order-history',
    abortSignal,
    productController.orderHistory
);

/**
 * @swagger
 * /products/order-history/{id}:
 *   get:
 *     summary: Get details of a single order
 *     tags: [Products]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order details
 *       404:
 *         description: Order not found
 */
router.get('/order-history/:id',
    ...productValidator.singleOrderHistory,
    handleValidationErrors,
    productController.singleOrderHistory
);

/**
 * @swagger
 * /products/add-to-wishlist/{id}:
 *   post:
 *     summary: Add a product to the user's wishlist
 *     tags: [Products]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       201:
 *         description: Added to wishlist
 *       404:
 *         description: Product not found
 */
router.post('/add-to-wishlist/:id',
    ...productValidator.addToWishlist,
    handleValidationErrors,
    productController.addToWishlist
);


// export the configured router
module.exports = router;
