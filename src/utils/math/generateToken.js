

// import packages
const crypto = require('crypto');

// to generate unique crypto token
const generateToken = (num = 32) => {
	return crypto.randomBytes(Number(num) || 32).toString('hex');
};


// export it
module.exports = generateToken;
