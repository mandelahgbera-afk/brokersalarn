import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { motion } from "framer-motion";
import { Users, TrendingUp, TrendingDown, Star, Shield, Zap, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/ui/PageHeader";
import { toast } from "sonner";

const RISK_COLORS = { low: "text-up bg-up", medium: "text-yellow-400 bg-yellow-400/10", high: "text-down bg-down" };
const RISK_ICONS = { low: Shield, medium: Zap, high: TrendingUp };

function TraderCard({ trader, activeCopy, onCopy, onStop }) {
  const isFollowing = activeCopy?.trader_id === trader.id;
  const RiskIcon = RISK_ICONS[trader.risk_level] || Shield;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-2xl p-5 hover:border-primary/25 transition-colors"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-bold text-base"
            style={{ background: trader.avatar_color || "#6366f1" }}>
            {trader.trader_name?.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="font-bold text-sm">{trader.trader_name}</p>
            <p className="text-xs text-muted-foreground">{trader.specialty || "Multi-Strategy"}</p>
          </div>
        </div>
        <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg ${RISK_COLORS[trader.risk_level] || RISK_COLORS.medium}`}>
          <RiskIcon className="w-3 h-3" />
          {trader.risk_level}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: "Total Profit", value: `+${trader.total_profit_pct?.toFixed(1)}%`, up: true },
          { label: "Win Rate", value: `${trader.win_rate?.toFixed(1)}%` },
          { label: "Traders", value: trader.total_trades },
        ].map(s => (
          <div key={s.label} className="bg-secondary rounded-xl px-3 py-2 text-center">
            <p className={`text-sm font-bold font-mono ${s.up ? "text-up" : ""}`}>{s.value}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
        <span>{trader.followers} followers</span>
        <span className="text-foreground font-semibold">{trader.profit_split_pct}% profit split</span>
        <span>Min ${trader.min_allocation}</span>
      </div>

      {isFollowing ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-primary/10 border border-primary/25">
            <span className="text-xs font-semibold text-primary">✓ Following • ${activeCopy.allocation}</span>
            <span className={`text-xs font-mono font-bold ${activeCopy.profit_loss >= 0 ? "text-up" : "text-down"}`}>
              {activeCopy.profit_loss >= 0 ? "+" : ""}${activeCopy.profit_loss?.toFixed(2)}
            </span>
          </div>
          <Button variant="outline" size="sm" className="w-full border-destructive/40 text-destructive hover:bg-destructive/10 text-xs"
            onClick={() => onStop(activeCopy)}>
            <X className="w-3 h-3 mr-1" /> Stop Copying
          </Button>
        </div>
      ) : (
        <Button onClick={() => onCopy(trader)}
          className="w-full h-9 text-sm font-semibold gradient-green text-white glow-green-sm">
          Copy Trader
        </Button>
      )}
    </motion.div>
  );
}

export default function CopyTrading() {
  const { user } = useOutletContext();
  const [traders, setTraders] = useState([]);
  const [myCopies, setMyCopies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copyModal, setCopyModal] = useState(null);
  const [alloc, setAlloc] = useState("");

  useEffect(() => {
    if (!user?.email) return;
    Promise.all([
      base44.entities.CopyTrader.filter({ is_approved: true }),
      base44.entities.CopyTrade.filter({ user_email: user.email, is_active: true }),
    ]).then(([t, c]) => {
      setTraders(t);
      setMyCopies(c);
      setLoading(false);
    });
  }, [user]);

  const handleCopy = async () => {
    if (!alloc || parseFloat(alloc) < (copyModal?.min_allocation || 100)) {
      toast.error(`Minimum allocation is $${copyModal?.min_allocation || 100}`);
      return;
    }
    await base44.entities.CopyTrade.create({
      user_email: user.email,
      trader_id: copyModal.id,
      trader_name: copyModal.trader_name,
      allocation: parseFloat(alloc),
      profit_loss: 0,
      profit_loss_pct: 0,
      is_active: true,
    });
    const updated = await base44.entities.CopyTrade.filter({ user_email: user.email, is_active: true });
    setMyCopies(updated);
    toast.success(`Now copying ${copyModal.trader_name}!`);
    setCopyModal(null);
    setAlloc("");
  };

  const handleStop = async (copy) => {
    await base44.entities.CopyTrade.update(copy.id, { is_active: false });
    setMyCopies(prev => prev.filter(c => c.id !== copy.id));
    toast.success("Stopped copying trader");
  };

  const totalCopyPnl = myCopies.reduce((s, c) => s + (c.profit_loss || 0), 0);
  const totalAllocated = myCopies.reduce((s, c) => s + (c.allocation || 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader user={user} title="Copy Trading" subtitle="Mirror top traders automatically" />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Allocated", value: `$${totalAllocated.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
          { label: "Copy P&L", value: `${totalCopyPnl >= 0 ? "+" : ""}$${Math.abs(totalCopyPnl).toFixed(2)}`, up: totalCopyPnl >= 0 },
          { label: "Active Copies", value: myCopies.length },
        ].map((s, i) => (
          <div key={s.label} className="bg-card border border-border rounded-2xl p-4 text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5">{s.label}</p>
            <p className={`text-xl font-bold font-mono ${s.up === true ? "text-up" : s.up === false ? "text-down" : ""}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Traders grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1,2,3].map(i => <div key={i} className="h-64 bg-card border border-border rounded-2xl animate-pulse" />)}
        </div>
      ) : traders.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center">
          <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-foreground font-semibold">No approved traders yet</p>
          <p className="text-sm text-muted-foreground mt-1">Check back soon</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {traders.map(t => (
            <TraderCard
              key={t.id}
              trader={t}
              activeCopy={myCopies.find(c => c.trader_id === t.id)}
              onCopy={setCopyModal}
              onStop={handleStop}
            />
          ))}
        </div>
      )}

      {/* Copy modal */}
      {copyModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm"
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-lg">Copy {copyModal.trader_name}</h3>
              <button onClick={() => setCopyModal(null)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="px-4 py-3 rounded-xl bg-secondary text-sm space-y-1">
                <div className="flex justify-between"><span className="text-muted-foreground">Profit Split</span><span className="font-semibold">{copyModal.profit_split_pct}% to trader</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Min Allocation</span><span className="font-semibold">${copyModal.min_allocation}</span></div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Allocation (USD)</label>
                <Input
                  type="number"
                  placeholder={`Min $${copyModal.min_allocation}`}
                  value={alloc}
                  onChange={e => setAlloc(e.target.value)}
                  className="bg-secondary border-border font-mono"
                />
              </div>
              <Button onClick={handleCopy} className="w-full gradient-green text-white font-bold h-11">
                Start Copying
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}