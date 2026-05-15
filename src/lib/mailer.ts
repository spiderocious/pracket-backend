import nodemailer from 'nodemailer';

import { env } from '../env.js';
import { logger } from './logger.js';

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
});

export const sendMail = async (to: string, subject: string, html: string): Promise<void> => {
  try {
    await transporter.sendMail({ from: env.SMTP_FROM, to, subject, html });
  } catch (err) {
    logger.error({ err }, 'Failed to send email');
  }
};
