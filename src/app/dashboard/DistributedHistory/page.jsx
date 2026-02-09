
"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import "./DistributedHistory.css";

const DistributedHistory = () => {
  const [summaryData, setSummaryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await fetch("/api/DistributeItems");
        if (response.ok) {
          const data = await response.json();
          setSummaryData(data);
        }
      } catch (error) {
        console.error("Error fetching data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  const filteredData = summaryData.filter((item) =>
    item.itemName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="history-wrapper">Loading summary...</div>;

  return (
    <div className="history-wrapper">
      <div className="history-card">
        <div className="history-header-flex">
          <h2>📊 Distributed Items Summary</h2>
          <div className="search-container">
            <input
              type="text"
              placeholder="Search item name..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="table-container">
          <table className="history-table">
            <thead>
              <tr>
                <th>S.No</th>
                <th>Item Name</th>
                <th>Category</th>
                <th>Unit</th>
                <th>Total Distributed</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map((item, index) => (
                  <tr 
                    key={item.itemId} 
                    className="clickable-row"
                    onClick={() => router.push(`/dashboard/DistributedHistory/Details?itemId=${item.itemId}`)}
                  >
                    <td>{index + 1}</td>
                    <td className="item-name-bold">{item.itemName}</td>
                    <td><span className="category-badge">{item.category || "N/A"}</span></td>
                    <td>{item.unit}</td>
                    <td>
                      <span className="qty-badge-total">{item.totalDistributed}</span>
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="empty-state">No distributed items found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DistributedHistory;