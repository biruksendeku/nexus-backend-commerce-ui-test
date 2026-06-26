

// import packages
const router = require('express').Router();

// import custom packages
const accountController = require('../controllers/account');
const accountValidator = require('../middlewares/validator/account');
const handleValidationErrors = require('../middlewares/errors/handleValidationErrors');



// routes
router.get('/profile',
	accountController.getProfile
);

router.patch('/profile',
	...accountValidator.updateProfile,
	handleValidationErrors,
	accountController.updateProfile
);

router.patch('/change-password',
	...accountValidator.changePassword,
	handleValidationErrors,
	accountController.changePassword
);

router.post('/add-password',
	...accountValidator.addPassword,
	handleValidationErrors,
	accountController.addPasswordToSocialAccount
);

router.delete('/delete',
	...accountValidator.deleteAccount,
	handleValidationErrors,
	accountController.deleteAccount
);

router.get('/settings',
	accountController.getSettings
);

router.get('/unsubscribe',
	accountController.unsubscribeEmail
);


// export the configure
module.exports = router;
