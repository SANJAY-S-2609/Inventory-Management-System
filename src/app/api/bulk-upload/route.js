export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/db";
import ProductMaster from "../../../models/ProductMaster"; // Importing the new JSX model

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json(); // This is the data from Excel

    if (!Array.isArray(body) || body.length === 0) {
      return NextResponse.json({ message: "No data found" }, { status: 400 });
    }

    // Process the data: Clean up and map columns
    const bulkData = body
      .filter((row) => row.name && (row.hsnSac || row.hsnSAC)) // Ensure name & hsn exist
      .map((row) => ({
        // Convert to string in case Excel sends a number
        name: String(row.name).trim(), 
        hsnSac: String(row.hsnSac || row.hsnSAC).trim(),
      }));

    if (bulkData.length === 0) {
      return NextResponse.json({ message: "No valid rows found" }, { status: 400 });
    }

    // Insert into DB. 'ordered: false' allows valid items to save even if duplicates fail.
    await ProductMaster.insertMany(bulkData, { ordered: false })
      .catch((err) => {
        // We ignore error code 11000 (Duplicate Key) so the rest can upload
        if (err.code !== 11000) {
          console.error("Insert Error:", err);
        }
      });

    return NextResponse.json(
      { message: `Successfully processed ${bulkData.length} items!` },
      { status: 201 }
    );
  } catch (error) {
    console.error("Bulk Upload Error:", error);
    return NextResponse.json(
      { message: "Upload failed: " + error.message },
      { status: 500 }
    );
  }
}