import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 465),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendMail(opts: {
  to: string; subject: string; html: string;
}) {
  const from = `"Yojana" <${process.env.SMTP_USER}>`;
  return transporter.sendMail({ from, ...opts });
}
