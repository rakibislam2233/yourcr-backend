

interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  attachments?: any[];
}

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    const transporter = createEmailTransporter();
    
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.SMTP_USERNAME,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
      attachments: options.attachments,
    });
  } catch (error) {
    throw new Error(`Email sending failed: ${error}`);
  }
};

// Send OTP email specifically
export const sendOTPEmail = async (email: string, otp: string): Promise<void> => {
  const subject = 'Your OTP Code';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Your OTP Code</h2>
      <p>Hello,</p>
      <p>Your OTP code is:</p>
      <div style="background-color: #f5f5f5; padding: 20px; text-align: center; border-radius: 5px; margin: 20px 0;">
        <h1 style="margin: 0; letter-spacing: 5px; color: #333;">${otp}</h1>
      </div>
      <p>This code will expire in 10 minutes.</p>
      <p>If you didn't request this code, please ignore this email.</p>
      <hr style="margin: 30px 0;">
      <p style="color: #666; font-size: 12px;">
        This is an automated message. Please do not reply to this email.
      </p>
    </div>
  `;

  await sendEmail({
    to: email,
    subject,
    html,
  });
};