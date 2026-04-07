import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Bell, Shield, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import PageHeader from "@/components/ui/PageHeader";
import { toast } from "sonner";

export default function Settings() {
  const { user } = useOutletContext();
  const { refreshProfile } = useAuth();
  const [form, setForm] = useState({ full_name: "", email: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) setForm({ full_name: user.full_name || "", email: user.email || "" });
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    const users = await base44.entities.User.filter({ email: user.email });
    if (users[0]) {
      await base44.entities.User.update(users[0].id, { full_name: form.full_name });
    }
    // Refresh in-memory profile so sidebar/header update immediately
    await refreshProfile();
    toast.success("Profile updated!");
    setSaving(false);
  };

  const sections = [
    { icon: User, label: "Account", color: "text-primary bg-primary/15" },
    { icon: Bell, label: "Notifications", color: "text-blue-400 bg-blue-400/15" },
    { icon: Shield, label: "Security", color: "text-purple-400 bg-purple-400/15" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader user={user} title="Settings" subtitle="Manage your account" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Nav */}
        <div className="bg-card border border-border rounded-2xl p-3">
          {sections.map(s => (
            <button key={s.label} className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-secondary transition-colors group">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${s.color}`}>
                <s.icon className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium">{s.label}</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto" />
            </button>
          ))}
        </div>

        {/* Profile form */}
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-5">
          <p className="text-sm font-semibold mb-5">Profile Information</p>

          {/* Avatar */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center text-2xl font-bold text-primary">
              {user?.full_name?.slice(0,2).toUpperCase() || user?.email?.[0]?.toUpperCase() || "U"}
            </div>
            <div>
              <p className="font-semibold">{user?.full_name || "No name set"}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <span className={`text-xs font-semibold mt-1 inline-block px-2 py-0.5 rounded-md ${user?.role === "admin" ? "bg-yellow-500/15 text-yellow-400" : "bg-primary/15 text-primary"}`}>
                {user?.role || "user"}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Full Name</label>
              <Input
                value={form.full_name}
                onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))}
                className="bg-secondary border-border"
                placeholder="Your full name"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Email Address</label>
              <Input
                value={form.email}
                disabled
                className="bg-secondary border-border opacity-60 cursor-not-allowed"
              />
              <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
            </div>

            <div className="pt-2">
              <Button onClick={handleSave} disabled={saving}
                className="gradient-green text-white font-semibold glow-green-sm">
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
