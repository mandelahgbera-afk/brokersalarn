import React from "react";
import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TopBar({ user, title }) {
  const initials = user?.full_name
    ? user.full_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() || "U";

  return (
    <div className="flex items-center justify-between mb-6 lg:mb-8">
      <div>
        <h1 className="text-xl lg:text-2xl font-bold text-foreground">{title}</h1>
        {user && (
          <p className="text-sm text-muted-foreground mt-0.5">
            Welcome back, {user.full_name?.split(" ")[0] || "Trader"}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="w-9 h-9 rounded-xl text-muted-foreground hover:text-foreground relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-primary rounded-full" />
        </Button>
        <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
          {initials}
        </div>
      </div>
    </div>
  );
}