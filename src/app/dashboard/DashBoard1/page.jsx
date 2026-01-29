"use client";
import React, { useState, useEffect } from "react";
import "./dashBoard1.css";

const DashBoard1 = () => {
  const [viewType, setViewType] = useState("weekly");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/dashboard-summary?viewType=${viewType}`);
        const result = await res.json();
        if (res.ok) setData(result);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetchDashboardData();
  }, [viewType]);

  if (loading || !data)
    return <div className="loading-container">Loading Dashboard...</div>;

  const allValues = data.analytics.flatMap((d) => [d.stock, d.dist]);
  const maxVal = Math.max(...allValues, 1);

  return (
    <div className="inventory-dashboard">
      <div className="stats-grid">
        <div className="stat-card purple">
          <div className="card-info">
            <span>Total Products</span>
            <h2>{data.stats.totalProducts}</h2>
          </div>
          <div className="card-badge">Items</div>
        </div>
        <div className="stat-card red">
          <div className="card-info">
            <span>Total Stock</span>
            <h2>{data.stats.totalStock}</h2>
          </div>
          <div className="card-badge">Units</div>
        </div>
        <div className="stat-card blue">
          <div className="card-info">
            <span>Categories</span>
            <h2>{data.stats.categories}</h2>
          </div>
          <div className="card-badge">Groups</div>
        </div>
      </div>

      <div className="main-content-grid">
        <div className="analytics-card">
          <div className="analytics-header">
            <h3>Inventory Analytics</h3>
            <div className="analytics-controls">
              <div className="toggle-btns">
                <button
                  className={viewType === "weekly" ? "active" : ""}
                  onClick={() => setViewType("weekly")}
                >
                  Week
                </button>
                <button
                  className={viewType === "monthly" ? "active" : ""}
                  onClick={() => setViewType("monthly")}
                >
                  Month
                </button>
              </div>
            </div>
          </div>
          <div className="chart-area">
            {data.analytics.map((item, index) => (
              <div key={index} className="chart-column">
                <div className="bar-pair">
                  <div
                    className="bar bar-blue"
                    style={{ height: `${(item.stock / maxVal) * 100}%` }}
                  ></div>
                  <div
                    className="bar bar-pink"
                    style={{ height: `${(item.dist / maxVal) * 100}%` }}
                  ></div>
                </div>
                <span className="chart-label">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="alerts-column">
          <div className="alert-card out-of-stock">
            <div className="alert-title">⚠️ Out of Stock</div>
            <div className="out-of-stock-content">
              {data.alerts.outOfStock.length > 0 ? (
                data.alerts.outOfStock.map((item, i) => (
                  <p key={i}>
                    {item.name} <small>({item.category})</small>
                  </p>
                ))
              ) : (
                <span className="no-items">All items available</span>
              )}
            </div>
          </div>

          <div className="alert-card low-stock">
            <div className="alert-title">📉 Low Stock</div>
            <div className="low-stock-scroll-area">
              {data.alerts.lowStock.map((item, i) => (
                <div key={i} className="low-stock-item">
                  <strong>{item.name}:</strong>
                  <div className="status-val">
                    <span className="text-red">{item.quantity}</span>
                    <small> / limit: {item.threshold}</small>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default DashBoard1;
