
"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import "./editPurchase.css";

export default function EditPurchase() {
  const { id } = useParams();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    invoiceNumber: "",
    supplierId: "",
  });
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Fetching data for ID:", id);
        
        const [supRes, purRes] = await Promise.all([
          fetch("/api/Supplier"),
          fetch(`/api/PurchaseHistory/${id}`)
        ]);

        const suppliersList = await supRes.json();
        const purchaseResponse = await purRes.json();

        // LOGGING: Check your browser console to see this!
        console.log("API Response received:", purchaseResponse);

        setSuppliers(suppliersList);

        // FIX: Access the 'purchase' property inside the response
        if (purchaseResponse && purchaseResponse.purchase) {
          const p = purchaseResponse.purchase;
          console.log("Setting form data with invoice:", p.invoiceNumber);
          
          setFormData({
            invoiceNumber: p.invoiceNumber || "",
            supplierId: p.supplierId || "",
          });
        } else {
          console.error("Purchase key not found in API response");
        }

      } catch (error) {
        console.error("Failed to load data", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/PurchaseHistory/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert("Purchase updated successfully!");
        router.push("/dashboard/PurchaseHistory");
      } else {
        alert("Update failed.");
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div className="loading-container">Loading Record...</div>;

  return (
    <div className="edit-container">
      <div className="edit-card">
        <h2>Edit Purchase Record</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Invoice Number</label>
            <input
              type="text"
              name="invoiceNumber"
              value={formData.invoiceNumber}
              onChange={(e) => setFormData({...formData, invoiceNumber: e.target.value})}
              required
              placeholder="Loading invoice..."
            />
          </div>

          <div className="form-group">
            <label>Supplier / Company</label>
            <select
              value={formData.supplierId}
              onChange={(e) => setFormData({...formData, supplierId: e.target.value})}
              required
            >
              <option value="">Select Company</option>
              {suppliers.map((sup) => (
                <option key={sup._id} value={sup.supplierId}>
                  {sup.companyName}
                </option>
              ))}
            </select>
          </div>

          <div className="button-group">
            <button type="submit" className="save-btn">Update Record</button>
            <button type="button" className="cancel-btn" onClick={() => router.back()}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}