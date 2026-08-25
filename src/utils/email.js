import nodemailer from "nodemailer";

const transport = nodemailer.createTransport({
  host: process.env.BREVO_SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.SENDER_EMAIL,
    pass: process.env.BREVO_API_KEY,
  },
});

const sendOtpEmail = async (email, otp) => {
  await transport.sendMail({
    from: `Warden ${process.env.EMAIL_FROM}`,
    to: email,
    subject: "Your warden OTP code",
    html: `
        <h2>Email Verification</h2>
        <p>Your OTP code is:</p>
        <h1>${otp}</h1>
        <p>This code expires in 10 minutes.</p>
        <p>If you didn't request this, ignore this email</p>
    `,
  });
};

export { sendOtpEmail };