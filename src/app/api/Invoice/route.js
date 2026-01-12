export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/db";
import PurchaseHistory from "../../../models/PurchaseHistory";
import ItemDetails from "../../../models/ItemDetails";

/* =========================
   POST : CREATE PURCHASE
   ========================= */
export  async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();

    const {
      invoiceNumber,
      supplierId,
      itemIds,
      cgstPercent,
      sgstPercent,
      cgst,
      sgst,
    } = body;

    /* ---------- BASIC VALIDATION ---------- */
    if (
      !invoiceNumber ||
      !supplierId ||
      !Array.isArray(itemIds) ||
      itemIds.length === 0
    ) {
      return NextResponse.json(
        { message: "Required fields missing" },
        { status: 400 }
      );
    }

    /* ---------- DUPLICATE INVOICE CHECK ---------- */
    const existingInvoice = await PurchaseHistory.findOne({ invoiceNumber });
    if (existingInvoice) {
      return NextResponse.json(
        { message: "Invoice number already exists" },
        { status: 409 }
      );
    }

    /* ---------- FETCH ITEMS FROM DB ---------- */
    const items = await ItemDetails.find({
      itemId: { $in: itemIds },
    });

    if (items.length !== itemIds.length) {
      return NextResponse.json(
        { message: "One or more items not found" },
        { status: 404 }
      );
    }

    /* ---------- VALIDATE SUPPLIER CONSISTENCY ---------- */
    const invalidItem = items.find(
      (item) => item.supplierId !== supplierId
    );

    if (invalidItem) {
      return NextResponse.json(
        { message: "Items do not belong to the selected supplier" },
        { status: 400 }
      );
    }

    /* ---------- CALCULATE TOTAL BEFORE TAX ---------- */
    let totalAmountBeforeTax = items.reduce(
      (sum, item) => sum + Number(item.totalAmount),
      0
    );
    totalAmountBeforeTax = Number(totalAmountBeforeTax.toFixed(2));

    /* ---------- TAX CALCULATION (BOTH SCENARIOS) ---------- */
    let calculatedCGST = Number(cgst) || 0;
    let calculatedSGST = Number(sgst) || 0;
    let calculatedCGSTPercent = Number(cgstPercent) || 0;
    let calculatedSGSTPercent = Number(sgstPercent) || 0;

    // Scenario 1: percentage given, amount missing
    if (calculatedCGSTPercent > 0 && !calculatedCGST) {
      calculatedCGST = (totalAmountBeforeTax * calculatedCGSTPercent) / 100;
    }
    if (calculatedSGSTPercent > 0 && !calculatedSGST) {
      calculatedSGST = (totalAmountBeforeTax * calculatedSGSTPercent) / 100;
    }

    // Scenario 2: amount given, percentage missing
    if (calculatedCGST > 0 && !calculatedCGSTPercent) {
      calculatedCGSTPercent = totalAmountBeforeTax
        ? (calculatedCGST * 100) / totalAmountBeforeTax
        : 0;
    }
    if (calculatedSGST > 0 && !calculatedSGSTPercent) {
      calculatedSGSTPercent = totalAmountBeforeTax
        ? (calculatedSGST * 100) / totalAmountBeforeTax
        : 0;
    }

    const totalTaxAmount = Number((calculatedCGST + calculatedSGST).toFixed(2));
    const totalAmountAfterTax = Number((totalAmountBeforeTax + totalTaxAmount).toFixed(2));

    /* ---------- SAVE PURCHASE HISTORY ---------- */
    const purchase = await PurchaseHistory.create({
      invoiceNumber,
      supplierId,
      itemIds,
      cgstPercent: Number(calculatedCGSTPercent.toFixed(2)),
      sgstPercent: Number(calculatedSGSTPercent.toFixed(2)),
      cgst: Number(calculatedCGST.toFixed(2)),
      sgst: Number(calculatedSGST.toFixed(2)),
      totalAmountBeforeTax,
      totalTaxAmount,
      totalAmountAfterTax,
    });

    return NextResponse.json(
      { message: "Purchase history created successfully", data: purchase },
      { status: 201 }
    );
  } catch (error) {
    console.error("PURCHASE HISTORY ERROR:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}

/* =========================
   GET : ALL PURCHASES
   ========================= */
export async function GET() {
  try {
    await connectDB();

    // Use aggregate to join PurchaseHistory with ItemDetails
    const purchases = await PurchaseHistory.aggregate([
      {
        $lookup: {
          from: "itemdetails",     // The collection name in MongoDB (usually lowercase)
          localField: "itemIds",   // Field in PurchaseHistory
          foreignField: "itemId",  // Field in ItemDetails
          as: "purchasedItems"     // The name of the array that will contain the items
        }
      },
      { $sort: { createdAt: -1 } }
    ]);

    return NextResponse.json(purchases, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch", error: error.message },
      { status: 500 }
    );
  }
}