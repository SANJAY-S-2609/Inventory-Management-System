"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import "./Login.css";

const Login = () => {
  const [formData, setFormData] = useState({
    userId: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    // Lock scroll on page load
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setSuccess("");
  setLoading(true);

  try {
    const res = await fetch("/api/ValidateLogins", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: formData.userId,
        password: formData.password,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Login failed");
    } else {
      setSuccess("Login successful!");
      
      // --- ADD THIS LINE TO FIX YOUR ISSUE ---
      // This sets a cookie named 'isLoggedIn' that lasts for 24 hours
      document.cookie = "isLoggedIn=true; path=/; max-age=86400; SameSite=Lax";
      
      console.log("Login response:", data);
      
      // Use window.location.href to ensure a full refresh so middleware picks up the cookie
      window.location.href = "/dashboard/DashBoard1";
    }
  } catch (err) {
    setError("Something went wrong. Try again.");
    console.error(err);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="login-page-container">
      <div className="login-split-wrapper">

        {/* LEFT SIDE: BRANDING */}
        <div className="login-brand-side">
          <div className="brand-content">
            <img src="/inventory.jpg" alt="Inventory" />
            <h1 className="brand-name">InvTrack</h1>
          </div>
        </div>

        {/* RIGHT SIDE: FORM */}
        <div className="login-form-side">
          <div className="form-inner-card">
            <div className="form-header">
              <h2>Login</h2>
            </div>

            <form onSubmit={handleSubmit} className="custom-login-form">
              {error && <p className="text-danger">{error}</p>}
              {success && <p className="text-success">{success}</p>}

              <div className="input-group">
                <label>User Id</label>
                <input
                  type="email"
                  name="userId" // must match state key
                  placeholder="email@example.com"
                  onChange={handleChange}
                  value={formData.userId}
                  required
                />
              </div>

              <div className="input-group">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  onChange={handleChange}
                  value={formData.password}
                  required
                />
              </div>

              <button
                type="submit"
                className="login-submit-btn"
                disabled={loading}
              >
                {loading ? "Authenticating..." : "Login"}
              </button>

              <div className="form-footer">
                <span>New to InvTrack?</span>
                <Link href="/SignUp">Sign Up</Link>
              </div>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;