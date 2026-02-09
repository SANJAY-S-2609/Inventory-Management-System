import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/db";
import Admin from "../../../models/Admin";

export async function POST(req) {
  try {
        console.log("namma thaan ")

    await connectDB();
    const { password, newPassword, isUpdate } = await req.json();

    // 1. Always find the admin config record (or create it if the table is empty)
    let config = await Admin.findOne();
    if (!config) {
      config = await Admin.create({ adminPassword: "admin123" });
    }

    // 2. PASSWORD UPDATE FLOW (After OTP)
    if (isUpdate) {
      config.adminPassword = newPassword;
      await config.save();
      return NextResponse.json({ message: "Password updated successfully" }, { status: 200 });
    }

    // 3. PASSWORD CHECK FLOW (Login)
    if (config.adminPassword === password) {
      return NextResponse.json({ success: true }, { status: 200 });
    } else {
      return NextResponse.json({ success: false, message: "Incorrect Password" }, { status: 401 });
    }
  } catch (error) {
    console.error("Security API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}