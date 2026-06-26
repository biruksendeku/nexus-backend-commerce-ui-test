

// import packages
const { emailWrapper, button, linkBox } = require('./base');



/* * Email verification */
const verificationEmailTemplate = (verificationUrl) =>
  emailWrapper(
    'Verify Your Email',
    `
      <p>Hello,</p>
      <p>
        Thank you for creating your ${process.env.YOUR_COMPANY_NAME} account.
        Please verify your email address to activate your account.
      </p>
      ${button(verificationUrl, 'Verify Email')}
      ${linkBox(verificationUrl)}
      <p style="margin-top:32px;">
        If you did not create this account, you can safely ignore this email.
      </p>
    `
  );
  

/* * Password reset request (includes device info) */
const resetApprovalTemplate = (resetLink, deviceInfo = {}, userName = '') =>
  emailWrapper(
    'Password Reset Request',
    `
      <p>Hello ${userName},</p>
      <p>
        We received a request to reset your password.
        If this was you, click the button below.
      </p>
      ${button(resetLink, 'Reset Password')}
      ${linkBox(resetLink)}
      <div style="
        margin-top:32px;
        padding:20px;
        background:#f9fafb;
        border:1px solid #e5e7eb;
        border-radius:10px;
      ">
        <h3 style="margin-top:0; font-size:16px; color:#111827;">Device Information</h3>
        <p><strong>Browser:</strong> ${deviceInfo.browser?.name || 'Unknown'} ${deviceInfo.browser?.major || ''}</p>
        <p><strong>Operating System:</strong> ${deviceInfo.os?.name || 'Unknown'} ${deviceInfo.os?.version || ''}</p>
        <p><strong>IP Address:</strong> ${deviceInfo.ip || 'Unknown'}</p>
        <p><strong>Location:</strong> ${deviceInfo.location?.city || 'Unknown'}, ${deviceInfo.location?.country || 'Unknown'}</p>
        <p><strong>Time:</strong> ${new Date(deviceInfo.timestamp || Date.now()).toLocaleString()}</p>
      </div>
      <p style="margin-top:32px; color:#6b7280;">
        If you did not request a password reset, you can safely ignore this email.
      </p>
      <p style="font-size:13px; color:#9ca3af;">
        This reset link will expire in 1 hour.
      </p>
    `
  );



/* * Password reset success */
const resetSuccessTemplate = (userName = '') =>
  emailWrapper(
    'Password Reset Successful',
    `<p>Hello ${userName},</p><p>Your password has been changed successfully. You can now log in with your new password.</p>`
  );



/* * First‑time password setup */
const passwordAddedTemplate = (userName = '') =>
  emailWrapper(
    'Password Added',
    `<p>Hello ${userName},</p><p>A password has been added to your account. You can now log in using your email and password.</p><p>If you did not perform this action, please contact our support team immediately.</p>`
  );



/* * Account deletion confirmation */
const accountDeletedTemplate = (userName = '') =>
  emailWrapper(
    'Account Deleted',
    `<p>Hello ${userName},</p><p>This email confirms that your account has been permanently deleted.</p><p>If you did not request this, please contact support immediately. To create a new account, you can sign up again at any time.</p>`
  );



/* * Password changed (after logged‑in update) */
  const passwordChangedTemplate = (userName = '', deviceInfo = {}) =>
    emailWrapper(
      'Password Changed',
      `
        <p>Hello ${userName},</p>
        <p>Your password was just changed successfully.</p>
  
        <div style="
          margin:24px 0;
          padding:20px;
          background:#f9fafb;
          border:1px solid #e5e7eb;
          border-radius:10px;
        ">
          <h3 style="margin-top:0; font-size:16px; color:#111827;">Change Details</h3>
          <p><strong>Browser:</strong> ${deviceInfo.browser?.name || 'Unknown'} ${deviceInfo.browser?.major || ''}</p>
          <p><strong>Operating System:</strong> ${deviceInfo.os?.name || 'Unknown'} ${deviceInfo.os?.version || ''}</p>
          <p><strong>IP Address:</strong> ${deviceInfo.ip || 'Unknown'}</p>
          <p><strong>Location:</strong> ${deviceInfo.location?.city || 'Unknown'}, ${deviceInfo.location?.country || 'Unknown'}</p>
          <p><strong>Time:</strong> ${new Date(deviceInfo.timestamp || Date.now()).toLocaleString()}</p>
        </div>
  
        <p style="color:#6b7280;">
          If you did not make this change, please
          <a href="${process.env.BASE_URL}/account/reset-password" style="color:#111827; text-decoration:underline;">reset your password</a>
          immediately or contact support.
        </p>
      `
    );



// export them
module.exports = {
  verificationEmailTemplate,
  resetApprovalTemplate,
  resetSuccessTemplate,
  passwordAddedTemplate,
  accountDeletedTemplate,
  passwordChangedTemplate,
};
