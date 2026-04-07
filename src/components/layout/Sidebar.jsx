import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, BarChart3, ArrowLeftRight,
  Users, History, Settings, Shield, Coins,
  TrendingUp, Menu, X, LogOut, ChevronLeft, ChevronRight,
  SlidersHorizontal, Wallet
} from "lucide-react";
import { useAuth } from "@/lib/AuthContext";

const userNav = [
  { path: "/",              label: "Dashboard",     icon: LayoutDashboard },
  { path: "/portfolio",     label: "Portfolio",      icon: BarChart3 },
  { path: "/trade",         label: "Trade",          icon: ArrowLeftRight },
  { path: "/copy-trading",  label: "Copy Trading",   icon: Users },
  { path: "/transactions",  label: "Transactions",   icon: History },
  { path: "/settings",      label: "Settings",       icon: Settings },
];

const adminNav = [
  { path: "/admin",              label: "Overview",          icon: Shield },
  { path: "/admin/users",        label: "Users",             icon: Users },
  { path: "/admin/cryptos",      label: "Cryptos",           icon: Coins },
  { path: "/admin/traders",      label: "Copy Traders",      icon: TrendingUp },
  { path: "/admin/transactions", label: "Transactions",      icon: History },
  { path: "/admin/settings",     label: "Platform Settings", icon: SlidersHorizontal },
];

export default function Sidebar({ user, isAdmin }) {
  const location = useLocation();
  const { logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const links = isAdmin ? adminNav : userNav;

  const NavLinks = ({ onClose }) => (
    <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
      {links.map((link) => {
        const active = location.pathname === link.path ||
          (link.path !== "/" && location.pathname.startsWith(link.path));
        const Icon = link.icon;
        return (
          <Link
            key={link.path}
            to={link.path}
            onClick={onClose}
            className={`relative flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium transition-all duration-150 group ${
              active
                ? "bg-primary/12 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-white/5"
            }`}
          >
            {active && (
              <motion.div
                layoutId="activeNav"
                className="absolute inset-0 bg-primary/10 rounded-2xl border border-primary/20"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <Icon className={`relative w-[17px] h-[17px] flex-shrink-0 transition-colors ${active ? "text-primary" : "group-hover:text-foreground"}`} />
            {!collapsed && (
              <span className="relative truncate text-[13px]">{link.label}</span>
            )}
            {active && !collapsed && (
              <span className="relative ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
            )}
          </Link>
        );
      })}
    </nav>
  );

  const SidebarContent = ({ onClose = () => {} }) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 ${collapsed ? "justify-center" : ""}`}>
        <div className="w-8 h-8 rounded-xl gradient-green flex items-center justify-center flex-shrink-0 glow-green-sm">
          <TrendingUp className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <div>
            <span className="text-base font-black tracking-tight">Brokerr</span>
            <span className="block text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">Pro Platform</span>
          </div>
        )}
      </div>

      {/* Role badge */}
      {!collapsed && (
        <div className="px-3 mb-2">
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl ${isAdmin ? "bg-yellow-400/8 border border-yellow-400/15" : "bg-primary/8 border border-primary/15"}`}>
            <div className={`w-1.5 h-1.5 rounded-full relative ${isAdmin ? "bg-yellow-400" : "bg-primary"}`}>
              <span className={`absolute inset-0 rounded-full animate-ping opacity-60 ${isAdmin ? "bg-yellow-400" : "bg-primary"}`} />
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-widest ${isAdmin ? "text-yellow-400" : "text-primary"}`}>
              {isAdmin ? "Admin" : "Trader"}
            </span>
            {user?.full_name && (
              <span className="ml-auto text-[10px] text-muted-foreground truncate max-w-[80px]">{user.full_name.split(" ")[0]}</span>
            )}
          </div>
        </div>
      )}

      <NavLinks onClose={onClose} />

      {/* Bottom actions */}
      <div className="px-2 py-3 border-t border-border/50 space-y-0.5">
        {isAdmin && (
          <Link to="/" onClick={onClose}
            className="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all">
            <Wallet className="w-[17px] h-[17px] flex-shrink-0" />
            {!collapsed && <span className="text-[13px]">User View</span>}
          </Link>
        )}
        <button
          onClick={() => logout()}
          className="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/8 transition-all w-full"
        >
          <LogOut className="w-[17px] h-[17px] flex-shrink-0" />
          {!collapsed && <span className="text-[13px]">Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar only */}
      <aside className={`hidden lg:flex flex-col bg-[hsl(222,28%,4%)] border-r border-border/60 transition-all duration-300 h-screen sticky top-0 flex-shrink-0 ${collapsed ? "w-[64px]" : "w-[230px]"}`}>
        <SidebarContent />
        <div className="px-2 pb-3">
          <button onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center py-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all">
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </aside>
    </>
  );
}
