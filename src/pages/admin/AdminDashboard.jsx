import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area, LineChart, Line, PieChart, Pie, Cell
} from "recharts";
import { Users, DollarSign, TrendingUp, Clock, CheckCircle, XCircle, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/ui/PageHeader";
import { toast } from "sonner";

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-dark rounded-xl px-3 py-2 text-xs border border-white/10">
      {label && <p className="text-muted-foreground mb-1">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} className="font-mono font-bold" style={{ color: p.color }}>
          {p.name}: ${p.value?.toLocaleString()}
        </p>
      ))}
    </div>
  );
}

export default function AdminDashboard() {
  const { user } = useOutletContext();
  const [stats, setStats] = useState({ users: 0, pending: 0, totalDeposits: 0, totalWithdrawals: 0, totalRevenue: 0 });
  const [pending, setPending] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [volumeData, setVolumeData] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const [users, txns] = await Promise.all([
      base44.entities.User.list(),
      base44.entities.Transaction.list("-created_at", 200),
    ]);

    const pendingTxns = txns.filter(t => t.status === "pending");
    const approvedDeposits = txns.filter(t => t.type === "deposit" && (t.status === "approved" || t.status === "completed"));
    const approvedWithdrawals = txns.filter(t => t.type === "withdrawal" && (t.status === "approved" || t.status === "completed"));
    const totalDeposits = approvedDeposits.reduce((s, t) => s + t.amount, 0);
    const totalWithdrawals = approvedWithdrawals.reduce((s, t) => s + t.amount, 0);

    // Build monthly chart from real data
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const monthlyMap = {};
    months.forEach(m => { monthlyMap[m] = { deposits: 0, withdrawals: 0, trades: 0 }; });
    txns.forEach(t => {
      const m = months[new Date(t.created_at).getMonth()];
      if (!monthlyMap[m]) return;
      if (t.type === "deposit") monthlyMap[m].deposits += t.amount;
      if (t.type === "withdrawal") monthlyMap[m].withdrawals += t.amount;
      if (t.type === "buy" || t.type === "sell") monthlyMap[m].trades += t.amount;
    });
    const built = months.slice(0, 6).map(m => ({ month: m, ...monthlyMap[m] }));

    // Volume by type pie
    const typeVol = {};
    txns.forEach(t => { typeVol[t.type] = (typeVol[t.type] || 0) + t.amount; });
    const vol = Object.entries(typeVol).map(([name, value]) => ({ name, value: Math.round(value) }));

    setStats({ users: users.length, pending: pendingTxns.length, totalDeposits, totalWithdrawals, totalRevenue: totalDeposits * 0.01 });
    setPending(pendingTxns.slice(0, 8));
    setChartData(built);
    setVolumeData(vol);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleApprove = async (tx) => {
    await base44.entities.Transaction.update(tx.id, { status: "approved" });
    toast.success("Transaction approved");
    load();
  };

  const handleReject = async (tx) => {
    await base44.entities.Transaction.update(tx.id, { status: "rejected" });
    toast.error("Transaction rejected");
    load();
  };

  const STATS = [
    { label: "Total Users",       value: stats.users,                                                                                        icon: Users,       color: "text-blue-400 bg-blue-400/12",   border: "border-blue-400/15" },
    { label: "Pending Actions",   value: stats.pending,                                                                                      icon: Clock,       color: "text-yellow-400 bg-yellow-400/12", border: "border-yellow-400/15" },
    { label: "Total Deposits",    value: `$${stats.totalDeposits.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,                  icon: DollarSign,  color: "text-up bg-up",                  border: "border-primary/15" },
    { label: "Total Withdrawals", value: `$${stats.totalWithdrawals.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,               icon: TrendingUp,  color: "text-down bg-down",              border: "border-destructive/15" },
  ];

  const PIE_COLORS = { deposit: "#10b981", withdrawal: "#ef4444", buy: "#3b82f6", sell: "#a855f7", copy_profit: "#f59e0b" };
  const hasDepositsAboveWithdrawals = stats.totalDeposits >= stats.totalWithdrawals;

  return (
    <div className="space-y-5">
      <PageHeader user={user} title="Admin Overview" subtitle="Platform intelligence dashboard" />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className={`bg-card border ${s.border} rounded-3xl p-5 relative overflow-hidden group hover:border-opacity-50 transition-all`}>
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-3xl ${s.color.split(" ")[1]}/5`} />
            <div className="flex items-start justify-between mb-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">{s.label}</p>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${s.color}`}>
                <s.icon className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black font-mono tabular-nums">{loading ? "—" : s.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Deposits vs Withdrawals — color reacts to which is larger */}
        <div className="lg:col-span-2 bg-card border border-border rounded-3xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-bold">Deposits vs Withdrawals</p>
              <p className="text-xs text-muted-foreground mt-0.5">Monthly volume breakdown</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />Deposits</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-400 inline-block" />Withdrawals</span>
            </div>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barGap={3} barCategoryGap="28%">
                <XAxis dataKey="month" tick={{ fill: "hsl(215,14%,46%)", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                <Bar dataKey="deposits"    fill={hasDepositsAboveWithdrawals ? "hsl(160,84%,42%)" : "hsl(160,60%,32%)"} radius={[5,5,0,0]} name="Deposits" />
                <Bar dataKey="withdrawals" fill={!hasDepositsAboveWithdrawals ? "hsl(0,72%,54%)" : "hsl(0,50%,40%)"} radius={[5,5,0,0]} name="Withdrawals" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Volume by type */}
        <div className="bg-card border border-border rounded-3xl p-5">
          <p className="text-sm font-bold mb-4">Volume by Type</p>
          {loading || volumeData.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-xs text-muted-foreground">No data yet</div>
          ) : (
            <>
              <div className="h-36">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={volumeData} cx="50%" cy="50%" innerRadius={38} outerRadius={60} dataKey="value" strokeWidth={0} paddingAngle={3}>
                      {volumeData.map((d, i) => <Cell key={i} fill={PIE_COLORS[d.name] || "#6366f1"} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-1.5 mt-2">
                {volumeData.map(d => (
                  <div key={d.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full" style={{ background: PIE_COLORS[d.name] || "#6366f1" }} />
                      <span className="text-muted-foreground capitalize">{d.name.replace("_"," ")}</span>
                    </div>
                    <span className="font-mono font-semibold">${d.value?.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Pending transactions */}
      <div className="bg-card border border-border rounded-3xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center gap-3">
          <Activity className="w-4 h-4 text-primary" />
          <p className="text-sm font-bold">Pending Approvals</p>
          {stats.pending > 0 && (
            <span className="ml-auto text-xs px-2.5 py-0.5 rounded-full bg-yellow-400/12 text-yellow-400 font-bold border border-yellow-400/20">
              {stats.pending} pending
            </span>
          )}
        </div>
        {loading ? (
          <div className="space-y-px">{[1,2,3].map(i => <div key={i} className="h-16 shimmer" />)}</div>
        ) : pending.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2">
            <CheckCircle className="w-8 h-8 text-primary/30" />
            <p className="text-sm text-muted-foreground">All caught up — no pending transactions</p>
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {pending.map(tx => (
              <div key={tx.id} className="flex items-center gap-4 px-5 py-4 hover:bg-secondary/30 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${tx.type === "deposit" ? "bg-emerald-400" : tx.type === "withdrawal" ? "bg-rose-400" : "bg-blue-400"}`} />
                    <p className="text-sm font-semibold capitalize">{tx.type.replace("_"," ")}</p>
                    <span className="text-xs text-muted-foreground font-mono">${tx.amount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                  <p className="text-xs text-muted-foreground pl-3.5">{tx.user_email} • {new Date(tx.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Button size="sm" onClick={() => handleApprove(tx)}
                    className="h-8 px-3 gradient-green text-white text-xs font-semibold glow-green-xs">
                    <CheckCircle className="w-3.5 h-3.5 mr-1" /> Approve
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleReject(tx)}
                    className="h-8 px-3 border-destructive/40 text-destructive hover:bg-destructive/10 text-xs font-semibold">
                    <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}