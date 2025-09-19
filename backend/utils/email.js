const nodemailer = require("nodemailer");

let cachedTransporter = null;

function createTransporter() {
  if (cachedTransporter) return cachedTransporter;

  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_SECURE,
    SMTP_USER,
    SMTP_PASS,
    SMTP_FROM
  } = process.env;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    console.warn("Email is not fully configured. Missing SMTP env vars.");
    return null;
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: String(SMTP_SECURE).toLowerCase() === "true", // true for 465
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS
    }
  });

  cachedTransporter = transporter;
  return transporter;
}

async function sendEmail({ to, subject, html, text }) {
  const transporter = createTransporter();
  if (!transporter) {
    console.warn("sendEmail skipped: transporter not configured");
    return { skipped: true };
  }

  const from = process.env.SMTP_FROM || process.env.SMTP_USER;

  return transporter.sendMail({ from, to, subject, html, text });
}

module.exports = { sendEmail };


