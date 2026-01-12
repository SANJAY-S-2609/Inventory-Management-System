"use client";
import React, { useState, useEffect } from "react";
import "./distributeItems.css";
import { useRouter, useSearchParams } from "next/navigation";

const DistributeItem = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get data from URL parameters
  const preId = searchParams.get("id");
  const preName = searchParams.get("name");
  const preUnit = searchParams.get("unit");
  const preRemaining = searchParams.get("remaining");

  const [formData, setFormData] = useState({
    itemId: "",
    itemName: "",
    unit: "pcs",
    distributedTo: "",
    receiverPerson: "",
    numberOfItems: 1,
    remaining: "", // Added to state to ensure tracking
    distributedDate: new Date().toISOString().split("T")[0],
  });

  // Pre-fill form when page loads
  useEffect(() => {
    if (preId || preName || preUnit || preRemaining) {
      setFormData((prev) => ({
        ...prev,
        itemId: preId || "",
        itemName: preName || "",
        unit: preUnit || "pcs",
        remaining: preRemaining || "0",
      }));
    }
  }, [preId, preName, preUnit, preRemaining]);

  const [loading, setLoading] = useState(false);

  const capitalizeFirst = (value) =>
    value ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase() : value;

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (["distributedTo", "receiverPerson"].includes(name)) {
      setFormData((prev) => ({ ...prev, [name]: capitalizeFirst(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // --- Validation Logic Start ---
    const requestedAmount = Number(formData.numberOfItems);
    const availableAmount = Number(formData.remaining);

    if (requestedAmount > availableAmount) {
      alert(
        `Insufficient Stock! You are trying to distribute ${requestedAmount} items, but only ${availableAmount} are remaining.`
      );
      return; // Stop the function here, prevents data from being sent to backend
    }
    // --- Validation Logic End ---

    setLoading(true);
    try {
      const response = await fetch("/api/DistributeItems", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert("Item Distribution Recorded Successfully!");
        router.push("/dashboard/IssuedItems"); // Redirect back after success
      } else {
        const err = await response.json();
        alert(`Error: ${err.message}`);
      }
    } catch (error) {
      alert("Failed to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="distribute-wrapper">
      <div className="distribute-form-card shadow-lg">
        <div className="distribute-header">
          <button className="back-btn-circular" onClick={() => router.back()}>
            ←
          </button>
          <div className="header-content">
            <h2>📦 Distribute Item</h2>
            <p className="subtitle">
              Distributing: <strong>{formData.itemName}</strong>
            </p>
          </div>
        </div>

        <hr className="divider" />

        <form className="modern-distribute-form" onSubmit={handleSubmit}>
          {/* Item ID is kept in state but hidden from UI as requested */}
          <input type="hidden" name="itemId" value={formData.itemId} />

          <div className="form-grid">
            <div className="input-group">
              <label>Item Name</label>
              <input
                name="itemName"
                type="text"
                value={formData.itemName}
                readOnly // Pre-filled and Read Only
                className="readonly-input"
              />
            </div>

            <div className="input-group">
              <label>Unit</label>
              <input
                name="unit"
                type="text"
                value={formData.unit}
                readOnly // Pre-filled and Read Only
                className="readonly-input"
              />
            </div>

            <div className="input-group">
              <label>Remaining</label>
              <input
                name="remaining"
                type="text"
                value={formData.remaining}
                readOnly // Pre-filled and Read Only
                className="readonly-input"
              />
            </div>

            <div className="input-group">
              <label>Number of Items</label>
              <input
                name="numberOfItems"
                type="number"
                min="1"
                value={formData.numberOfItems}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <label>Receiver Person</label>
              <input
                name="receiverPerson"
                type="text"
                placeholder="Receiver name"
                value={formData.receiverPerson}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <label>Distributed To (Location) *</label>
              <input
                name="distributedTo"
                type="text"
                placeholder="Warehouse a / lab 1"
                value={formData.distributedTo}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <label>Distribution Date *</label>
              <input
                name="distributedDate"
                type="date"
                value={formData.distributedDate}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={() => router.back()}
            >
              Discard
            </button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? "Recording..." : "Confirm & Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DistributeItem;