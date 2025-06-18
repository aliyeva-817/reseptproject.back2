const nodemailer = require("nodemailer");

const sendOTP = async (to, otp) => {
  console.log("🔁 OTP göndərilir: ", to, otp); // debug log

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject: "OTP Kodunuz",
      text: `OTP kodunuz: ${otp}. 10 dəqiqə ərzində keçərlidir.`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ OTP Email göndərildi:", info.response);
  } catch (err) {
    console.error("❌ OTP göndərilmədi:", err.message);
    throw new Error("OTP göndərilə bilmədi: " + err.message);
  }
};

module.exports = sendOTP;
