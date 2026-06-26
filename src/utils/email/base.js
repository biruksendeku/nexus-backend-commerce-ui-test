

// Base wrapper & reusable components
const emailWrapper = (title, content) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${title}</title>
</head>
<body style="
  margin:0;
  padding:0;
  background:#f4f7fb;
  font-family:Arial,sans-serif;
  color:#1f2937;
">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0"
          style="
            max-width:600px;
            background:#ffffff;
            border-radius:14px;
            overflow:hidden;
            border:1px solid #e5e7eb;
          "
        >
          <!-- Header -->
          <tr>
            <td style="
              padding:32px;
              background:#111827;
              text-align:center;
            ">
              <h1 style="
                margin:0;
                font-size:28px;
                color:#ffffff;
                font-weight:700;
              ">
                ${title}
              </h1>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="
              padding:40px 32px;
              line-height:1.7;
              font-size:15px;
              color:#374151;
            ">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="
              padding:24px 32px;
              background:#f9fafb;
              border-top:1px solid #e5e7eb;
              text-align:center;
              font-size:12px;
              color:#6b7280;
            ">
              <p style="margin:0 0 8px 0;">
                © ${new Date().getFullYear()} ${process.env.YOUR_COMPANY_NAME}. All rights reserved.
              </p>
              <p style="margin:0 0 14px 0;">
                ${process.env.YOUR_COMPANY_ADDRESS}
              </p>
              <a
                href="${process.env.BASE_URL}/account/unsubscribe"
                style="
                  color:#6b7280;
                  text-decoration:underline;
                "
              >
                Unsubscribe
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

const button = (url, text) => `
  <div style="margin:32px 0;">
    <a
      href="${url}"
      style="
        display:inline-block;
        padding:14px 24px;
        background:#111827;
        color:#ffffff;
        text-decoration:none;
        border-radius:8px;
        font-size:14px;
        font-weight:600;
      "
    >
      ${text}
    </a>
  </div>`;

const linkBox = (url) => `
  <div style="margin-top:24px;">
    <p style="margin:0 0 10px 0; font-size:13px; color:#6b7280;">
      If the button above does not work, copy and paste this link into your browser:
    </p>
    <div style="
      background:#f3f4f6;
      border:1px solid #d1d5db;
      border-radius:8px;
      padding:14px;
      word-break:break-all;
      font-size:13px;
      color:#111827;
    ">
      ${url}
    </div>
  </div>`;



// export them
module.exports = {
	emailWrapper,
	button,
	linkBox
}
