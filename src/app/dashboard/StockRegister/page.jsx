"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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

  // 1. Filtered Data for the TABLE rows only
  const filteredData = stockData.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 2. ✅ FIXED: Use 'stockData' (original list) for summary calculations
  // This ensures the totals at the bottom stay the same even when searching.
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
          }}
        >
          <h2>📦 Stock Register</h2>

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
                    {/* <td>
                      ₹
                      {(
                        ((item.existingStock || 0) + (item.newStock || 0)) *
                        item.perPrice
                      ).toLocaleString()}
                    </td> */}
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
                {/* We show stockData.length to always reflect the full registry size */}
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
