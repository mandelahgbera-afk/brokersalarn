import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import MobileBottomNav from "./MobileBottomNav";
import { useAuth } from "@/lib/AuthContext";

export default function AppLayout() {
  const { user } = useAuth();
  const location = useLocation();

  // isAdmin: true when on /admin routes
  const isAdmin = location.pathname.startsWith("/admin");

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <Sidebar user={user} isAdmin={isAdmin} />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto min-w-0 pb-[80px] lg:pb-0">
        <div className="p-4 lg:p-8 pt-4 lg:pt-8 max-w-[1400px] mx-auto">
          <Outlet context={{ user }} />
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav isAdmin={isAdmin} />
    </div>
  );
}
