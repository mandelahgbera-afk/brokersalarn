import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { motion } from "framer-motion";
import { Users, Search, Shield, ShieldOff, Ban, CheckCircle, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/ui/PageHeader";
import { toast } from "sonner";

const ROLE_COLORS = {
  admin: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  user: "text-primary bg-primary/10 border-primary/20",
};

const STATUS_COLORS = {
  active: "text-up bg-up",
  suspended: "text-down bg-down",
};

export default function ManageUsers() {
  const { user } = useOutletContext();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = async () => {
    const data = await base44.entities.User.list("-created_at", 500);
    setUsers(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = users.filter(u =>
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggleRole = async (u) => {
    const newRole = u.role === "admin" ? "user" : "admin";
    await base44.entities.User.update(u.id, { role: newRole });
    toast.success(`${u.email} is now ${newRole}`);
    load();
  };

  const handleToggleStatus = async (u) => {
    const newStatus = u.status === "suspended" ? "active" : "suspended";
    await base44.entities.User.update(u.id, { status: newStatus });
    toast.success(`${u.email} ${newStatus === "suspended" ? "suspended" : "reactivated"}`);
    load();
  };

  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === "admin").length,
    active: users.filter(u => u.status !== "suspended").length,
    suspended: users.filter(u => u.status === "suspended").length,
  };

  return (
    <div className="space-y-6">
      <PageHeader user={user} title="Manage Users" subtitle={`${stats.total} registered users`} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Users", value: stats.total, color: "text-blue-400 bg-blue-400/12" },
          { label: "Admins", value: stats.admins, color: "text-yellow-400 bg-yellow-400/12" },
          { label: "Active", value: stats.active, color: "text-up bg-up" },
          { label: "Suspended", value: stats.suspended, color: "text-down bg-down" },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-2xl p-4">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-2">{s.label}</p>
            <p className="text-2xl font-black font-mono">{loading ? "—" : s.value}</p>
          </div>
        ))}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="pl-10 bg-secondary border-border"
        />
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="grid grid-cols-5 lg:grid-cols-6 gap-4 px-5 py-3 border-b border-border text-xs text-muted-foreground font-medium uppercase tracking-wider">
          <span className="col-span-2">User</span>
          <span className="text-center">Role</span>
          <span className="hidden lg:block text-center">Joined</span>
          <span className="text-center">Status</span>
          <span className="text-right">Actions</span>
        </div>
        {loading ? (
          <div className="space-y-px">{[1,2,3,4].map(i => <div key={i} className="h-16 bg-secondary/30 animate-pulse" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-sm text-muted-foreground">No users found</div>
        ) : (
          <div className="divide-y divide-border/50">
            {filtered.map((u, i) => (
              <motion.div key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                className="grid grid-cols-5 lg:grid-cols-6 gap-4 px-5 py-4 hover:bg-secondary/30 transition-colors items-center">
                <div className="col-span-2 flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center text-sm font-bold text-primary flex-shrink-0">
                    {u.full_name?.slice(0,2).toUpperCase() || u.email?.[0]?.toUpperCase() || "U"}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">{u.full_name || "No name"}</p>
                    <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                  </div>
                </div>
                <div className="flex justify-center">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-lg capitalize border ${ROLE_COLORS[u.role] || ROLE_COLORS.user}`}>
                    {u.role || "user"}
                  </span>
                </div>
                <div className="hidden lg:block text-center text-xs text-muted-foreground">
                  {u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}
                </div>
                <div className="flex justify-center">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-lg capitalize ${STATUS_COLORS[u.status] || STATUS_COLORS.active}`}>
                    {u.status || "active"}
                  </span>
                </div>
                <div className="flex gap-1.5 justify-end">
                  <Button size="sm" variant="outline" onClick={() => handleToggleRole(u)}
                    title={u.role === "admin" ? "Remove admin" : "Make admin"}
                    className="h-7 w-7 p-0 border-border text-muted-foreground hover:text-foreground">
                    {u.role === "admin" ? <ShieldOff className="w-3.5 h-3.5" /> : <Shield className="w-3.5 h-3.5" />}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleToggleStatus(u)}
                    title={u.status === "suspended" ? "Reactivate" : "Suspend"}
                    className={`h-7 w-7 p-0 ${u.status === "suspended" ? "border-primary/40 text-primary hover:bg-primary/10" : "border-destructive/40 text-destructive hover:bg-destructive/10"}`}>
                    {u.status === "suspended" ? <CheckCircle className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
