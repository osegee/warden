import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  auth: {
    user: process.env.BREVO_SMTP_USER, // Brevo SMTP login, e.g. 9xxxxx001@smtp-brevo.com
    pass: process.env.BREVO_API_KEY,   // Brevo SMTP key (starts with xsmtpsib-)
  },
});

export async function sendOtpEmail(toEmail, otp) {
  await transporter.sendMail({
    from: `"Warden" <${process.env.SENDER_EMAIL}>`,
    to: toEmail,
    subject: 'Verify your email',
    text: `Your verification code is ${otp}. It expires in 10 minutes.`,
    html: `<p>Your verification code is <b>${otp}</b>.</p><p>It expires in 10 minutes.</p>`,
  });
}