

// import packages
const multer = require('multer');
const fileFilter = require('../../utils/file/fileFilter');

const storage = multer.memoryStorage();

const upload = multer({
	storage: storage,
	limits: {
		fileSize: parseInt(process.env.MAX_IMAGE_SIZE || 5)*1024*1024 // fallback 5MB per image
	},
	fileFilter: fileFilter
});


// export the config
module.exports = upload;
