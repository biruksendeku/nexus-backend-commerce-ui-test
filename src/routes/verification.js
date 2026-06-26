

// import packages
const router = require('express').Router();

// import custom packages
const verificationController = require('../controllers/verification');
const verificationValidator = require('../middlewares/validator/verification');
const handleValidationErrors = require('../middlewares/errors/handleValidationErrors');

// ---------- SWAGGER COMMENTS ----------

/**
 * @swagger
 * /api/verify/email/{token}:
 *   get:
 *     summary: Verify email using token
 *     tags: [Verification]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Verification token
 *     responses:
 *       302:
 *         description: Redirects to home on success
 *       401:
 *         description: Invalid or expired link
 */
router.get('/email/:token',
    ...verificationValidator.verifyEmail,
    handleValidationErrors,
    verificationController.verifyEmail
);

/**
 * @swagger
 * /api/verify/resend-verification:
 *   post:
 *     summary: Resend verification email
 *     tags: [Verification]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Verification email sent
 *       400:
 *         description: Already verified
 *       401:
 *         description: Email not found
 */
router.post('/resend-verification',
    ...verificationValidator.resendVerification,
    handleValidationErrors,
    verificationController.resendVerification
);


// export the configured router
module.exports = router;
