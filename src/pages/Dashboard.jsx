import React, { useState, useEffect } from "react";
import { useOutletContext, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";
import {
  Wallet, TrendingUp, TrendingDown, ArrowDownLeft,
  ArrowUpRight, ArrowLeftRight, Copy, Eye, EyeOff,
  Sparkles, ChevronRight
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/ui/PageHeader";
import { CoinIcon } from "@/components/ui/CryptoRow";

const CHART_DATA = [
  { t: "Jan", v: 8200 }, { t: "Feb", v: 11000 }, { t: "Mar", v: 9400 },
  { t: "Apr", v: 13200 }, { t: "May", v: 12100 }, { t: "Jun", v: 16800 },
  { t: "Jul", v: 15200 }, { t: "Aug", v: 18900 }, { t: "Sep", v: 17400 },
  { t: "Oct", v: 21200 }, { t: "Nov", v: 24500 }, { t: "Dec", v: 26400 },
];

const QUICK_ACTIONS = [
  { label: "Deposit", icon: ArrowDownLeft, path: "/transactions", gradient: "from-emerald-500/20 to-teal-500/10", border: "border-emerald-500/20", iconColor: "text-emerald-400" },
  { label: "Withdraw", icon: ArrowUpRight, path: "/transactions", gradient: "from-blue-500/20 to-cyan-500/10", border: "border-blue-500/20", iconColor: "text-blue-400" },
  { label: "Trade", icon: ArrowLeftRight, path: "/trade", gradient: "from-purple-500/20 to-pink-500/10", border: "border-purple-500/20", iconColor: "text-purple-400" },
  { label: "Copy", icon: Copy, path: "/copy-trading", gradient: "from-yellow-500/20 to-orange-500/10", border: "border-yellow-500/20", iconColor: "text-yellow-400" },
];

const PIE_COLORS = ["#10b981","#3b82f6","#a855f7","#f59e0b","#ef4444","#06b6d4"];

function StatPill({ label, value, up }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className={`text-sm font-bold font-mono tabular-nums ${up === true ? "text-up" : up === false ? "text-down" : "text-foreground"}`}>{value}</span>
    </div>
  );
}

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-dark rounded-xl px-3 py-2 text-xs border border-white/10">
      <p className="text-muted-foreground">{payload[0].payload.t}</p>
      <p className="font-mono font-bold text-primary">${payload[0].value?.toLocaleString()}</p>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useOutletContext();
  const [balance, setBalance] = useState(null);
  const [portfolio, setPortfolio] = useState([]);
  const [cryptos, setCryptos] = useState([]);
  const [txns, setTxns] = useState([]);
  const [hideBalance, setHideBalance] = useState(false);
  const [loading, setLoading] = useState(true);
  const [chartPeriod, setChartPeriod] = useState("1Y");

  useEffect(() => {
    if (!user?.email) return;
    Promise.all([
      base44.entities.UserBalance.filter({ user_email: user.email }),
      base44.entities.Portfolio.filter({ user_email: user.email }),
      base44.entities.Cryptocurrency.list(),
      base44.entities.Transaction.filter({ user_email: user.email }, "-created_at", 5),
    ]).then(([bal, port, cry, tx]) => {
      setBalance(bal[0] || { balance_usd: 0, total_invested: 0, total_profit_loss: 0 });
      setPortfolio(port);
      setCryptos(cry.filter(c => c.is_active));
      setTxns(tx);
      setLoading(false);
    });
  }, [user]);

  const totalBalance = balance?.balance_usd || 0;
  const pl = balance?.total_profit_loss || 0;
  const plPct = balance?.total_invested > 0 ? ((pl / balance.total_invested) * 100).toFixed(2) : "0.00";
  const isUp = pl >= 0;

  // Dynamic chart color based on P&L
  const chartColor = isUp ? "hsl(160,84%,42%)" : "hsl(0,72%,54%)";
  const chartGradientId = isUp ? "chartGreen" : "chartRed";

  const portfolioWithPrices = portfolio.map((p, i) => {
    const coin = cryptos.find(c => c.symbol === p.crypto_symbol);
    const currentValue = (coin?.price || 0) * p.amount;
    const costBasis = p.avg_buy_price * p.amount;
    const pnl = currentValue - costBasis;
    return { ...p, currentValue, pnl, price: coin?.price || 0, change: coin?.change_24h || 0, color: PIE_COLORS[i % PIE_COLORS.length] };
  });

  const totalPortfolioValue = portfolioWithPrices.reduce((s, p) => s + p.currentValue, 0);

  return (
    <div className="space-y-5">
      <PageHeader
        user={user}
        title="Dashboard"
        subtitle={`Welcome back, ${user?.full_name?.split(" ")[0] || "Trader"} 👋`}
      />

      {/* Hero Balance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl p-6 lg:p-8"
        style={{
          background: "linear-gradient(135deg, hsl(222,28%,8%) 0%, hsl(222,22%,11%) 50%, hsl(271,30%,13%) 100%)",
          borderWidth: 1,
          borderStyle: "solid",
          borderColor: "rgba(255,255,255,0.06)"
        }}
      >
        {/* Ambient orbs */}
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-primary/8 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-purple-500/6 blur-3xl pointer-events-none" />

        <div className="relative flex flex-col lg:flex-row lg:items-end gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-muted-foreground font-medium">Total Balance</span>
              <button onClick={() => setHideBalance(!hideBalance)}
                className="text-muted-foreground hover:text-foreground transition-colors">
                {hideBalance ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
            <AnimatePresence mode="wait">
              <motion.p
                key={hideBalance ? "hidden" : totalBalance}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="text-4xl lg:text-5xl font-black font-mono tabular-nums mb-3"
              >
                {hideBalance
                  ? "••••••"
                  : `$${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              </motion.p>
            </AnimatePresence>
            <div className={`inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-1 rounded-full ${isUp ? "bg-up text-up" : "bg-down text-down"}`}>
              {isUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              {isUp ? "+" : ""}${Math.abs(pl).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              <span className="opacity-70">({isUp ? "+" : ""}{plPct}%)</span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-3">
            {QUICK_ACTIONS.map(a => (
              <Link key={a.label} to={a.path}
                className={`flex flex-col items-center gap-1.5 group px-3 py-2.5 rounded-2xl bg-gradient-to-b ${a.gradient} border ${a.border} hover:scale-105 transition-all duration-200`}>
                <a.icon className={`w-5 h-5 ${a.iconColor}`} />
                <span className="text-[10px] font-semibold text-muted-foreground group-hover:text-foreground transition-colors">{a.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Portfolio Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="lg:col-span-2 bg-card border border-border rounded-3xl p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-bold">Portfolio Performance</p>
              <p className="text-xs text-muted-foreground mt-0.5">12-month overview</p>
            </div>
            <div className="flex items-center gap-1">
              {["1W","1M","3M","1Y"].map(p => (
                <button key={p} onClick={() => setChartPeriod(p)}
                  className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition-colors ${chartPeriod === p ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground"}`}>
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={CHART_DATA} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id={chartGradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={chartColor} stopOpacity={0.28} />
                    <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="t" tick={{ fill: "hsl(215,14%,46%)", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotoneX" dataKey="v" stroke={chartColor} strokeWidth={2.5}
                  fill={`url(#${chartGradientId})`} dot={false} activeDot={{ r: 4, strokeWidth: 0, fill: chartColor }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Allocation Donut */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="bg-card border border-border rounded-3xl p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-bold">Allocation</p>
            <Link to="/portfolio" className="text-xs text-primary hover:underline flex items-center gap-0.5">
              All <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          {loading || portfolioWithPrices.length === 0 ? (
            <div className="h-40 flex flex-col items-center justify-center gap-3">
              <Wallet className="w-8 h-8 text-muted-foreground/30" />
              <p className="text-xs text-muted-foreground">No holdings yet</p>
              <Link to="/trade" className="text-xs text-primary hover:underline">Start trading →</Link>
            </div>
          ) : (
            <>
              <div className="relative h-36">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={portfolioWithPrices.map(p => ({ name: p.crypto_symbol, value: p.currentValue }))}
                      cx="50%" cy="50%" innerRadius={44} outerRadius={68} dataKey="value" strokeWidth={0} paddingAngle={2}>
                      {portfolioWithPrices.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                    <p className="text-[10px] text-muted-foreground">Total</p>
                    <p className="text-sm font-bold font-mono">${totalPortfolioValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-1.5 mt-2">
                {portfolioWithPrices.slice(0, 4).map(p => (
                  <div key={p.id} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.color }} />
                      <span className="text-muted-foreground">{p.crypto_symbol}</span>
                    </div>
                    <span className="font-mono font-semibold">
                      {totalPortfolioValue > 0 ? ((p.currentValue / totalPortfolioValue) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </motion.div>
      </div>

      {/* Market + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Market */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16 }}
          className="bg-card border border-border rounded-3xl p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-bold">Market</p>
            <Link to="/trade" className="text-xs text-primary hover:underline flex items-center gap-0.5">
              Trade <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-0.5">
            {loading
              ? [1,2,3,4,5].map(i => <div key={i} className="h-12 shimmer rounded-xl" />)
              : cryptos.slice(0, 6).map(c => (
                <Link to="/trade" key={c.id} className="flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-secondary transition-colors group">
                  <CoinIcon symbol={c.symbol} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">{c.symbol}</p>
                    <p className="text-[10px] text-muted-foreground">{c.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono font-semibold tabular-nums">
                      ${c.price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                    </p>
                    <p className={`text-[10px] font-semibold ${c.change_24h >= 0 ? "text-up" : "text-down"}`}>
                      {c.change_24h >= 0 ? "+" : ""}{c.change_24h?.toFixed(2)}%
                    </p>
                  </div>
                </Link>
              ))}
          </div>
        </motion.div>

        {/* Recent Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border border-border rounded-3xl p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-bold">Recent Activity</p>
            <Link to="/transactions" className="text-xs text-primary hover:underline flex items-center gap-0.5">
              All <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          {loading
            ? [1,2,3].map(i => <div key={i} className="h-14 shimmer rounded-xl mb-2" />)
            : txns.length === 0
            ? (
              <div className="flex flex-col items-center justify-center h-40 gap-3">
                <Sparkles className="w-8 h-8 text-muted-foreground/30" />
                <p className="text-xs text-muted-foreground">No transactions yet</p>
              </div>
            )
            : (
              <div className="space-y-1">
                {txns.map(tx => {
                  const isIn = ["deposit","sell","copy_profit"].includes(tx.type);
                  return (
                    <div key={tx.id} className="flex items-center gap-3 px-3 py-3 rounded-2xl hover:bg-secondary transition-colors">
                      <div className={`w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0 ${isIn ? "bg-up" : "bg-down"}`}>
                        {isIn
                          ? <ArrowDownLeft className="w-4 h-4 text-up" />
                          : <ArrowUpRight className="w-4 h-4 text-down" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold capitalize">{tx.type.replace("_"," ")}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {new Date(tx.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-mono font-bold tabular-nums ${isIn ? "text-up" : "text-down"}`}>
                          {isIn ? "+" : "-"}${Math.abs(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        <p className={`text-[10px] font-semibold capitalize ${
                          tx.status === "completed" || tx.status === "approved" ? "text-up"
                          : tx.status === "rejected" ? "text-down"
                          : "text-yellow-400"
                        }`}>{tx.status}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
        </motion.div>
      </div>
    </div>
  );
}