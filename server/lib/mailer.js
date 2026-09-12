import nodemailer from 'nodemailer';
import { config } from '../config.js';

function otpEmailHtml(code) {
  return `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
      <h2 style="margin:0 0 12px">Verify your ShortScale email</h2>
      <p>Use this one-time code to finish creating your account:</p>
      <p style="font-size:28px;letter-spacing:6px;font-weight:700">${code}</p>
      <p style="color:#64748b;font-size:13px">This code expires in 10 minutes. If you did not request it, ignore this email.</p>
    </div>
  `;
}

function gmailCredentials() {
  const user = String(process.env.EMAIL_USER || config.emailUser || '').trim();
  const pass = String(process.env.EMAIL_PASSWORD || config.emailPassword || '').replace(/\s+/g, '');
  const from = String(process.env.EMAIL_FROM || config.emailFrom || user).trim();
  return { user, pass, from };
}

export async function sendOtpEmail(to, code) {
  const { user, pass, from } = gmailCredentials();

  if (!user || !pass) {
    console.log(`[otp] Verification code for ${to}: ${code}`);
    return { delivered: false };
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
    });
    await transporter.sendMail({
      from,
      to,
      subject: 'Your ShortScale verification code',
      html: otpEmailHtml(code),
      text: `Your ShortScale verification code is ${code}. It expires in 10 minutes.`,
    });
    return { delivered: true };
  } catch (error) {
    console.error('[otp] Gmail send failed:', error.message);
    throw new Error(
      'Could not send the verification email. Check EMAIL_USER and the Gmail App Password in .env.'
    );
  }
}
