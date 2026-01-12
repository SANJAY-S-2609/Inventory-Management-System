// import { NextResponse } from "next/server";
// import { connectDB } from "../../../lib/db";
// import ItemDetails from "../../../models/ItemDetails";

// export async function GET(request) {
//   try {
//     await connectDB();
//     const { searchParams } = new URL(request.url);
//     const itemId = searchParams.get("itemId");

//     const query = itemId ? { itemId: itemId } : {};
//     const data = await ItemDetails.find(query).sort({ Date: -1 });

//     return NextResponse.json(data);
//   } catch (error) {
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }

import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/db";
import ItemDetails from "../../../models/ItemDetails";
import DistributedItems from "../../../models/DistributedItems";

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get("itemId");

    if (!itemId) return NextResponse.json([]);

    // 1. Get total distributed for this specific ID
    const totalDistRes = await DistributedItems.aggregate([
      { $match: { itemId: itemId } },
      { $group: { _id: "$itemId", total: { $sum: "$numberOfItems" } } }
    ]);
    let totalDistributed = totalDistRes.length > 0 ? totalDistRes[0].total : 0;

    // 2. Get all purchase batches (Newest first)
    const batches = await ItemDetails.find({ itemId }).sort({ Date: -1 }).lean();

    // 3. Deduct distribution from batches starting from newest
    const updatedBatches = batches.map((batch) => {
      let remaining = batch.quantity;

      if (totalDistributed > 0) {
        if (totalDistributed >= remaining) {
          totalDistributed -= remaining;
          remaining = 0;
        } else {
          remaining -= totalDistributed;
          totalDistributed = 0;
        }
      }

      return {
        ...batch,
        quantity: remaining, // This now shows the REMAINING quantity
        totalAmount: remaining * batch.perItemPrice // Updated value
      };
    });

    return NextResponse.json(updatedBatches);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}