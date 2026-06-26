

// import packages
const router = require('express').Router();

// import custom packages
const passwordController = require('../controllers/password');
const passwordValidator = require('../middlewares/validator/password');
const handleValidationErrors = require('../middlewares/errors/handleValidationErrors');



// routes
router.post('/forgot-password',
	...passwordValidator.forgotPassword,
	handleValidationErrors,
	passwordController.forgotPassword
);


router.get('/reset-password/:token',
	...passwordValidator.getResetToken,
	handleValidationErrors,
	passwordController.getResetToken
);


// export the configured router
module.exports = router;
