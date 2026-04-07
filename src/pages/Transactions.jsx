import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight, Clock, CheckCircle, XCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/ui/PageHeader";
import { toast } from "sonner";

const TYPE_META = {
  deposit: { label: "Deposit", icon: ArrowDownLeft, color: "text-up bg-up" },
  withdrawal: { label: "Withdrawal", icon: ArrowUpRight, color: "text-down bg-down" },
  buy: { label: "Buy", icon: ArrowLeftRight, color: "text-blue-400 bg-blue-400/10" },
  sell: { label: "Sell", icon: ArrowLeftRight, color: "text-purple-400 bg-purple-400/10" },
  copy_profit: { label: "Copy Profit", icon: ArrowDownLeft, color: "text-up bg-up" },
};

const STATUS_META = {
  pending: { label: "Pending", icon: Clock, cls: "text-yellow-400 bg-yellow-400/10" },
  approved: { label: "Approved", icon: CheckCircle, cls: "text-up bg-up" },
  completed: { label: "Completed", icon: CheckCircle, cls: "text-up bg-up" },
  rejected: { label: "Rejected", icon: XCircle, cls: "text-down bg-down" },
};

export default function Transactions() {
  const { user } = useOutletContext();
  const [txns, setTxns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [modal, setModal] = useState(null); // "deposit" | "withdraw"
  const [amount, setAmount] = useState("");
  const [wallet, setWallet] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [depositAddresses, setDepositAddresses] = useState({});

  useEffect(() => {
    base44.entities.PlatformSettings.list().then(rows => {
      const map = {};
      rows.forEach(r => { map[r.key] = r.value; });
      setDepositAddresses(map);
    }).catch(() => {});
  }, []);

  const load = () => {
    if (!user?.email) return;
    base44.entities.Transaction.filter({ user_email: user.email }, "-created_at", 50)
      .then(t => { setTxns(t); setLoading(false); });
  };

  useEffect(() => { load(); }, [user]);

  const filtered = filter === "all" ? txns : txns.filter(t => t.type === filter);

  const handleSubmit = async () => {
    if (!amount || parseFloat(amount) <= 0) { toast.error("Enter a valid amount"); return; }
    if (modal === "withdrawal" && !wallet) { toast.error("Enter your wallet address"); return; }
    setSubmitting(true);
    await base44.entities.Transaction.create({
      user_email: user.email,
      type: modal,
      amount: parseFloat(amount),
      wallet_address: wallet || undefined,
      status: "pending",
    });
    toast.success(`${modal === "deposit" ? "Deposit" : "Withdrawal"} request submitted! Awaiting approval.`);
    setModal(null); setAmount(""); setWallet("");
    load();
    setSubmitting(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader user={user} title="Transactions" subtitle="Your complete transaction history" />

      {/* Action buttons */}
      <div className="flex gap-3">
        <Button onClick={() => setModal("deposit")}
          className="gradient-green text-white font-semibold glow-green-sm">
          <ArrowDownLeft className="w-4 h-4 mr-2" /> Deposit
        </Button>
        <Button onClick={() => setModal("withdrawal")} variant="outline"
          className="border-border text-foreground hover:bg-secondary font-semibold">
          <ArrowUpRight className="w-4 h-4 mr-2" /> Withdraw
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {["all", "deposit", "withdrawal", "buy", "sell"].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-colors capitalize ${filter === f ? "bg-primary/15 text-primary border border-primary/30" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
            {f}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {loading ? (
          <div className="space-y-px">
            {[1,2,3,4,5].map(i => <div key={i} className="h-16 bg-secondary/50 animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-sm text-muted-foreground">No transactions found</div>
        ) : (
          <>
            {/* Header */}
            <div className="grid grid-cols-4 lg:grid-cols-6 gap-4 px-5 py-3 border-b border-border text-xs text-muted-foreground font-medium uppercase tracking-wider">
              <span className="col-span-2">Type</span>
              <span className="text-right">Amount</span>
              <span className="hidden lg:block text-right">Crypto</span>
              <span className="hidden lg:block text-right">Date</span>
              <span className="text-right">Status</span>
            </div>
            <div className="divide-y divide-border/50">
              {filtered.map((tx, i) => {
                const meta = TYPE_META[tx.type] || TYPE_META.deposit;
                const status = STATUS_META[tx.status] || STATUS_META.pending;
                const StatusIcon = status.icon;
                return (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="grid grid-cols-4 lg:grid-cols-6 gap-4 px-5 py-4 hover:bg-secondary/30 transition-colors items-center"
                  >
                    <div className="col-span-2 flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${meta.color}`}>
                        <meta.icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{meta.label}</p>
                        <p className="text-xs text-muted-foreground hidden sm:block">
                          {tx.wallet_address ? `${tx.wallet_address.slice(0,8)}...` : "Platform"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-mono font-bold">${tx.amount?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                    <div className="hidden lg:block text-right text-sm text-muted-foreground font-mono">
                      {tx.crypto_amount ? `${tx.crypto_amount} ${tx.crypto_symbol}` : "—"}
                    </div>
                    <div className="hidden lg:block text-right text-xs text-muted-foreground">
                      {new Date(tx.created_at).toLocaleDateString()}
                    </div>
                    <div className="flex items-center justify-end gap-1.5">
                      <StatusIcon className={`w-3.5 h-3.5 ${status.cls.split(" ")[0]}`} />
                      <span className={`text-xs font-semibold ${status.cls.split(" ")[0]}`}>{status.label}</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm"
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-lg capitalize">{modal}</h3>
              <button onClick={() => setModal(null)}><X className="w-5 h-5 text-muted-foreground hover:text-foreground" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Amount (USD)</label>
                <Input type="number" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)}
                  className="bg-secondary border-border font-mono text-lg h-12" />
              </div>
              {modal === "withdrawal" && (
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">Wallet Address</label>
                  <Input placeholder="0x..." value={wallet} onChange={e => setWallet(e.target.value)}
                    className="bg-secondary border-border font-mono text-sm" />
                </div>
              )}
              {modal === "deposit" && (
                <div className="space-y-2">
                  <div className="px-4 py-3 rounded-xl bg-primary/10 border border-primary/20 text-xs text-primary">
                    Send your deposit to one of the addresses below. After submission, an admin will confirm your deposit.
                  </div>
                  {depositAddresses.deposit_image_url && (
                    <img src={depositAddresses.deposit_image_url} alt="Deposit QR" className="w-32 h-32 object-contain mx-auto rounded-xl border border-border" />
                  )}
                  {Object.entries(depositAddresses)
                    .filter(([k]) => k.startsWith("deposit_address_") && !k.includes("image"))
                    .map(([k, v]) => v ? (
                      <div key={k} className="px-3 py-2.5 rounded-xl bg-secondary text-xs">
                        <p className="text-muted-foreground mb-1 uppercase tracking-wider font-semibold text-[10px]">{k.replace("deposit_address_", "").toUpperCase().replace("_", " ")}</p>
                        <p className="font-mono break-all text-foreground select-all">{v}</p>
                      </div>
                    ) : null)}
                </div>
              )}
              <Button onClick={handleSubmit} disabled={submitting}
                className={`w-full h-11 font-bold ${modal === "deposit" ? "gradient-green text-white" : "bg-secondary border border-border text-foreground hover:bg-muted"}`}>
                {submitting ? "Submitting..." : `Submit ${modal}`}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}