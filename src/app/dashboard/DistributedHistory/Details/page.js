"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import jsPDF from "jspdf"; 
import autoTable from "jspdf-autotable"; 
import "../DistributedHistory.css"; 

const DistributionDetailsContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const itemId = searchParams.get("itemId");
  
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [itemName, setItemName] = useState("");

  useEffect(() => {
    const fetchDetails = async () => {
      if (!itemId) return;
      try {
        const response = await fetch(`/api/DistributeItems/Details?itemId=${itemId}`);
        const data = await response.json();
        if (response.ok) {
          setLogs(data);
          if (data.length > 0) setItemName(data[0].itemName);
        }
      } catch (error) {
        console.error("Error fetching details", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [itemId]);

  // --- PDF EXPORT LOGIC ---
  const downloadPDF = () => {
    const doc = new jsPDF();

    // Add Title
    doc.setFontSize(18);
    doc.text("Item Distribution Report", 14, 22);
    
    // Add Item Subtitle
    doc.setFontSize(13);
    doc.setTextColor(60);
    doc.text(`Item: ${itemName}`, 14, 30);

    // Add Date
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 36);

    // Define Columns
    const tableColumn = ["S.No", "Receiver Name", "Location", "Quantity", "Unit", "Date"];

    // Define Rows
    const tableRows = logs.map((log, index) => [
      index + 1,
      log.receiverPerson,
      log.distributedTo,
      log.numberOfItems,
      log.unit,
      new Date(log.distributedDate).toLocaleDateString("en-GB")
    ]);

    // Generate Table
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 42,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] }, // Professional Blue Header
      styles: { fontSize: 9 },
    });

    // Save the PDF
    doc.save(`Distribution_Logs_${itemName.replace(/\s+/g, '_')}.pdf`);
  };

  if (loading) return <div className="history-wrapper">Loading distribution logs...</div>;

  return (
    <div className="history-wrapper">
      <div className="history-card">
        <div className="history-header-flex" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <button className="btn-clear" onClick={() => router.back()}>
              ← Back
            </button>
            <h2 style={{ margin: 0 }}>Distribution Logs: <span style={{color: "#3b82f6"}}>{itemName}</span></h2>
          </div>

          {/* PDF Export Button */}
          <button
            onClick={downloadPDF}
            disabled={logs.length === 0}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              backgroundColor: "#fee2e2", // Light Red
              color: "#b91c1c", // Dark Red
              border: "none",
              padding: "10px 18px",
              borderRadius: "10px",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: "700",
              transition: "0.2s ease"
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#fecaca"}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#fee2e2"}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" />
                <path d="M14 2V8H20" />
                <path d="M16 13H8" />
                <path d="M16 17H8" />
            </svg>
            PDF Export
          </button>
        </div>

        <div className="table-container">
          <table className="history-table">
            <thead>
              <tr>
                <th>S.No</th>
                <th>Receiver Name</th>
                <th>Distributed Location</th>
                <th>Quantity</th>
                <th>Unit</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {logs.length > 0 ? (
                logs.map((log, index) => (
                  <tr key={log._id}>
                    <td>{index + 1}</td>
                    <td style={{fontWeight: "600"}}>{log.receiverPerson}</td>
                    <td>{log.distributedTo}</td>
                    <td>
                      <span className="qty-badge">{log.numberOfItems}</span>
                    </td>
                    <td>{log.unit}</td>
                    <td className="date-text">
                      {new Date(log.distributedDate).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric"
                      })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="empty-state">No individual records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default function DistributedDetailsPage() {
  return (
    <Suspense fallback={<div>Loading Page...</div>}>
      <DistributionDetailsContent />
    </Suspense>
  );
}