"use client";

import React, { useState, useEffect, useRef } from "react";
import "./supplier.css";
import { useRouter } from "next/navigation";

function Supplier() {
  const [suppliers, setSuppliers] = useState([]); // original data
  const [filteredSuppliers, setFilteredSuppliers] = useState([]); // filtered
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const router = useRouter();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [showNewPassModal, setShowNewPassModal] = useState(false);
  const [pendingSupplierId, setPendingSupplierId] = useState(null);
  const [passwordInput, setPasswordInput] = useState("");
  const [newPasswordInput, setNewPasswordInput] = useState("");
  const [otpInput, setOtpInput] = useState(new Array(6).fill(""));
  const [serverOtp, setServerOtp] = useState("");
  const [timer, setTimer] = useState(60);
  const otpRefs = useRef([]);

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
        .includes(search.toLowerCase()),
    );

    setFilteredSuppliers(filtered);
  }, [search, suppliers]);

  const handleEditInitiate = (supplierId) => {
    setPendingSupplierId(supplierId);
    setShowPasswordModal(true);
  };

  const handlePasswordSubmit = async () => {
    const res = await fetch("/api/Admin-security", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: passwordInput }),
    });

    if (res.ok) {
      router.push(`/dashboard/AddSupplier?supplierId=${pendingSupplierId}`);
      setShowPasswordModal(false);
      setPasswordInput("");
    } else {
      alert("Incorrect Admin Password");
    }
  };

  const generateAndSendOtp = async () => {
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setServerOtp(newOtp);
    setTimer(90);
    setOtpInput(new Array(6).fill(""));
    setShowPasswordModal(false);
    setShowOtpModal(true);
    await fetch("/api/Send-Otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ otp: newOtp }),
    });
  };

  const verifyOtp = () => {
    if (otpInput.join("") === serverOtp) {
      setShowOtpModal(false);
      setShowNewPassModal(true);
    } else {
      alert("Invalid OTP");
    }
  };
  const handleOtpChange = (element, index) => {
    // Only allow numbers
    if (isNaN(element.value)) return;

    let newOtp = [...otpInput];
    // Take only the last character entered (prevents double numbers)
    newOtp[index] = element.value.slice(-1);
    setOtpInput(newOtp);

    // Move to next box if value is entered
    if (element.value !== "" && index < 5) {
      otpRefs.current[index + 1].focus();
    }
  };

  // ADD THIS: Handle backspace to go backwards
  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otpInput[index] && index > 0) {
      otpRefs.current[index - 1].focus();
    }
  };

  const handleUpdatePassword = async () => {
    const res = await fetch("/api/Admin-security", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newPassword: newPasswordInput, isUpdate: true }),
    });

    if (res.ok) {
      alert("Password updated in database!");
      setShowNewPassModal(false);
      setShowPasswordModal(true);
      setNewPasswordInput("");
    }
  };

  return (
    <div className="supplier-view-container">
      {/* --- MODAL 1: PASSWORD (Identical to Purchase) --- */}
      {showPasswordModal && (
        <div className="custom-security-overlay">
          <div className="custom-security-modal">
            <h3>Admin Verification</h3>
            <p>Enter password to modify supplier record</p>
            <input 
              type="password" 
              placeholder="Enter Admin Password" 
              className="security-modal-input"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
            />
            <button className="security-btn-primary" onClick={handlePasswordSubmit}>Login</button>
            <button className="security-btn-forgot" onClick={generateAndSendOtp}>Forgot Password? (Use WhatsApp OTP)</button>
            <button className="security-btn-close" onClick={() => setShowPasswordModal(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* --- MODAL 2: OTP (Identical to Purchase) --- */}
{/* --- MODAL 2: OTP VERIFICATION --- */}
      {showOtpModal && (
        <div className="custom-security-overlay">
          <div className="custom-security-modal">
            <h3>WhatsApp Verification</h3>
            <p>6-digit code sent to authorized KIOT numbers</p>
            <div className="otp-boxes-container">
              {otpInput.map((data, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength="1"
                  ref={(el) => (otpRefs.current[index] = el)}
                  value={data}
                  onChange={(e) => handleOtpChange(e.target, index)} // Use the function
                  onKeyDown={(e) => handleKeyDown(e, index)}       // Add backspace support
                  className="otp-box-field"
                />
              ))}
            </div>
            <p className="security-timer">
              Time remaining: <span style={{color: timer < 10 ? 'red' : '#10b981'}}>{timer}s</span>
            </p>
            
            <button 
              className="security-btn-primary" 
              onClick={verifyOtp} 
              disabled={timer === 0}
            >
              Verify & Access
            </button>
            
            {timer === 0 && (
              <button className="security-btn-forgot" onClick={generateAndSendOtp}>
                Resend New Code
              </button>
            )}
            <button className="security-btn-close" onClick={() => setShowOtpModal(false)}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* --- MODAL 3: RESET (Identical to Purchase) --- */}
      {showNewPassModal && (
        <div className="custom-security-overlay">
          <div className="custom-security-modal">
            <h3>Reset Admin Password</h3>
            <p>OTP Verified. Please set your new password below.</p>
            <input 
              type="password" 
              placeholder="Enter New Password" 
              className="security-modal-input"
              value={newPasswordInput}
              onChange={(e) => setNewPasswordInput(e.target.value)}
            />
            <button className="security-btn-primary" onClick={handleUpdatePassword}>Update & Save Password</button>
            <button className="security-btn-close" onClick={() => setShowNewPassModal(false)}>Cancel</button>
          </div>
        </div>
      )}
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
                  <td
                    colSpan="11"
                    style={{ textAlign: "center", padding: "20px" }}
                  >
                    Loading Suppliers...
                  </td>
                </tr>
              ) : filteredSuppliers.length === 0 ? (
                <tr>
                  <td
                    colSpan="11"
                    style={{ textAlign: "center", padding: "20px" }}
                  >
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
                          onClick={() => handleEditInitiate(s.supplierId)} // Changed this line
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
