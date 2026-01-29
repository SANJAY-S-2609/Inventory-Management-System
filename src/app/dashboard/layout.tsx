"use client";

import { useRouter, usePathname } from "next/navigation";
import "./DashBoard1/layout.css"; // Ensure this path is correct for your project
import { useEffect, useState } from "react";
import type { ReactNode } from "react";

type Props = { children: ReactNode };

export default function DashboardLayout({ children }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  
  // 1. Add State for Mobile Sidebar
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close sidebar when route changes (mobile UX)
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // --- LOGOUT LOGIC ---
  const handleLogout = () => {
    document.cookie = "isLoggedIn=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    localStorage.clear();
    window.location.href = "/";
  };

  // --- SAFE NAVIGATION LOGIC ---
 // --- SAFE NAVIGATION LOGIC ---
  const safeNavigate = (targetPath: string) => {
    // 1. Get the list of items stored in the temporary batch
    const pendingItems = JSON.parse(localStorage.getItem("pending_batch_items") || "[]");
    
    // 2. Check if the user is in "Edit Mode" 
    const isCurrentlyEditing = typeof window !== "undefined" && window.location.search.includes("itemId=");

    // If the user is editing an existing item, let them navigate freely
    if (isCurrentlyEditing) {
      router.push(targetPath);
      return;
    }

    // 3. RESTRICTION LOGIC:
    // If there are pending items, only allow them to go to "Additem" (to add more) 
    // or stay/go to "ReviewItems" (to finalize invoice).
    if (
      pendingItems.length > 0 && 
      !targetPath.includes("ReviewItems") && 
      !targetPath.includes("Additem")
    ) {
      alert("⚠️ Purchase Incomplete: You have items in your list. Please enter the Invoice number in the Review page or Discard them to leave.");
      
      // Force them back to the Review page
      router.push("/dashboard/ReviewItems");
      return;
    }

    // If no items are pending, allow normal navigation
    router.push(targetPath);
  };
  
  const isActive = (path: string) => pathname === path ? "nav-item active" : "nav-item";

  return (
    <div className="app-layout">

      {/* 2. Mobile Header (Contains ONLY the animated hamburger) */}
      <div className="mobile-header">
        
        {/* ANIMATED TOGGLE BUTTON */}
        <div 
          className={`menu-toggle ${isMobileMenuOpen ? "open" : ""}`} 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <div className="bar half start"></div>
          <div className="bar"></div>
          <div className="bar half end"></div>
        </div>

      </div>

      {/* SIDEBAR */}
      <aside className={`app-sidebar ${isMobileMenuOpen ? "open" : ""}`}>
        <div className="brand">
          <img src="/inventory.jpg" style={{ width: "25%" }} alt="Inventory" />
          <h2 className="logo-text">InvTrack</h2>
        </div>

        <nav className="nav-menu">
          <div className={isActive("/dashboard/DashBoard1")} onClick={() => safeNavigate("/dashboard/DashBoard1")}>🏠 Dashboard</div>
          <div className={isActive("/dashboard/Additem")} onClick={() => safeNavigate("/dashboard/Additem")}>🛒 Add Items</div>
          
          {/* Add the Review Items link to the sidebar so they can find it easily */}
          
          <div className={isActive("/dashboard/IssuedItems")} onClick={() => safeNavigate("/dashboard/IssuedItems")}>📦 Issue Items</div>
          <div className={isActive("/dashboard/Supplier")} onClick={() => safeNavigate("/dashboard/Supplier")}>🚚 Suppliers</div>
          <div className={isActive("/dashboard/ShowAddedItems")} onClick={() => safeNavigate("/dashboard/ShowAddedItems")}>🧾 Show Added Items</div>
          <div className={isActive("/dashboard/PurchaseHistory")} onClick={() => safeNavigate("/dashboard/PurchaseHistory")}>🕘 Purchase History</div>
          <div className={isActive("/dashboard/StockRegister")} onClick={() => safeNavigate("/dashboard/StockRegister")}>📋 Stock Register</div>
          <div className={isActive("/dashboard/DistributedHistory")} onClick={() => safeNavigate("/dashboard/DistributedHistory")}>📂 Distributed History</div>
        </nav>

        <button className="logout-button" onClick={handleLogout}>↩ Logout</button>
      </aside>

      {/* OVERLAY (Closes menu when clicking outside on mobile) */}
      {isMobileMenuOpen && <div className="sidebar-overlay" onClick={() => setIsMobileMenuOpen(false)}></div>}
      
      {/* MAIN CONTENT */}
      <div className="main-container">
        <main className="content-area">{children}</main>
      </div>
    </div>
  );
}