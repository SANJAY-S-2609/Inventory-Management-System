"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; // Changed import
import "./id.css";

export default function PurchaseDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await fetch(`/api/PurchaseHistory/${id}`);
        const result = await res.json();
        if (res.ok) setData(result);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

// --- DOWNLOAD EXCEL LOGIC ---
  const downloadExcel = () => {
    const { purchase, items } = data;
    
    const worksheetData = items.map((item, index) => ({
      "S.No": index + 1,
      "Item Name": item.name,
      "Unit": item.unit,
      "Quantity": item.purchasedQuantity, // Explicitly included
      "Price Per Item": item.perItemPrice,
      "Original Total": item.originalPrice,
      "Discount Price": item.discountPrice,
      "Final Price": item.finalPrice,
    }));

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Purchase Details");
    XLSX.writeFile(workbook, `Purchase_${purchase.invoiceNumber}.xlsx`);
  };

const downloadPDF = () => {
  if (!data || !Array.isArray(data.items) || data.items.length === 0) {
    alert("No purchase items available");
    return;
  }

  const { purchase, supplierName, items } = data;
  const doc = new jsPDF();

  /* ---------- HEADER (SAME STYLE) ---------- */
  doc.setFontSize(18);
  doc.text("Purchase Details Report", 14, 20);

  doc.setFontSize(11);
  doc.text(`Invoice: ${purchase.invoiceNumber}`, 14, 30);
  doc.text(`Supplier: ${supplierName}`, 14, 37);

  /* ---------- TABLE HEADERS (SAME STYLE) ---------- */
  const tableColumn = [
    "S.No",
    "Item Name",
    "Unit",
    "Qty",
    "Per Price",
    "Original Price",
    "Discount",
    "Final Price",
  ];

  /* ---------- TABLE DATA (FIXED MAPPING) ---------- */
  const tableRows = items.map((item, index) => [
    index + 1,
    item.name || "-",
    item.unit || "-",
    item.purchasedQuantity ?? 0,  // Quantity
    item.perItemPrice ?? 0,       // Per
    item.originalPrice ?? 0,
    item.discountPrice ?? 0,
    item.finalPrice ?? 0,
  ]);

  /* ---------- TABLE (SAME STYLING) ---------- */
  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 45,
    theme: "grid",
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      minCellHeight: 6,   
      fillColor: [41, 128, 185], // 🔵 SAME BLUE HEADER
      halign: "center",
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 10 }, // S.No
      3: { halign: "center" },                // Qty
      4: { halign: "right" },                 // Per Price
      5: { halign: "right" },                 // Original
      6: { halign: "right" },                 // Discount
      7: { halign: "right" },                 // Final
    },
  });

  /* ---------- TOTALS (SAME POSITION & STYLE) ---------- */
  const finalY = doc.lastAutoTable.finalY + 10;

  doc.setFontSize(10);
  doc.text(
    `Total GST: Rs. ${purchase.totalTaxAmount?.toLocaleString() || 0}`,
    140,
    finalY
  );

  doc.setFont("helvetica", "bold");
  doc.text(
    `Grand Total: Rs. ${purchase.totalAmountAfterTax?.toLocaleString() || 0}`,
    140,
    finalY + 7
  );

  /* ---------- SAVE ---------- */
  doc.save(`Purchase_${purchase.invoiceNumber}.pdf`);
};



  if (loading) return <div className="loader-container">Loading Details...</div>;
  if (!data) return <div className="loader-container">Purchase record not found.</div>;

  const { purchase, supplierName, items } = data;

  return (
    <div className="details-container">
      <div className="details-header">
        <div className="header-left" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button className="back-btn" onClick={() => router.back()}>← Back</button>
          <button className="download-btn excel" onClick={downloadExcel}>Excel</button>
          <button className="download-btn pdf" onClick={downloadPDF}>PDF</button>
        </div>
        <div className="header-right">
          <div className="info-badge">
            <span className="label">Invoice:</span>
            <span className="value">{purchase.invoiceNumber}</span>
          </div>
          <div className="info-badge">
            <span className="label">Supplier:</span>
            <span className="value">{supplierName}</span>
          </div>
        </div>
      </div>

      <div className="details-card">
        <h3 className="card-title">Purchased Items Details</h3>
        <div className="table-wrapper">
          <table className="details-table">
            <thead>
              <tr>
                <th>S.No</th>
                <th>Item Name</th>
                <th>Unit</th>
                <th>Total Purchased</th>
                <th>Per</th>
                {/* <th>Distributed</th>
                <th>Remaining</th> */}
                <th>Original Price</th>
                <th>Discount Price</th>
                <th>Final Price</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(items) && items.map((item, index) => (
                <tr key={item._id}>
                  <td>{index + 1}</td>
                  <td className="item-name">{item.name}</td>
                  <td>{item.unit}</td>
                  <td className="stock-cell-total">{item.purchasedQuantity}</td>
                  <td className="stock-cell-total">{item.perItemPrice}</td>
                  {/* <td className="stock-cell-dist distribution-cell">
                    {item.totalDistributed}
                    {item.distributionDetails.length > 0 && (
                      <div className="distribution-tooltip">
                        <h4>Distribution Breakdown</h4>
                        <ul>
                          {item.distributionDetails.map((dist, i) => (
                            <li key={i}>
                              <span className="dist-place">{dist.place}:</span> 
                              <span className="dist-count">{dist.count} {item.unit}</span>
                            <div className="dist-date" style={{ fontSize: '11px', color: '#666' }}>
                            {dist.date ? new Date(dist.date).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            }) : 'No Date'}
                          </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </td>               */}
                  {/* <td className="stock-cell-rem">{item.remainingStock}</td> */}
                  <td>₹{item.originalPrice?.toLocaleString()}</td>
                  <td className="discount-text">₹{item.discountPrice?.toLocaleString()}</td>
                  <td className="final-price">₹{item.finalPrice?.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="summary-section">
          <div className="summary-box">
            <div className="summary-row total-tax">
              <span>Total GST</span>
              <span>₹{purchase.totalTaxAmount?.toLocaleString()}</span>
            </div>
            <div className="summary-row total-cost">
              <span>Grand Total</span>
              <span>₹{purchase.totalAmountAfterTax?.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}