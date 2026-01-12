"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import "./individualItems.css";

const IndividualItemContent = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Get itemId from URL query
  const itemId = searchParams.get("itemId");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Correctly fetch data from the API endpoint
        const url = itemId ? `/api/IndividualItems?itemId=${itemId}` : "/api/IndividualItems";
        const res = await fetch(url);
        const data = await res.json();
        
        if (Array.isArray(data)) {
          setRecords(data);
        }
      } catch (error) {
        console.error("Error fetching individual items:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [itemId]);

  // Calculate Total of all 'totalAmount' fields
  const grandTotalAmount = records.reduce((acc, item) => acc + (item.totalAmount || 0), 0);

  return (
    <div className="ind-item-container">
      <div className="ind-item-card">
        <div className="ind-header">
          <div className="ind-header-left">
            <span className="ind-icon">📑</span>
            <h2>{itemId && records.length > 0 ? ` ${records[0].name}` : "Individual Item Entries"}</h2>
          </div>
          <button className="back-btn" onClick={() => router.push('/dashboard/StockRegister')}>
            Back to Stock Register
          </button>
        </div>

        <div className="ind-table-wrapper">
          <table className="modern-ind-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Item Name</th>
                <th>HSN</th>
                <th>Qty</th>
                <th>GST%</th>
                <th>Unit Price</th>
                <th>Total Price</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" className="text-center">Loading Records...</td></tr>
              ) : records.length === 0 ? (
                <tr><td colSpan="7" className="text-center">No Records Found</td></tr>
              ) : (
                records.map((item, index) => (
                  <tr key={index}>
                    <td>{new Date(item.Date).toLocaleDateString("en-GB")}</td>
                    <td className="ind-item-name-cell">{item.name}</td>
                    <td>{item.hsnSac}</td>
                    <td>{item.quantity}</td>
                    <td>{item.gstPercentage}%</td>
                    <td>₹{item.perItemPrice.toLocaleString()}</td>
                    <td className="ind-price-bold">₹{item.totalAmount.toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot>
              <tr className="ind-total-row">
                {/* Spanning 6 columns to push the total to the last column (right side) */}
                <td colSpan="6" style={{ textAlign: "right", fontWeight: "bold" }}>
                  Grand Total of All Entries:
                </td>
                <td className="ind-grand-total" style={{ fontWeight: "bold", color: "green", fontSize: "1.1rem" }}>
                  ₹{grandTotalAmount.toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

export default function IndividualItemPage() {
  return (
    <Suspense fallback={<div className="text-center p-10">Loading UI...</div>}>
      <IndividualItemContent />
    </Suspense>
  );
}