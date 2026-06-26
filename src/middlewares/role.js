

// to check if the user has active session / is logged in?
exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        return res.redirect('/auth/login');
    }
    
    // filtering out unverified users
    if (!req.user.isVerified) {
        return res.status(401).send('Please verify your email first, or request a resend at "/api/verify/resend-verification"');
    }
    
    // pass them on success
    next();
};


// check if the user is admin or not
exports.isAdmin = (req, res, next) => {
	if(req.user.userRole === 'admin') {
		return next();
	}
	res.status(403).send('Forbidden');
};
