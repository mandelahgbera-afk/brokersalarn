import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, Save, Eye, EyeOff, AlertTriangle, Wallet, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/ui/PageHeader";
import { toast } from "sonner";

const DEPOSIT_METHODS = [
  { key: "deposit_address_btc", label: "Bitcoin (BTC) Deposit Address", placeholder: "bc1q..." },
  { key: "deposit_address_eth", label: "Ethereum (ETH) Deposit Address", placeholder: "0x..." },
  { key: "deposit_address_usdt_trc20", label: "USDT (TRC20) Deposit Address", placeholder: "T..." },
  { key: "deposit_address_usdt_erc20", label: "USDT (ERC20) Deposit Address", placeholder: "0x..." },
  { key: "deposit_address_bnb", label: "BNB Deposit Address", placeholder: "bnb1..." },
  { key: "deposit_image_url", label: "Deposit QR Code / Banner Image URL", placeholder: "https://..." },
];

export default function PlatformSettings() {
  const { user } = useOutletContext();
  const [settings, setSettings] = useState({});
  const [editing, setEditing] = useState({});
  const [saving, setSaving] = useState({});
  const [showAddress, setShowAddress] = useState({});
  const [loading, setLoading] = useState(true);

  const isSuperAdmin = user?.role === "admin";

  useEffect(() => {
    if (!isSuperAdmin) return;
    base44.entities.PlatformSettings.list().then(rows => {
      const map = {};
      rows.forEach(r => { map[r.key] = r; });
      setSettings(map);
      setLoading(false);
    });
  }, [isSuperAdmin]);

  const handleSave = async (key, label) => {
    if (!isSuperAdmin) { toast.error("Unauthorized"); return; }
    const value = editing[key];
    if (!value?.trim()) { toast.error("Value cannot be empty"); return; }
    setSaving(p => ({ ...p, [key]: true }));

    const existing = settings[key];
    if (existing?.id) {
      await base44.entities.PlatformSettings.update(existing.id, { value: value.trim(), updated_by: user.email });
    } else {
      await base44.entities.PlatformSettings.create({ key, value: value.trim(), label, updated_by: user.email });
    }

    const rows = await base44.entities.PlatformSettings.list();
    const map = {};
    rows.forEach(r => { map[r.key] = r; });
    setSettings(map);
    setEditing(p => { const n = { ...p }; delete n[key]; return n; });
    setSaving(p => ({ ...p, [key]: false }));
    toast.success(`${label} updated securely`);
  };

  if (!isSuperAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-16 h-16 rounded-3xl bg-destructive/15 flex items-center justify-center">
          <Lock className="w-8 h-8 text-destructive" />
        </div>
        <h2 className="text-xl font-bold">Access Restricted</h2>
        <p className="text-sm text-muted-foreground">Only super administrators can manage platform settings.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader user={user} title="Platform Settings" subtitle="Super admin controls — handle with care" />

      <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
        <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0" />
        <p className="text-xs text-yellow-300">Deposit addresses are shown to users when they request a deposit. Ensure accuracy before saving. All changes are logged.</p>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center gap-3">
          <Wallet className="w-4 h-4 text-primary" />
          <p className="text-sm font-semibold">Deposit Addresses & Methods</p>
          <span className="ml-auto text-xs px-2 py-0.5 rounded-md bg-yellow-400/10 text-yellow-400 font-semibold">Super Admin Only</span>
        </div>
        {loading ? (
          <div className="space-y-px">{[1,2,3,4].map(i => <div key={i} className="h-20 bg-secondary/30 animate-pulse" />)}</div>
        ) : (
          <div className="divide-y divide-border/50">
            {DEPOSIT_METHODS.map((m, i) => {
              const current = settings[m.key]?.value || "";
              const isEditing = editing[m.key] !== undefined;
              const val = isEditing ? editing[m.key] : current;
              const visible = showAddress[m.key];
              const lastUpdatedBy = settings[m.key]?.updated_by;

              return (
                <motion.div key={m.key} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                  className="px-5 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">{m.label}</label>
                      <div className="flex gap-2 items-center">
                        <div className="relative flex-1">
                          <Input
                            type={visible ? "text" : "password"}
                            value={isEditing ? val : (current || "")}
                            onChange={e => setEditing(p => ({ ...p, [m.key]: e.target.value }))}
                            placeholder={isEditing ? m.placeholder : (current ? "••••••••••••" : m.placeholder)}
                            readOnly={!isEditing}
                            className={`bg-secondary border-border font-mono text-sm pr-10 ${!isEditing ? "opacity-60 cursor-default" : ""}`}
                          />
                          {current && (
                            <button onClick={() => setShowAddress(p => ({ ...p, [m.key]: !visible }))}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                              {visible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                          )}
                        </div>
                        {!isEditing ? (
                          <Button size="sm" variant="outline" onClick={() => setEditing(p => ({ ...p, [m.key]: current }))}
                            className="h-9 px-3 border-border text-xs gap-1.5 flex-shrink-0">
                            <Edit3 className="w-3 h-3" /> Edit
                          </Button>
                        ) : (
                          <div className="flex gap-2 flex-shrink-0">
                            <Button size="sm" onClick={() => handleSave(m.key, m.label)} disabled={saving[m.key]}
                              className="h-9 px-3 gradient-green text-white text-xs gap-1.5">
                              <Save className="w-3 h-3" /> {saving[m.key] ? "Saving..." : "Save"}
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setEditing(p => { const n = { ...p }; delete n[m.key]; return n; })}
                              className="h-9 px-3 border-border text-xs">Cancel</Button>
                          </div>
                        )}
                      </div>
                      {lastUpdatedBy && (
                        <p className="text-[10px] text-muted-foreground mt-1.5">
                          Last updated by: <span className="text-foreground/60 font-mono">{lastUpdatedBy}</span>
                          {settings[m.key]?.updated_at && ` • ${new Date(settings[m.key].updated_at).toLocaleDateString()}`}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
