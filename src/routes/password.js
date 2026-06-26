

// import packages
const router = require('express').Router();

// import custom packages
const passwordController = require('../controllers/password');
const passwordValidator = require('../middlewares/validator/password');
const handleValidationErrors = require('../middlewares/errors/handleValidationErrors');

// ---------- SWAGGER COMMENTS ----------

/**
 * @swagger
 * /password/forgot-password:
 *   post:
 *     summary: Send password reset link (with device info)
 *     tags: [Password]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - newPassword
 *               - confirmNewPassword
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *               confirmNewPassword:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *     responses:
 *       201:
 *         description: Reset link sent
 *       400:
 *         description: Missing fields, unverified account, or social-only user
 *       401:
 *         description: Email not found
 */
router.post('/forgot-password',
    ...passwordValidator.forgotPassword,
    handleValidationErrors,
    passwordController.forgotPassword
);

/**
 * @swagger
 * /password/reset/{token}:
 *   get:
 *     summary: Verify reset token and apply new password
 *     tags: [Password]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Reset token from email
 *     responses:
 *       200:
 *         description: Password updated successfully
 *       401:
 *         description: Invalid or expired token
 */
router.get('/reset/:token',
    ...passwordValidator.getResetToken,
    handleValidationErrors,
    passwordController.getResetToken
);


// export the configured router
module.exports = router;
