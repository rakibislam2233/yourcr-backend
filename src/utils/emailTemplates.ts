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
      background: #F6F6F6;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      color: #2d3748;
      line-height: 1.6;
    }
    table { border-collapse: collapse; }

    .email-wrapper {
      background: #F6F6F6;
      padding: 40px 20px;
    }

    .container {
      max-width: 520px;
      margin: 30px auto; 
      background-color: #FFFFFF;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    }

    .logo-section {
      text-align: center;
      padding: 15px;
      background: #FFFFFF;
      border-bottom: 1px solid #e2e8f0;
    }

    .logo-section img {
      max-width: 100px;
      height: auto;
      display: inline-block;
    }

    .content {
      padding: 32px 28px;
      font-size: 15px;
      color: #4a5568;
    }

    .content h2 {
      color: #2456C4;
      font-size: 20px;
      margin: 0 0 16px 0;
      font-weight: 600;
      letter-spacing: -0.3px;
    }

    .content p {
      margin: 0 0 14px;
      color: #4a5568;
    }

    .otp-code {
      font-family: 'Courier New', Courier, monospace;
      font-size: 28px;
      font-weight: bold;
      letter-spacing: 6px;
      color: #2456C4;
      text-align: center;
      padding: 18px;
      background: #FFFFFF;
      border: 2px dashed #2456C4;
      border-radius: 8px;
      margin: 20px 0;
    }

    .highlight-box {
      background: linear-gradient(135deg, #e8f0fe 0%, #f3f8ff 100%);
      border-left: 3px solid #2456C4;
      padding: 18px 20px;
      margin: 20px 0;
      border-radius: 0 6px 6px 0;
      font-size: 14px;
    }

    .highlight-box p {
      margin: 0 0 10px;
    }

    .highlight-box ul {
      margin: 8px 0;
      padding-left: 20px;
    }

    .highlight-box li {
      margin-bottom: 6px;
      color: #4a5568;
    }

    .credentials-table {
      width: 100%;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      overflow: hidden;
      margin: 18px 0;
      font-size: 14px;
    }

    .credentials-table td {
      padding: 10px 14px;
      border-bottom: 1px solid #edf2f7;
    }

    .credentials-table tr:last-child td {
      border-bottom: none;
    }

    .credentials-table td:first-child {
      background-color: #f7fafc;
      font-weight: 600;
      width: 38%;
      color: #2d3748;
    }

    .credentials-table td:last-child {
      color: #4a5568;
    }

    .footer {
      background: #FFFFFF;
      padding: 20px 28px;
      text-align: center;
      font-size: 13px;
      color: #718096;
      border-top: 1px solid #e2e8f0;
    }

    .footer p {
      margin: 0 0 6px;
    }

    .footer a {
      color: #2456C4;
      text-decoration: none;
      font-weight: 500;
    }

    .footer a:hover {
      text-decoration: underline;
    }

    .footer-logo {
      font-weight: 700;
      font-size: 14px;
      color: #2d3748;
      margin-bottom: 8px;
    }

    .footer-tagline {
      color: #a0aec0;
      font-size: 12px;
      font-style: italic;
      margin-top: 12px;
    }

    .button {
      display: inline-block;
      background: linear-gradient(135deg, #2456C4 0%, #1a45a0 100%);
      color: #FFFFFF !important;
      padding: 12px 28px;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      font-size: 14px;
      margin: 20px 0;
      box-shadow: 0 2px 8px rgba(36, 86, 196, 0.3);
      transition: all 0.3s ease;
    }

    .button:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(36, 86, 196, 0.4);
    }

    .status-badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .badge-pending {
      background: #fef3c7;
      color: #92400e;
    }

    .badge-approved {
      background: #d1fae5;
      color: #065f46;
    }

    .badge-rejected {
      background: #fee2e2;
      color: #991b1b;
    }

    @media (max-width: 600px) {
      .email-wrapper { padding: 24px 12px; }
      .container { margin: 0; border-radius: 8px; }
      .logo-section { padding: 20px 16px 16px; }
      .logo-section img { max-width: 80px; }
      .content { padding: 24px 20px; font-size: 14px; }
      .content h2 { font-size: 18px; }
      .footer { padding: 20px 20px; }
      .otp-code { font-size: 24px; letter-spacing: 4px; padding: 16px; }
      .credentials-table { font-size: 13px; }
      .credentials-table td { padding: 8px 12px; }
    }
  </style>
</head>
<body>
  ${
    preheader
      ? `<div style="display:none;font-size:1px;color:#f5f7fa;line-height:1px;max-height:0;overflow:hidden;">${preheader}</div>`
      : ''
  }

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="email-wrapper">
    <tr>
      <td align="center">
        <table class="container" role="presentation">
          <!-- Logo -->
          <tr>
            <td class="logo-section">
              <h1 style="margin: 0; color: #2456C4; font-size: 24px; font-weight: 700;">YourCR</h1>
              <p style="margin: 4px 0 0; color: #718096; font-size: 12px;">Class Representative Management System</p>
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
              <p class="footer-logo">YourCR</p>
              <p style="margin: 8px 0;">
                <a href="mailto:support@yourcr.app">support@yourcr.app</a><br>
                <a href="https://yourcr.app">www.yourcr.app</a>
              </p>
              <p style="margin-top: 16px; color: #a0aec0; font-size: 11px;">
                © ${new Date().getFullYear()} YourCR. All rights reserved.
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
  <p style="text-align: center; color: #718096; font-size: 13px;">This code will expire in ${minutes} minutes</p>
`;

const generateHighlightBox = (html: string) => `
  <div class="highlight-box">${html}</div>
`;

const generateButton = (text: string, url: string) => `
  <div style="text-align:center; margin:32px 0;">
    <a href="${url}" class="button" target="_blank">${text}</a>
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

// ──────────────────────────────────────────────
// CR Registration Emails
export const sendPendingCRRegistrationEmail = async (
  to: string,
  name: string,
  institutionName: string
): Promise<void> => {
  const subject = 'CR Registration Received – Pending Approval';
  const content = `
    <h1>CR Registration Received</h1>
    <p>Hi <strong>${name}</strong>,</p>
    <p>Thank you for registering as a Class Representative for <strong>${institutionName}</strong>. Your registration is currently under review.</p>
    ${generateHighlightBox(`
      <p><strong>Registration Details:</strong></p>
      <ul style="padding-left:24px; margin:16px 0;">
        <li>Institution: ${institutionName}</li>
        <li>Status: <span class="status-badge status-pending">Pending</span></li>
      </ul>
    `)}
    <p>You will receive another email once your registration is approved or rejected.</p>
    <p style="color: #6b7280; font-size: 14px;">This usually takes 1-2 business days.</p>
  `;

  const html = generateProfessionalEmailTemplate(content, {
    title: 'CR Registration Pending',
    preheader: `Your CR registration for ${institutionName} is under review`,
  });

  await addEmailToQueue({ to, subject, html });
};

export const sendCRRegistrationApprovedEmail = async (
  to: string,
  name: string,
  institutionName: string
): Promise<void> => {
  const subject = 'CR Registration Approved – Welcome to YourCR!';
  const content = `
    <h1>Registration Approved! 🎉</h1>
    <p>Congratulations <strong>${name}</strong>,</p>
    <p>Your Class Representative registration for <strong>${institutionName}</strong> has been <span class="status-badge status-approved">Approved</span>!</p>
    ${generateHighlightBox(`
      <p><strong>What you can now do:</strong></p>
      <ul style="padding-left:24px; margin:16px 0;">
        <li>Create and manage class notices</li>
        <li>Schedule classes and assessments</li>
        <li>Communicate with your students</li>
        <li>Track student issues and resolutions</li>
      </ul>
    `)}
    <p>Start managing your class right away!</p>
    ${generateButton('Go to Dashboard', 'https://yourcr.app/dashboard')}
  `;

  const html = generateProfessionalEmailTemplate(content, {
    title: 'CR Registration Approved',
    preheader: `Your CR registration for ${institutionName} has been approved`,
  });

  await addEmailToQueue({ to, subject, html });
};

export const sendCRRegistrationRejectedEmail = async (
  to: string,
  name: string,
  institutionName: string,
  reason?: string
): Promise<void> => {
  const subject = 'CR Registration Update – Action Required';
  const content = `
    <h1>Registration Update</h1>
    <p>Hi <strong>${name}</strong>,</p>
    <p>Your Class Representative registration for <strong>${institutionName}</strong> has been <span class="status-badge status-rejected">Rejected</span>.</p>
    ${
      reason
        ? generateHighlightBox(`
      <p><strong>Reason:</strong></p>
      <p>${reason}</p>
    `)
        : ''
    }
    <p>If you believe this is a mistake or would like to reapply with updated information, please contact our support team.</p>
    ${generateButton('Contact Support', 'mailto:support@yourcr.app')}
  `;

  const html = generateProfessionalEmailTemplate(content, {
    title: 'CR Registration Rejected',
    preheader: `Your CR registration for ${institutionName} requires attention`,
  });

  await addEmailToQueue({ to, subject, html });
};

// ──────────────────────────────────────────────
// Student Created Email
export const sendStudentCreatedEmail = async (
  to: string,
  name: string,
  crName: string,
  institutionName: string
): Promise<void> => {
  const subject = 'Welcome to YourCR – Account Created';
  const content = `
    <h1>Welcome to YourCR! 👋</h1>
    <p>Hi <strong>${name}</strong>,</p>
    <p>Your account has been created on YourCR by your Class Representative <strong>${crName}</strong> from <strong>${institutionName}</strong>.</p>
    ${generateHighlightBox(`
      <p><strong>What you can do:</strong></p>
      <ul style="padding-left:24px; margin:16px 0;">
        <li>View class notices and updates</li>
        <li>Access class schedules and routines</li>
        <li>Submit assessments and assignments</li>
        <li>Report issues to your CR</li>
      </ul>
    `)}
    <p>You can now log in and start using the platform.</p>
    ${generateButton('Log In to YourCR', 'https://yourcr.app/login')}
  `;

  const html = generateProfessionalEmailTemplate(content, {
    title: 'Welcome to YourCR',
    preheader: `Your account has been created by ${crName}`,
  });

  await addEmailToQueue({ to, subject, html });
};
