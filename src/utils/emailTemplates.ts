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
  <title>${title}</title>
  <style>
    body { 
      margin: 0; 
      padding: 0; 
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
      color: #333333; 
      line-height: 1.6; 
    }
    table { border-collapse: collapse; }
    .container { 
      max-width: 600px; 
      margin: 30px auto; 
      background-color: #F9F9F9; 
      border-radius: 12px; 
      overflow: hidden; 
      box-shadow: 0 10px 40px rgba(0,0,0,0.15); 
    }
    .header { 
      background: #F9F9F9;
      padding: 40px 30px; 
      text-align: center; 
      border-bottom: 3px solid #65C257;
    }
    .header img { 
      max-width: 200px; 
      height: auto; 
      border-radius: 12px;
    }
    .header h1 {
      color: #1e293b;
      font-size: 28px;
      margin: 15px 0 0 0;
      font-weight: 700;
    }
    .content { 
      padding: 45px 40px; 
      font-size: 15px; 
      background-color: #F9F9F9;
    }
    .content h2 { 
      color: #65C257; 
      font-size: 24px; 
      margin: 0 0 20px 0; 
      font-weight: 700; 
    }
    .content p { 
      margin: 0 0 16px; 
      color: #4b5563;
    }
    .otp-code { 
      font-family: 'Courier New', Courier, monospace; 
      font-size: 36px; 
      font-weight: bold; 
      letter-spacing: 10px; 
      color: #ffffff; 
      text-align: center; 
      padding: 25px; 
      background: #65C257;
      border-radius: 10px; 
      margin: 30px 0; 
      box-shadow: 0 4px 15px rgba(0, 214, 92, 0.3);
    }
    .highlight-box {
      background: #F9F9F9;
      border-left: 4px solid #65C257; 
      padding: 25px; 
      margin: 25px 0; 
      border-radius: 0 8px 8px 0; 
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    }
    .highlight-box ul {
      margin: 10px 0;
      padding-left: 20px;
    }
    .highlight-box li {
      margin: 8px 0;
      color: #4b5563;
    }
    .credentials-table {
      width: 100%;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      overflow: hidden;
      margin: 25px 0;
      font-size: 15px;
    }
    .credentials-table td {
      padding: 15px 20px;
      border-bottom: 1px solid #f3f4f6;
    }
    .credentials-table tr:last-child td {
      border-bottom: none;
    }
    .credentials-table td:first-child {
      background-color: #f9fafb;
      font-weight: 600;
      width: 40%;
      color: #374151;
    }
    .status-badge {
      display: inline-block;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .status-pending {
      background: #fef3c7;
      color: #92400e;
    }
    .status-approved {
      background: #d1fae5;
      color: #065f46;
    }
    .status-rejected {
      background: #fee2e2;
      color: #991b1b;
    }
    .status-completed {
      background: #dbeafe;
      color: #1e40af;
    }
    .cta-button {
      display: inline-block;
      padding: 14px 32px;
      background: #65C257;
      color: #ffffff;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      margin: 20px 0;
      box-shadow: 0 4px 12px rgba(0, 214, 92, 0.3);
      transition: transform 0.2s;
    }
    .footer {
      background: #F9F9F9;
      padding: 35px 40px;
      text-align: center;
      font-size: 13px;
      color: #94a3b8;
    }
    .footer strong {
      color: #65C257;
      font-size: 16px;
    }
    .footer a { 
      color: #65C257; 
      text-decoration: none; 
      font-weight: 500;
    }
    .footer a:hover { 
      text-decoration: underline; 
    }
    .footer-tagline {
      color: #64748b;
      font-style: italic;
      margin-top: 15px;
      font-size: 14px;
    }
    @media (max-width: 600px) {
      .container { 
        margin: 10px !important; 
        border-radius: 8px !important; 
      }
      .header, .content, .footer { 
        padding: 25px 20px !important; 
      }
      .otp-code { 
        font-size: 28px !important; 
        letter-spacing: 6px !important; 
        padding: 20px !important;
      }
      .header h1 {
        font-size: 22px !important;
      }
    }
  </style>
</head>
<body>
  ${
    preheader
      ? `<div style="display:none;font-size:1px;color:#0f172a;line-height:1px;max-height:0;overflow:hidden;">${preheader}</div>`
      : ''
  }

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table class="container" role="presentation">
          <!-- Header -->
          <tr>
            <td class="header">
              <img src="https://i.ibb.co.com/dwnFctfX/logo.webp" alt="Easy Bet" />
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td class="content">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td class="footer">
              <p style="margin: 0 0 10px;">
                <strong>Easy Bet</strong>
              </p>
              <p style="margin: 0 0 8px;">
                Email: <a href="mailto:support@easybet.com">support@easybet.com</a><br>
                Website: <a href="https://www.easybet.com">www.easybet.com</a>
              </p>
              <p style="margin: 25px 0 0; color: #64748b; font-size: 12px;">
                © ${new Date().getFullYear()} Easy Bet. All rights reserved.
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

const generateOTPSection = (otp: string, minutes: number = 30) => `
  <p>Please enter the following verification code to proceed:</p>
  <div class="otp-code">${otp}</div>
  <p style="text-align: center; color: #6b7280; font-size: 14px;">
    ⏱️ This code will expire in <strong>${minutes} minutes</strong>
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
