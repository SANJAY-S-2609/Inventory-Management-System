"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx"; 
import jsPDF from "jspdf"; 
import autoTable from "jspdf-autotable"; 
import "./showAddedItems.css";

function ShowAddedItems() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // States for Filtering
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [stockThreshold, setStockThreshold] = useState(""); // Input for stock value

  const router = useRouter();

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await fetch("/api/AddItems");
        const data = await res.json();
        if (res.ok) setItems(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  // Get unique categories for the dropdown
  const uniqueCategories = ["All", ...new Set(items.map((item) => item.category))];

  // --- FILTER LOGIC ---
  const filteredItems = items.filter((item) => {
    const matchesCategory = categoryFilter === "All" || item.category === categoryFilter;
    
    // Logic: If threshold is empty, show all. Otherwise show items <= threshold.
    const matchesStock = stockThreshold === "" || item.quantity <= Number(stockThreshold);
    
    return matchesCategory && matchesStock;
  });

  // --- EXCEL DOWNLOAD LOGIC ---
  const downloadExcel = () => {
    const excelData = filteredItems.map((item, index) => ({
      "S.No": index + 1,
      "Item Name": item.name,
      "Quantity": item.quantity,
      "Per":item.perItemPrice,
      "Unit": item.unit,
      "Original Price": item.originalPrice,
      "Discount %": item.discountPercentage,
      "Total Amount": item.totalAmount,
      "Company Name": item.companyName,
      "Phone": item.companyNumber,
      "Category": item.category,
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Inventory");
    XLSX.writeFile(workbook, "Added_Items_Report.xlsx");
  };

  // --- PDF DOWNLOAD LOGIC (LANDSCAPE MODE) ---
  const downloadPDF = () => {
    const doc = new jsPDF('l', 'mm', 'a4'); 

    doc.setFontSize(18);
    doc.text("Inventory: Added Items List", 14, 15);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 22);

    const tableColumn = [
      "S.No", "Item Name", "Qty", "Unit", "Price", "Disc%", "Total", "Company", "Phone", "Category"
    ];

    const tableRows = filteredItems.map((item, index) => [
      index + 1,
      item.name,
      item.quantity,
      item.perItemPrice,
      item.unit,
      item.originalPrice,
      item.discountPercentage,
      item.totalAmount,
      item.companyName,
      item.companyNumber,
      item.category
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 28,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [99, 102, 241], textColor: [255, 255, 255] },
    });

    doc.save("Inventory_Items_Report.pdf");
  };

  return (
    <div className="show-items-container">
      <div className="show-items-card">
        
        {/* Header with Filters and Download Buttons */}
        <div className="show-items-header">
          <div className="header-info" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <h2>📦 Items List</h2>
            
            {/* Filter Group */}
            <div className="filter-group" style={{ display: 'flex', gap: '10px' }}>
              {/* Category Dropdown */}
              <select 
                className="filter-select"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                style={{ padding: '5px 10px', borderRadius: '5px', border: '1px solid #ddd' }}
              >
                {uniqueCategories.map(cat => (
                  <option key={cat} value={cat}>{cat === "All" ? "All Categories" : cat}</option>
                ))}
              </select>

              {/* Stock Input Box */}
              <input 
                type="number"
                placeholder="Qty less than..."
                className="filter-input"
                value={stockThreshold}
                onChange={(e) => setStockThreshold(e.target.value)}
                style={{ 
                  padding: '5px 10px', 
                  borderRadius: '5px', 
                  border: '1px solid #ddd',
                  width: '140px'
                }}
              />
            </div>
          </div>

          <div className="header-btns">
            <button className="download-btn excel-btn" onClick={downloadExcel}>
              📊 Excel Export
            </button>
            <button className="download-btn pdf-btn" onClick={downloadPDF}>
              📄 PDF Export
            </button>
          </div>
        </div>
      
        <div className="show-items-table-wrapper">
          <table className="show-items-table">
            <thead>
              <tr>
                <th>S.No</th>
                <th>Item Name</th>
                <th>Qty</th>
                <th>Unit</th>
                <th>Per</th>
                <th>Original Price</th>
                <th>Discount %</th>
                <th>Total Amount</th>
                <th>Company Name</th>
                <th>Phone</th>
                <th>Category</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr><td colSpan="11" className="text-center">Loading Inventory Data...</td></tr>
              ) : filteredItems.length > 0 ? (
                filteredItems.map((item, index) => (
                  <tr key={item._id}>
                    <td>{index + 1}</td>
                    <td className="fw-bold">{item.name}</td>
                    {/* Applying red color if quantity is low (threshold of 10 or based on input) */}
                    <td style={{ 
                      color: item.quantity < 10 ? 'red' : 'inherit', 
                      fontWeight: item.quantity < 10 ? 'bold' : 'normal' 
                    }}>
                      {item.quantity}
                    </td>
                    <td>{item.unit}</td>
                    <td>{item.perItemPrice}</td>
                    <td>{item.originalPrice}</td>
                    <td>{item.discountPercentage}%</td>
                    <td className="text-success fw-bold">{item.totalAmount}</td>
                    <td>{item.companyName}</td>
                    <td>{item.companyNumber}</td>
                    <td><span className="cat-badge">{item.category}</span></td>
                    <td>
                      <button
                        className="btn-edit"
                        onClick={() =>
                          router.push(`/dashboard/Additem?itemId=${item.itemId}`)
                        }
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="11" className="text-center">No records found matching filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ShowAddedItems;