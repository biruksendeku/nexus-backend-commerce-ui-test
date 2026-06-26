

// import packages
const router = require('express').Router();

// import custom packages
const verificationController = require('../controllers/verification');
const verificationValidator = require('../middlewares/validator/verification');
const handleValidationErrors = require('../middlewares/errors/handleValidationErrors');



// routes
router.get('/email/:token',
	...verificationValidator.verifyEmail,
	handleValidationErrors,
	verificationController.verifyEmail
);

router.post('/resend-verification',
	...verificationValidator.resendVerification,
	handleValidationErrors,
	verificationController.resendVerification
);


// export the configured router
module.exports = router;
