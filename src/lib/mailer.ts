import nodemailer from "nodemailer";

let cachedTransporter: nodemailer.Transporter | null = null;

function getMailerTransporter() {
  if (cachedTransporter) {
    return cachedTransporter;
  }

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error("SMTP credentials are not fully configured");
  }

  cachedTransporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });

  return cachedTransporter;
}

export async function sendOtpEmail(email: string, otp: string) {
  const transporter = getMailerTransporter();
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;

  await transporter.sendMail({
    from,
    to: email,
    subject: "Your Rentro OTP code",
    text: `Your Rentro OTP is ${otp}. It expires in 5 minutes.`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.5;color:#0f172a">
        <h2 style="margin-bottom:8px">Rentro login verification</h2>
        <p>Use this OTP to complete your login:</p>
        <div style="font-size:28px;font-weight:700;letter-spacing:6px;margin:12px 0;color:#1d4ed8">${otp}</div>
        <p>This OTP expires in 5 minutes.</p>
        <p style="margin-top:20px;color:#64748b">If you did not request this, you can ignore this email.</p>
      </div>
    `,
  });
}
