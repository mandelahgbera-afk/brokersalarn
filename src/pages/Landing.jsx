import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import {
  TrendingUp, Shield, Zap, Globe, ArrowRight, ChevronDown,
  Lock, BarChart3, Copy, Wallet, Star, Check, Menu, X, Flame,
  Activity, Gauge, User, TrendingDown, Eye, Unlock
} from "lucide-react";

const NAV_LINKS = ["Features", "Security", "How it works", "Resources"];

const FEATURES = [
  { icon: Copy, title: "Copy Trading", desc: "Follow top traders and mirror their strategies automatically with advanced risk controls.", gradient: "from-purple-500/20 to-pink-500/20", iconColor: "text-purple-400" },
  { icon: BarChart3, title: "Advanced Analytics", desc: "Real-time portfolio insights, performance metrics, and market intelligence in one dashboard.", gradient: "from-blue-500/20 to-cyan-500/20", iconColor: "text-blue-400" },
  { icon: Zap, title: "Lightning Fast", desc: "Sub-second order execution across 50+ blockchains with institutional-grade infrastructure.", gradient: "from-yellow-500/20 to-orange-500/20", iconColor: "text-yellow-400" },
  { icon: Shield, title: "Maximum Security", desc: "Multi-signature wallets, cold storage, RLS policies, and 24/7 security monitoring.", gradient: "from-emerald-500/20 to-teal-500/20", iconColor: "text-emerald-400" },
  { icon: Gauge, title: "Risk Management", desc: "Customizable position sizing, stop-loss automation, and portfolio rebalancing tools.", gradient: "from-rose-500/20 to-red-500/20", iconColor: "text-rose-400" },
  { icon: Globe, title: "Multi-Chain", desc: "Seamless access to Ethereum, Solana, Polygon, Arbitrum, and 50+ other networks.", gradient: "from-indigo-500/20 to-violet-500/20", iconColor: "text-indigo-400" },
];

const STEPS = [
  { num: "01", title: "Create Account", desc: "Sign up in under 2 minutes. Identity verification ensures platform security." },
  { num: "02", title: "Connect Wallet", desc: "Link your crypto wallet with institutional-grade security and multi-sig protection." },
  { num: "03", title: "Start Trading", desc: "Trade independently or copy proven strategies from top performers instantly." },
];

const TESTIMONIALS = [
  { name: "Sarah Chen", role: "Crypto Investor", text: "The copy-trading feature helped me grow my portfolio by 180% in 8 months. Professional platform.", initials: "SC", color: "#6366f1" },
  { name: "Michael Roberts", role: "Day Trader", text: "Best execution speed and analytics suite I've used. Switched from 3 other platforms.", initials: "MR", color: "#10b981" },
  { name: "Emma Watson", role: "DeFi Strategist", text: "Finally found a platform that understands institutional-grade requirements with retail simplicity.", initials: "EW", color: "#f59e0b" },
];

const TICKER = ["BTC +2.4%", "ETH -0.8%", "SOL +5.3%", "BNB +1.2%", "ADA -1.1%", "DOGE +3.2%", "AVAX -2.1%", "LINK +4.2%", "MATIC +1.7%", "XRP +0.9%"];

function FloatingOrb({ className }) {
  return <div className={`absolute rounded-full blur-3xl opacity-20 pointer-events-none ${className}`} />;
}

function PriceTicker() {
  return (
    <div className="relative overflow-hidden bg-black/40 border-y border-white/5 py-2.5">
      <div className="flex animate-[ticker_25s_linear_infinite] gap-10 whitespace-nowrap w-max">
        {[...TICKER, ...TICKER].map((t, i) => {
          const up = t.includes("+");
          return (
            <span key={i} className={`text-xs font-mono font-semibold ${up ? "text-emerald-400" : "text-rose-400"}`}>
              {t}
            </span>
          );
        })}
      </div>
    </div>
  );
}

export default function Landing() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <style>{`
        @keyframes ticker { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes float { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-16px); } }
        @keyframes pulse-ring { 0% { transform: scale(0.95); opacity: 0.8; } 70% { transform: scale(1.05); opacity: 0; } 100% { transform: scale(0.95); opacity: 0; } }
        .float { animation: float 5s ease-in-out infinite; }
        .hero-glow { background: radial-gradient(ellipse 80% 60% at 50% 0%, hsla(158,82%,42%,0.15) 0%, transparent 60%); }
      `}</style>

      {/* Nav */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-black/80 backdrop-blur-xl border-b border-white/5" : ""}`}>
        <div className="max-w-7xl mx-auto px-5 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl gradient-green flex items-center justify-center glow-green-sm">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">Brokerr</span>
          </div>

          <div className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.map(l => (
              <a key={l} href={`#${l.toLowerCase().replace(" ", "-")}`}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">
                {l}
              </a>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium px-4 py-2">
              Sign In
            </Link>
            <Link to="/" className="text-sm font-semibold px-5 py-2 rounded-xl gradient-green text-white glow-green-sm hover:opacity-90 transition-opacity">
              Get Started
            </Link>
          </div>

          <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden w-9 h-9 flex items-center justify-center text-muted-foreground">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-black/90 backdrop-blur-xl border-b border-white/5 px-5 pb-5 space-y-3">
              {NAV_LINKS.map(l => (
                <a key={l} href={`#${l.toLowerCase().replace(" ", "-")}`} onClick={() => setMobileOpen(false)}
                  className="block py-2.5 text-sm text-muted-foreground hover:text-foreground font-medium border-b border-white/5">
                  {l}
                </a>
              ))}
              <Link to="/" className="block w-full text-center py-3 rounded-xl gradient-green text-white font-semibold text-sm mt-3">
                Get Started Free
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <PriceTicker />

      {/* Hero */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center pt-16 overflow-hidden">
        <div className="hero-glow absolute inset-0 pointer-events-none" />
        <FloatingOrb className="w-[600px] h-[600px] bg-emerald-500 top-[-200px] left-[-200px]" />
        <FloatingOrb className="w-[400px] h-[400px] bg-purple-500 bottom-[-100px] right-[-100px]" />
        <FloatingOrb className="w-[300px] h-[300px] bg-blue-500 top-[30%] right-[10%]" />

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 text-center px-5 max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-muted-foreground mb-8">
            <Flame className="w-3.5 h-3.5 text-emerald-400" />
            Trusted by 50,000+ traders across 50+ blockchains
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] mb-6">
            <span className="text-foreground">Professional Crypto</span>
            <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
              Trading & Copy Trading
            </span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed">
            Institutional-grade platform built for serious traders. Advanced analytics, copy-trading, multi-chain support, and bank-grade security—all in one dashboard.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link to="/"
              className="group flex items-center gap-2 px-8 py-4 rounded-2xl gradient-green text-white font-bold text-base glow-green-sm hover:opacity-90 transition-all hover:scale-[1.02] active:scale-[0.98]">
              Launch App
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <a href="#features"
              className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-white/5 border border-white/10 font-semibold text-base hover:bg-white/10 transition-all backdrop-blur-sm">
              Learn More
            </a>
          </motion.div>

          {/* Platform Stats */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            className="grid grid-cols-3 gap-4 md:gap-8 text-sm mt-16 pt-12 border-t border-white/5">
            {[
              { value: "50K+", label: "Active Traders" },
              { value: "$2.5B+", label: "Total Volume" },
              { value: "50+", label: "Blockchains" },
            ].map(s => (
              <div key={s.label} className="flex flex-col items-center gap-1">
                <span className="text-2xl md:text-3xl font-black text-emerald-400">{s.value}</span>
                <span className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">{s.label}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Floating dashboard mockup */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, type: "spring", damping: 20 }}
          className="float relative z-10 mt-16 mx-5 max-w-2xl w-full"
        >
          <div className="relative bg-gradient-to-br from-[hsl(224,20%,10%)] to-[hsl(224,25%,7%)] border border-white/10 rounded-3xl p-5 shadow-2xl backdrop-blur-sm">
            <div className="flex items-center gap-1.5 mb-4">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500/70" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
            </div>
            <div className="flex justify-between items-start mb-5">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Total Balance</p>
                <p className="text-3xl font-black font-mono">$200,000.00</p>
                <p className="text-xs text-emerald-400 font-semibold mt-1">+12.5% this month</p>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 rounded-xl bg-emerald-500/15 text-emerald-400 text-xs font-semibold border border-emerald-500/20">Fund</button>
                <button className="px-4 py-2 rounded-xl bg-white/5 text-muted-foreground text-xs font-semibold border border-white/10">Withdraw</button>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[{ s: "BTC", c: "+2.4%", col: "#F7931A" }, { s: "ETH", c: "+1.8%", col: "#627EEA" }, { s: "SOL", c: "+5.3%", col: "#9945FF" }, { s: "ADA", c: "+5.2%", col: "#0033AD" }].map(c => (
                <div key={c.s} className="bg-white/5 rounded-xl p-3 text-center">
                  <div className="w-7 h-7 rounded-full mx-auto mb-1.5 flex items-center justify-center text-white text-[9px] font-bold" style={{ background: c.col }}>{c.s.slice(0, 2)}</div>
                  <p className="text-[10px] font-semibold">{c.s}</p>
                  <p className="text-[10px] text-emerald-400 font-bold">{c.c}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <a href="#features" className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-muted-foreground animate-bounce">
          <span className="text-xs">Scroll</span>
          <ChevronDown className="w-4 h-4" />
        </a>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-5 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="text-sm font-semibold text-emerald-400 uppercase tracking-widest mb-3">Platform Features</motion.p>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-4xl lg:text-5xl font-black tracking-tight">Powerful Tools for Professional Traders</motion.h2>
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
            className="text-muted-foreground text-lg mt-4 max-w-2xl mx-auto">Everything you need to trade smarter and earn more with advanced analytics and proven strategies.</motion.p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              className={`relative group p-6 rounded-3xl bg-gradient-to-br ${f.gradient} border border-white/8 hover:border-white/15 transition-all duration-300 hover:-translate-y-1 cursor-default`}>
              <div className={`w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-4 ${f.iconColor}`}>
                <f.icon className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 px-5 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/3 to-transparent pointer-events-none" />
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              className="text-sm font-semibold text-emerald-400 uppercase tracking-widest mb-3">Getting Started</motion.p>
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="text-4xl lg:text-5xl font-black tracking-tight">Get Trading in 3 Steps</motion.h2>
            <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
              className="text-muted-foreground text-lg mt-4 max-w-2xl mx-auto">From account creation to your first trade in under 5 minutes.</motion.p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map((s, i) => (
              <motion.div key={s.num} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="text-center relative">
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-5">
                  <span className="text-2xl font-black text-emerald-400">{s.num}</span>
                </div>
                <h3 className="font-bold text-xl mb-3">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                {i < 2 && <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-px bg-gradient-to-r from-emerald-500/30 to-transparent" />}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 px-5 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="text-sm font-semibold text-emerald-400 uppercase tracking-widest mb-3">User Stories</motion.p>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-4xl lg:text-5xl font-black tracking-tight">Trusted by Professional Traders</motion.h2>
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
            className="text-muted-foreground text-lg mt-4 max-w-2xl mx-auto">Join thousands of profitable traders using our platform daily.</motion.p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <motion.div key={t.name} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="bg-white/3 border border-white/8 rounded-3xl p-6 hover:bg-white/5 transition-all">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, j) => <Star key={j} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />)}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-5">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold" style={{ background: t.color }}>
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-5 max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="text-sm font-semibold text-emerald-400 uppercase tracking-widest mb-3">Pricing Plans</motion.p>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-4xl lg:text-5xl font-black tracking-tight">Transparent Pricing. Zero Hidden Fees.</motion.h2>
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
            className="text-muted-foreground text-lg mt-4 max-w-2xl mx-auto">Choose the plan that fits your trading style. Upgrade or downgrade anytime.</motion.p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { name: "Starter", price: "Free", desc: "Perfect for beginners.", features: ["Portfolio tracking", "Basic analytics", "1 wallet", "Email support"], cta: "Get Started" },
            { name: "Pro", price: "$19/mo", desc: "For serious investors.", features: ["Everything in Starter", "Advanced analytics", "Unlimited wallets", "Copy Trading access", "Priority support"], cta: "Start Pro Trial", popular: true },
            { name: "Enterprise", price: "Custom", desc: "For institutions.", features: ["Everything in Pro", "Dedicated manager", "Custom integrations", "SLA guarantee"], cta: "Contact Sales" },
          ].map((p, i) => (
            <motion.div key={p.name} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className={`relative p-6 rounded-3xl border transition-all ${p.popular ? "bg-gradient-to-b from-emerald-500/15 to-transparent border-emerald-500/40 glow-green-sm" : "bg-white/3 border-white/8 hover:border-white/15"}`}>
              {p.popular && <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-4 py-1 rounded-full gradient-green text-white">Most Popular</span>}
              <p className="font-bold text-lg mb-1">{p.name}</p>
              <p className="text-3xl font-black mb-1">{p.price}</p>
              <p className="text-xs text-muted-foreground mb-5">{p.desc}</p>
              <ul className="space-y-2.5 mb-6">
                {p.features.map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-sm">
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link to="/" className={`block text-center py-3 rounded-xl font-semibold text-sm transition-all ${p.popular ? "gradient-green text-white glow-green-sm hover:opacity-90" : "bg-white/8 hover:bg-white/12 border border-white/10"}`}>
                {p.cta}
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-5">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center relative">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-blue-500/10 rounded-3xl blur-2xl" />
          <div className="relative bg-white/3 border border-white/10 rounded-3xl p-12">
            <h2 className="text-4xl lg:text-5xl font-black mb-4">Ready to Start Your<br />Crypto Journey?</h2>
            <p className="text-muted-foreground mb-8">Join 50,000+ investors already earning with Brokerr. No hidden fees, no complex setup.</p>
            <Link to="/"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl gradient-green text-white font-bold text-base glow-green-sm hover:opacity-90 transition-all hover:scale-[1.02]">
              Create Free Account <ArrowRight className="w-4 h-4" />
            </Link>
            <p className="text-xs text-muted-foreground mt-4">Takes less than 2 minutes</p>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-10 px-5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl gradient-green flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold">Brokerr</span>
          </div>
          <p className="text-xs text-muted-foreground">© 2024 Brokerr. All rights reserved. Not financial advice.</p>
          <div className="flex gap-5 text-xs text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="hover:text-foreground transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
