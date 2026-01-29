// "use client";
// import React, { useState, useEffect } from "react";
// import "./DistributedHistory.css";

// const DistributedHistory = () => {
//   const [items, setItems] = useState([]); // Stores all data from DB
//   const [loading, setLoading] = useState(true);

//   // Filter States
//   const [startDate, setStartDate] = useState("");
//   const [endDate, setEndDate] = useState("");

//   // Fetch data on load
//   useEffect(() => {
//     const fetchHistory = async () => {
//       try {
//         const response = await fetch("/api/DistributeItems");
//         if (response.ok) {
//           const data = await response.json();
//           setItems(data);
//         } else {
//           console.error("Failed to fetch history");
//         }
//       } catch (error) {
//         console.error("Error connecting to server", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchHistory();
//   }, []);

//   // --- FILTER LOGIC ---
//   const filteredItems = items.filter((item) => {
//     if (!startDate && !endDate) return true; // No filter selected, show all

//     const itemDate = new Date(item.distributedDate).setHours(0, 0, 0, 0);
//     const start = startDate ? new Date(startDate).setHours(0, 0, 0, 0) : null;
//     const end = endDate ? new Date(endDate).setHours(0, 0, 0, 0) : null;

//     if (start && itemDate < start) return false; // Before start date
//     if (end && itemDate > end) return false; // After end date

//     return true;
//   });

//   const clearFilters = () => {
//     setStartDate("");
//     setEndDate("");
//   };

//   if (loading) {
//     return <div className="history-wrapper">Loading records...</div>;
//   }

//   return (
//     <div className="history-wrapper">
//       <div className="history-card">
        
//         {/* HEADER WITH FILTERS */}
//         <div className="history-header-flex">
//           <h2>📋 Distributed Items History</h2>
          
//           <div className="filter-container">
//             <div className="date-group">
//               <label>From:</label>
//               <input 
//                 type="date" 
//                 className="date-input"
//                 value={startDate}
//                 onChange={(e) => setStartDate(e.target.value)}
//               />
//             </div>

//             <div className="date-group">
//               <label>To:</label>
//               <input 
//                 type="date" 
//                 className="date-input"
//                 value={endDate}
//                 onChange={(e) => setEndDate(e.target.value)}
//               />
//             </div>

//             {(startDate || endDate) && (
//               <button className="btn-clear" onClick={clearFilters}>
//                 Clear
//               </button>
//             )}
//           </div>
//         </div>

//         {/* TABLE */}
//         <div className="table-container">
//           <table className="history-table">
//             <thead>
//               <tr>
//                 <th>S.No</th>
//                 <th>Item Name</th>
//                 <th>Quantity</th>
//                 <th>Unit</th>
//                 <th>Receiver</th>
//                 <th>Location</th>
//                 <th>Date</th>
//               </tr>
//             </thead>
//             <tbody>
//               {filteredItems.length > 0 ? (
//                 filteredItems.map((item, index) => (
//                   <tr key={item._id || index}>
//                     <td>{index + 1}</td>
//                     <td className="item-name">{item.itemName}</td>
//                     <td>
//                       <span className="qty-badge">{item.numberOfItems}</span>
//                     </td>
//                     <td>{item.unit}</td>
//                     <td>{item.receiverPerson}</td>
//                     <td>{item.distributedTo}</td>
//                     <td className="date-text">
//                       {new Date(item.distributedDate).toLocaleDateString()}
//                     </td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan="7" className="empty-state">
//                     No records found for this date range.
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default DistributedHistory;
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