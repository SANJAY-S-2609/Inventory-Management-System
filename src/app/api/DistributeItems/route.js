import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/db";
import DistributedItems from "../../../models/DistributedItems";
import Items from "../../../models/Items"; // Import the Items model for Category

// --- YOUR EXISTING POST CODE (UNCHANGED) ---
export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    // Validate required fields
    if (!body.itemId || !body.numberOfItems) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const newEntry = await DistributedItems.create({
      itemId: body.itemId,
      itemName: body.itemName,
      unit: body.unit,
      distributedTo: body.distributedTo,
      receiverPerson: body.receiverPerson,
      numberOfItems: Number(body.numberOfItems),
      distributedDate: new Date(body.distributedDate),
    });

    return NextResponse.json({ message: "Success", data: newEntry }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}


export async function GET(req) {
  try {
    await connectDB();

    // Use aggregation to group items and join with Items collection for Category
    const summary = await DistributedItems.aggregate([
      {
        $group: {
          _id: "$itemId",
          itemName: { $first: "$itemName" },
          unit: { $first: "$unit" },
          totalDistributed: { $sum: "$numberOfItems" },
        },
      },
      {
        $lookup: {
          from: "items", // This should match your MongoDB collection name for Items
          localField: "_id",
          foreignField: "itemId",
          as: "itemDetails",
        },
      },
      {
        $unwind: {
          path: "$itemDetails",
          preserveNullAndEmptyArrays: true, // In case an item was deleted from main stock
        },
      },
      {
        $project: {
          _id: 0,
          itemId: "$_id",
          itemName: 1,
          unit: 1,
          totalDistributed: 1,
          category: "$itemDetails.category",
        },
      },
    ]);

    return NextResponse.json(summary, { status: 200 });
  } catch (error) {
    console.error("Aggregation Error:", error);
    return NextResponse.json({ message: "Failed to fetch summary" }, { status: 500 });
  }
}

