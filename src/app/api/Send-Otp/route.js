// app/api/send-otp/route.js
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req) {
  try {
    const { otp } = await req.json();

    // 1. Configure the Transporter (Using Gmail as an example)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "2k23cse144@kiot.ac.in", // Your email
        pass: "qvdp twzk mmal yvua",    // Your Gmail App Password
      },
    });

    // 2. Define Authorized Recipients
    const recipients = ["2k23cse144@kiot.ac.in", "2k23cse132@kiot.ac.in","2k23cse142@kiot.ac.in","2k23cse141@kiot.ac.in","2k23cse164@kiot.ac.in","2k23cse167@kiot.ac.in"];

    // 3. Setup Mail Options
    const mailOptions = {
      from: '"Inventory System" <your-email@gmail.com>',
      to: recipients.join(", "), // Sends to both addresses
      subject: "Action Required: Inventory Edit OTP",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd;">
          <h2 style="color: #6366f1;">Inventory Security Verification</h2>
          <p>A request was made to edit an item in the inventory.</p>
          <div style="background: #f3f4f6; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px;">
            ${otp}
          </div>
          <p>This OTP is valid for <strong>1 minute</strong>. Do not share this code with anyone.</p>
          <p>If you did not request this, please ignore this email.</p>
        </div>
      `,
    };

    // 4. Send the Email
    await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: "OTP sent successfully" }, { status: 200 });
  } catch (error) {
    console.error("Email Error:", error);
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
  }
}