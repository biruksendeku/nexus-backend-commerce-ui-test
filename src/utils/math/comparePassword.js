

// import packages
const bcrypt = require('bcryptjs');

// hash and raw comparison function
// returns true on success
const comparePassword = async (raw, saved) => {
	return await bcrypt.compare(raw, saved);
};


// export it
module.exports = comparePassword;
