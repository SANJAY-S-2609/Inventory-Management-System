"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import jsPDF from "jspdf"; // Import jsPDF
import autoTable from "jspdf-autotable"; // Import autoTable
import "./stockRegister.css";

const StockRegister = () => {
  const [stockData, setStockData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/StockRegister");
        const data = await response.json();
        if (Array.isArray(data)) setStockData(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Function to Generate and Download PDF
  const downloadPDF = () => {
    const doc = new jsPDF();

    // Add Title
    doc.setFontSize(18);
    doc.text("Stock Register Report", 14, 22);
    
    // Add Date
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

    // Define Columns
    const tableColumn = [
      "S.No", 
      "Item Name", 
      "HSN", 
      "Exist. Stock", 
      "New Stock", 
      "Total Stock", 
      "Total Value"
    ];

    // Define Rows (Using stockData to print the full register)
    const tableRows = stockData.map((item, index) => {
      const totalStock = (item.existingStock || 0) + (item.newStock || 0);
      return [
        index + 1,
        item.name,
        item.hsn || "-",
        item.existingStock || 0,
        item.newStock || 0,
        totalStock,
        `Rs. ${item.totalValue.toLocaleString()}`
      ];
    });

    // Generate Table in PDF
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 35,
      theme: 'grid',
      styles: { fontSize: 9 },
      headStyles: { fillColor: [22, 160, 133] }, // Green header for Stock Register
    });

    // Save the PDF
    doc.save("Stock_Register.pdf");
  };

  // 1. Filtered Data for the TABLE rows only
  const filteredData = stockData.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 2. Summary calculations
  const grandTotalStock = stockData.reduce(
    (acc, item) => acc + (item.existingStock || 0) + (item.newStock || 0),
    0
  );

  const grandTotalValue = stockData.reduce(
    (acc, item) => acc + (item.totalValue || 0),
    0
  );

  return (
    <div className="stock-reg-container">
      <div className="stock-reg-card">
        <div
          className="reg-header"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "15px"
          }}
        >
          <h2>📦 Stock Register</h2>

          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginLeft: "auto" }}>
            
            {/* --- CUSTOM STYLED PDF EXPORT BUTTON --- */}
            <button
              onClick={downloadPDF}
              disabled={loading || stockData.length === 0}
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
                opacity: loading || stockData.length === 0 ? 0.6 : 1,
                transition: "0.2s ease"
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#fecdd3"}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#ffe4e6"}
            >
              {/* SVG Icon */}
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

            <div className="search-container">
              <input
                type="text"
                className="search-input"
                placeholder="Search item name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  padding: "8px 12px",
                  borderRadius: "6px",
                  border: "1px solid #ccc",
                  width: "250px",
                }}
              />
            </div>
          </div>
        </div>

        <div className="reg-table-wrapper">
          <table className="modern-reg-table">
            <thead>
              <tr>
                <th>S.No</th>
                <th>Item Name</th>
                <th>HSN</th>
                <th>Existing Stock</th>
                <th>New Stock</th>
                <th>Total Stock</th>
                <th>Total Value</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center">
                    Loading...
                  </td>
                </tr>
              ) : filteredData.length > 0 ? (
                filteredData.map((item, index) => (
                  <tr
                    key={item._id}
                    onClick={() =>
                      router.push(
                        `/dashboard/IndividualItems?itemId=${item.itemId}`
                      )
                    }
                    className="clickable-row"
                    style={{ cursor: "pointer" }}
                  >
                    <td>{index + 1}</td>
                    <td>{item.name}</td>
                    <td>{item.hsn}</td>
                    <td>{item.existingStock}</td>
                    <td>{item.newStock}</td>
                    <td>{(item.existingStock || 0) + (item.newStock || 0)}</td>
                    <td style={{color:"#10b981"}}>₹{item.totalValue.toLocaleString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    style={{ textAlign: "center", padding: "20px" }}
                  >
                    No items found matching "{searchTerm}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {!loading && stockData.length > 0 && (
          <div className="summary-section">
            <div className="summary-box">
              <div className="summary-row">
                <span>Total Items in Registry</span>
                <span>{stockData.length}</span>
              </div>
              <div className="summary-row">
                <span>Total Accumulated Stock</span>
                <span>{grandTotalStock.toLocaleString()} units</span>
              </div>
              <div className="summary-row total-cost">
                <span>Total stock Value</span>
                <span style={{ color: "#00b894" }}>
                  ₹{grandTotalValue.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StockRegister;