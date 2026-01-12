"use client";

import React, { useState, useEffect } from "react";
import "./purchaseHistory.css";
import { useRouter } from "next/navigation";

function Purchase() {
  const [purchases, setPurchases] = useState([]);
  const [filteredPurchases, setFilteredPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchPurchases = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/PurchaseHistory");
        const data = await response.json();
        if (response.ok) {
          setPurchases(data);
          setFilteredPurchases(data);
        }
      } catch (error) {
        console.error("Error fetching purchases:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPurchases();
  }, []);

  useEffect(() => {
    const filtered = purchases.filter((p) =>
      (p.invoiceNumber + (p.companyName || "")).toLowerCase().includes(search.toLowerCase())
    );
    setFilteredPurchases(filtered);
  }, [search, purchases]);

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="purchase-view-container">
      <div className="purchase-card-full">
        <div className="purchase-header-row">
          <div className="header-info">
            <h2>Purchase Records</h2>
          </div>
          <div className="purchase-header-actions">
            <input
              type="text"
              placeholder="Search invoice or company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="purchase-search-input"
            />
          </div>
        </div>

        <div className="purchase-table-wrapper">
          <table className="modern-purchase-table">
            <thead>
              <tr>
                <th>S.No</th>
                <th>Date</th>
                <th>Invoice Number</th>
                <th>Supplier Company</th>
                <th>Total Cost</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" className="table-loader">Loading Purchase Data...</td></tr>
              ) : filteredPurchases.length === 0 ? (
                <tr><td colSpan="5" className="table-loader">No purchase records found.</td></tr>
              ) : (
                filteredPurchases.map((p, index) => (
                  <tr 
                    key={p._id} 
                    className="clickable-row" 
                    onClick={() => router.push(`/dashboard/PurchaseHistory/${p._id}`)}
                  >
                    <td className="sno-cell">{index + 1}</td>
                    <td className="date-cell">{formatDate(p.purchaseDate || p.createdAt)}</td>
                    <td className="invoice-cell">{p.invoiceNumber}</td>
                    <td className="company-cell">{p.companyName}</td>
                    <td className="cost-cell" style={{color:"#10b981"}}>₹{p.totalAmountAfterTax?.toLocaleString() || "0"}</td>
                    <td className="action-cell">
                      <button 
                        className="edit-btn"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevents row click navigation
                          router.push(`/dashboard/PurchaseHistory/Edit/${p._id}`);
                        }}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Purchase;