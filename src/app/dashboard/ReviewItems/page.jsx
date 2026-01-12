"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ReviewItems() {
  const router = useRouter();

  // --- STATE INITIALIZATION (Lazy Initializers to avoid render warnings) ---
  
  const [items, setItems] = useState(() => {
    if (typeof window !== "undefined") {
      // Corrected key to match the AddItem page logic
      const savedItems = localStorage.getItem("pending_batch_items");
      return savedItems ? JSON.parse(savedItems) : [];
    }
    return [];
  });

  const [supplier, setSupplier] = useState(() => {
    if (typeof window !== "undefined") {
      const savedSup = localStorage.getItem("pending_supplier");
      return savedSup ? JSON.parse(savedSup) : {};
    }
    return {};
  });

  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // --- ACTIONS ---

  const discardItem = (tid) => {
    const filtered = items.filter((i) => i.tempId !== tid);
    setItems(filtered);
    localStorage.setItem("pending_batch_items", JSON.stringify(filtered));
  };

  const handleFinalSave = async () => {
    if (!invoiceNumber.trim()) {
      alert("Please enter a valid Invoice Number to complete the purchase.");
      return;
    }

    if (items.length === 0) {
      alert("The item list is empty. Please add items first.");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/BulkSaveItems", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceNumber, supplier, items }),
      });

      if (res.ok) {
        alert("All items and Invoice details saved successfully! ✅");
        // Clear storage only after successful DB save
        localStorage.removeItem("pending_batch_items");
        localStorage.removeItem("pending_supplier");
        router.push("/dashboard/ShowAddedItems");
      } else {
        const errorData = await res.json();
        alert(`Error: ${errorData.message || "Failed to save to database."}`);
      }
    } catch (err) {
      console.error("Save Error:", err);
      alert("A network error occurred. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="card shadow-lg border-0 rounded-4 p-4 bg-white">
        <div className="mb-4 border-bottom pb-3">
          <h2 className="fw-bold text-dark">Review Purchase Items</h2>
          <p className="text-muted mb-0">
            Supplier: <span className="fw-bold text-primary">{supplier.companyName || "Not Selected"}</span>
          </p>
        </div>

        {/* ITEMS TABLE */}
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th style={{ width: "100px" }}>Action</th>
                <th>Item Name</th>
                <th>Category</th>
                <th>Qty</th>
                <th className="text-end">Total (Inc. GST)</th>
              </tr>
            </thead>
            <tbody>
              {items.length > 0 ? (
                items.map((item) => (
                  <tr key={item.tempId}>
                    <td>
                      <button
                        className="btn btn-outline-danger btn-sm rounded-pill px-3"
                        onClick={() => discardItem(item.tempId)}
                      >
                        Discard
                      </button>
                    </td>
                    <td className="fw-semibold">{item.name}</td>
                    <td><span className="badge bg-secondary opacity-75">{item.category}</span></td>
                    <td>{item.quantity} {item.unit}</td>
                    <td className="text-end fw-bold text-success">
                      ₹{parseFloat(item.totalAmount).toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-5 text-muted italic">
                    No items added yet. Click "+ Add One More Item" to begin.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ADD MORE BUTTON */}
        <div className="mt-3">
          <button
            className="btn btn-outline-primary fw-bold rounded-3"
            onClick={() => router.push("/dashboard/Additem")}
          >
            + Add One More Item
          </button>
        </div>

        {/* FINAL INVOICE SECTION */}
        <div className="mt-5 p-4 rounded-4" style={{ backgroundColor: "#f8f9fa", border: "1px dashed #dee2e6" }}>
          <h4 className="fw-bold mb-3">Finalize & Save</h4>
          <div className="row align-items-end g-3">
            <div className="col-md-6">
              <label className="form-label fw-medium">Invoice Number / Bill No.</label>
              <input
                type="text"
                className="form-control form-control-lg border-2"
                placeholder="Enter Invoice Number"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
              />
            </div>
            <div className="col-md-6">
              <button
                className="btn btn-success btn-lg w-100 fw-bold shadow-sm"
                onClick={handleFinalSave}
                disabled={isSaving || items.length === 0}
              >
                {isSaving ? "Saving to Database..." : "Confirm & Save to Database"}
              </button>
            </div>
          </div>
          <small className="text-muted d-block mt-3">
            * Items will not be saved to the database until an invoice number is provided and confirmed.
          </small>
        </div>
      </div>
    </div>
  );
}