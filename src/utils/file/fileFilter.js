

// import custom packages
const BadRequestError = require('../../middlewares/errors/customErrors');


// to filter file safety
const fileFilter = (req, file, cb) => {
	if (file.mimetype.startsWith('image/')) {
		cb(null, true);
	} else {
		cb(new BadRequestError('Not an image! Please upload an image.'));
	}
};


// export it
module.exports = fileFilter;
