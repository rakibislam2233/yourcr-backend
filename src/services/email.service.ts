import { Queue } from 'bullmq';
import { createEmailTransporter, emailConfig, emailTemplates } from '../config/email.config';
import { logger } from '../config/logger.config';

interface EmailJobData {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  template?: 'otp' | 'welcome' | 'passwordReset';
  templateData?: any;
}

// Email queue for background processing
export const emailQueue = new Queue<EmailJobData>('email-processing', {
  connection: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD,
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
});

// Send email function (adds to queue)
export const sendEmail = async (options: EmailJobData): Promise<void> => {
  try {
    // Process template if provided
    if (options.template && options.templateData) {
      const template = emailTemplates[options.template];
      if (template) {
        const rendered = template(options.templateData);
        options.subject = rendered.subject;
        options.html = rendered.html;
      }
    }

    // Add email job to queue
    const job = await emailQueue.add('send-email', options, {
      jobId: `email-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    });

    logger.info(`📧 Email queued successfully`, {
      jobId: job.id,
      to: options.to,
      subject: options.subject,
    });
  } catch (error) {
    logger.error('❌ Failed to queue email:', error);
    throw error;
  }
};

// Direct email sending function (used by worker)
export const sendEmailDirect = async (options: EmailJobData): Promise<void> => {
  const transporter = createEmailTransporter();
  
  try {
    // Process template if provided
    if (options.template && options.templateData) {
      const template = emailTemplates[options.template];
      if (template) {
        const rendered = template(options.templateData);
        options.subject = rendered.subject;
        options.html = rendered.html;
      }
    }

    await transporter.sendMail({
      from: emailConfig.from,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });

    logger.info(`✅ Email sent successfully`, {
      to: options.to,
      subject: options.subject,
    });
  } catch (error) {
    logger.error('❌ Email sending failed:', error);
    throw error;
  } finally {
    await transporter.close();
  }
};

// Verify email configuration
export const verifyEmailConnection = async (): Promise<boolean> => {
  const transporter = createEmailTransporter();
  
  try {
    await transporter.verify();
    logger.info('✅ Email server is ready');
    await transporter.close();
    return true;
  } catch (error) {
    logger.error('❌ Email server verification failed:', error);
    await transporter.close();
    return false;
  }
};

// Predefined email functions
export const sendOTPEmail = async (to: string, otp: string): Promise<void> => {
  return sendEmail({
    to,
    template: 'otp',
    templateData: otp,
  });
};

export const sendWelcomeEmail = async (to: string, name: string): Promise<void> => {
  return sendEmail({
    to,
    template: 'welcome',
    templateData: name,
  });
};

export const sendPasswordResetEmail = async (to: string, resetLink: string): Promise<void> => {
  return sendEmail({
    to,
    template: 'passwordReset',
    templateData: resetLink,
  });
};