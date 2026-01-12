// import { NextResponse } from "next/server";
// import { connectDB } from "../../../lib/db";
// import ItemDetails from "../../../models/ItemDetails";

// export async function GET() {
//   try {
//     await connectDB();
//     const stockData = await ItemDetails.aggregate([
//       { $sort: { Date: -1 } },
//       {
//         $group: {
//           _id: "$itemId",
//           name: { $first: "$name" },
//           hsn: { $first: "$hsnSac" },
//           latestQuantity: { $first: "$quantity" },
//           latestPrice: { $first: "$perItemPrice" },
//           totalQuantity: { $sum: "$quantity" },
//         },
//       },
//       {
//         $project: {
//           _id: 1,
//           name: 1,
//           hsn: 1,
//           newStock: "$latestQuantity",
//           perPrice: "$latestPrice",
//           existingStock: { $subtract: ["$totalQuantity", "$latestQuantity"] },
//         },
//       },
//       { $sort: { name: 1 } }
//     ]);
//     return NextResponse.json(stockData);
//   } catch (error) {
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }

import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/db";
import ItemDetails from "../../../models/ItemDetails";
import DistributedItems from "../../../models/DistributedItems";

export async function GET() {
  try {
    await connectDB();

    // 1. Aggregate Total Distributions per itemId
    const distributions = await DistributedItems.aggregate([
      {
        $group: {
          _id: "$itemId",
          totalDistributed: { $sum: "$numberOfItems" },
        },
      },
    ]);

    // Convert distributions to a Map for O(1) lookup
    const distMap = new Map(distributions.map(d => [d._id, d.totalDistributed]));

    // 2. Aggregate Item Batches
    const items = await ItemDetails.find().sort({ Date: -1 }).lean();

    // 3. Group items by itemId and apply subtraction logic (LIFO)
    const groupedData = {};

    items.forEach((item) => {
      if (!groupedData[item.itemId]) {
        groupedData[item.itemId] = {
          _id: item._id, // Representative ID
          itemId: item.itemId,
          name: item.name,
          hsn: item.hsnSac,
          totalPurchased: 0,
          totalValue: 0,
          batches: [],
          latestPrice: item.perItemPrice
        };
      }
      groupedData[item.itemId].totalPurchased += item.quantity;
      groupedData[item.itemId].batches.push({ ...item });
    });

    const finalStockData = Object.values(groupedData).map((group) => {
      let remainingToDistribute = distMap.get(group.itemId) || 0;
      let currentTotalStock = 0;
      let currentTotalValue = 0;

      // Subtract from latest batches first (LIFO logic)
      // Since batches are already sorted by Date: -1, the first one is the newest
      const processedBatches = group.batches.map((batch) => {
        let batchRemaining = batch.quantity;
        
        if (remainingToDistribute > 0) {
          if (remainingToDistribute >= batchRemaining) {
            remainingToDistribute -= batchRemaining;
            batchRemaining = 0;
          } else {
            batchRemaining -= remainingToDistribute;
            remainingToDistribute = 0;
          }
        }

        currentTotalStock += batchRemaining;
        currentTotalValue += (batchRemaining * batch.perItemPrice);
        
        return { ...batch, remaining: batchRemaining };
      });

      // To match your UI expectations:
      // existingStock = stock from older batches
      // newStock = stock from the latest batch
      const newStock = processedBatches[0].remaining;
      const existingStock = currentTotalStock - newStock;

      return {
        _id: group._id,
        itemId: group.itemId,
        name: group.name,
        hsn: group.hsn,
        existingStock: existingStock,
        newStock: newStock,
        perPrice: group.latestPrice, 
        totalValue: currentTotalValue // More accurate than (totalStock * latestPrice)
      };
    });

    return NextResponse.json(finalStockData);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}