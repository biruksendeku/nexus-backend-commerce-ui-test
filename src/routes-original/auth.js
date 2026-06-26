

// import external packages
const passport = require('passport');
const router = require('express').Router();

// import custom packages
const authController = require('../controllers/auth');
const authValidator = require('../middlewares/validator/auth');
const handleValidationErrors = require('../middlewares/errors/handleValidationErrors');
const { authLimiter } = require('../middlewares/ratelimit');


// TODO FOR /register
/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - confirmPassword
 *               - userRole
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Password123
 *               confirmPassword:
 *                 type: string
 *                 format: password
 *                 example: Password123
 *               userRole:
 *                 type: string
 *                 enum: [ user, admin ]
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Validation error
 */

// routes
router.post('/register',
	authLimiter,
	...authValidator.register,
	handleValidationErrors,
	authController.register
);

// TODO FOR /login
/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login with email and password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       302:
 *         description: Redirects to home on success
 *       401:
 *         description: Invalid credentials
 */

router.post('/login',
	authLimiter,
	...authValidator.login,
	handleValidationErrors,
	authController.login(passport)
);

router.get('/google',
	authController.google(passport)
);

router.get('/google/callback',
	authController.googleCallback(passport)
);
/*
router.get('/facebook',
	authController.facebook(passport)
);

router.get('/facebook/callback',
	authController.facebookCallback(passport)
);
*/
router.get('/logout',
	authController.logout
);


// export the configured router
module.exports = router;
