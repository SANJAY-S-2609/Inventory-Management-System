import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/db";
import PurchaseHistory from "../../../models/PurchaseHistory";
import Supplier from "../../../models/SupplierDetails"; // We need this to get the Company Name

export async function GET() {
  try {
    await connectDB();

    // 1. Fetch all purchases
    const purchases = await PurchaseHistory.find({}).sort({ createdAt: -1 });

    // 2. Fetch all suppliers to map company names
    const suppliers = await Supplier.find({});

    // Create a map for quick lookup: { "SUP123": "ABC Corp" }
    const supplierMap = {};
    suppliers.forEach((s) => {
      // Use whichever field you store the ID in (supplierId or _id)
      supplierMap[s.supplierId] = s.companyName;
    });

    // 3. Merge companyName into the purchase data
    const enhancedPurchases = purchases.map((p) => {
      const purchaseObj = p.toObject();
      return {
        ...purchaseObj,
        companyName: supplierMap[p.supplierId] || "Unknown Supplier",
        // Mapping totalAmountAfterTax to a simpler key for the frontend if needed
        totalCost: purchaseObj.totalAmountAfterTax, 
      };
    });

    return NextResponse.json(enhancedPurchases, { status: 200 });
  } catch (error) {
    console.error("Error fetching purchases:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}