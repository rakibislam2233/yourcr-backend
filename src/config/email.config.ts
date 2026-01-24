import nodemailer from 'nodemailer';
import config from './index';

export const emailTransporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: config.email.secure,
  auth: {
    user: config.email.username,
    pass: config.email.password,
  },
});

export const emailConfig = {
  from: config.email.emailFrom,
  replyTo: config.email.emailFrom,
};

// Verify email configuration
emailTransporter.verify((error, success) => {
  if (error) {
    console.error('Email configuration error:', error);
  } else {
    console.log('Email server is ready');
  }
});
