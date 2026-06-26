
// import the v2 version
const cloudinary = require('cloudinary').v2;

// configure cloudinary with our credentials
cloudinary.config({

	// follow README.md on how to get these credentials from 
	// their websites
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET
});

// export the config
module.exports = cloudinary;
