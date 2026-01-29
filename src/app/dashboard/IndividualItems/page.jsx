"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
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

  const grandTotalAmount = records.reduce((acc, item) => acc + (item.totalAmount || 0), 0);

  // --- PDF Download Function ---
  const downloadPDF = () => {
    const doc = new jsPDF();
    const itemName = records.length > 0 ? records[0].name : "Unknown Item";

    doc.setFontSize(18);
    doc.text(`Item Report: ${itemName}`, 14, 22);

    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

    const tableColumn = ["Date", "Item Name", "HSN", "Qty", "GST", "Unit Price", "Total Price"];
    const tableRows = records.map(item => [
      new Date(item.Date).toLocaleDateString("en-GB"),
      item.name,
      item.hsnSac,
      item.quantity,
      `${item.gstPercentage}%`,
      `Rs. ${item.perItemPrice.toLocaleString()}`,
      `Rs. ${item.totalAmount.toLocaleString()}`
    ]);

    // Add Grand Total Row to PDF
    tableRows.push([
      { content: 'Grand Total', colSpan: 6, styles: { halign: 'right', fontStyle: 'bold' } },
      { content: `Rs. ${grandTotalAmount.toLocaleString()}`, styles: { fontStyle: 'bold', textColor: [22, 160, 133] } }
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 35,
      theme: 'grid',
      styles: { fontSize: 9 },
      headStyles: { fillColor: [185, 28, 28] }, // Matches the red theme
    });

    doc.save(`${itemName.replace(/\s+/g, '_')}_History.pdf`);
  };

  return (
    <div className="ind-item-container">
      <div className="ind-item-card">
        <div className="ind-header">
          <div className="ind-header-left">
            <span className="ind-icon">📑</span>
            <h2>{itemId && records.length > 0 ? ` ${records[0].name}` : "Individual Item Entries"}</h2>
          </div>
          
          <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
            
            {/* --- CUSTOM STYLED PDF EXPORT BUTTON --- */}
            <button
              onClick={downloadPDF}
              disabled={loading || records.length === 0}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                backgroundColor: "#ffe4e6", // Light Pink Background
                color: "#9f1239", // Dark Red/Maroon Text
                border: "none",
                padding: "10px 20px",
                borderRadius: "12px", // Rounded corners
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "700", // Bold Text
                opacity: loading || records.length === 0 ? 0.6 : 1,
                transition: "0.2s ease"
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#fecdd3"}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#ffe4e6"}
            >
              {/* SVG Icon similar to image */}
              <svg 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                style={{ opacity: 0.7 }} 
              >
                <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 13H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 17H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M10 9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              PDF Export
            </button>

            <button className="back-btn" onClick={() => router.push('/dashboard/StockRegister')}>
              Back to Register
            </button>
          </div>
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