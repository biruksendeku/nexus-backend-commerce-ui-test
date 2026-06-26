

// import packages
const { validationResult } = require('express-validator');


/* =============================================
 * validation error handler
// =============================================*/
module.exports = function handleValidationErrors(req, res, next) {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
    	// format errors for better readability
    	const formattedErrors = errors.array().reduce((acc, err) => {
    		const field = err.path || 'general';
    		if(!acc[field]) {
    			acc[field] = [];
    		}
    		acc[field].push(err.msg);
    		return acc;
    	}, {});

    	// send json response
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: formattedErrors
        });
    }
    
    next();
};
