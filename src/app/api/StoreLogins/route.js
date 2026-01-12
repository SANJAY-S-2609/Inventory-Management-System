import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import Logins from "../../../models/User";
import { connectDB } from "../../../lib/db";
// your DB connection

export async function POST(req) {
  try {
    // STEP 1: Connect DB
    await connectDB();

    // STEP 2: Read request body
    const { userId, password } = await req.json();

    console.log(userId);
    console.log(password);

    // STEP 3: Hash password (STEP 4 you asked about ✅)
    const hashedPassword = await bcrypt.hash(password, 10);

    // STEP 4: Save to DB
    await Logins.create({
      userId,
      password: hashedPassword,
    });

    return NextResponse.json({ message: "User registered successfully" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
