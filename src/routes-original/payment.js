

// import router
const router = require('express').Router();

// import the controller
const paymentController = require('../controllers/payment');
const paymentValidator = require('../middlewares/validator/payment');
const handleValidationErrors = require('../middlewares/errors/handleValidationErrors');
const abortSignal = require('../middlewares/abort');



// ROUTES
router.post('/create-payment',
	abortSignal,
	...paymentValidator.createPayment,
	handleValidationErrors,
	paymentController.createPayment
);

router.post('/webhook',
	paymentController.webhookController
);


// export the configured router
module.exports = router;
