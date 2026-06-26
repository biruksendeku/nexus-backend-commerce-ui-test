

// to set token expiration time
const tokenExpiration = (days) => {
	return Date.now() + Number(days)*24*60*60*1000;
};

// export it
module.exports = tokenExpiration;
