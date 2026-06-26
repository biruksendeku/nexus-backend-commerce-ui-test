

// import the custom package
const calculatePercentage = require('./calculatePercentage');

// reusable function for comparing data
const comparison = (current, previous) => ({
	current,
	previous,
	change: calculatePercentage(current, previous),
	isIncrease: calculatePercentage(current, previous) >= 0,
});


// export it
module.exports = comparison;
