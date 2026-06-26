

// import external packages
const passport = require('passport');
const router = require('express').Router();

// import custom packages
const authController = require('../controllers/auth');
const authValidator = require('../middlewares/validator/auth');
const handleValidationErrors = require('../middlewares/errors/handleValidationErrors');
const { authLimiter } = require('../middlewares/ratelimit');


// FOR /register
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

// FOR /login
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

// FOR Google OAuth
/**
 * @swagger
 * /auth/google:
 *   get:
 *     summary: Initiate Google OAuth login
 *     tags: [Auth]
 *     description: |
 *       ⚠️ **This is an OAuth redirect flow. The "Try it out" button will not work due to CORS restrictions.**
 *       
 *       To test this endpoint:
 *       1. Copy this URL: `http://localhost:8000/auth/google`
 *       2. Paste it directly into your browser's address bar
 *       3. You will be redirected to Google's consent screen
 *       4. After approving, you'll be redirected back to the app
 *       
 *       This endpoint redirects the user to Google's OAuth consent screen.
 *     responses:
 *       302:
 *         description: Redirects to Google's OAuth page
 *         headers:
 *           Location:
 *             schema:
 *               type: string
 *             description: Google OAuth authorization URL
 *       500:
 *         description: Server error (e.g., missing OAuth credentials)
 */
router.get('/google',
    authController.google(passport)
);

router.get('/google/callback',
    authController.googleCallback(passport)
);

router.get('/logout',
	authController.logout
);


// export the configured router
module.exports = router;
