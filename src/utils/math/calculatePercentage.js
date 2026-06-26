

const calculatePercentage = (currentData, previousData) => {
	if (previousData === 0) return 0;
	const percentage = ((currentData - previousData) / previousData) * 100;
	return percentage; // +ve increase, -ve decrease
};


// export it
module.exports = calculatePercentage;
