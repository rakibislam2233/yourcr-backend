import { addEmailToQueue } from '../queues/email.queue';

const generateProfessionalEmailTemplate = (
  content: string,
  options: { title: string; preheader?: string }
): string => {
  const { title, preheader = '' } = options;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>${title}</title>
  <style>
    :root {
      --bg: #f8fafc;
      --text: #0f172a;
      --primary: #2563eb;
      --primary-dark: #1d4ed8;
      --card: #ffffff;
      --border: #e2e8f0;
      --muted: #64748b;
    }
    [data-scheme="dark"] {
      --bg: #0f172a;
      --text: #f1f5f9;
      --card: #1e293b;
      --border: #334155;
      --muted: #94a3b8;
    }
    body {
      margin: 0;
      padding: 0;
      background-color: var(--bg);
      font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
      color: var(--text);
      line-height: 1.6;
    }
    table { border-collapse: collapse; }
    .container {
      max-width: 600px;
      margin: 32px auto;
      background-color: var(--card);
      border: 1px solid var(--border);
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 16px rgba(0,0,0,0.06);
    }
    .logo {
      text-align: center;
      padding: 32px 20px 24px;
      border-bottom: 1px solid var(--border);
    }
    .logo img { max-width: 160px; height: auto; }
    .content {
      padding: 40px 32px;
      font-size: 16px;
    }
    .content h1, .content h2 {
      color: var(--primary);
      margin: 0 0 20px;
      font-weight: 600;
    }
    .content h1 { font-size: 26px; }
    .content h2 { font-size: 22px; }
    .content p { margin: 0 0 20px; }
    .otp-code {
      font-family: 'Courier New', monospace;
      font-size: 36px;
      font-weight: bold;
      letter-spacing: 10px;
      color: var(--primary);
      text-align: center;
      padding: 24px;
      background: rgba(37,99,235,0.08);
      border: 2px dashed var(--primary);
      border-radius: 12px;
      margin: 28px 0;
    }
    .highlight-box {
      background: rgba(37,99,235,0.05);
      border-left: 5px solid var(--primary);
      padding: 24px;
      margin: 28px 0;
      border-radius: 0 8px 8px 0;
    }
    .btn {
      display: inline-block;
      background-color: var(--primary);
      color: white !important;
      font-weight: 600;
      padding: 14px 32px;
      border-radius: 8px;
      text-decoration: none;
      margin: 20px 0;
    }
    .btn:hover { background-color: var(--primary-dark); }
    .footer {
      background: rgba(0,0,0,0.03);
      padding: 32px 40px;
      text-align: center;
      font-size: 14px;
      color: var(--muted);
      border-top: 1px solid var(--border);
    }
    .footer a { color: var(--primary); text-decoration: none; }
    .footer a:hover { text-decoration: underline; }

    @media (prefers-color-scheme: dark) {
      :root {
        --bg: #0f172a;
        --text: #f1f5f9;
        --card: #1e293b;
        --border: #334155;
        --muted: #94a3b8;
      }
      .otp-code { background: rgba(37,99,235,0.15); }
      .highlight-box { background: rgba(37,99,235,0.12); }
      .btn { color: white !important; }
    }
    @media (max-width: 600px) {
      .container { margin: 16px !important; border-radius: 0; }
      .content, .logo, .footer { padding: 24px !important; }
      .otp-code { font-size: 30px; letter-spacing: 6px; }
    }
  </style>
</head>
<body>
  ${preheader ? `<div style="display:none;font-size:0;color:transparent;line-height:0;max-height:0;">${preheader}</div>` : ''}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="background:var(--bg);">
        <table class="container" role="presentation">
          <!-- Logo -->
          <tr>
            <td class="logo">
              <img src="https://i.ibb.co/YOUR-LOGO-HERE/your-cr-logo.png" alt="Your CR Logo" />
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td class="content">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td class="footer">
              <p style="margin:0 0 12px;">
                <strong>Your CR</strong> — Class Representative Platform<br>
                <a href="mailto:support@yourcr.app">support@yourcr.app</a>
              </p>
              <p style="margin:16px 0 0; font-size:13px;">
                © ${new Date().getFullYear()} Your CR. All rights reserved.<br>
                Empowering Class Representatives & Students
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};

const generateOTPSection = (otp: string, minutes: number = 15) => `
  <p style="text-align:center; font-size:15px; margin-bottom:12px;">Your verification code:</p>
  <div class="otp-code">${otp}</div>
  <p style="text-align:center; color:var(--muted); font-size:14px;">
    This code will expire in ${minutes} minutes.
  </p>
`;

const generateHighlightBox = (html: string) => `
  <div class="highlight-box">${html}</div>
`;

const generateButton = (text: string, url: string) => `
  <div style="text-align:center; margin:32px 0;">
    <a href="${url}" class="btn" target="_blank">${text}</a>
  </div>
`;

// ──────────────────────────────────────────────
// Email Functions (all in English)
export const sendWelcomeEmail = async (to: string, name: string): Promise<void> => {
  const subject = 'Welcome to Your CR!';
  const content = `
    <h1>Welcome, ${name}!</h1>
    <p>You're now part of Your CR — the centralized platform for class representatives and students to manage everything in one place.</p>
    ${generateHighlightBox(`
      <p><strong>What you can do on Your CR:</strong></p>
      <ul style="padding-left:24px; margin:16px 0;">
        <li>Share class notices, routines, and assignments</li>
        <li>Communicate quickly with students</li>
        <li>Track attendance and results</li>
        <li>Manage college/polytechnic/university events & group chats</li>
      </ul>
    `)}
    <p>Get started right away!</p>
    ${generateButton('Go to Dashboard', 'https://yourcr.app/dashboard')}
  `;

  const html = generateProfessionalEmailTemplate(content, {
    title: 'Welcome to Your CR',
    preheader: `Hi ${name}, your class management journey starts now!`,
  });

  await addEmailToQueue({ to, subject, html });
};

export const sendVerificationEmail = async (to: string, otp: string): Promise<void> => {
  const subject = 'Verify Your Email – Your OTP Code';
  const content = `
    <h2>Verify Your Email</h2>
    <p>Thank you for signing up! Please use the code below to verify your email address:</p>
    ${generateOTPSection(otp, 15)}
    <p style="color:var(--muted); font-size:14px;">If you didn’t request this, you can safely ignore this email.</p>
  `;

  const html = generateProfessionalEmailTemplate(content, {
    title: 'Email Verification',
    preheader: `Your verification code: ${otp}`,
  });

  await addEmailToQueue({ to, subject, html });
};

export const sendResetPasswordEmail = async (to: string, otp: string): Promise<void> => {
  const subject = 'Password Reset Request – Your OTP Code';
  const content = `
    <h2>Password Reset Request</h2>
    <p>You requested to reset your password. Use the OTP below to continue:</p>
    ${generateOTPSection(otp, 15)}
    <p style="color:var(--muted); font-size:14px;">If you didn’t request this, your password will remain unchanged.</p>
  `;

  const html = generateProfessionalEmailTemplate(content, {
    title: 'Password Reset',
    preheader: `Your reset code: ${otp}`,
  });

  await addEmailToQueue({ to, subject, html });
};

export const sendOTPEmail = async (to: string, otp: string): Promise<void> => {
  const subject = 'Your One-Time Password (OTP)';
  const content = `
    <h2>Your OTP Code</h2>
    <p>Use this code to proceed:</p>
    ${generateOTPSection(otp, 15)}
    <p style="color:var(--muted); font-size:14px;">If you didn’t request this code, please ignore this email.</p>
  `;

  const html = generateProfessionalEmailTemplate(content, {
    title: 'Your OTP Code',
    preheader: `Your code: ${otp}`,
  });

  await addEmailToQueue({ to, subject, html });
};
