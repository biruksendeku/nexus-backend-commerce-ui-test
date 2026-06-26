

// import packages
const router = require('express').Router();

// import custom packages
const accountController = require('../controllers/account');
const accountValidator = require('../middlewares/validator/account');
const handleValidationErrors = require('../middlewares/errors/handleValidationErrors');

// ---------- SWAGGER DEFINITIONS ----------

/**
 * @swagger
 * /account/profile:
 *   get:
 *     summary: Get current user's profile
 *     tags: [Account]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: User profile data
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
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         email:
 *                           type: string
 *                         avatar:
 *                           type: string
 *                         isVerified:
 *                           type: boolean
 *                         userRole:
 *                           type: string
 *                         authProvider:
 *                           type: array
 *                           items:
 *                             type: string
 *                         verifiedAt:
 *                           type: string
 *                           format: date-time
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *       401:
 *         description: Not authenticated or invalid credentials
 */
router.get('/profile',
    accountController.getProfile
);

/**
 * @swagger
 * /account/profile:
 *   patch:
 *     summary: Update user's profile (name and/or avatar)
 *     tags: [Account]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               avatar:
 *                 type: string
 *                 format: uri
 *                 example: https://example.com/avatar.jpg
 *     responses:
 *       200:
 *         description: Profile updated successfully
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
 *                       $ref: '#/components/schemas/User'
 *       400:
 *         description: No fields provided or validation error
 */
router.patch('/profile',
    ...accountValidator.updateProfile,
    handleValidationErrors,
    accountController.updateProfile
);

/**
 * @swagger
 * /account/change-password:
 *   patch:
 *     summary: Change current user's password (requires local auth)
 *     tags: [Account]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *               - confirmPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 format: password
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 maxLength: 32
 *               confirmNewPassword:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Password changed successfully
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
 *         description: Missing fields, password mismatch, or invalid current password
 *       401:
 *         description: Not authenticated or account uses social login only
 */
router.patch('/change-password',
    ...accountValidator.changePassword,
    handleValidationErrors,
    accountController.changePassword
);

/**
 * @swagger
 * /account/add-password:
 *   post:
 *     summary: Add a local password to a social-only account
 *     tags: [Account]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *               - confirmPassword
 *             properties:
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 maxLength: 32
 *               confirmPassword:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Password added successfully
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
 *         description: Password already exists, mismatch, or validation error
 *       401:
 *         description: Not authenticated
 */
router.post('/add-password',
    ...accountValidator.addPassword,
    handleValidationErrors,
    accountController.addPasswordToSocialAccount
);

/**
 * @swagger
 * /account/delete:
 *   delete:
 *     summary: Permanently delete the authenticated user's account
 *     tags: [Account]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *                 description: Required if account has a local password
 *     responses:
 *       204:
 *         description: Account deleted successfully (no content)
 *       400:
 *         description: Password required for local accounts
 *       401:
 *         description: Not authenticated or incorrect password
 */
router.delete('/delete',
    ...accountValidator.deleteAccount,
    handleValidationErrors,
    accountController.deleteAccount
);

/**
 * @swagger
 * /account/settings:
 *   get:
 *     summary: Get account settings (email, verification status, etc.)
 *     tags: [Account]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Account settings
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
 *                     settings:
 *                       type: object
 *                       properties:
 *                         email:
 *                           type: string
 *                         isVerified:
 *                           type: boolean
 *                         userRole:
 *                           type: string
 *                         authProvider:
 *                           type: array
 *                           items:
 *                             type: string
 *                         verifiedAt:
 *                           type: string
 *                           format: date-time
 *                         hasPassword:
 *                           type: boolean
 *       401:
 *         description: Not authenticated
 */
router.get('/settings',
    accountController.getSettings
);

/**
 * @swagger
 * /account/unsubscribe:
 *   get:
 *     summary: Unsubscribe from marketing/notification emails
 *     tags: [Account]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Unsubscribed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: Not authenticated
 */
router.get('/unsubscribe',
    accountController.unsubscribeEmail
);

// export the configured router
module.exports = router;
