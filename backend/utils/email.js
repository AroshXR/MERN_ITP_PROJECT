const nodemailer = require("nodemailer");

let cachedTransporter = null;

const REQUIRED_ENV_VARS = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS"];

function createTransporter() {
  if (cachedTransporter) {
    return cachedTransporter;
  }

  const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);
  if (missing.length) {
    console.warn('[email] SMTP configuration incomplete. Missing:', missing.join(', '));
    console.warn('[email] Set SMTP_HOST, SMTP_PORT, SMTP_SECURE (optional), SMTP_USER, SMTP_PASS, and SMTP_FROM.');
    return null;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: String(process.env.SMTP_SECURE ?? '').toLowerCase() === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    cachedTransporter = transporter;
    console.log('[email] SMTP transporter configured');
    return transporter;
  } catch (error) {
    console.error('[email] Failed to configure transporter:', error.message);
    return null;
  }
}

async function sendEmail({ to, subject, html, text }) {
  try {
    const transporter = createTransporter();
    if (!transporter) {
      return { success: false, error: 'Email transporter not configured' };
    }

    const from = process.env.SMTP_FROM || process.env.SMTP_USER;
    if (!from) {
      return { success: false, error: 'No from address configured' };
    }

    const info = await transporter.sendMail({
      from,
      to,
      subject,
      html,
      text,
    });

    console.log(`[email] Message sent to ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('[email] Failed to send email:', error.message);
    return { success: false, error: error.message };
  }
}

async function testEmailConfiguration() {
  const transporter = createTransporter();
  if (!transporter) {
    return { success: false, message: 'Email transporter not configured' };
  }

  try {
    await transporter.verify();
    return { success: true, message: 'SMTP configuration is valid' };
  } catch (error) {
    console.error('[email] SMTP verification failed:', error.message);
    return { success: false, message: error.message };
  }
}

module.exports = { sendEmail, testEmailConfiguration };
