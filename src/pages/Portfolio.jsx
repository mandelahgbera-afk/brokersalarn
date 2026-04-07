import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { motion } from "framer-motion";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis
} from "recharts";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/ui/PageHeader";
import { CoinIcon } from "@/components/ui/CryptoRow";

const COLORS = ["#14b87a", "#3b82f6", "#a855f7", "#f59e0b", "#ef4444", "#06b6d4"];

export default function Portfolio() {
  const { user } = useOutletContext();
  const [portfolio, setPortfolio] = useState([]);
  const [cryptos, setCryptos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.email) return;
    Promise.all([
      base44.entities.Portfolio.filter({ user_email: user.email }),
      base44.entities.Cryptocurrency.list(),
    ]).then(([port, cry]) => {
      setPortfolio(port);
      setCryptos(cry);
      setLoading(false);
    });
  }, [user]);

  const enriched = portfolio.map((p, i) => {
    const coin = cryptos.find(c => c.symbol === p.crypto_symbol);
    const currentValue = (coin?.price || 0) * p.amount;
    const costBasis = p.avg_buy_price * p.amount;
    const pnl = currentValue - costBasis;
    const pnlPct = costBasis > 0 ? ((pnl / costBasis) * 100) : 0;
    return { ...p, currentValue, costBasis, pnl, pnlPct, price: coin?.price || 0, change: coin?.change_24h || 0, color: COLORS[i % COLORS.length] };
  });

  const totalValue = enriched.reduce((s, p) => s + p.currentValue, 0);
  const totalPnl = enriched.reduce((s, p) => s + p.pnl, 0);
  const totalCost = enriched.reduce((s, p) => s + p.costBasis, 0);
  const totalPnlPct = totalCost > 0 ? ((totalPnl / totalCost) * 100) : 0;

  const pieData = enriched.map(p => ({ name: p.crypto_symbol, value: p.currentValue }));
  // Chart color reacts to total P&L
  const chartColor = totalPnl >= 0 ? "hsl(160,84%,42%)" : "hsl(0,72%,54%)";

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload?.length) return (
      <div className="bg-card border border-border rounded-xl px-3 py-2 text-xs">
        <p className="font-semibold">{payload[0].name}</p>
        <p className="font-mono text-primary">${payload[0].value?.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
      </div>
    );
    return null;
  };

  return (
    <div className="space-y-5">
      <PageHeader user={user} title="Portfolio" subtitle="Your holdings & performance" />

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Value", value: `$${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
          { label: "Total Cost", value: `$${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
          { label: "P&L", value: `${totalPnl >= 0 ? "+" : ""}$${Math.abs(totalPnl).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, up: totalPnl >= 0 },
          { label: "P&L %", value: `${totalPnlPct >= 0 ? "+" : ""}${totalPnlPct.toFixed(2)}%`, up: totalPnlPct >= 0 },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className="bg-card border border-border rounded-2xl p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">{s.label}</p>
            <p className={`text-xl font-bold font-mono ${s.up === true ? "text-up" : s.up === false ? "text-down" : "text-foreground"}`}>{s.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Allocation pie */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <p className="text-sm font-semibold mb-4">Allocation</p>
          {loading || pieData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">No holdings</div>
          ) : (
            <>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" strokeWidth={0}>
                      {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-1.5 mt-2">
                {enriched.map(p => (
                  <div key={p.id} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
                      <span className="text-muted-foreground">{p.crypto_symbol}</span>
                    </div>
                    <span className="font-mono font-semibold">{totalValue > 0 ? ((p.currentValue / totalValue) * 100).toFixed(1) : 0}%</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Holdings table */}
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-5">
          <p className="text-sm font-semibold mb-4">Holdings</p>
          {loading ? (
            <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-14 bg-secondary rounded-xl animate-pulse" />)}</div>
          ) : enriched.length === 0 ? (
            <div className="text-center py-12 text-sm text-muted-foreground">No holdings. Start trading to build your portfolio.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-muted-foreground border-b border-border">
                    <th className="text-left pb-3 font-medium">Asset</th>
                    <th className="text-right pb-3 font-medium">Amount</th>
                    <th className="text-right pb-3 font-medium">Price</th>
                    <th className="text-right pb-3 font-medium">Value</th>
                    <th className="text-right pb-3 font-medium">P&L</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {enriched.map(p => (
                    <tr key={p.id} className="hover:bg-secondary/50 transition-colors">
                      <td className="py-3">
                        <div className="flex items-center gap-2.5">
                          <CoinIcon symbol={p.crypto_symbol} size={7} />
                          <div>
                            <p className="font-semibold">{p.crypto_symbol}</p>
                            <p className="text-xs text-muted-foreground">{p.change >= 0 ? "+" : ""}{p.change?.toFixed(2)}% 24h</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 text-right font-mono text-muted-foreground">{p.amount}</td>
                      <td className="py-3 text-right font-mono">${p.price?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td className="py-3 text-right font-mono font-semibold">${p.currentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="py-3 text-right">
                        <p className={`font-mono font-semibold text-xs ${p.pnl >= 0 ? "text-up" : "text-down"}`}>
                          {p.pnl >= 0 ? "+" : ""}${Math.abs(p.pnl).toFixed(2)}
                        </p>
                        <p className={`text-xs ${p.pnlPct >= 0 ? "text-up" : "text-down"}`}>
                          {p.pnlPct >= 0 ? "+" : ""}{p.pnlPct.toFixed(2)}%
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}