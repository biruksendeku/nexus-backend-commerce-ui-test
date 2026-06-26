

// import packages
const auth = require('./authTemplates');
const orders = require('./orderTemplates');


// export them
module.exports = {
	...auth,
	...orders
};
