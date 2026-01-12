"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import "./signUp.css";

const Signup = () => {
  const [formData, setFormData] = useState({
    userId: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);

  // Lock scroll on mount
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  // ✅ MISSING FUNCTION (FIX)
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/StoreLogins", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: formData.userId,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Registration failed");
      } else {
        alert("Account created successfully!");
        window.location.href = "/";
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page-container">
      <div className="signup-split-wrapper">

        {/* LEFT BRAND PANEL */}
        <div className="signup-brand-panel">
          <div className="brand-inner">
            <img src="/inventory.jpg" alt="Inventory" />
            <h1 className="brand-title">InvTrack</h1>
          </div>
        </div>

        {/* RIGHT FORM PANEL */}
        <div className="signup-form-panel">
          <div className="form-card-inner">

            <div className="form-header-section">
              <h2>Create Account</h2>
            </div>

            <form onSubmit={handleSubmit} className="signup-custom-form">

              <div className="form-input-group">
                <label>User ID (Email)</label>
                <input
                  type="email"
                  name="userId"
                  placeholder="Enter your email"
                  value={formData.userId}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-input-group">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-input-group">
                <label>Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Repeat your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>

              <button
                type="submit"
                className="signup-primary-btn"
                disabled={loading}
              >
                {loading ? "Registering..." : "Create  Account"}
              </button>

              <div className="form-nav-footer">
                <span>Already have an account?</span>
                <Link href="/"> Login</Link>
              </div>

            </form>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Signup;
