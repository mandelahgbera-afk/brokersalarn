import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Clock, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/ui/PageHeader";
import { toast } from "sonner";

const STATUS_COLORS = {
  pending: "text-yellow-400 bg-yellow-400/10",
  approved: "text-up bg-up",
  completed: "text-up bg-up",
  rejected: "text-down bg-down",
};

const TYPE_COLORS = {
  deposit: "text-up", withdrawal: "text-down",
  buy: "text-blue-400", sell: "text-purple-400", copy_profit: "text-up",
};

export default function AdminTransactions() {
  const { user } = useOutletContext();
  const [txns, setTxns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");

  const load = () => {
    base44.entities.Transaction.list("-created_at", 200).then(t => { setTxns(t); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const filtered = filter === "all" ? txns : txns.filter(t => t.status === filter);

  const handleApprove = async (tx) => {
    await base44.entities.Transaction.update(tx.id, { status: "approved" });
    toast.success("Approved");
    load();
  };

  const handleReject = async (tx) => {
    await base44.entities.Transaction.update(tx.id, { status: "rejected" });
    toast.error("Rejected");
    load();
  };

  const counts = {
    pending: txns.filter(t => t.status === "pending").length,
    approved: txns.filter(t => t.status === "approved").length,
    rejected: txns.filter(t => t.status === "rejected").length,
  };

  return (
    <div className="space-y-6">
      <PageHeader user={user} title="All Transactions" subtitle={`${txns.length} total`} />

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { v: "pending", label: `Pending (${counts.pending})` },
          { v: "approved", label: `Approved (${counts.approved})` },
          { v: "rejected", label: `Rejected (${counts.rejected})` },
          { v: "all", label: `All (${txns.length})` },
        ].map(f => (
          <button key={f.v} onClick={() => setFilter(f.v)}
            className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-colors ${filter === f.v ? "bg-primary/15 text-primary border border-primary/30" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
            {f.label}
          </button>
        ))}
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="grid grid-cols-5 lg:grid-cols-6 gap-4 px-5 py-3 border-b border-border text-xs text-muted-foreground font-medium uppercase tracking-wider">
          <span>User</span>
          <span className="text-center">Type</span>
          <span className="text-right">Amount</span>
          <span className="hidden lg:block text-right">Date</span>
          <span className="text-center">Status</span>
          <span className="text-right">Actions</span>
        </div>
        {loading ? (
          <div className="space-y-px">{[1,2,3,4].map(i => <div key={i} className="h-16 bg-secondary/30 animate-pulse" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-sm text-muted-foreground">No {filter} transactions</div>
        ) : (
          <div className="divide-y divide-border/50">
            {filtered.map((tx, i) => (
              <motion.div key={tx.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                className="grid grid-cols-5 lg:grid-cols-6 gap-4 px-5 py-4 hover:bg-secondary/30 transition-colors items-center">
                <div className="text-xs text-muted-foreground truncate">{tx.user_email?.split("@")[0]}</div>
                <div className="text-center">
                  <span className={`text-xs font-semibold capitalize ${TYPE_COLORS[tx.type] || ""}`}>{tx.type?.replace("_", " ")}</span>
                </div>
                <div className="text-right font-mono font-bold text-sm">${tx.amount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                <div className="hidden lg:block text-right text-xs text-muted-foreground">
                  {new Date(tx.created_at).toLocaleDateString()}
                </div>
                <div className="flex justify-center">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-lg capitalize ${STATUS_COLORS[tx.status] || ""}`}>
                    {tx.status}
                  </span>
                </div>
                <div className="flex gap-1.5 justify-end">
                  {tx.status === "pending" && (
                    <>
                      <Button size="sm" onClick={() => handleApprove(tx)}
                        className="h-7 w-7 p-0 gradient-green text-white">
                        <CheckCircle className="w-3.5 h-3.5" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleReject(tx)}
                        className="h-7 w-7 p-0 border-destructive/40 text-destructive hover:bg-destructive/10">
                        <XCircle className="w-3.5 h-3.5" />
                      </Button>
                    </>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}