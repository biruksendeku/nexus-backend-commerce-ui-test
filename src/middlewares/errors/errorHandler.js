

// import packages
const { AppError } = require('./customErrors');
const ErrorLog = require('../../models/errorLog');


// define error handler
const errorHandler = async (err, req, res, next) => {

    // handle abort error
    if(err.name === 'AbortError') return;

    // Log critical errors (500s or unknown errors)
    if (!err.statusCode || err.statusCode >= 500) {
        try {
        	console.error('Error message: ', err.message);
        	console.error('Error stack: ', err.stack);
            await ErrorLog.create({
                message: err.message,
                stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
                statusCode: err.statusCode || 500,
                method: req.method,
                path: req.originalUrl,
                userId: req.user ? req.user._id : null,
                body: req.body
            });
        } catch (logError) {
            console.error('Failed to log error:', logError);
        }
    }

    // handle MongoDB duplicate-key error
    if (err.code === 11000) {
        return res.status(409).json({
            success: false,
            message: 'Duplicate value error'
        });
    }

    // handle validation error from express-validator
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }

    // our custom errors
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message
        });
    }

    // handling unknown error
    console.error('Error message: ', err.message);
    console.error('Error stack: ', err.stack);
    
    return res.status(500).json({
        success: false,
        message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
};


// export the handler
module.exports = { errorHandler };
