"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function Additem() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const itemId = searchParams.get("itemId");

  // State to track field errors
  const [errors, setErrors] = useState({});

  const [hsnSuggestions, setHsnSuggestions] = useState([]);
  const [nameSuggestions, setNameSuggestions] = useState([]);
  const [selectedItemId, setSelectedItemId] = useState(null);

  const [supplierList, setSupplierList] = useState([]);

  const [formData, setFormData] = useState({
    hsnSac: "",
    name: "",
    category: "",
    quantity: "",
    minOrderLevel: "", // ✅ Initialized
    unit: "",
    perItemPrice: "",
    originalPrice: "",
    discountPercentage: "0",
    gstPercentage: "0",
    totalAmount: "",
    supplierId: "",
    discountPrice: "",
    companyName: "",
    companyNumber: "",
  });

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const res = await fetch("/api/Supplier");
        const data = await res.json();
        setSupplierList(data);
      } catch (err) {
        console.error("Error fetching suppliers", err);
      }
    };
    fetchSuppliers();
  }, []);

  useEffect(() => {
    if (itemId) {
      const fetchItem = async () => {
        try {
          const res = await fetch(`/api/AddItems?itemId=${itemId}`);
          const data = await res.json();
          setFormData({
            ...data,
            perItemPrice: data.perItemPrice || "",
            gstPercentage: data.gstPercentage || "",
            minOrderLevel: data.minOrderLevel || "", // ✅ Load existing value in Edit Mode
          });
        } catch (err) {
          console.error("Failed to fetch item:", err);
        }
      };
      fetchItem();
    } else {
      const urlSid = searchParams.get("supplierId");
      const urlCName = searchParams.get("companyName");
      const urlCPhone = searchParams.get("companyNumber");
      const savedSupplier = JSON.parse(
        localStorage.getItem("pending_supplier")
      );

      if (urlSid) {
        setFormData((prev) => ({
          ...prev,
          supplierId: urlSid,
          companyName: urlCName,
          companyNumber: urlCPhone,
        }));
      } else if (savedSupplier) {
        setFormData((prev) => ({
          ...prev,
          supplierId: savedSupplier.supplierId,
          companyName: savedSupplier.companyName,
          companyNumber: savedSupplier.companyNumber,
        }));
      }
    }
  }, [itemId, searchParams]);

  const handleSupplierChange = (e) => {
    const selectedId = e.target.value;
    const supplier = supplierList.find((s) => s.supplierId === selectedId);

    if (supplier) {
      const supplierData = {
        supplierId: supplier.supplierId,
        companyName: supplier.companyName,
        companyNumber: supplier.companyNumber || supplier.supplierMobileNumber,
      };
      setFormData((prev) => ({ ...prev, ...supplierData }));
      localStorage.setItem("pending_supplier", JSON.stringify(supplierData));
    } else {
      setFormData((prev) => ({
        ...prev,
        supplierId: "",
        companyName: "",
        companyNumber: "",
      }));
    }
  };

  // ✅ New helper to show suggestions when clicking on Item Name based on HSN entered
  const handleNameFocus = async () => {
    if (formData.hsnSac.length > 2) {
      const res = await fetch(`/api/AddItems?searchName=${formData.name}&searchHsn=${formData.hsnSac}`);
      const data = await res.json();
      setNameSuggestions(data);
    }
  };

  const handleChange = async (e) => {
    const { name, value } = e.target;
    let newErrors = { ...errors };

    // Fetch suggestions for HSN or Name
    if (name === "hsnSac" && value.length > 2) {
      const res = await fetch(`/api/AddItems?searchHsn=${value}`);
      const data = await res.json();
      setHsnSuggestions(data);
    } else if (name === "name" && value.length > 2) {
      // ✅ Updated to filter names by the current HSN in state
      const res = await fetch(`/api/AddItems?searchName=${value}&searchHsn=${formData.hsnSac}`);
      const data = await res.json();
      setNameSuggestions(data);
    }
    // If user changes the text manually after selecting, reset the selectedItemId
    if (name === "name" || name === "hsnSac") {
      setSelectedItemId(null);
    }

    // --- VALIDATION LOGIC ---

    // 1. Quantity Validation (Numbers only)
    if (name === "quantity") {
      if (value && isNaN(value)) {
        newErrors.quantity = "There should only be numbers";
      } else {
        delete newErrors.quantity;
      }
    }

    // 2. Minimum Order Level Validation (Numbers only) - ✅ ADDED
    if (name === "minOrderLevel") {
      if (value && isNaN(value)) {
        newErrors.minOrderLevel = "There should only be numbers";
      } else {
        delete newErrors.minOrderLevel;
      }
    }

    // 3. Unit Price Validation (Numbers only)
    if (name === "perItemPrice") {
      if (value && isNaN(value)) {
        newErrors.perItemPrice = "There should only be numbers";
      } else {
        delete newErrors.perItemPrice;
      }
    }

    // 4. Discount Validation (Max 100%)
    if (name === "discountPercentage") {
      if (Number(value) > 100) {
        newErrors.discountPercentage = "Do Not Exceed Above 100%";
      } else {
        delete newErrors.discountPercentage;
      }
    }

    // 5. GST Validation
    if (name === "gstPercentage") {
      if (Number(value) > 100) {
        newErrors.gstPercentage = "Do Not Exceed Above 100%";
      } else if (Number(value) < 0) {
        newErrors.gstPercentage = "GST Should Be Positive";
      } else {
        delete newErrors.gstPercentage;
      }
    }

    setErrors(newErrors);
    if ((name === "discountPercentage" || name === "gstPercentage") && value.length > 2) {
      return; 
    }
    // --- DATA UPDATE & CALCULATION ---
    setFormData((prev) => {
      let updatedData = { ...prev, [name]: value };

      const qty =
        name === "quantity" ? Number(value) : Number(prev.quantity || 0);
      const price =
        name === "perItemPrice"
          ? Number(value)
          : Number(prev.perItemPrice || 0);

      const newOriginalPrice = qty * price;
      updatedData.originalPrice = newOriginalPrice.toFixed(2);

      const discountPercent =
        name === "discountPercentage"
          ? Number(value || 0 )
          : Number(prev.discountPercentage || 0);
      const gstPercent =
        name === "gstPercentage"
          ? Number(value || 0)
          : Number(prev.gstPercentage || 0);

      if (newOriginalPrice > 0) {
        // ✅ Fix: Prevent negative amount by capping effective discount at 100%
        const effectiveDiscount = Math.min(discountPercent, 100);
        const discountAmount = (newOriginalPrice * effectiveDiscount) / 100;
        
        updatedData.discountPrice = discountAmount.toFixed(2);
        const taxableValue = newOriginalPrice - discountAmount;
        const gstAmount = (taxableValue * gstPercent) / 100;
        updatedData.totalAmount = (taxableValue + gstAmount).toFixed(2);
      } else {
        updatedData.discountPrice = "0.00";
        updatedData.totalAmount = "0.00";
      }

      return updatedData;
    });
  };

  const handleSelectSuggestion = (item) => {
    setFormData((prev) => ({
      ...prev,
      hsnSac: item.hsnSac.toString(),
      name: item.name,
      category: item.category,
      unit: item.unit,
    }));
    setSelectedItemId(item.itemId); // 👈 Store the existing ID
    setHsnSuggestions([]);
    setNameSuggestions([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. VALIDATION (Keep existing logic)
    if (Object.keys(errors).length > 0) {
      alert("Please fix the highlighted errors before submitting.");
      return;
    }

    if (!formData.supplierId) {
      alert("Please select a supplier first.");
      return;
    }

    if (formData.companyNumber.length !== 10) {
      alert("Give the proper phone number (10 digits)");
      return;
    }

    const isEditMode = !!itemId;

    if (isEditMode) {
      // --- LOGIC FOR EDIT MODE: Update DB directly ---
      try {
        const res = await fetch("/api/AddItems", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ itemId, ...formData }),
        });

        if (!res.ok) throw new Error("Failed to update item");

        alert("Item updated successfully ✅");
        router.push("/dashboard/ShowAddedItems");
      } catch (err) {
        console.error(err);
        alert("Error updating item ❌");
      }
    } else {
      // --- LOGIC FOR ADD MODE: Save to Local List and reset form ---

      // Create a unique temp ID so the "Discard" button on the next page knows which one to delete
      const tempEntry = {
        ...formData,
        tempId: Date.now(),
        existingItemId: selectedItemId,
      };

      // Get current list from storage (or empty array if none)
      const currentList = JSON.parse(
        localStorage.getItem("pending_batch_items") || "[]"
      );
      currentList.push(tempEntry);

      // Save updated list to localStorage
      localStorage.setItem("pending_batch_items", JSON.stringify(currentList));

      // Save/Lock the supplier info so it stays consistent for this purchase
      localStorage.setItem(
        "pending_supplier",
        JSON.stringify({
          supplierId: formData.supplierId,
          companyName: formData.companyName,
          companyNumber: formData.companyNumber,
        })
      );

      alert(
        "Item added to temporary list! You can now add one more item or click 'Stop Adding'. ✅"
      );

      // Reset ONLY the item-specific fields so the user can add another item immediately
      setFormData((prev) => ({
        ...prev,
        name: "",
        quantity: "",
        minOrderLevel: "",
        unit: "",
        originalPrice: "",
        perItemPrice: "",
        discountPercentage: "0",
        gstPercentage: "0",
        discountPrice: "",
        totalAmount: "",
        hsnSac: "",
        category: "",
      }));
    }
  };

  const isNavigationLocked =
    !itemId &&
    JSON.parse(
      typeof window !== "undefined"
        ? localStorage.getItem("purchase_item_ids") || "[]"
        : "[]"
    ).length > 0;

  // Helper for key blocking
  const blockKeys = (e) => ["e", "E", "+", "-"].includes(e.key) && e.preventDefault();

  return (
    <div className="add-item-container">
      <div
        className="bg-white shadow-lg w-100 p-2 rounded-4"
        style={{ maxWidth: "1400px" }}
      >
        <div className="mb-4">
          <h2 className="fw-semibold">
            {itemId ? "✏️ Edit Item" : "📦 Add New Item"}
          </h2>
        </div>

        <form onSubmit={handleSubmit}>
          {/* ROW 1 */}
          <div className="row g-4 px-2 mb-2">
            {/* HSN COLUMN */}
            <div className="col-md-4 position-relative">
              <label className="form-label fw-medium">HSN / SAC</label>
              <input
                className="form-control"
                name="hsnSac"
                autoComplete="off"
                value={formData.hsnSac}
                onChange={handleChange}
                onBlur={() => setTimeout(() => setHsnSuggestions([]), 200)}
                required
              />
              {hsnSuggestions.length > 0 && (
                <ul
                  className="list-group position-absolute w-100 z-3 shadow-lg"
                  style={{ top: "100%", maxHeight: "200px", overflowY: "auto" }}
                >
                  {/* ✅ Deduplicate and show only HSN numbers */}
                  {Array.from(new Set(hsnSuggestions.map((a) => a.hsnSac)))
                    .map((hsn) => hsnSuggestions.find((a) => a.hsnSac === hsn))
                    .map((item) => (
                      <li
                        key={item._id}
                        className="list-group-item list-group-item-action cursor-pointer"
                        style={{ cursor: "pointer" }}
                        onMouseDown={() => {
                          setFormData((p) => ({ ...p, hsnSac: item.hsnSac.toString() }));
                          setHsnSuggestions([]);
                        }}
                      >
                        <strong>{item.hsnSac}</strong>
                      </li>
                    ))}
                </ul>
              )}
            </div>

            {/* NAME COLUMN */}
            <div className="col-md-4 position-relative">
              <label className="form-label fw-medium">Item Name</label>
              <input
                className="form-control"
                name="name"
                autoComplete="off"
                value={formData.name}
                onChange={handleChange}
                onFocus={handleNameFocus} // ✅ Triggers fetch on click
                onBlur={() => setTimeout(() => setNameSuggestions([]), 200)}
                required
              />
              {nameSuggestions.length > 0 && (
                <ul
                  className="list-group position-absolute w-100 z-3 shadow-lg"
                  style={{ top: "100%", maxHeight: "200px", overflowY: "auto" }}
                >
                  {nameSuggestions.map((item) => (
                    <li
                      key={item._id}
                      className="list-group-item list-group-item-action"
                      style={{ cursor: "pointer" }}
                      onMouseDown={() => handleSelectSuggestion(item)}
                    >
                      {item.name}{" "}
                      <small className="text-muted">({item.category})</small>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="col-md-4">
              <label className="form-label fw-medium">Item Category</label>
              <select
                className="form-select"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="">Select Category</option>
                <option>Plumbing items</option>
                <option>Electrical items</option>
                <option>Painting items</option>
                <option>Carpentry items</option>
                <option>Sanitation items</option>
              </select>
            </div>
          </div>

          {/* ROW 2 */}
          <div className="row g-4 px-2 mb-2">
            {/* QUANTITY */}
            <div className="col-md-4">
              <label className="form-label fw-medium">Quantity</label>
              <input
                className="form-control"
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                onKeyDown={blockKeys} // ✅ Block invalid keys
                required
                style={
                  errors.quantity
                    ? {
                        border: "1px solid red",
                        boxShadow: "0 0 0 0.2rem rgba(220, 53, 69, 0.25)",
                      }
                    : {}
                }
              />
              {errors.quantity && (
                <small
                  style={{
                    color: "red",
                    fontSize: "12px",
                    marginTop: "5px",
                    display: "block",
                  }}
                >
                  {errors.quantity}
                </small>
              )}
            </div>

            {/* MINIMUM ORDER LEVEL */}
            <div className="col-md-4">
              <label className="form-label fw-medium">
                Minimum Order Level
              </label>
              <input
                className="form-control"
                type="number"
                name="minOrderLevel"
                value={formData.minOrderLevel}
                onChange={handleChange}
                onKeyDown={blockKeys} // ✅ Block invalid keys
                required
                style={
                  errors.minOrderLevel
                    ? {
                        border: "1px solid red",
                        boxShadow: "0 0 0 0.2rem rgba(220, 53, 69, 0.25)",
                      }
                    : {}
                }
              />
              {errors.minOrderLevel && (
                <small
                  style={{
                    color: "red",
                    fontSize: "12px",
                    marginTop: "5px",
                    display: "block",
                  }}
                >
                  {errors.minOrderLevel}
                </small>
              )}
            </div>

            <div className="col-md-4">
              <label className="form-label fw-medium">Unit</label>
              <select
                className="form-select"
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                required
              >
                <option value="">Select Unit</option>
                <option>pcs</option>
                <option>kg</option>
                <option>g</option>
                <option>liter</option>
                <option>ml</option>
                <option>box</option>
                <option>packet</option>
                <option>dozen</option>
                <option>m</option>
                <option>cm</option>
                <option>mm</option>
              </select>
            </div>
          </div>

          {/* ROW 3 */}
          <div className="row g-4 px-2 mb-2">
            {/* UNIT PRICE */}
            <div className="col-md-4">
              <label className="form-label fw-medium">Unit Price</label>
              <input
                className="form-control"
                type="number"
                name="perItemPrice"
                value={formData.perItemPrice}
                onChange={handleChange}
                onKeyDown={blockKeys} // ✅ Block invalid keys
                required
                style={
                  errors.perItemPrice
                    ? {
                        border: "1px solid red",
                        boxShadow: "0 0 0 0.2rem rgba(220, 53, 69, 0.25)",
                      }
                    : {}
                }
              />
              {errors.perItemPrice && (
                <small
                  style={{
                    color: "red",
                    fontSize: "12px",
                    marginTop: "5px",
                    display: "block",
                  }}
                >
                  {errors.perItemPrice}
                </small>
              )}
            </div>

            <div className="col-md-4">
              <label className="form-label fw-medium">Total Price</label>
              <input
                className="form-control bg-light"
                type="number"
                name="originalPrice"
                value={formData.originalPrice}
                readOnly
              />
            </div>

            {/* DISCOUNT */}
            <div className="col-md-4">
              <label className="form-label fw-medium">Discount %</label>
              <input
                className="form-control"
                type="number"
                name="discountPercentage"
                value={formData.discountPercentage}
                onChange={handleChange}
                onKeyDown={blockKeys} // ✅ Block invalid keys
                placeholder="0"
                style={
                  errors.discountPercentage
                    ? {
                        border: "1px solid red",
                        boxShadow: "0 0 0 0.2rem rgba(220, 53, 69, 0.25)",
                      }
                    : {}
                }
              />
              {errors.discountPercentage && (
                <small
                  style={{
                    color: "red",
                    fontSize: "12px",
                    marginTop: "5px",
                    display: "block",
                  }}
                >
                  {errors.discountPercentage}
                </small>
              )}
            </div>
          </div>

          {/* COMBINED ROW: GST, Final Amount, Supplier */}
          <div className="row g-4 px-2 mb-4">
            {/* GST */}
            <div className="col-md-4">
              <label className="form-label fw-medium">GST %</label>
              <input
                className="form-control"
                type="number"
                name="gstPercentage"
                value={formData.gstPercentage}
                onChange={handleChange}
                onKeyDown={blockKeys} // ✅ Block invalid keys
                placeholder="0"
                style={
                  errors.gstPercentage
                    ? {
                        border: "1px solid red",
                        boxShadow: "0 0 0 0.2rem rgba(220, 53, 69, 0.25)",
                      }
                    : {}
                }
              />
              {errors.gstPercentage && (
                <small
                  style={{
                    color: "red",
                    fontSize: "12px",
                    marginTop: "5px",
                    display: "block",
                  }}
                >
                  {errors.gstPercentage}
                </small>
              )}
            </div>

            <div className="col-md-4">
              <label
                className="form-label fw-bold"
                style={{ fontSize: "1.1rem" }}
              >
                Final Amount
              </label>
              <input
                className="form-control fw-bold"
                type="number"
                name="totalAmount"
                value={formData.totalAmount}
                readOnly
                style={{
                  backgroundColor: "#f8f9fa",
                  fontSize: "1.2rem",
                  color: "#2be317d9",
                }}
              />
            </div>

            {!itemId && (
              <div className="col-md-4">
                <label className="form-label fw-bold">Select Supplier</label>
                <select
                  className="form-select"
                  value={formData.supplierId}
                  onChange={handleSupplierChange}
                  disabled={isNavigationLocked}
                  required
                >
                  <option value="">-- Click to choose a supplier --</option>
                  {supplierList.map((s) => (
                    <option key={s._id} value={s.supplierId}>
                      {s.companyName} ({s.supplierName})
                    </option>
                  ))}
                </select>
                {isNavigationLocked && (
                  <small className="text-danger mt-1 d-block">
                    Supplier cannot be changed until invoice is completed.
                  </small>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="d-flex justify-content-end gap-3 mt-4 pt-3 border-top">
            <button
              type="button"
              className="btn btn-warning px-4 py-2 fw-semibold rounded-3"
              onClick={() => router.push("/dashboard/ReviewItems")}
            >
              Stop Adding & View List (
              {typeof window !== "undefined"
                ? JSON.parse(
                    localStorage.getItem("pending_batch_items") || "[]"
                  ).length
                : 0}
              )
            </button>
            <button
              type="submit"
              className="btn btn-primary px-4 py-2 fw-semibold rounded-3"
              disabled={Object.keys(errors).length > 0} // ✅ Disable button if errors exist
            >
              {itemId ? "Update Item" : "Add Item"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Additem;