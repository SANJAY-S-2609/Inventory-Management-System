"use client";

import React, { useState, useEffect } from "react";
import "./supplier.css";
import { useRouter } from "next/navigation";

function Supplier() {
  const [suppliers, setSuppliers] = useState([]);        // original data
  const [filteredSuppliers, setFilteredSuppliers] = useState([]); // filtered
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const router = useRouter();

  // 🔹 Fetch suppliers ONLY ONCE
  useEffect(() => {
    const fetchSuppliers = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/Supplier");
        const data = await response.json();
        if (response.ok) {
          setSuppliers(data);
          setFilteredSuppliers(data); // initialize
        }
      } catch (error) {
        console.error("Error fetching suppliers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSuppliers();
  }, []);

  // 🔹 Filter locally (NO API CALL)
  useEffect(() => {
    const filtered = suppliers.filter((s) =>
      (
        s.supplierName +
        s.companyName +
        s.address +
        s.district +
        s.state +
        s.email
      )
        .toLowerCase()
        .includes(search.toLowerCase())
    );

    setFilteredSuppliers(filtered);
  }, [search, suppliers]);

  return (
    <div className="supplier-view-container">
      <div className="supplier-card-full">
        {/* HEADER */}
        <div className="supplier-header-row">
          <div className="header-info">
            <h2>Suppliers</h2>
          </div>

          <div className="supplier-header-actions">
            <input
              type="text"
              placeholder="Search supplier..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="supplier-search-input"
            />

            <button
              className="add-supplier-btn"
              onClick={() => router.push("/dashboard/AddSupplier")}
            >
              Add New Supplier
            </button>
          </div>
        </div>

        {/* TABLE */}
        <div className="supplier-table-wrapper">
          <table className="modern-supplier-table">
            <thead>
              <tr>
                <th>SID</th>
                <th>Supplier Name</th>
                <th>Company Name</th>
                <th>Address</th>
                <th>District</th>
                <th>State</th>
                <th>Supplier Mobile</th>
                <th>Company Phone</th>
                <th>Godown Number</th>
                <th>Email</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="11" style={{ textAlign: "center", padding: "20px" }}>
                    Loading Suppliers...
                  </td>
                </tr>
              ) : filteredSuppliers.length === 0 ? (
                <tr>
                  <td colSpan="11" style={{ textAlign: "center", padding: "20px" }}>
                    No suppliers found.
                  </td>
                </tr>
              ) : (
                filteredSuppliers.map((s, index) => (
                  <tr key={s._id}>
                    <td className="sid-cell">{index + 1}</td>
                    <td>{s.supplierName}</td>
                    <td>{s.companyName}</td>
                    <td>{s.address}</td>
                    <td>{s.district}</td>
                    <td>{s.state}</td>
                    <td>{s.supplierMobileNumber}</td>
                    <td>{s.companyNumber || "-"}</td>
                    <td>{s.godownNumber || "-"}</td>
                    <td>{s.email}</td>
                    <td>
                      <div className="action-btns">
                        <button
                          className="btn-edit"
                          onClick={() =>
                            router.push(`/dashboard/AddSupplier?supplierId=${s.supplierId}`)
                          }
                        >
                          Edit
                        </button>

                      </div>
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

export default Supplier;