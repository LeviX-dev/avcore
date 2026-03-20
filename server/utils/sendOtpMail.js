import nodemailer from "nodemailer";

export const sendOtpMail = async (user, otp) => {

  try {

    console.log("Sending OTP to:", user.email);

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
      }
    });

    const mailOptions = {
      from: process.env.MAIL_USER,
      to: user.email,
      cc: process.env.MAIL_CC,
      subject: "Your Login OTP",
      html: `
        <h3>MMS Login OTP</h3>

        <p><b>Name:</b> ${user.name}</p>
        <p><b>Role:</b> ${user.role}</p>
        <p><b>Username:</b> ${user.username}</p>

        <h2>OTP : ${otp}</h2>

        <p>This OTP is valid for 5 minutes.</p>
      `
    };

    await transporter.sendMail(mailOptions);

    console.log("OTP mail sent successfully");

  } catch (error) {

    console.error("MAIL ERROR:", error);
    throw error;

  }

};