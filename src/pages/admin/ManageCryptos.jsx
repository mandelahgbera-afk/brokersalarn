import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, X, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/ui/PageHeader";
import { CoinIcon } from "@/components/ui/CryptoRow";
import { toast } from "sonner";

const EMPTY = { symbol: "", name: "", price: "", change_24h: "", market_cap: "", volume_24h: "", is_active: true };

export default function ManageCryptos() {
  const { user } = useOutletContext();
  const [cryptos, setCryptos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | "add" | crypto object
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = () => {
    base44.entities.Cryptocurrency.list().then(c => { setCryptos(c); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm(EMPTY); setModal("add"); };
  const openEdit = (c) => { setForm({ ...c, price: c.price?.toString(), change_24h: c.change_24h?.toString(), market_cap: c.market_cap?.toString(), volume_24h: c.volume_24h?.toString() }); setModal(c); };

  const handleSave = async () => {
    if (!form.symbol || !form.name || !form.price) { toast.error("Symbol, name and price are required"); return; }
    setSaving(true);
    const data = { ...form, price: parseFloat(form.price), change_24h: parseFloat(form.change_24h) || 0, market_cap: parseFloat(form.market_cap) || 0, volume_24h: parseFloat(form.volume_24h) || 0 };
    if (modal === "add") {
      await base44.entities.Cryptocurrency.create(data);
      toast.success(`${form.symbol} added`);
    } else {
      await base44.entities.Cryptocurrency.update(modal.id, data);
      toast.success(`${form.symbol} updated`);
    }
    load(); setModal(null); setSaving(false);
  };

  const handleDelete = async (c) => {
    if (!confirm(`Delete ${c.symbol}?`)) return;
    await base44.entities.Cryptocurrency.delete(c.id);
    toast.success(`${c.symbol} deleted`);
    load();
  };

  const handleToggle = async (c) => {
    await base44.entities.Cryptocurrency.update(c.id, { is_active: !c.is_active });
    load();
  };

  return (
    <div className="space-y-6">
      <PageHeader user={user} title="Cryptocurrencies" subtitle={`${cryptos.length} coins listed`} />

      <Button onClick={openAdd} className="gradient-green text-white font-semibold glow-green-sm">
        <Plus className="w-4 h-4 mr-2" /> Add Cryptocurrency
      </Button>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="grid grid-cols-5 gap-4 px-5 py-3 border-b border-border text-xs text-muted-foreground font-medium uppercase tracking-wider">
          <span className="col-span-2">Coin</span>
          <span className="text-right">Price</span>
          <span className="text-center">Status</span>
          <span className="text-right">Actions</span>
        </div>
        {loading ? (
          <div className="space-y-px">{[1,2,3,4,5].map(i => <div key={i} className="h-16 bg-secondary/30 animate-pulse" />)}</div>
        ) : cryptos.length === 0 ? (
          <div className="text-center py-12 text-sm text-muted-foreground">No cryptocurrencies. Add one above.</div>
        ) : (
          <div className="divide-y divide-border/50">
            {cryptos.map((c, i) => (
              <motion.div key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                className="grid grid-cols-5 gap-4 px-5 py-4 hover:bg-secondary/30 transition-colors items-center">
                <div className="col-span-2 flex items-center gap-3">
                  <CoinIcon symbol={c.symbol} />
                  <div>
                    <p className="text-sm font-bold">{c.symbol}</p>
                    <p className="text-xs text-muted-foreground">{c.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-mono font-semibold">${c.price?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                  <p className={`text-xs font-semibold ${c.change_24h >= 0 ? "text-up" : "text-down"}`}>
                    {c.change_24h >= 0 ? "+" : ""}{c.change_24h?.toFixed(2)}%
                  </p>
                </div>
                <div className="flex justify-center">
                  <button onClick={() => handleToggle(c)}
                    className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors ${c.is_active ? "bg-up text-up hover:bg-destructive/10 hover:text-down" : "bg-down text-down hover:bg-up hover:text-up"}`}>
                    {c.is_active ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    {c.is_active ? "Active" : "Inactive"}
                  </button>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button size="sm" variant="ghost" onClick={() => openEdit(c)} className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground">
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(c)} className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-border rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-lg">{modal === "add" ? "Add Cryptocurrency" : `Edit ${form.symbol}`}</h3>
              <button onClick={() => setModal(null)}><X className="w-5 h-5 text-muted-foreground" /></button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Symbol", key: "symbol", placeholder: "BTC" },
                { label: "Name", key: "name", placeholder: "Bitcoin" },
                { label: "Price (USD)", key: "price", placeholder: "45000" },
                { label: "24h Change %", key: "change_24h", placeholder: "2.5" },
                { label: "Market Cap", key: "market_cap", placeholder: "850000000000" },
                { label: "Volume 24h", key: "volume_24h", placeholder: "28000000000" },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-xs text-muted-foreground mb-1.5 block">{f.label}</label>
                  <Input value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    placeholder={f.placeholder} className="bg-secondary border-border font-mono text-sm" />
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-5">
              <Button onClick={handleSave} disabled={saving} className="flex-1 gradient-green text-white font-semibold">
                {saving ? "Saving..." : "Save"}
              </Button>
              <Button onClick={() => setModal(null)} variant="outline" className="border-border">Cancel</Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}