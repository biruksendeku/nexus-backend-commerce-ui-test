

// external packages
const router = require('express').Router();

// import custom packages
const adminController = require('../controllers/admin');
const upload = require('../config/storage/multer');
const adminValidator = require('../middlewares/validator/admin');
const handleValidationErrors = require('../middlewares/errors/handleValidationErrors');
const abortSignal = require('../middlewares/abort');



// TODO FOR /dashboard
/**
 * @swagger
 * /admin/dashboard:
 *   get:
 *     summary: Admin dashboard stats
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     users:
 *                       type: object
 *                     orders:
 *                       type: object
 *                     products:
 *                       type: object
 *                     revenue:
 *                       type: object
 */

// ROUTERS
router.get('/dashboard',
	abortSignal,
	adminController.dashboard
);

// TODO FOR /create
/**
 * @swagger
 * /admin/create:
 *   post:
 *     summary: Create a new product
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - quantity
 *               - category
 *               - deliveryTime
 *               - productInfo
 *               - images
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               quantity:
 *                 type: integer
 *               category:
 *                 type: string
 *                 enum: [clothing, electronics, books, home, sports, beauty, toys, other]
 *               deliveryTime:
 *                 type: string
 *                 enum: [2-3 days, 3-5 days, 5-7 days, 7-10 days]
 *               productInfo:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [in stock, out of stock, pre-order]
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Product created
 *       400:
 *         description: Missing fields or validation error
 */
router.post('/create',
	upload.array('images', 5),
	...adminValidator.createProduct,
	handleValidationErrors,
	adminController.createProduct
);

router.get('/products',
	abortSignal,
	...adminValidator.getAllProducts,
	handleValidationErrors,
	adminController.getAllProducts
);

router.get('/products/:id',
	...adminValidator.getOneProduct,
	handleValidationErrors,
	adminController.getOneProduct
);

router.get('/orders',
	abortSignal,
	...adminValidator.getAllOrders,
	handleValidationErrors,
	adminController.getAllOrders
);

router.get('/revenue',
	abortSignal,
	adminController.getAllRevenue
);

router.patch('/products/:id',
	upload.array('images', 5),
	...adminValidator.updateProduct,
	handleValidationErrors,
	adminController.updateProduct
);

router.delete('/products/:id',
	...adminValidator.deleteProduct,
	handleValidationErrors,
	adminController.deleteProduct
);

router.get('/errors',
	adminController.getCriticalErrors
);

router.get('/errors/:id',
	...adminValidator.getErrorDetail,
	handleValidationErrors,
	adminController.getErrorDetail
);

router.delete('/errors/:id',
	...adminValidator.deleteError,
	handleValidationErrors,
	adminController.deleteError
);

router.post('/errors/bulk-delete',
	...adminValidator.deleteMultipleErrors,
	handleValidationErrors,
	adminController.deleteMultipleErrors
);


// finally export the configured router
module.exports = router;
