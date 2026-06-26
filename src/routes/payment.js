

// import router
const router = require('express').Router();

// import the controller
const paymentController = require('../controllers/payment');
const paymentValidator = require('../middlewares/validator/payment');
const handleValidationErrors = require('../middlewares/errors/handleValidationErrors');
const abortSignal = require('../middlewares/abort');

// ---------- SWAGGER COMMENTS ----------

/**
 * @swagger
 * /api/payment/create-payment:
 *   post:
 *     summary: Initiate Stripe checkout session
 *     tags: [Payment]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - items
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: string
 *                     quantity:
 *                       type: integer
 *               shippingAddress:
 *                 type: object
 *                 properties:
 *                   street:
 *                     type: string
 *                   city:
 *                     type: string
 *                   state:
 *                     type: string
 *                   zipCode:
 *                     type: string
 *                   country:
 *                     type: string
 *     responses:
 *       200:
 *         description: Stripe session created, contains redirect URL
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 sessionId:
 *                   type: string
 *                 url:
 *                   type: string
 *                 orderId:
 *                   type: string
 *       400:
 *         description: Cart empty or product unavailable
 *       401:
 *         description: Not authenticated
 */
router.post('/create-payment',
    abortSignal,
    ...paymentValidator.createPayment,
    handleValidationErrors,
    paymentController.createPayment
);

/**
 * @swagger
 * /api/payment/webhook:
 *   post:
 *     summary: Stripe webhook endpoint (no auth)
 *     tags: [Payment]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Webhook received
 */
router.post('/webhook',
    paymentController.webhookController
);


// export the configured router
module.exports = router;
