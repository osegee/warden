// import nodemailer from "nodemailer";

// const transport = nodemailer.createTransport({
//   host: process.env.BREVO_SMTP_HOST,
//   port: process.env.SMTP_PORT,
//   secure: true, // true for 465, false for other portss
//   auth: {
//     user: process.env.SENDER_EMAIL,
//     pass: process.env.BREVO_API_KEY,
//   },
// });

// const sendOtpEmail = async (email, otp) => {
//   await transport.sendMail({
//     from: `Warden ${process.env.EMAIL_FROM}`,
//     to: email,
//     subject: "Your warden OTP code",
//     html: `
//         <h2>Email Verification</h2>
//         <p>Your OTP code is:</p>
//         <h1>${otp}</h1>
//         <p>This code expires in 10 minutes.</p>
//         <p>If you didn't request this, ignore this email</p>
//     `,
//   });
// };

// export { sendOtpEmail };

import {
  TransactionalEmailsApi,
  SendSmtpEmail,
  TransactionalEmailsApiApiKeys,
} from "@getbrevo/brevo";

const apiInstance = new TransactionalEmailsApi();
apiInstance.setApiKey(
  TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY,
);

const sendOtpEmail = async (email, otp) => {
  const sendSmtpEmail = new brevo.SendSmtpEmail();

  sendSmtpEmail.subject = "Your Warden OTP Code";
  sendSmtpEmail.to = [{ email: email }];
  sendSmtpEmail.sender = {
    email: process.env.SENDER_EMAIL,
    name: "Warden",
  };
  sendSmtpEmail.htmlContent = `
        <h2>Email Verification</h2>
        <p>Your OTP code is:</p>
        <h1>${otp}</h1>
        <p>This code expires in 10 minutes.</p>
        <p>If you didn't request this, ignore this email.</p>
    `;

  await apiInstance.sendTransacEmail(sendSmtpEmail);
};

export { sendOtpEmail };
