

import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/db";
import DistributedItems from "../../../models/DistributedItems";

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