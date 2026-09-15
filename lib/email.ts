import nodemailer from "nodemailer";

interface SendOtpOptions {
  to: string;
  otp: string;
  name?: string;
  purpose?: string;
}

const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64" fill="none"><path d="M16 26C16 14 23 8 32 8C41 8 48 14 48 26C48 34 45 42 45 42H19C19 42 16 34 16 26Z" fill="#B45309" /><ellipse cx="32" cy="24" rx="11" ry="12" fill="#FBBF24" /><path d="M21 20C21 13 26 10 32 10C35 10 39 12 41 15C39 20 34 23 28 23C24 23 22 21 21 20Z" fill="#92400E" /><path d="M43 20C43 14 39 11 34 10C39 12 42 16 43 20Z" fill="#78350F" /><path d="M18 44C18 39 24 37 32 37C40 37 46 39 46 44V48H18V44Z" fill="#64748B" /><rect x="10" y="36" width="44" height="24" rx="4" fill="#475569" stroke="#334155" stroke-width="1.5" /><rect x="12" y="38" width="40" height="20" rx="3" fill="#1E293B" /><path d="M24 44L20 48L24 52" stroke="#38BDF8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" /><path d="M34 43L30 53" stroke="#38BDF8" stroke-width="2.5" stroke-linecap="round" /><path d="M40 44L44 48L40 52" stroke="#38BDF8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" /></svg>`;

export async function sendOtpEmail({ to, otp, name, purpose = "registration" }: SendOtpOptions) {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.EMAIL_FROM || user || `"is-a-coder.in" <noreply@is-a-coder.in>`;
  const secure = process.env.SMTP_SECURE === "true" || port === 465;

  const appName = "is-a-coder.in";
  const appUrl = "https://is-a-coder.in";
  const subject =
    purpose === "registration"
      ? `${otp} is your verification code for ${appName}`
      : `${otp} is your password reset code for ${appName}`;

  const displayName = name ? name.trim() : "Developer";

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style type="text/css">
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #030712;
      color: #f3f4f6;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
    }
    a, a:link, a:visited, a:hover, a:active {
      color: #ffffff !important;
      text-decoration: none !important;
    }
    .brand-link, .brand-link:visited, .brand-link span {
      color: #ffffff !important;
      text-decoration: none !important;
      -webkit-text-fill-color: #ffffff !important;
    }
    /* Disable auto link styling in Gmail / Apple Mail */
    u + #body a {
      color: #ffffff !important;
      text-decoration: none !important;
    }
    a[x-apple-data-detectors] {
      color: inherit !important;
      text-decoration: none !important;
      font-size: inherit !important;
      font-family: inherit !important;
      font-weight: inherit !important;
      line-height: inherit !important;
    }
    .wrapper {
      max-width: 540px;
      margin: 30px auto;
      background: #0f172a;
      border: 1px solid #1e293b;
      border-radius: 18px;
      overflow: hidden;
      box-shadow: 0 12px 30px -5px rgba(0, 0, 0, 0.5);
    }
    .header {
      background: linear-gradient(135deg, #0284c7 0%, #2563eb 50%, #4f46e5 100%);
      padding: 28px 24px;
      text-align: center;
    }
    .content {
      padding: 36px 30px;
      color: #cbd5e1;
      font-size: 15px;
      line-height: 1.6;
    }
    .greeting {
      font-size: 18px;
      font-weight: 600;
      color: #ffffff;
      margin-top: 0;
      margin-bottom: 12px;
    }
    .code-box {
      margin: 28px 0;
      background: #030712;
      border: 1px solid #38bdf8;
      border-radius: 14px;
      padding: 24px 16px;
      text-align: center;
      box-shadow: 0 0 20px rgba(56, 189, 248, 0.1);
    }
    .code-title {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #38bdf8;
      font-weight: 700;
      margin-bottom: 10px;
    }
    .otp-code {
      font-size: 40px;
      font-weight: 800;
      letter-spacing: 10px;
      color: #38bdf8;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      margin: 0;
    }
    .info-badge {
      display: inline-block;
      margin-top: 14px;
      font-size: 12px;
      color: #94a3b8;
      background: #1e293b;
      padding: 5px 14px;
      border-radius: 20px;
      font-weight: 500;
    }
    .footer {
      border-top: 1px solid #1e293b;
      padding: 20px 30px;
      text-align: center;
      font-size: 12px;
      color: #64748b;
      background: #090d16;
    }
    .warning {
      color: #f59e0b;
      font-size: 13px;
      margin-top: 20px;
    }
  </style>
</head>
<body id="body">
  <div class="wrapper">
    <!-- Header with pure white brand title & favicon -->
    <div class="header">
      <table border="0" cellspacing="0" cellpadding="0" style="margin: 0 auto;">
        <tr>
          <td align="center" valign="middle" style="padding-right: 12px;">
            <img src="cid:faviconLogo" alt="${appName} Favicon" width="38" height="38" style="display: block; border-radius: 8px; border: 0;" />
          </td>
          <td align="center" valign="middle">
            <a href="${appUrl}" target="_blank" class="brand-link" style="color: #ffffff !important; text-decoration: none !important; border: 0; outline: none;">
              <span style="color: #ffffff !important; font-size: 26px; font-weight: 800; letter-spacing: -0.5px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; text-shadow: 0 2px 4px rgba(0,0,0,0.3); text-decoration: none !important; -webkit-text-fill-color: #ffffff !important;">
                <font color="#ffffff">${appName}</font>
              </span>
            </a>
          </td>
        </tr>
      </table>
    </div>

    <!-- Content -->
    <div class="content">
      <h2 class="greeting">Hello ${displayName},</h2>
      <p style="color: #cbd5e1; margin: 0 0 20px 0; line-height: 1.6;">
        ${
          purpose === "registration"
            ? `Thank you for creating an account on <a href="${appUrl}" target="_blank" style="color: #ffffff !important; text-decoration: none !important; font-weight: 700;"><strong style="color: #ffffff !important;"><font color="#ffffff">${appName}</font></strong></a>. Please use the verification code below to verify your email address and activate your account.`
            : `We received a request to reset your password for <a href="${appUrl}" target="_blank" style="color: #ffffff !important; text-decoration: none !important; font-weight: 700;"><strong style="color: #ffffff !important;"><font color="#ffffff">${appName}</font></strong></a>. Use the code below to proceed.`
        }
      </p>

      <div class="code-box">
        <div class="code-title">One-Time Verification Code</div>
        <div class="otp-code">${otp}</div>
        <div class="info-badge">⏱️ Expires in 10 minutes</div>
      </div>

      <p class="warning">
        🔒 <strong>Security Notice:</strong> If you did not request this verification code, please ignore this email. Never share this code with anyone.
      </p>
    </div>

    <!-- Footer -->
    <div class="footer">
      &copy; 2024 <a href="${appUrl}" target="_blank" style="color: #ffffff !important; text-decoration: none !important; font-weight: 600;"><font color="#ffffff">${appName}</font></a>. Empowering developers with custom subdomain identities.
    </div>
  </div>
</body>
</html>
  `;

  // If SMTP is properly configured in environment variables
  if (host && user && pass) {
    try {
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: {
          user,
          pass,
        },
      });

      await transporter.sendMail({
        from,
        to,
        subject,
        html: htmlContent,
       
      });

      console.log(`[Email Service] OTP successfully sent via SMTP to ${to}`);
      return { success: true, method: "smtp" };
    } catch (smtpError) {
      console.error("[Email Service] Failed to send via SMTP:", smtpError);
      // Fallback to console in development
      console.log(`\n==========================================`);
      console.log(`[DEV EMAIL SIMULATION] OTP for ${to}: ${otp}`);
      console.log(`==========================================\n`);
      return { success: true, method: "simulated", error: smtpError };
    }
  } else {
    // When SMTP credentials are not configured (local dev)
    console.log(`\n========================================================`);
    console.log(`🔑 [DEV MODE] SMTP not configured. OTP for ${to}: [ ${otp} ]`);
    console.log(`   Purpose: ${purpose}`);
    console.log(`   Expires in: 10 minutes`);
    console.log(`========================================================\n`);
    return { success: true, method: "simulated" };
  }
}
