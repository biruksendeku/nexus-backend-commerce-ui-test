

// error class defining
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
    }
}


// extend our error class

// to not found
class NotFoundError extends AppError {
    constructor(resource = 'Resource') {
        super(`${resource} not found`, 404);
    }
}

// to bad request
class BadRequestError extends AppError {
    constructor(message = 'Invalid request') {
        super(message, 400);
    }
}


// export all classes
module.exports = { AppError, NotFoundError, BadRequestError };
