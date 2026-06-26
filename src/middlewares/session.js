

// import packages
const session = require('express-session');

// using connect-mongo to store sessions
const mongoose = require('mongoose');
const { MongoStore } = require('connect-mongo');

// configuring sessionMiddleware
const sessionMiddleware = session({
	// create a hashed long digit that you can trust to sign the user session with 
	// for example using Node.js native module crypto 
	// crypto.randomBytes(32).toString('hex') - this for example creates a random 32 bytes 
	// digits that you can use as secret for session
	secret: process.env.SESSION_SECRET_KEY,
	resave: false, // don't resave without changes made
	saveUninitialized: false, // avoid saving empty sessions to save memory and storage

	store: new MongoStore({
		client: mongoose.connection.getClient(),
		collectionName: 'sessions', // the name of the collection that we expect to see in Database
		ttl: 7 * 24 * 60 * 60, // 7 days in seconds
		autoRemove: 'native' // default interval to check for expired sessions
	}),
	rolling: true, // resets expiration time as => last logged time + time we specified 
	// everytime the user logs in, it gets the new time 
	cookie: {
		httpOnly: true, // to avoid cookies to be found using document.cookies in the browser
		// hence there won't be any modifications
		secure: process.env.NODE_ENV !== 'development', // since secure: true required https, make sure for development it's false
		sameSite: process.env.NODE_ENV !== 'development' ? 'none' : 'lax', // if we use 'strict' here we won't be able 
		// to accept the data that's sent to us from auth providers
		
		maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
	}
});


// export the middleware
module.exports = sessionMiddleware;
