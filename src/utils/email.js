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

const sendOtpEmail = async (email, otp) => {
  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      accept: "application/json",
      "api-key": process.env.BREVO_API_KEY,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      sender: {
        email: process.env.SENDER_EMAIL,
        name: "Warden",
      },
      to: [{ email }],
      subject: "Your Warden OTP Code",
      htmlContent: `
                <h2>Email Verification</h2>
                <p>Your OTP code is:</p>
                <h1>${otp}</h1>
                <p>Expires in 10 minutes.</p>
                <p>If you didn't request this, ignore this email.</p>
            `,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Email sending failed: ${error.message}`);
  } else {
    console.log("OTP sent successfully");
  }

  return response.json();
};

export { sendOtpEmail };
