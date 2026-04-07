import React from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard, BarChart3, ArrowLeftRight,
  Users, Settings
} from "lucide-react";

const userNavItems = [
  { path: "/", label: "Home", icon: LayoutDashboard },
  { path: "/portfolio", label: "Portfolio", icon: BarChart3 },
  { path: "/trade", label: "Trade", icon: ArrowLeftRight },
  { path: "/copy-trading", label: "Copy", icon: Users },
  { path: "/settings", label: "More", icon: Settings },
];

const adminNavItems = [
  { path: "/admin", label: "Admin", icon: LayoutDashboard },
  { path: "/admin/users", label: "Users", icon: Users },
  { path: "/admin/cryptos", label: "Cryptos", icon: BarChart3 },
  { path: "/admin/traders", label: "Traders", icon: ArrowLeftRight },
  { path: "/admin/settings", label: "Settings", icon: Settings },
];

export default function MobileBottomNav({ isAdmin }) {
  const location = useLocation();
  const navItems = isAdmin ? adminNavItems : userNavItems;

  return (
    <div className="fixed bottom-0 left-0 right-0 lg:hidden z-40 bg-background border-t border-border/50 backdrop-blur-xl">
      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* Navigation */}
      <nav className="flex items-center justify-around h-[68px] px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path ||
            (item.path !== "/" && location.pathname.startsWith(item.path));
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className="relative flex flex-col items-center justify-center w-full h-full group"
            >
              {/* Active background indicator */}
              {isActive && (
                <motion.div
                  layoutId="mobileActiveNav"
                  className="absolute inset-x-2 bottom-1 h-1 bg-primary rounded-t-full"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}

              {/* Icon */}
              <motion.div
                animate={{
                  scale: isActive ? 1.15 : 1,
                  color: isActive ? "var(--primary)" : "var(--muted-foreground)",
                }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-center mb-1"
              >
                <Icon className={`w-5 h-5 flex-shrink-0 transition-colors ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground group-hover:text-foreground"
                }`} />
              </motion.div>

              {/* Label */}
              <motion.span
                animate={{
                  opacity: isActive ? 1 : 0.7,
                  fontSize: isActive ? "0.625rem" : "0.625rem",
                }}
                transition={{ duration: 0.2 }}
                className={`text-[10px] font-semibold whitespace-nowrap transition-colors ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground group-hover:text-foreground"
                }`}
              >
                {item.label}
              </motion.span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
