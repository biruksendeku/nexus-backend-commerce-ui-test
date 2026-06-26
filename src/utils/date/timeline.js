


// daily
const today = new Date();
today.setHours(0, 0, 0, 0);

const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);
yesterday.setHours(0, 0, 0, 0);

const yesterdayEnd = new Date(yesterday);
yesterdayEnd.setHours(23, 59, 59, 999);


// weekly
const weekStart = new Date();
weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // sunday
weekStart.setHours(0, 0, 0, 0);

const lastWeekStart = new Date(weekStart);
lastWeekStart.setDate(lastWeekStart.getDate() - 7);

const lastWeekEnd = new Date(weekStart);
lastWeekEnd.setDate(lastWeekEnd.getDate() - 1);
lastWeekEnd.setHours(23, 59, 59, 999);


// monthly
const now = new Date();
const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);


// yearly
const yearStart = new Date();
yearStart.setMonth(0, 1);
yearStart.setDate(0, 0, 0, 0);

const lastYearStart = new Date();
lastYearStart.setFullYear(lastYearStart.getFullYear() - 1, 0, 1);
lastYearStart.setHours(0, 0, 0, 0);

const lastYearEnd = new Date();
lastYearEnd.setFullYear(lastYearEnd.getFullYear() - 1 , 11, 31);
lastYearEnd.setHours(23, 59, 59, 999);


// wrap in one object
const timeline = {
	today,
	yesterday,
	yesterdayEnd,
	weekStart,
	lastWeekStart,
	lastWeekEnd,
	monthStart,
	lastMonthStart,
	lastMonthEnd,
	yearStart,
	lastYearStart,
	lastYearEnd
};


// export the object
module.exports = timeline;
