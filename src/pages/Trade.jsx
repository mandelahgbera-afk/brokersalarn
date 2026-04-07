import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from "recharts";
import { ArrowUpDown, TrendingUp, TrendingDown, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/ui/PageHeader";
import { CoinIcon, getCoinColor } from "@/components/ui/CryptoRow";
import { toast } from "sonner";

const MOCK_CHART = [
  { t: "00:00", v: 42100 }, { t: "04:00", v: 43200 }, { t: "08:00", v: 41800 },
  { t: "12:00", v: 44500 }, { t: "16:00", v: 43900 }, { t: "20:00", v: 45200 },
  { t: "24:00", v: 44800 },
];

export default function Trade() {
  const { user } = useOutletContext();
  const [cryptos, setCryptos] = useState([]);
  const [selected, setSelected] = useState(null);
  const [side, setSide] = useState("buy");
  const [amount, setAmount] = useState("");
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!user?.email) return;
    Promise.all([
      base44.entities.Cryptocurrency.list(),
      base44.entities.UserBalance.filter({ user_email: user.email }),
    ]).then(([cry, bal]) => {
      const active = cry.filter(c => c.is_active);
      setCryptos(active);
      if (active.length > 0) setSelected(active[0]);
      setBalance(bal[0] || { balance_usd: 0 });
      setLoading(false);
    });
  }, [user]);

  const filtered = cryptos.filter(c =>
    c.symbol.toLowerCase().includes(search.toLowerCase()) ||
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const usdValue = selected && amount ? (parseFloat(amount) * selected.price).toFixed(2) : "0.00";
  const cryptoValue = selected && amount ? (parseFloat(amount) / selected.price).toFixed(6) : "0.000000";

  const handleTrade = async () => {
    if (!selected || !amount || parseFloat(amount) <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    const usdAmt = side === "buy" ? parseFloat(amount) : parseFloat(amount) * selected.price;
    if (side === "buy" && usdAmt > (balance?.balance_usd || 0)) {
      toast.error("Insufficient balance");
      return;
    }
    setSubmitting(true);
    await base44.entities.Transaction.create({
      user_email: user.email,
      type: side,
      amount: usdAmt,
      crypto_symbol: selected.symbol,
      crypto_amount: side === "buy" ? parseFloat(cryptoValue) : parseFloat(amount),
      status: "pending",
    });
    toast.success(`${side === "buy" ? "Buy" : "Sell"} order placed! Awaiting admin approval.`);
    setAmount("");
    setSubmitting(false);
  };

  const pcts = [25, 50, 75, 100];

  return (
    <div className="space-y-6">
      <PageHeader user={user} title="Trade" subtitle="Buy & sell cryptocurrencies" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coin list */}
        <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
          <p className="text-sm font-semibold">Markets</p>
          <Input
            placeholder="Search..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-secondary border-border text-sm h-9"
          />
          <div className="space-y-0.5 max-h-[480px] overflow-y-auto">
            {loading ? (
              [1,2,3,4,5].map(i => <div key={i} className="h-12 bg-secondary rounded-xl animate-pulse" />)
            ) : (
              filtered.map(c => (
                <button key={c.id} onClick={() => setSelected(c)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-left ${selected?.id === c.id ? "bg-primary/10 border border-primary/25" : "hover:bg-secondary"}`}>
                  <CoinIcon symbol={c.symbol} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">{c.symbol}</p>
                    <p className="text-xs text-muted-foreground truncate">{c.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-mono font-semibold">${c.price?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                    <p className={`text-xs font-semibold ${c.change_24h >= 0 ? "text-up" : "text-down"}`}>
                      {c.change_24h >= 0 ? "+" : ""}{c.change_24h?.toFixed(2)}%
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chart + Trade form */}
        <div className="lg:col-span-2 space-y-5">
          {/* Selected coin info */}
          {selected && (
            <motion.div
              key={selected.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-card border border-border rounded-2xl p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <CoinIcon symbol={selected.symbol} size={10} />
                  <div>
                    <p className="font-bold text-lg">{selected.name}</p>
                    <p className="text-xs text-muted-foreground">{selected.symbol}/USD</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold font-mono">${selected.price?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                  <p className={`text-sm font-semibold ${selected.change_24h >= 0 ? "text-up" : "text-down"}`}>
                    {selected.change_24h >= 0 ? "+" : ""}{selected.change_24h?.toFixed(2)}% 24h
                  </p>
                </div>
              </div>
              <div className="h-36">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={MOCK_CHART} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                    <defs>
                      <linearGradient id="tradeGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={selected.change_24h >= 0 ? "hsl(158,82%,42%)" : "hsl(0,70%,54%)"} stopOpacity={0.2} />
                        <stop offset="95%" stopColor={selected.change_24h >= 0 ? "hsl(158,82%,42%)" : "hsl(0,70%,54%)"} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="t" tick={{ fill: "hsl(215,14%,48%)", fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      content={({ active, payload }) =>
                        active && payload?.length ? (
                          <div className="bg-card border border-border rounded-lg px-2.5 py-1.5 text-xs">
                            <p className="font-mono font-bold text-primary">${payload[0].value?.toLocaleString()}</p>
                          </div>
                        ) : null
                      }
                    />
                    <Area type="monotone" dataKey="v"
                      stroke={selected.change_24h >= 0 ? "hsl(158,82%,42%)" : "hsl(0,70%,54%)"}
                      strokeWidth={2} fill="url(#tradeGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          )}

          {/* Trade panel */}
          <div className="bg-card border border-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm font-semibold">Quick Trade</p>
              <div className="flex rounded-xl overflow-hidden border border-border">
                <button onClick={() => setSide("buy")}
                  className={`px-5 py-2 text-sm font-semibold transition-colors ${side === "buy" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                  Buy
                </button>
                <button onClick={() => setSide("sell")}
                  className={`px-5 py-2 text-sm font-semibold transition-colors ${side === "sell" ? "bg-destructive text-destructive-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                  Sell
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {/* Amount input */}
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">
                  {side === "buy" ? "You pay (USD)" : `You sell (${selected?.symbol || ""})`}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-mono">
                    {side === "buy" ? "$" : selected?.symbol}
                  </span>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    className="bg-secondary border-border pl-10 font-mono text-base h-12"
                  />
                </div>
                {/* Quick % buttons */}
                {side === "buy" && balance && (
                  <div className="flex gap-2 mt-2">
                    {pcts.map(p => (
                      <button key={p} onClick={() => setAmount(((balance.balance_usd * p) / 100).toFixed(2))}
                        className="flex-1 py-1.5 rounded-lg bg-secondary text-xs font-semibold text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors">
                        {p}%
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Conversion display */}
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-secondary">
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground mb-0.5">You {side === "buy" ? "receive" : "get"}</p>
                  <p className="font-mono font-bold">
                    {side === "buy" ? `${cryptoValue} ${selected?.symbol || ""}` : `$${usdValue}`}
                  </p>
                </div>
                <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
                <div className="text-right">
                  <p className="text-xs text-muted-foreground mb-0.5">Balance</p>
                  <p className="font-mono text-sm font-semibold">${(balance?.balance_usd || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
              </div>

              <Button
                onClick={handleTrade}
                disabled={submitting || !selected || !amount}
                className={`w-full h-12 text-sm font-bold rounded-xl ${side === "buy" ? "gradient-green text-white glow-green-sm" : "bg-destructive hover:bg-destructive/90 text-destructive-foreground"}`}
              >
                {submitting ? "Placing order..." : `${side === "buy" ? "Buy" : "Sell"} ${selected?.symbol || ""}`}
              </Button>
              <p className="text-xs text-center text-muted-foreground">Orders require admin approval before execution</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}