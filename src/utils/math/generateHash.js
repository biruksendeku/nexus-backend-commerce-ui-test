

// import packages
const bcrypt = require('bcryptjs');

// hash generator function
const generateHash = async (raw, salt = 10) => {
	return await bcrypt.hash(raw, Number(salt) || 10);
};


// export it
module.exports = generateHash;
