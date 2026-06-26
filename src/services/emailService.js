

// import packages
const transporter = require('../config/email/nodemailer');

const { 
    verificationEmailTemplate, 
    resetSuccessTemplate, 
    resetApprovalTemplate,
    passwordAddedTemplate,
    accountDeletedTemplate,
    passwordChangedTemplate,
    orderConfirmationTemplate,
    paymentFailedTemplate,
    refundTemplate
} = require('../utils/email');



/*
// * to send the 1day limited verification-URL to 
	* the new registered user
*/
async function sendVerificationEmail(email, token, userName) {
    const verificationUrl = `${process.env.BASE_URL}/api/verify/email/${token}`;
    
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email.toLowerCase(),
        subject: 'Verify Your Email',
        html: verificationEmailTemplate(verificationUrl)
    });
}



/*
// * email when user resets password successfully
*/
async function resetSuccessEmail(email, userName) {
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email.toLowerCase(),
        subject: 'Password Reset Success',
        html: resetSuccessTemplate(userName)
    });
}


/*
// * email containing 1day limited URL 
	* to approve reset password
*/
async function resetApprovalEmail(email, token, deviceInfo, userName) {
    const resetLink = `${process.env.BASE_URL}/password/reset/${token}`;
    
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email.toLowerCase(),
        subject: 'Password Reset Request',
        html: resetApprovalTemplate(resetLink, deviceInfo, userName)
    });
}



/*
// * email when password is first added/created
*/

async function passwordAddedEmail(email, name) {
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email.toLowerCase(),
        subject: 'Password Added Successfully',
        html: passwordAddedTemplate(name)
    });
}



/*
// * email when account is deleted
*/

async function accountDeletedEmail(email, name) {
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email.toLowerCase(),
        subject: 'Account Deleted',
        html: accountDeletedTemplate(name)
    });
}



/*
// * email when password is changed
*/

async function passwordChangedEmail(email, userName, deviceInfo) {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email.toLowerCase(),
    subject: 'Password Changed Successfully',
    html: passwordChangedTemplate(userName, deviceInfo),
  });
}



/*
  * send order confirmation email
*/
async function sendOrderConfirmation(order) {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: order.user.email.toLowerCase(), // populating user
    subject: `Order Confirmed - #${order._id.toString().slice(-8).toUpperCase()}`,
    html: orderConfirmationTemplate(order)
  });
}



/*
  * send payment failed email
*/
async function sendPaymentFailed(order) {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: order.user.email.toLowerCase(),
    subject: `Payment Failed - Order #${order._id.toString().slice(-8).toUpperCase()}`,
    html: paymentFailedTemplate(order)
  });
}



/*
  * send refund confirmation email
*/
async function sendRefundEmail(order) {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: order.user.email.toLowerCase(),
    subject: `Refund Processed - Order #${order._id.toString().slice(-8).toUpperCase()}`,
    html: refundTemplate(order)
  });
}


// wrap in one object
const emailServices = {
  sendVerificationEmail,
  resetApprovalEmail,
  resetSuccessEmail,
  passwordAddedEmail,
  accountDeletedEmail,
  passwordChangedEmail,
  sendOrderConfirmation,
  sendPaymentFailed,
  sendRefundEmail
};


// export the object
module.exports = emailServices;
