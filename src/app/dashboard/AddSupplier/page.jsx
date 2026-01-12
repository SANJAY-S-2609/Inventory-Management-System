"use client";

import React, { useState } from "react";
import "./addSupplier.css";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

function AddSupplier() {


  const searchParams = useSearchParams();
  const supplierId = searchParams.get("supplierId");
  const isEditMode = Boolean(supplierId);


  const router = useRouter(); // ✅ useRouter hook
  const [form, setForm] = useState({
    supplierName: "",
    companyName: "",
    address: "",
    district: "",
    state: "",
    supplierMobileNumber: "",
    companyNumber: "",
    godownNumber: "",
    email: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  useEffect(() => {
  if (!supplierId) return;

  const fetchSupplier = async () => {
    try {
      const res = await fetch(`/api/Supplier?supplierId=${supplierId}`);
      const data = await res.json();

      setForm({
        supplierName: data.supplierName || "",
        companyName: data.companyName || "",
        address: data.address || "",
        district: data.district || "",
        state: data.state || "",
        supplierMobileNumber: data.supplierMobileNumber || "",
        companyNumber: data.companyNumber || "",
        godownNumber: data.godownNumber || "",
        email: data.email || "",
      });
    } catch (error) {
      alert("Failed to load supplier data");
    }
  };

  fetchSupplier();
}, [supplierId]);


  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  

  try {
    const response = await fetch("/api/Supplier", {
      method: isEditMode ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        isEditMode ? { ...form, supplierId } : form
      ),
    });

    if (response.ok) {
      alert(
        isEditMode
          ? "Supplier Updated Successfully!"
          : "Supplier Details Saved Successfully!"
      );
      router.push("/dashboard/Supplier");
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
    <div className="add-supplier-wrapper">
      <div className="form-container-full shadow-lg">
        <div className="form-header-row">
          <button className="back-nav-btn" onClick={() => router.back()}>
            ← Back
          </button>
          <div className="header-text">
          <h2>{isEditMode ? "Edit Supplier" : "New Supplier Registration"}</h2>
          </div>
        </div>

        <hr className="form-divider" />

        <form className="modern-grid-form" onSubmit={handleSubmit}>
          {/* Section 1: Basic Info */}
          <div className="form-row">
            <div className="input-field">
              <label>Supplier Name *</label>
              <input name="supplierName" value={form.supplierName}type="text" onChange={handleChange} required />
            </div>
            <div className="input-field">
              <label>Company Name *</label>
              <input name="companyName" value={form.companyName}type="text" onChange={handleChange} required />
            </div>
          </div>

          {/* Section 2: Contact Info */}
          <div className="form-row">
            <div className="input-field">
              <label>Supplier Mobile *</label>
              <input
                name="supplierMobileNumber"
                type="tel"
                value={form.supplierMobileNumber}
                placeholder="10-15 digits"
                onChange={handleChange}
                required
              />
            </div>
            <div className="input-field">
              <label>Email Address *</label>
              <input name="email" value={form.email}type="email" onChange={handleChange} required />
            </div>
          </div>


          

          {/* Section 4: Secondary Contact */}
          <div className="form-row">
            <div className="input-field">
              <label>Company Phone</label>
              <input name="companyNumber" value={form.companyNumber}type="tel" onChange={handleChange} />
            </div>
            <div className="input-field">
              <label>Godown Number</label>
              <input name="godownNumber" value={form.godownNumber} type="text" onChange={handleChange} />
            </div>
          </div>

          {/* Section 5: Location */}
          <div className="form-row">
            <div className="input-field">
              <label>District *</label>
              <input name="district" type="text" value={form.district} onChange={handleChange} required />
            </div>
            <div className="input-field">
              <label>State *</label>
              <input name="state" type="text" value={form.state} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-row">

            <div className="input-field">
              <label>Full Address *</label>
              <input name="address" type="text" value={form.address} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="discard-btn" onClick={() => router.back()}>
              Cancel
            </button>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Saving..." : isEditMode ? "Update Supplier" : "Save Supplier Details"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddSupplier;