import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import User from "../../../models/User";
import { connectDB } from "../../../lib/db";

export async function POST(req) {
  try {
    await connectDB();

    const { userId, password } = await req.json();

    const user = await User.findOne({ userId });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    return NextResponse.json({ message: "Login successful" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
