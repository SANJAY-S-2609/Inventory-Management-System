import { NextResponse } from "next/server";
import { connectDB } from "../../../../lib/db"; // Adjust path if needed
import DistributedItems from "../../../../models/DistributedItems";

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const itemId = searchParams.get("itemId");

    if (!itemId) {
      return NextResponse.json({ message: "Item ID is required" }, { status: 400 });
    }

    // Find all distribution records for this specific itemId
    const history = await DistributedItems.find({ itemId }).sort({ distributedDate: -1 });
    
    return NextResponse.json(history, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Failed to fetch details" }, { status: 500 });
  }
}