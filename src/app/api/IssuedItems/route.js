// import { NextResponse } from "next/server";
// import { connectDB } from "../../../lib/db";
// import ItemDetails from "../../../models/ItemDetails";
// import DistributedItems from "../../../models/DistributedItems";

// export async function GET(req) {
//   try {
//     await connectDB();

//     // Get the search query from the URL
//     const { searchParams } = new URL(req.url);
//     const query = searchParams.get("search");

//     // Build filter for searching by name
//     let filter = {};
//     if (query) {
//       filter.name = { $regex: query, $options: "i" }; // Case-insensitive search
//     }

//     // 1. Fetch all matching items from ItemDetails
//     const items = await ItemDetails.find(filter).lean();

//     // 2. Fetch all distributions to calculate sums
//     const distributions = await DistributedItems.find({}).lean();

//     // 3. Combine the data
//     const dynamicData = items.map((item) => {
//       // Calculate total quantity distributed for THIS specific itemId
//       const totalDistributed = distributions
//         .filter((d) => d.itemId === item.itemId)
//         .reduce((sum, d) => sum + d.numberOfItems, 0);

//       return {
//         id: item._id,
//         itemId: item.itemId,
//         category : item.category,
//         name: item.name,
//         unit: item.unit,
//         quantity: item.quantity, // Original stock
//         distributed: totalDistributed, // Sum from DistributedItems
//         remaining: item.quantity - totalDistributed, // Math: Total - Distributed
//       };
//     });

//     return NextResponse.json(dynamicData, { status: 200 });
//   } catch (error) {
//     console.error("Fetch Error:", error);
//     return NextResponse.json({ message: "Error fetching data" }, { status: 500 });
//   }
// }
import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/db";
import ItemDetails from "../../../models/ItemDetails";
import DistributedItems from "../../../models/DistributedItems";

export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("search") || "";

    // 1. Aggregate Distributions per itemId
    const distributions = await DistributedItems.aggregate([
      {
        $group: {
          _id: "$itemId",
          totalDistributed: { $sum: "$numberOfItems" },
        },
      },
    ]);

    // Create a simple map for quick lookup: { "uuid-123": 50 }
    const distMap = {};
    distributions.forEach(d => {
      distMap[d._id] = d.totalDistributed;
    });

    // 2. Aggregate ItemDetails batches into unique items
    // We group by itemId to combine duplicates
    const items = await ItemDetails.aggregate([
      {
        $group: {
          _id: "$itemId",
          name: { $first: "$name" },
          unit: { $first: "$unit" },
          category: { $first: "$category" },
          totalPurchased: { $sum: "$quantity" },
        },
      },
      {
        $match: {
          name: { $regex: query, $options: "i" } // Filter by search term
        }
      }
    ]);

    // 3. Combine the data
    const dynamicData = items.map((item) => {
      const distributedCount = distMap[item._id] || 0;
      const remainingCount = item.totalPurchased - distributedCount;

      return {
        itemId: item._id, // This is your UUID
        name: item.name,
        unit: item.unit,
        category: item.category,
        quantity: item.totalPurchased, // Total bought across all batches
        distributed: distributedCount,
        remaining: remainingCount,
      };
    });

    return NextResponse.json(dynamicData, { status: 200 });
  } catch (error) {
    console.error("Fetch Error:", error);
    return NextResponse.json({ message: "Error fetching data" }, { status: 500 });
  }
}