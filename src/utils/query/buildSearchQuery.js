

// import packages
const sanitizeInput = require('../string/sanitize');

// to build search history for products in mongoose
const buildSearchQuery = (name) => {
	if(!name || name.trim() === '') return {};
	name = sanitizeInput(name);
	return {
		name: {
			$regex: name.trim(),
			$options: 'i'
		}
	}
};


// export the function
module.exports = buildSearchQuery;
