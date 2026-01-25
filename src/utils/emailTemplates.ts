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
    body { margin: 0; padding: 0; background-color: #f4f4f4; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333333; line-height: 1.6; }
    table { border-collapse: collapse; }
    .container { max-width: 600px; margin: 30px auto; background-color: #ffffff; border: 1px solid #eeeeee; border-radius: 4px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
    .logo { text-align: center; padding: 20px; border-bottom: 1px solid #eeeeee; }
    .logo img { max-width: 150px; height: auto; }
    .content { padding: 40px; font-size: 15px; }
    .content h2 { color: #9300D3; font-size: 22px; margin: 0 0 20px 0; font-weight: 600; }
    .content p { margin: 0 0 16px; }
    .otp-code { 
      font-family: 'Courier New', Courier, monospace; 
      font-size: 32px; 
      font-weight: bold; 
      letter-spacing: 8px; 
      color: #9300D3; 
      text-align: center; 
      padding: 20px; 
      background: #f8f8f8; 
      border: 2px dashed #cccccc; 
      border-radius: 6px; 
      margin: 24px 0; 
    }
    .highlight-box {
      background-color: #f9f9f9;
      border-left: 4px solid #9300D3; 
      padding: 20px; 
      margin: 24px 0; 
      border-radius: 0 4px 4px 0; 
    }
    .credentials-table {
      width: 100%;
      border: 1px solid #d0d0d0;
      border-radius: 4px;
      overflow: hidden;
      margin: 24px 0;
      font-size: 15px;
    }
    .credentials-table td {
      padding: 12px 16px;
      border-bottom: 1px solid #e5e5e5;
    }
    .credentials-table td:first-child {
      background-color: #f5f5f5;
      font-weight: 600;
      width: 35%;
    }
    .footer {
      background-color: #f9f9f9;
      padding: 30px 40px;
      text-align: center;
      font-size: 13px;
      color: #666666;
      border-top: 1px solid #eeeeee;
    }
    .footer a { color: #9300D3; text-decoration: none; }
    .footer a:hover { text-decoration: underline; }
    @media (max-width: 600px) {
      .container { margin: 10px !important; border-radius: 0; }
      .header, .content, .logo, .footer { padding: 20px !important; }
      .otp-code { font-size: 28px !important; letter-spacing: 5px !important; }
    }
  </style>
</head>
<body>
  ${
    preheader
      ? `<div style="display:none;font-size:1px;color:#f4f4f4;line-height:1px;max-height:0;overflow:hidden;">${preheader}</div>`
      : ''
  }

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center">
        <table class="container" role="presentation">
          <!-- Logo -->
          <tr>
            <td class="logo">
              <img src="https://talenzy.s3.us-east-1.amazonaws.com/common/logo_talenzy.png" alt="Talenzy" />
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
              <p style="margin: 0 0 8px;">
                <strong>Talenzy</strong><br>
                Email: <a href="mailto:contact@talenzy.app">contact@talenzy.app</a>
              </p>
              <p style="margin: 20px 0 0; color: #999999;">
                © ${new Date().getFullYear()} Talenzy. All rights reserved.<br>
                Share Your Talent With The World
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
  <p>This code will expire in ${minutes} minutes.</p>
`;

const generateHighlightBox = (html: string) => `
  <div class="highlight-box">${html}</div>
`;

const sendWelcomeEmail = async (to: string, name: string): Promise<void> => {
  const subject = 'Welcome to Talenzy!';
  const content = `
    <h2>Welcome to Talenzy, ${name}!</h2>
    <p>We're excited to have you join our community of talented creators and enthusiasts.</p>
    ${generateHighlightBox(`
      <p><strong>What you can do on Talenzy:</strong></p>
      <ul style="margin: 10px 0; padding-left: 20px;">
        <li>Share your photos and videos with the world</li>
        <li>Discover and connect with talented creators</li>
        <li>Hire talents for events or projects</li>
        <li>Send gifts to support your favorite creators</li>
      </ul>
    `)}
    <p>Start exploring and showcasing your talent today!</p>
    <p>If you have any questions, feel free to reach out to us at <a href="mailto:contact@talenzy.app" style="color: #9300D3;">contact@talenzy.app</a></p>
  `;

  const html = generateProfessionalEmailTemplate(content, {
    title: 'Welcome to Talenzy',
    preheader: `Welcome ${name}! Start your journey on Talenzy.`,
  });

  await addEmailToQueue({ to, subject, html });
};

const sendVerificationEmail = async (to: string, otp: string): Promise<void> => {
  const subject = 'Email Verification - Your OTP Code';
  const content = `
    <h2>Verify Your Email</h2>
    <p>Thank you for signing up! Please use the One-Time Password (OTP) below to verify your email address:</p>
    ${generateOTPSection(otp, 30)}
    <p>If you did not request this verification, please ignore this email.</p>
  `;

  const html = generateProfessionalEmailTemplate(content, {
    title: 'Email Verification',
    preheader: `Your verification code: ${otp}`,
  });

  // High priority for OTP emails
  await addEmailToQueue({ to, subject, html });
};

const sendResetPasswordEmail = async (to: string, otp: string): Promise<void> => {
  const subject = 'Password Reset Request - Your OTP Code';
  const content = `
    <h2>Password Reset Request</h2>
    <p>You requested to reset your password. Please use the One-Time Password (OTP) below to proceed:</p>
    ${generateOTPSection(otp, 30)}
    <p>If you did not request this password reset, please ignore this email and your password will remain unchanged.</p>
  `;

  const html = generateProfessionalEmailTemplate(content, {
    title: 'Password Reset Request',
    preheader: `Your password reset code: ${otp}`,
  });

  // High priority for password reset emails
  await addEmailToQueue({ to, subject, html });
};

const sendOTPEmail = async (to: string, otp: string): Promise<void> => {
  const subject = 'Your OTP Code';
  const content = `
    <h2>Your OTP Code</h2>
    <p>Your One-Time Password (OTP) is:</p>
    ${generateOTPSection(otp, 30)}
    <p>If you did not request this code, please ignore this email.</p>
  `;

  const html = generateProfessionalEmailTemplate(content, {
    title: 'Your OTP Code',
    preheader: `Your OTP code: ${otp}`,
  });

  // High priority for OTP emails
  await addEmailToQueue({ to, subject, html });
};

// ============== VERIFICATION MODULE EMAILS ==============

const sendVerificationSubmittedEmail = async (to: string, name: string): Promise<void> => {
  const subject = 'Verification Request Submitted';
  const content = `
    <h2>Verification Request Received</h2>
    <p>Hi ${name},</p>
    <p>Thank you for submitting your verification request! We've received your documents and our team will review them shortly.</p>
    ${generateHighlightBox(`
      <p><strong>What happens next?</strong></p>
      <ul style="margin: 10px 0; padding-left: 20px;">
        <li>Our team will review your submitted documents</li>
        <li>This process typically takes 1-3 business days</li>
        <li>You'll receive an email once the review is complete</li>
      </ul>
    `)}
    <p>Once verified, you'll receive the verified badge on your profile, increasing your visibility and credibility on Talenzy.</p>
  `;

  const html = generateProfessionalEmailTemplate(content, {
    title: 'Verification Submitted',
    preheader: 'Your verification request is being reviewed',
  });

  await addEmailToQueue({ to, subject, html });
};

const sendVerificationApprovedEmail = async (to: string, name: string): Promise<void> => {
  const subject = 'Congratulations! You are now Verified!';
  const content = `
    <h2>You're Verified!</h2>
    <p>Hi ${name},</p>
    <p>Congratulations! Your verification request has been approved. You now have the official verified badge on your Talenzy profile!</p>
    ${generateHighlightBox(`
      <p style="text-align: center;">
        <span style="font-size: 48px;">✓</span><br>
        <strong style="color: #9300D3; font-size: 18px;">VERIFIED CREATOR</strong>
      </p>
    `)}
    <p><strong>What this means for you:</strong></p>
    <ul style="margin: 10px 0; padding-left: 20px;">
      <li>Verified badge displayed on your profile</li>
      <li>Increased visibility in search results</li>
      <li>Higher trust and credibility with clients</li>
      <li>Priority support from our team</li>
    </ul>
    <p>Thank you for being a valued member of Talenzy!</p>
  `;

  const html = generateProfessionalEmailTemplate(content, {
    title: 'Verification Approved',
    preheader: 'Congratulations! You are now a verified creator on Talenzy',
  });

  await addEmailToQueue({ to, subject, html });
};

const sendVerificationRejectedEmail = async (
  to: string,
  name: string,
  reason: string
): Promise<void> => {
  const subject = 'Verification Request Update';
  const content = `
    <h2>Verification Request Not Approved</h2>
    <p>Hi ${name},</p>
    <p>Unfortunately, we were unable to verify your account at this time.</p>
    ${generateHighlightBox(`
      <p><strong>Reason:</strong></p>
      <p>${reason}</p>
    `)}
    <p><strong>What you can do:</strong></p>
    <ul style="margin: 10px 0; padding-left: 20px;">
      <li>Review the reason above and address the issue</li>
      <li>Ensure your documents are clear and readable</li>
      <li>Submit a new verification request with updated information</li>
    </ul>
    <p>If you have questions or believe this was an error, please contact us at <a href="mailto:contact@talenzy.app" style="color: #9300D3;">contact@talenzy.app</a></p>
  `;

  const html = generateProfessionalEmailTemplate(content, {
    title: 'Verification Not Approved',
    preheader: 'Your verification request needs attention',
  });

  await addEmailToQueue({ to, subject, html });
};

export const emailTemplates = {
  // Auth & General
  sendWelcomeEmail,
  sendResetPasswordEmail,
  sendVerificationEmail,
  sendOTPEmail,

  // Verification Module
  sendVerificationSubmittedEmail,
  sendVerificationApprovedEmail,
  sendVerificationRejectedEmail,
};
