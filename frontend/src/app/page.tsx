"use client";

import { useState, useCallback, useEffect, useRef } from "react";

// ==================== SVG Icons ====================

const Ic = {
  flame: (c = "w-5 h-5") => <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2c-2 4-6 6-6 11a6 6 0 0 0 12 0c0-5-4-7-6-11z" fill="currentColor" fillOpacity=".12"/><path d="M10 17a2 2 0 0 0 4 0c0-2-2-3-2-5s-2 3-2 5z" fill="currentColor" fillOpacity=".25" stroke="none"/></svg>,
  question: (c = "w-5 h-5") => <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M9 9h.01c.3-1.7 1.7-3 3.49-3s3 1.3 3 3c0 2-3 3-3 3"/><circle cx="12" cy="17" r=".5" fill="currentColor" stroke="none"/></svg>,
  user: (c = "w-5 h-5") => <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 0 0-16 0"/></svg>,
  chart: (c = "w-5 h-5") => <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>,
  brain: (c = "w-5 h-5") => <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A4.5 4.5 0 0 0 5 6.5c0 .5.1 1 .28 1.45A4 4 0 0 0 3 11.5a4 4 0 0 0 1.06 2.72A4.5 4.5 0 0 0 8.5 22H12V2z" fill="currentColor" fillOpacity=".06"/><path d="M14.5 2A4.5 4.5 0 0 1 19 6.5c0 .5-.1 1-.28 1.45A4 4 0 0 1 21 11.5a4 4 0 0 1-1.06 2.72A4.5 4.5 0 0 1 15.5 22H12V2z" fill="currentColor" fillOpacity=".06"/><path d="M12 2v20"/></svg>,
  heart: (c = "w-5 h-5") => <svg className={c} viewBox="0 0 24 24" fill="currentColor" fillOpacity=".15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7z"/></svg>,
  users: (c = "w-5 h-5") => <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  sparkles: (c = "w-5 h-5") => <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3 1.8 5.4L19 10l-5.2 1.6L12 17l-1.8-5.4L5 10l5.2-1.6z" fill="currentColor" fillOpacity=".12"/><path d="M19 15l.9 2.7 2.6.8-2.6.8-.9 2.7-.9-2.7-2.6-.8 2.6-.8z" fill="currentColor" fillOpacity=".08"/></svg>,
  zap: (c = "w-5 h-5") => <svg className={c} viewBox="0 0 24 24" fill="currentColor" fillOpacity=".12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg>,
  rocket: (c = "w-5 h-5") => <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" fill="currentColor" fillOpacity=".1"/><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" fill="currentColor" fillOpacity=".06"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>,
  church: (c = "w-5 h-5") => <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4M10 4h4"/><path d="m6 10 6-4 6 4" fill="currentColor" fillOpacity=".08"/><path d="M6 10v11h12V10M2 21h20M10 21v-4a2 2 0 0 1 4 0v4"/></svg>,
  check: (c = "w-5 h-5") => <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity=".08"/><path d="m9 12 2 2 4-4"/></svg>,
  coins: (c = "w-5 h-5") => <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><ellipse cx="12" cy="8" rx="7" ry="3" fill="currentColor" fillOpacity=".08"/><path d="M5 8v4c0 1.66 3.13 3 7 3s7-1.34 7-3V8M5 12v4c0 1.66 3.13 3 7 3s7-1.34 7-3v-4"/></svg>,
  megaphone: (c = "w-5 h-5") => <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 11 18-5v12L3 13v-2z" fill="currentColor" fillOpacity=".08"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></svg>,
  refresh: (c = "w-5 h-5") => <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/></svg>,
  trendUp: (c = "w-5 h-5") => <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m22 7-8.5 8.5-5-5L2 17"/><path d="M16 7h6v6"/></svg>,
  fileText: (c = "w-5 h-5") => <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="currentColor" fillOpacity=".05"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg>,
  alert: (c = "w-5 h-5") => <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" fill="currentColor" fillOpacity=".06"/><path d="M12 9v4M12 17h.01"/></svg>,
  chat: (c = "w-5 h-5") => <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" fill="currentColor" fillOpacity=".06"/></svg>,
  swords: (c = "w-5 h-5") => <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 17.5 3 6V3h3l11.5 11.5M13 19l6-6M16 16l4 4M19 21l2-2"/><path d="M9.5 6.5 21 18v3h-3L6.5 9.5M11 5l-6 6M8 8 4 4M5 3 3 5"/></svg>,
  network: (c = "w-5 h-5") => <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="6" cy="6" r="2.5" fill="currentColor" fillOpacity=".12"/><circle cx="18" cy="6" r="2.5" fill="currentColor" fillOpacity=".12"/><circle cx="6" cy="18" r="2.5" fill="currentColor" fillOpacity=".12"/><circle cx="18" cy="18" r="2.5" fill="currentColor" fillOpacity=".12"/><circle cx="12" cy="12" r="2.5" fill="currentColor" fillOpacity=".18"/><path d="M8 7.5l2.5 3M16 7.5l-2.5 3M8 16.5l2.5-3M16 16.5l-2.5-3" strokeOpacity=".4"/></svg>,
};

/* ---------- Background ---------- */
function Background() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: -1 }}>
      <div className="bg-orb bg-orb-1" />
      <div className="bg-orb bg-orb-2" />
      <div className="bg-orb bg-orb-3" />
      {Array.from({ length: 8 }, (_, i) => (
        <div key={i} className={`particle particle-${i + 1}`} />
      ))}
    </div>
  );
}

// ==================== Types ====================

interface Agent {
  id: string;
  name: string;
  role: string;
  beliefStance: number;
  riskTolerance: number;
  conformityBias: number;
  stage: string;
  faction: string;
  pbtBalance: number;
  investedAmount: number;
  promotionCount: number;
}

interface Dialogue {
  speaker: string;
  text: string;
}

interface InvestAction {
  amount: number;
  mintTxHash: string;
  eventTxHash: string;
}

interface DebateRecord {
  round: number;
  prophetId: string;
  targetId: string;
  strategy: string;
  dialogues: Dialogue[];
  converted: boolean;
  stanceChange: { before: number; after: number };
  investAction: InvestAction | null;
}

interface Metrics {
  totalAgents: number;
  convertedCount: number;
  totalInvested: number;
  totalPromotions: number;
  mainFaction: string;
  factionDistribution: {
    "pre-bull": number;
    neutral: number;
    realist: number;
  };
  rounds: number;
}

// ==================== Config ====================

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// ==================== Helpers ====================

const ROLE_ICON: Record<string, (c?: string) => JSX.Element> = {
  prophet: Ic.flame,
  skeptic: Ic.question,
  neutral: Ic.user,
  realist: Ic.chart,
};

const FACTION_CONFIG: Record<string, { label: string; color: string; dot: string; bg: string }> = {
  "pre-bull": { label: "牛市预演教", color: "text-emerald-400", dot: "bg-emerald-400", bg: "bg-emerald-500/8" },
  neutral: { label: "中立", color: "text-slate-400", dot: "bg-slate-400", bg: "bg-slate-500/8" },
  realist: { label: "现实主义", color: "text-rose-400", dot: "bg-rose-400", bg: "bg-rose-500/8" },
};

const STAGE_CONFIG: Record<string, { color: string; glow: string }> = {
  S0: { color: "text-slate-500 border-slate-500/20 bg-slate-500/5", glow: "" },
  S1: { color: "text-blue-400 border-blue-400/20 bg-blue-500/5", glow: "" },
  S2: { color: "text-violet-400 border-violet-400/20 bg-violet-500/5", glow: "" },
  S3: { color: "text-emerald-400 border-emerald-400/20 bg-emerald-500/5", glow: "shadow-[0_0_8px_rgba(0,255,136,0.15)]" },
  S4: { color: "text-emerald-300 border-emerald-300/30 bg-emerald-400/10", glow: "shadow-[0_0_12px_rgba(0,255,136,0.2)]" },
};

const STRATEGY_CONFIG: Record<string, { icon: (c?: string) => JSX.Element; label: string; color: string }> = {
  logical: { icon: Ic.brain, label: "逻辑论证", color: "text-blue-400 border-blue-400/20 bg-blue-500/8" },
  emotional: { icon: Ic.heart, label: "情感打动", color: "text-rose-400 border-rose-400/20 bg-rose-500/8" },
  social_proof: { icon: Ic.users, label: "社会证明", color: "text-amber-400 border-amber-400/20 bg-amber-500/8" },
  miracle: { icon: Ic.sparkles, label: "奇迹叙事", color: "text-violet-400 border-violet-400/20 bg-violet-500/8" },
};

function truncHash(h: string): string {
  if (!h || h.length < 14) return h;
  return h.slice(0, 6) + "···" + h.slice(-4);
}

function stancePercent(stance: number): number {
  return ((stance + 1) / 2) * 100;
}

// ==================== Components ====================

/* ---------- Animated Number ---------- */
function AnimNum({ value, prefix = "", suffix = "" }: { value: number; prefix?: string; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  const prev = useRef(0);
  useEffect(() => {
    const from = prev.current;
    const to = value;
    prev.current = value;
    if (from === to) { setDisplay(to); return; }
    const dur = 600;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / dur, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(from + (to - from) * ease));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [value]);
  return <>{prefix}{display.toLocaleString()}{suffix}</>;
}

/* ---------- Stat Card ---------- */
function StatCard({ icon, label, value, sub, delay = 0 }: {
  icon: React.ReactNode; label: string; value: string | number; sub?: string; delay?: number;
}) {
  return (
    <div
      className="glass glass-hover rounded-2xl p-5 animate-fade-in-up group"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-medium text-slate-500 uppercase tracking-widest mb-1">{label}</p>
          <p className="text-2xl font-bold tracking-tight">
            {typeof value === "number" ? <AnimNum value={value} /> : value}
          </p>
          {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
        </div>
        <div className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center text-emerald-400/70 group-hover:text-emerald-400 transition-colors">{icon}</div>
      </div>
    </div>
  );
}

/* ---------- Faction Donut ---------- */
function FactionDonut({ distribution }: { distribution: { "pre-bull": number; neutral: number; realist: number } }) {
  const total = distribution["pre-bull"] + distribution.neutral + distribution.realist;
  const segments = [
    { key: "pre-bull", value: distribution["pre-bull"], color: "#00ff88" },
    { key: "neutral", value: distribution.neutral, color: "#64748b" },
    { key: "realist", value: distribution.realist, color: "#f43f5e" },
  ];

  let offset = 0;
  const circumference = 2 * Math.PI * 40;

  return (
    <div className="flex items-center gap-6">
      <div className="relative w-24 h-24 flex-shrink-0">
        <svg viewBox="0 0 100 100" className="transform -rotate-90">
          {segments.map((seg) => {
            const pct = total > 0 ? seg.value / total : 0;
            const dash = pct * circumference;
            const gap = circumference - dash;
            const el = (
              <circle
                key={seg.key}
                cx="50" cy="50" r="40"
                fill="none"
                stroke={seg.color}
                strokeWidth="8"
                strokeDasharray={`${dash} ${gap}`}
                strokeDashoffset={-offset}
                strokeLinecap="round"
                className="transition-all duration-700"
                opacity={0.8}
              />
            );
            offset += dash;
            return el;
          })}
          <circle cx="50" cy="50" r="32" fill="#06060f" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold gradient-text">{total}</span>
        </div>
      </div>
      <div className="space-y-2">
        {segments.map((seg) => (
          <div key={seg.key} className="flex items-center gap-2 text-sm">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: seg.color }} />
            <span className="text-slate-400">{FACTION_CONFIG[seg.key].label}</span>
            <span className="font-mono font-bold text-slate-200">{seg.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Agent Card ---------- */
function AgentCard({ agent, isActive }: { agent: Agent; isActive: boolean }) {
  const isConverted = agent.stage === "S3" || agent.stage === "S4";
  const stageConf = STAGE_CONFIG[agent.stage] || STAGE_CONFIG.S0;
  const factionConf = FACTION_CONFIG[agent.faction] || FACTION_CONFIG.neutral;

  return (
    <div className={`agent-card ${isConverted ? "converted" : ""} rounded-xl p-4 ${isActive ? "ring-1 ring-emerald-500/30" : ""}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${factionConf.bg}`}>
            {(ROLE_ICON[agent.role] || Ic.user)("w-5 h-5")}
          </div>
          <div>
            <p className="font-semibold text-sm leading-tight">{agent.name}</p>
            <p className="text-[11px] text-slate-500 font-mono">{agent.id}</p>
          </div>
        </div>
        <span className={`text-[11px] font-mono px-2 py-0.5 rounded-md border ${stageConf.color} ${stageConf.glow}`}>
          {agent.stage}
        </span>
      </div>

      {/* Stance bar */}
      <div className="mb-3">
        <div className="flex justify-between text-[10px] text-slate-600 mb-1">
          <span>熊市 -1</span>
          <span className={`font-mono font-bold ${agent.beliefStance > 0 ? "text-emerald-400" : agent.beliefStance < 0 ? "text-rose-400" : "text-slate-400"}`}>
            {agent.beliefStance > 0 ? "+" : ""}{agent.beliefStance.toFixed(2)}
          </span>
          <span>牛市 +1</span>
        </div>
        <div className="stance-bar">
          <div className="stance-marker" style={{ left: `${stancePercent(agent.beliefStance)}%` }} />
        </div>
      </div>

      <div className="flex items-center justify-between text-xs">
        <span className={`flex items-center gap-1 ${factionConf.color}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${factionConf.dot}`} />
          {factionConf.label}
        </span>
        <div className="flex gap-3 text-slate-500 font-mono">
          {agent.pbtBalance > 0 && (
            <span className="text-amber-400/80">{agent.pbtBalance.toLocaleString()} PBT</span>
          )}
          {agent.promotionCount > 0 && (
            <span className="flex items-center gap-0.5">{Ic.megaphone("w-3 h-3")}×{agent.promotionCount}</span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- Strategy Stats ---------- */
function StrategyStats({ debates }: { debates: DebateRecord[] }) {
  const strategies = ["logical", "emotional", "social_proof", "miracle"] as const;
  const stats = strategies.map((s) => {
    const used = debates.filter((d) => d.strategy === s);
    const ok = used.filter((d) => d.converted).length;
    return { key: s, total: used.length, ok, rate: used.length > 0 ? ok / used.length : 0 };
  });

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((s, i) => {
        const conf = STRATEGY_CONFIG[s.key];
        return (
          <div
            key={s.key}
            className="glass rounded-xl p-4 animate-fade-in-up"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="w-5 h-5">{conf.icon("w-5 h-5")}</span>
              <span className="text-sm font-medium">{conf.label}</span>
            </div>
            <div className="progress-bar h-1.5 bg-white/5 mb-2">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${Math.max(s.rate * 100, s.total > 0 ? 4 : 0)}%`,
                  background: `linear-gradient(90deg, ${
                    s.key === "logical" ? "#3b82f6" :
                    s.key === "emotional" ? "#f43f5e" :
                    s.key === "social_proof" ? "#f59e0b" : "#8b5cf6"
                  }, transparent)`,
                }}
              />
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">{s.ok}/{s.total} 成功</span>
              <span className="font-mono font-bold text-slate-300">{Math.round(s.rate * 100)}%</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ---------- Debate Card ---------- */
function DebateCard({ debate, agents, expanded, onToggle }: {
  debate: DebateRecord; agents: Agent[]; expanded: boolean; onToggle: () => void;
}) {
  const prophet = agents.find((a) => a.id === debate.prophetId);
  const target = agents.find((a) => a.id === debate.targetId);
  const stratConf = STRATEGY_CONFIG[debate.strategy] || STRATEGY_CONFIG.logical;

  return (
    <div
      className={`glass rounded-2xl overflow-hidden transition-all duration-300 animate-fade-in-up ${
        debate.converted ? "animate-border-glow glow-green" : ""
      }`}
    >
      {/* Header — always visible */}
      <button onClick={onToggle} className="w-full text-left p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-sm font-mono font-bold text-slate-400">
            {debate.round}
          </div>
          <div>
            <div className="flex items-center gap-2 text-sm">
              <span className="font-semibold">{prophet?.name}</span>
              <span className="text-slate-600">vs</span>
              <span className="font-semibold">{target?.name}</span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`text-[11px] px-1.5 py-0.5 rounded border inline-flex items-center gap-1 ${stratConf.color}`}>
                {stratConf.icon("w-3.5 h-3.5")} {stratConf.label}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {debate.investAction && (
            <span className="text-[11px] text-amber-400/80 font-mono">+{debate.investAction.amount.toLocaleString()} PBT</span>
          )}
          <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm ${
            debate.converted ? "bg-emerald-500/15 text-emerald-400" : "bg-white/5 text-slate-500"
          }`}>
            {debate.converted ? "✓" : "✗"}
          </span>
          <svg
            className={`w-4 h-4 text-slate-500 transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-white/5">
          {/* Dialogue */}
          <div className="p-4 space-y-3">
            {debate.dialogues.map((d, i) => {
              const isProphet = d.speaker === prophet?.name;
              return (
                <div key={i} className={`flex ${isProphet ? "justify-start" : "justify-end"} animate-fade-in-up`}
                  style={{ animationDelay: `${i * 100}ms` }}>
                  <div className={`max-w-[80%] px-4 py-3 ${isProphet ? "bubble-prophet" : "bubble-target"}`}>
                    <div className={`text-[11px] font-semibold mb-1.5 flex items-center gap-1 ${isProphet ? "text-emerald-400/80" : "text-slate-500"}`}>
                      <span className="w-3.5 h-3.5">{isProphet ? Ic.flame("w-3.5 h-3.5") : Ic.chat("w-3.5 h-3.5")}</span> {d.speaker}
                    </div>
                    <p className="text-[13px] leading-relaxed text-slate-200">{d.text}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Result footer */}
          <div className="px-4 pb-4">
            <div className="rounded-xl bg-white/[0.02] border border-white/5 p-3 flex flex-wrap gap-x-5 gap-y-1.5 text-[11px] text-slate-500">
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 text-emerald-500">{Ic.trendUp("w-3.5 h-3.5")}</span>
                <span>立场</span>
                <span className="font-mono text-slate-300">{debate.stanceChange.before.toFixed(2)}</span>
                <span className="text-slate-600">→</span>
                <span className={`font-mono font-bold ${debate.stanceChange.after > debate.stanceChange.before ? "text-emerald-400" : "text-slate-400"}`}>
                  {debate.stanceChange.after.toFixed(2)}
                </span>
                {debate.stanceChange.after !== debate.stanceChange.before && (
                  <span className={debate.stanceChange.after > debate.stanceChange.before ? "text-emerald-500" : "text-rose-500"}>
                    ({debate.stanceChange.after > debate.stanceChange.before ? "↑" : "↓"}
                    {Math.abs(debate.stanceChange.after - debate.stanceChange.before).toFixed(2)})
                  </span>
                )}
              </div>
              {debate.investAction && (
                <>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 text-amber-400">{Ic.coins("w-3.5 h-3.5")}</span>
                    <span className="text-amber-400 font-mono">{debate.investAction.amount.toLocaleString()} PBT</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 text-slate-500">{Ic.fileText("w-3.5 h-3.5")}</span>
                    <span className="font-mono text-slate-400">{truncHash(debate.investAction.mintTxHash)}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== Main Page ====================

export default function Home() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [debates, setDebates] = useState<DebateRecord[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedDebate, setExpandedDebate] = useState<number | null>(null);
  const [latestTarget, setLatestTarget] = useState<string | null>(null);

  const apiCall = useCallback(
    async (path: string, method: "GET" | "POST" = "GET") => {
      const res = await fetch(`${API_BASE}${path}`, { method, headers: { "Content-Type": "application/json" } });
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      return res.json();
    }, []
  );

  const handleStart = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const data = await apiCall("/api/start", "POST");
      setAgents(data.agents); setMetrics(data.metrics);
      setDebates([]); setStarted(true); setExpandedDebate(null); setLatestTarget(null);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }, [apiCall]);

  const handleRound = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const data = await apiCall("/api/round", "POST");
      setAgents(data.agents); setMetrics(data.metrics);
      if (data.debate) {
        setDebates((prev) => [data.debate, ...prev]);
        setExpandedDebate(data.debate.round);
        setLatestTarget(data.debate.targetId);
        setTimeout(() => setLatestTarget(null), 2000);
      }
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }, [apiCall]);

  // ==================== Landing ====================

  if (!started) {
    return (
      <div className="min-h-screen flex items-center justify-center relative">
        <Background />

        {/* Decorative orbiting dots */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative w-[350px] h-[350px]">
            <div className="absolute inset-0 rounded-full border border-white/[0.04]" />
            <div className="absolute inset-[-50px] rounded-full border border-white/[0.025]" />
            <div className="absolute inset-[-100px] rounded-full border border-white/[0.015]" />
            <div className="animate-orbit">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/50 shadow-[0_0_12px_rgba(0,255,136,0.4)]" />
            </div>
            <div className="animate-orbit-2">
              <div className="w-2 h-2 rounded-full bg-violet-400/40 shadow-[0_0_8px_rgba(168,85,247,0.3)]" />
            </div>
            <div className="animate-orbit-3">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400/40 shadow-[0_0_8px_rgba(6,182,212,0.3)]" />
            </div>
          </div>
        </div>

        <div className="text-center max-w-md relative z-10 animate-fade-in-up">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/10 border border-emerald-500/10 flex items-center justify-center animate-float text-emerald-400">
            {Ic.church("w-10 h-10")}
          </div>

          <h1 className="text-4xl font-bold mb-2 gradient-text">牛市预演教</h1>
          <p className="text-base text-slate-400 mb-1 font-medium tracking-wide">Pre-Bull Simulation Church</p>
          <p className="text-sm text-slate-600 mb-10 leading-relaxed">
            AI Agent 叙事说服实验<br/>
            <span className="text-slate-500">观察信念如何在辩论中传播与扩散</span>
          </p>

          <button
            onClick={handleStart}
            disabled={loading}
            className="btn-primary px-10 py-3.5 rounded-xl text-base font-bold relative z-10"
          >
            <span className="relative z-10 flex items-center gap-2">
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  初始化中...
                </>
              ) : (
                <>
                  {Ic.rocket("w-5 h-5")} 开始实验
                </>
              )}
            </span>
          </button>

          {error && <p className="text-rose-400 text-sm mt-4">{error}</p>}

          <div className="mt-12 flex items-center justify-center gap-6 text-[11px] text-slate-600">
            <span className="flex items-center gap-1">{Ic.network("w-3.5 h-3.5 text-slate-500")} 6 AI Agents</span>
            <span className="w-1 h-1 rounded-full bg-slate-700" />
            <span className="flex items-center gap-1">{Ic.brain("w-3.5 h-3.5 text-slate-500")} 4 Strategies</span>
            <span className="w-1 h-1 rounded-full bg-slate-700" />
            <span className="flex items-center gap-1">{Ic.zap("w-3.5 h-3.5 text-slate-500")} Monad Testnet</span>
          </div>

          <p className="text-[10px] text-slate-700 mt-6 flex items-center justify-center gap-1">
            {Ic.alert("w-3 h-3 text-slate-600")} Simulation · Fiction · Not Financial Advice
          </p>
        </div>
      </div>
    );
  }

  // ==================== Dashboard ====================

  const convRate = metrics ? Math.round((metrics.convertedCount / metrics.totalAgents) * 100) : 0;

  return (
    <div className="min-h-screen">
      <Background />

      {/* ===== Top Bar ===== */}
      <header className="sticky top-0 z-40 border-b border-white/5 bg-[#06060f]/80 backdrop-blur-xl">
        <div className="max-w-[1400px] mx-auto px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 flex items-center justify-center text-emerald-400">{Ic.church("w-4.5 h-4.5")}</div>
            <div>
              <h1 className="text-sm font-bold leading-tight">牛市预演教</h1>
              <p className="text-[10px] text-slate-600 leading-tight">Pre-Bull Simulation Church</p>
            </div>
            {metrics && (
              <div className="hidden md:flex items-center gap-1 ml-4 px-2.5 py-1 rounded-full bg-white/[0.03] border border-white/5 text-[11px] text-slate-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Round {metrics.rounds}
                <span className="text-slate-600 mx-1">·</span>
                {metrics.convertedCount}/{metrics.totalAgents} converted
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRound}
              disabled={loading}
              className="btn-primary px-5 py-2 rounded-lg text-sm font-semibold"
            >
              <span className="relative z-10 flex items-center gap-2">
                {loading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span className="hidden sm:inline">辩论中...</span>
                  </>
                ) : (
                  <>{Ic.zap("w-4 h-4")} 下一轮</>
                )}
              </span>
            </button>
            <button
              onClick={handleStart}
              disabled={loading}
              className="px-3 py-2 rounded-lg text-xs text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-all"
            >
              重置
            </button>
          </div>
        </div>
      </header>

      {error && (
        <div className="max-w-[1400px] mx-auto px-5 mt-3">
          <div className="p-3 rounded-xl bg-rose-500/5 border border-rose-500/15 text-rose-400 text-xs flex items-center gap-2">
            <span className="w-4 h-4 flex-shrink-0">{Ic.alert("w-4 h-4")}</span> {error}
            <button onClick={() => setError(null)} className="ml-auto text-rose-500 hover:text-rose-300">✕</button>
          </div>
        </div>
      )}

      <main className="max-w-[1400px] mx-auto px-5 py-6 space-y-6">
        {/* ===== Stats Row ===== */}
        {metrics && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <StatCard icon={Ic.network("w-5 h-5")} label="Agents" value={metrics.totalAgents} delay={0} />
            <StatCard icon={Ic.check("w-5 h-5")} label="已转化" value={metrics.convertedCount} sub={`${convRate}% 转化率`} delay={50} />
            <StatCard icon={Ic.coins("w-5 h-5")} label="总投资" value={metrics.totalInvested} sub="PBT" delay={100} />
            <StatCard icon={Ic.megaphone("w-5 h-5")} label="推广次数" value={metrics.totalPromotions} delay={150} />
            <StatCard icon={Ic.church("w-5 h-5")} label="主流教派" value={FACTION_CONFIG[metrics.mainFaction]?.label || metrics.mainFaction} delay={200} />
            <StatCard icon={Ic.refresh("w-5 h-5")} label="回合数" value={metrics.rounds} delay={250} />
          </div>
        )}

        {/* ===== Strategy Stats ===== */}
        {debates.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">策略效果分析</h2>
            <StrategyStats debates={debates} />
          </section>
        )}

        {/* ===== Main Grid ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Agents + Donut */}
          <div className="lg:col-span-7 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Agent 网络</h2>
              {metrics && (
                <div className="flex gap-3">
                  {(["pre-bull", "neutral", "realist"] as const).map((f) => (
                    <span key={f} className="flex items-center gap-1.5 text-[11px] text-slate-500">
                      <span className={`w-2 h-2 rounded-full ${FACTION_CONFIG[f].dot}`} />
                      {FACTION_CONFIG[f].label} {metrics.factionDistribution[f]}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {agents.map((agent) => (
                <AgentCard key={agent.id} agent={agent} isActive={latestTarget === agent.id} />
              ))}
            </div>

            {/* Donut */}
            {metrics && (
              <div className="glass rounded-2xl p-5">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">教派分布</h3>
                <FactionDonut distribution={metrics.factionDistribution} />
              </div>
            )}
          </div>

          {/* Right: Debate Arena */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">{Ic.swords("w-4 h-4 text-slate-400")} Debate Arena</h2>
              {debates.length > 0 && (
                <span className="text-[11px] text-slate-600">{debates.length} debates</span>
              )}
            </div>

            <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto pr-1">
              {debates.length === 0 ? (
                <div className="glass rounded-2xl p-12 text-center">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-white/[0.03] flex items-center justify-center animate-float text-emerald-400">
                    {Ic.zap("w-7 h-7")}
                  </div>
                  <p className="text-sm text-slate-400">点击 <span className="text-emerald-400 font-medium">下一轮</span> 开始辩论</p>
                  <p className="text-[11px] text-slate-600 mt-1">先知以利亚将自动选择目标并发起说服</p>
                </div>
              ) : (
                debates.map((debate) => (
                  <DebateCard
                    key={debate.round}
                    debate={debate}
                    agents={agents}
                    expanded={expandedDebate === debate.round}
                    onToggle={() => setExpandedDebate(expandedDebate === debate.round ? null : debate.round)}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      {/* ===== Footer ===== */}
      <footer className="border-t border-white/[0.03] mt-8">
        <div className="max-w-[1400px] mx-auto px-5 py-4 flex items-center justify-between text-[10px] text-slate-700">
          <span className="flex items-center gap-1">{Ic.alert("w-3 h-3")} Simulation · Fiction · Not Financial Advice</span>
          <span className="flex items-center gap-1">{Ic.church("w-3 h-3")} 牛市预演教 — Built on Monad Testnet</span>
        </div>
      </footer>
    </div>
  );
}
