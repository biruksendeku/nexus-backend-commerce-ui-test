

// import packages
const multer = require('multer');
const fileFilter = require('../../utils/file/fileFilter');

const storage = multer.memoryStorage();

const upload = multer({
	storage: storage,
	limits: {
		fileSize: parseInt(process.env.MAX_IMAGE_SIZE || 5)*1024*1024, // fallback 5MB per image
		files: parseInt(process.env.MAX_IMAGE_LIMIT || 5) // per-request file count cap
	},
	fileFilter: fileFilter
});


// export the config
module.exports = upload;
