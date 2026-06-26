

// import packages
const nodemailer = require('nodemailer');


// configure nodemailer to include our credentials
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});


// export the configured transporter
module.exports = transporter;
