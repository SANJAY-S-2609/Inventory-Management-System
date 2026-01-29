"use client";

import React, { useState, useEffect, useRef } from "react";
import "./purchaseHistory.css";
import { useRouter } from "next/navigation";

function Purchase() {
  const [purchases, setPurchases] = useState([]);
  const [filteredPurchases, setFilteredPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const router = useRouter();

  // --- SECURITY STATES ---
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [pendingPurchaseId, setPendingPurchaseId] = useState(null);
  const [passwordInput, setPasswordInput] = useState("");
  const [otpInput, setOtpInput] = useState(new Array(6).fill(""));
  const [serverOtp, setServerOtp] = useState(""); 
  const [timer, setTimer] = useState(60);
  const otpRefs = useRef([]);

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

  // OTP Timer Logic
  useEffect(() => {
    let interval;
    if (showOtpModal && timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    } else if (timer === 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [showOtpModal, timer]);

  useEffect(() => {
    const filtered = purchases.filter((p) =>
      (p.invoiceNumber + (p.companyName || "")).toLowerCase().includes(search.toLowerCase())
    );
    setFilteredPurchases(filtered);
  }, [search, purchases]);

  // --- SECURITY LOGIC ---
  const handleEditInitiate = (e, purchaseId) => {
    e.stopPropagation(); // Prevents row click navigation
    setPendingPurchaseId(purchaseId);
    setShowPasswordModal(true);
  };

  const handlePasswordSubmit = () => {
    if (passwordInput === "admin123") { // Static password
      router.push(`/dashboard/PurchaseHistory/Edit/${pendingPurchaseId}`);
      setShowPasswordModal(false);
      setPasswordInput("");
    } else {
      alert("Invalid Password");
    }
  };

  const generateAndSendOtp = async () => {
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setServerOtp(newOtp);
    setTimer(90);
    setOtpInput(new Array(6).fill(""));
    setShowPasswordModal(false);
    setShowOtpModal(true);

    try {
      const res = await fetch("/api/Send-Otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp: newOtp }),
      });
      if (!res.ok) throw new Error("Failed to send");
    } catch (err) {
      alert("Error sending email OTP. Check backend console.");
    }
  };

  const handleOtpChange = (element, index) => {
    if (isNaN(element.value)) return;
    let newOtp = [...otpInput];
    newOtp[index] = element.value;
    setOtpInput(newOtp);
    if (element.value !== "" && index < 5) otpRefs.current[index + 1].focus();
  };

  const verifyOtp = () => {
    if (timer === 0) {
      alert("OTP Expired! Please resend.");
      return;
    }
    if (otpInput.join("") === serverOtp) {
      router.push(`/dashboard/PurchaseHistory/Edit/${pendingPurchaseId}`);
    } else {
      alert("Incorrect OTP");
    }
  };

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
      
      {/* --- PASSWORD MODAL --- */}
      {showPasswordModal && (
        <div className="custom-security-overlay">
          <div className="custom-security-modal">
            <h3>Admin Verification</h3>
            <p>Enter password to modify purchase record</p>
            <input 
              type="password" 
              placeholder="Enter Admin Password" 
              className="security-modal-input"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
            />
            <button className="security-btn-primary" onClick={handlePasswordSubmit}>Login</button>
            <button className="security-btn-forgot" onClick={generateAndSendOtp}>Forgot Password? (Use Email OTP)</button>
            <button className="security-btn-close" onClick={() => setShowPasswordModal(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* --- OTP MODAL --- */}
      {showOtpModal && (
        <div className="custom-security-overlay">
          <div className="custom-security-modal">
            <h3>Email Verification</h3>
            <p>6-digit code sent to authorized KIOT emails</p>
            <div className="otp-boxes-container">
              {otpInput.map((data, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength="1"
                  ref={(el) => (otpRefs.current[index] = el)}
                  value={data}
                  onChange={(e) => handleOtpChange(e.target, index)}
                  className="otp-box-field"
                />
              ))}
            </div>
            <p className="security-timer">Time remaining: <span style={{color: timer < 10 ? 'red' : '#10b981'}}>{timer}s</span></p>
            
            <button className="security-btn-primary" onClick={verifyOtp} disabled={timer === 0}>Verify & Access</button>
            {timer === 0 && (
              <button className="security-btn-forgot" onClick={generateAndSendOtp}>Resend New Code</button>
            )}
            <button className="security-btn-close" onClick={() => setShowOtpModal(false)}>Close</button>
          </div>
        </div>
      )}

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
                <tr><td colSpan="6" className="table-loader">Loading Purchase Data...</td></tr>
              ) : filteredPurchases.length === 0 ? (
                <tr><td colSpan="6" className="table-loader">No purchase records found.</td></tr>
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
                        onClick={(e) => handleEditInitiate(e, p._id)}
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

      <style jsx>{`
        .custom-security-overlay {
          position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7);
          display: flex; align-items: center; justify-content: center; z-index: 10000;
        }
        .custom-security-modal {
          background: white; padding: 30px; border-radius: 15px; width: 400px; text-align: center;
          box-shadow: 0 20px 40px rgba(0,0,0,0.4);
        }
        .security-modal-input {
          width: 100%; padding: 12px; margin: 20px 0; border: 1px solid #ddd; border-radius: 8px; font-size: 1rem;
        }
        .otp-boxes-container {
          display: flex; gap: 10px; justify-content: center; margin: 25px 0;
        }
        .otp-box-field {
          width: 45px; height: 50px; text-align: center; font-size: 1.5rem; border: 2px solid #eee; 
          border-radius: 8px; outline: none; transition: border 0.3s;
        }
        .otp-box-field:focus { border-color: #6366f1; }
        .security-btn-primary {
          width: 100%; padding: 14px; background: #6366f1; color: white; border: none; 
          border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 1rem;
        }
        .security-btn-forgot {
          background: none; border: none; color: #6366f1; font-size: 0.9rem; 
          text-decoration: underline; margin-top: 15px; cursor: pointer; display: block; width: 100%;
        }
        .security-btn-close {
          background: none; border: none; color: #888; margin-top: 12px; cursor: pointer; font-size: 0.9rem;
        }
        .security-timer { font-size: 0.95rem; margin-bottom: 20px; font-weight: 500; }
      `}</style>
    </div>
  );
}

export default Purchase;