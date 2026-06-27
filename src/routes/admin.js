

// external packages
const router = require('express').Router();

// import custom packages
const adminController = require('../controllers/admin');
const upload = require('../config/storage/multer');
const adminValidator = require('../middlewares/validator/admin');
const handleValidationErrors = require('../middlewares/errors/handleValidationErrors');
const abortSignal = require('../middlewares/abort');
const loadProduct = require('../utils/validator/loadProduct');

const { isAdmin, isSuperAdmin } = require('../middlewares/role');

// ---------- SWAGGER COMMENTS ----------

/**
 * @swagger
 * /admin/dashboard:
 *   get:
 *     summary: Admin dashboard with key metrics
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data including users, products, orders, revenue
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
 *                       properties:
 *                         total:
 *                           type: integer
 *                         recent:
 *                           type: array
 *                     orders:
 *                       type: object
 *                       properties:
 *                         recent:
 *                           type: array
 *                         pending:
 *                           type: array
 *                         cancelled:
 *                           type: array
 *                         today:
 *                           type: array
 *                         yesterday:
 *                           type: array
 *                         dailyChange:
 *                           type: number
 *                         topSelling:
 *                           type: array
 *                     products:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         inStock:
 *                           type: integer
 *                         outOfStock:
 *                           type: integer
 *                     revenue:
 *                       type: object
 *                       properties:
 *                         today:
 *                           type: number
 *                         yesterday:
 *                           type: number
 *                         dailyChange:
 *                           type: number
 *                         allTime:
 *                           type: number
 */
router.get('/dashboard',
	isAdmin,
    abortSignal,
    adminController.dashboard
);

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
 *                 enum: [1-2 days, 2-3 days, 3-5 days, 5-7 days, 7-10 days]
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
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Product'
 *       400:
 *         description: Validation error or missing images
 */
router.post('/create',
	isAdmin,
    upload.array('images', 5),
    ...adminValidator.createProduct,
    handleValidationErrors,
    adminController.createProduct
);

/**
 * @swagger
 * /admin/products:
 *   get:
 *     summary: Get all products with filtering, sorting, and pagination
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
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
 *         description: Sort field (e.g., price_asc, price_desc)
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
 *         description: Paginated list of products with stats
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
 *                 stats:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     inStock:
 *                       type: integer
 *                     outOfStock:
 *                       type: integer
 *                     popular:
 *                       type: integer
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     totalItems:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     hasNextPage:
 *                       type: boolean
 *                     hasPrevPage:
 *                       type: boolean
 */
router.get('/products',
	isAdmin,
    abortSignal,
    ...adminValidator.getAllProducts,
    handleValidationErrors,
    adminController.getAllProducts
);

/**
 * @swagger
 * /admin/products/{id}:
 *   get:
 *     summary: Get a single product by ID
 *     tags: [Admin]
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
 *       200:
 *         description: Product details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 */
router.get('/products/:id',
	isAdmin,
    ...adminValidator.getOneProduct,
    handleValidationErrors,
    adminController.getOneProduct
);

/**
 * @swagger
 * /admin/orders:
 *   get:
 *     summary: Get all orders with optional filters and sorting
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         description: Sorting option (e.g., newest, total_asc, total_desc)
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, processing, shipped, delivered, cancelled]
 *     responses:
 *       200:
 *         description: Paginated orders with analytics
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
 *                     $ref: '#/components/schemas/Order'
 *                 analytics:
 *                   type: object
 *                   properties:
 *                     daily:
 *                       type: number
 *                     weekly:
 *                       type: number
 *                     monthly:
 *                       type: number
 *                     yearly:
 *                       type: number
 *                     allTime:
 *                       type: integer
 *                 pagination:
 *                   type: object
 */
router.get('/orders',
	isAdmin,
    abortSignal,
    ...adminValidator.getAllOrders,
    handleValidationErrors,
    adminController.getAllOrders
);

/**
 * @swagger
 * /admin/orders/{id}:
 *   get:
 *     summary: Get a single order by ID
 *     tags: [Admin]
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Order'
 *       404:
 *         description: Order not found
 */
router.get('/orders/:id',
  isAdmin,
  abortSignal,
  ...adminValidator.getOneOrder,
  handleValidationErrors,
  adminController.getOneOrder
);

/**
 * @swagger
 * /admin/orders/{id}:
 *   patch:
 *     summary: Update order status (admin)
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               orderStatus:
 *                 type: string
 *                 enum: [pending, confirmed, processing, shipped, delivered, cancelled]
 *               paymentStatus:
 *                 type: string
 *                 enum: [pending, paid, failed, refunded]
 *     responses:
 *       200:
 *         description: Order updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Order'
 *       400:
 *         description: No fields provided or validation error
 *       404:
 *         description: Order not found
 */
router.patch('/orders/:id',
  isSuperAdmin,
  ...adminValidator.updateOrder,
  handleValidationErrors,
  adminController.updateOrder
);

/**
 * @swagger
 * /admin/revenue:
 *   get:
 *     summary: Revenue analytics (daily, weekly, monthly, yearly, all time)
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Revenue breakdown with top selling products
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
 *                     revenue:
 *                       type: object
 *                       properties:
 *                         daily:
 *                           type: number
 *                         weekly:
 *                           type: number
 *                         monthly:
 *                           type: number
 *                         yearly:
 *                           type: number
 *                         allTime:
 *                           type: number
 *                     orders:
 *                       type: object
 *                       properties:
 *                         today:
 *                           type: integer
 *                         yesterday:
 *                           type: integer
 *                         thisWeek:
 *                           type: integer
 *                         thisMonth:
 *                           type: integer
 *                         thisYear:
 *                           type: integer
 *                         allTime:
 *                           type: integer
 *                     products:
 *                       type: object
 *                       properties:
 *                         topSelling:
 *                           type: array
 *                           items:
 *                             type: object
 */
router.get('/revenue',
	isAdmin,
    abortSignal,
    adminController.getAllRevenue
);

/**
 * @swagger
 * /admin/products/{id}:
 *   patch:
 *     summary: Update a product (supports partial updates and image management)
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               quantity:
 *                 type: integer
 *               category:
 *                 type: string
 *               deliveryTime:
 *                 type: string
 *                 enum: [1-2 days, 2-3 days, 3-5 days, 5-7 days, 7-10 days]
 *               productInfo:
 *                 type: string
 *               status:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: New images to add
 *               deleteImages:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Public IDs of images to delete
 *               order:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Reorder images by public IDs
 *     responses:
 *       200:
 *         description: Product updated
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
 *                     id:
 *                       type: string
 *       404:
 *         description: Product not found
 *       400:
 *         description: Max image limit exceeded or validation error
 */
router.patch('/products/:id',
	isAdmin,
	loadProduct, // to fetch and attach product to the req object
    upload.array('images', 5),
    ...adminValidator.updateProduct,
    handleValidationErrors,
    adminController.updateProduct
);

/**
 * @swagger
 * /admin/products/{id}:
 *   delete:
 *     summary: Delete a product and its images from Cloudinary
 *     tags: [Admin]
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
 *       200:
 *         description: Product deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   nullable: true
 *       404:
 *         description: Product not found
 */
router.delete('/products/:id',
	isSuperAdmin,
    ...adminValidator.deleteProduct,
    handleValidationErrors,
    adminController.deleteProduct
);


/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: Get list of all registered users (admin)
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number (default 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Items per page (default 10)
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [newest, oldest, name_asc, name_desc]
 *         description: Sort order (default newest)
 *     responses:
 *       200:
 *         description: Array of users with pagination
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
 *                     $ref: '#/components/schemas/User'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     totalItems:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     hasNextPage:
 *                       type: boolean
 *                     hasPrevPage:
 *                       type: boolean
 */
router.get('/users',
	isAdmin,
	abortSignal,
	adminController.getAllUsers
);


/**
 * @swagger
 * /admin/users/{id}:
 *   get:
 *     summary: Get a single user by ID (admin)
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User details (password excluded)
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
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 */
router.get('/users/:id',
	isAdmin,
	...adminValidator.getOneUser,
	handleValidationErrors,
	adminController.getOneUser
);


/**
 * @swagger
 * /admin/users/{id}:
 *   patch:
 *     summary: Update user role or email subscription (admin)
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userRole:
 *                 type: string
 *                 enum: [user, admin]
 *                 description: New role for the user
 *               getEmail:
 *                 type: boolean
 *                 description: Enable/disable email notifications
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         email:
 *                           type: string
 *                         userRole:
 *                           type: string
 *                         getEmail:
 *                           type: boolean
 *       400:
 *         description: No fields provided or validation error
 *       404:
 *         description: User not found
 */
router.patch('/users/:id',
	isSuperAdmin,
	...adminValidator.updateUser,
	handleValidationErrors,
	adminController.updateUser
);


/**
 * @swagger
 * /admin/users/{id}:
 *   delete:
 *     summary: Delete a user permanently (admin)
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         email:
 *                           type: string
 *       404:
 *         description: User not found
 */
router.delete('/users/:id',
	isSuperAdmin,
	...adminValidator.deleteUser,
	handleValidationErrors,
	adminController.deleteUser
);

/**
 * @swagger
 * /admin/errors:
 *   get:
 *     summary: Retrieve a paginated list of critical errors (admin)
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number (default 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Items per page (default 20)
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [newest, oldest]
 *         description: Sort order by creation date (default newest)
 *     responses:
 *       200:
 *         description: List of critical errors
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                   description: Number of items on current page
 *                 total:
 *                   type: integer
 *                   description: Total number of error logs
 *                 page:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       message:
 *                         type: string
 *                       stack:
 *                         type: string
 *                       timestamp:
 *                         type: string
 *                         format: date-time
 *                       orderId:
 *                         type: string
 *                       resolved:
 *                         type: boolean
 *                       userId:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           email:
 *                             type: string
 *       401:
 *         description: Not authenticated or invalid session
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Invalid credentials
 */
router.get('/errors',
	isAdmin,
    adminController.getCriticalErrors
);


/**
 * @swagger
 * /admin/errors/{id}:
 *   get:
 *     summary: Get a single error log by ID (admin)
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Error log ID
 *     responses:
 *       200:
 *         description: Detailed error information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 error:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     message:
 *                       type: string
 *                     stack:
 *                       type: string
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                     orderId:
 *                       type: string
 *                     resolved:
 *                       type: boolean
 *                     userId:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         email:
 *                           type: string
 *       401:
 *         description: Not authenticated or invalid session
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Invalid credentials
 *       404:
 *         description: Error log not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Error log not found
 */
router.get('/errors/:id',
	isAdmin,
	...adminValidator.getErrorDetail,
	handleValidationErrors,
	adminController.getErrorDetail
);

/**
 * @swagger
 * /admin/errors/{id}:
 *   delete:
 *     summary: Delete a single error log (admin)
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Error log ID
 *     responses:
 *       200:
 *         description: Error log deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Error log deleted successfully
 *       401:
 *         description: Not authenticated or invalid session
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Invalid credentials
 *       404:
 *         description: Error log not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Error log not found
 */
router.delete('/errors/:id',
	isSuperAdmin,
	...adminValidator.deleteError,
	handleValidationErrors,
	adminController.deleteError
);



// finally export the configured router
module.exports = router;
