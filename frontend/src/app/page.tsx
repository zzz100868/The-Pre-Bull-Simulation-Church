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
  book: (c = "w-5 h-5") => <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" fill="currentColor" fillOpacity=".05"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
  newspaper: (c = "w-5 h-5") => <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" fill="currentColor" fillOpacity=".04"/><path d="M18 14h-8M15 18h-5M10 6h8v4h-8z"/></svg>,
  trophy: (c = "w-5 h-5") => <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18" fill="currentColor" fillOpacity=".06"/><path d="M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20 17 22M18 2H6v7a6 6 0 0 0 12 0V2z" fill="currentColor" fillOpacity=".04"/></svg>,
  shield: (c = "w-5 h-5") => <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="currentColor" fillOpacity=".06"/></svg>,
  link: (c = "w-5 h-5") => <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>,
  trendDown: (c = "w-5 h-5") => <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m22 17-8.5-8.5-5 5L2 7"/><path d="M16 17h6v-6"/></svg>,
  ghost: (c = "w-5 h-5") => <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 10h.01M15 10h.01M12 2a8 8 0 0 0-8 8v12l3-3 2 2 3-3 3 3 2-2 3 3V10a8 8 0 0 0-8-8z" fill="currentColor" fillOpacity=".06"/></svg>,
};

/* ---------- Starfield Canvas Background ---------- */
function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let W = 0, H = 0;
    const resize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);

    // Mouse parallax
    let mouseX = 0.5, mouseY = 0.5;
    const onMouse = (e: MouseEvent) => { mouseX = e.clientX / W; mouseY = e.clientY / H; };
    window.addEventListener("mousemove", onMouse);

    // 3-layer star system: far(slow), mid, near(fast)
    interface Star { x: number; y: number; r: number; baseA: number; twinkleSpeed: number; color: string; layer: number; driftX: number; driftY: number; }
    const stars: Star[] = [];
    const colors = ["rgba(255,255,255,", "rgba(200,220,255,", "rgba(255,240,220,", "rgba(180,200,255,", "rgba(220,200,255,"];
    const layerSpeeds = [0.08, 0.2, 0.45]; // px/frame drift speed per layer
    const layerParallax = [0.005, 0.015, 0.035]; // mouse parallax factor per layer

    for (let i = 0; i < 320; i++) {
      const layer = i < 180 ? 0 : i < 270 ? 1 : 2; // 180 far, 90 mid, 50 near
      const r = layer === 0 ? 0.3 + Math.random() * 0.6 : layer === 1 ? 0.5 + Math.random() * 1 : 1 + Math.random() * 1.8;
      // Random drift direction
      const angle = Math.random() * Math.PI * 2;
      const speed = layerSpeeds[layer] * (0.5 + Math.random() * 1);
      stars.push({
        x: Math.random() * W, y: Math.random() * H, r,
        baseA: layer === 0 ? 0.2 + Math.random() * 0.4 : layer === 1 ? 0.4 + Math.random() * 0.5 : 0.6 + Math.random() * 0.4,
        twinkleSpeed: 0.3 + Math.random() * 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        layer,
        driftX: Math.cos(angle) * speed,
        driftY: Math.sin(angle) * speed,
      });
    }

    // Shooting stars
    let shootingStar: { x: number; y: number; len: number; speed: number; angle: number; life: number; maxLife: number } | null = null;
    let shootTimer = 0;

    let animId: number;
    const draw = (time: number) => {
      ctx.clearRect(0, 0, W, H);

      // Update & draw stars
      for (const s of stars) {
        // Drift movement
        s.x += s.driftX;
        s.y += s.driftY;
        // Wrap around edges with padding
        if (s.x < -10) s.x = W + 10;
        if (s.x > W + 10) s.x = -10;
        if (s.y < -10) s.y = H + 10;
        if (s.y > H + 10) s.y = -10;

        // Mouse parallax offset
        const px = (mouseX - 0.5) * W * layerParallax[s.layer];
        const py = (mouseY - 0.5) * H * layerParallax[s.layer];
        const dx = s.x + px;
        const dy = s.y + py;

        // Twinkle
        const twinkle = Math.sin(time * 0.001 * s.twinkleSpeed + s.x * 0.01) * 0.35 + 0.65;
        const alpha = s.baseA * twinkle;

        ctx.beginPath();
        ctx.arc(dx, dy, s.r, 0, Math.PI * 2);
        ctx.fillStyle = s.color + alpha.toFixed(2) + ")";
        ctx.fill();

        // Large star cross-glow
        if (s.r > 1.5) {
          const glowR = s.r * 4;
          const g = ctx.createRadialGradient(dx, dy, 0, dx, dy, glowR);
          g.addColorStop(0, s.color + (alpha * 0.25).toFixed(2) + ")");
          g.addColorStop(0.5, s.color + (alpha * 0.08).toFixed(2) + ")");
          g.addColorStop(1, s.color + "0)");
          ctx.beginPath();
          ctx.arc(dx, dy, glowR, 0, Math.PI * 2);
          ctx.fillStyle = g;
          ctx.fill();
          // Diffraction spikes for brightest stars
          if (s.r > 2.2) {
            ctx.save();
            ctx.globalAlpha = alpha * 0.3;
            ctx.strokeStyle = s.color + "0.5)";
            ctx.lineWidth = 0.5;
            const spikeLen = s.r * 8;
            for (let a = 0; a < 4; a++) {
              const sa = a * Math.PI / 4 + time * 0.0001;
              ctx.beginPath();
              ctx.moveTo(dx - Math.cos(sa) * spikeLen, dy - Math.sin(sa) * spikeLen);
              ctx.lineTo(dx + Math.cos(sa) * spikeLen, dy + Math.sin(sa) * spikeLen);
              ctx.stroke();
            }
            ctx.restore();
          }
        }
      }

      // Shooting star
      shootTimer++;
      if (!shootingStar && shootTimer > 200 && Math.random() < 0.012) {
        shootTimer = 0;
        const angle = Math.PI * 0.12 + Math.random() * Math.PI * 0.25;
        shootingStar = {
          x: Math.random() * W * 0.8,
          y: Math.random() * H * 0.35,
          len: 80 + Math.random() * 100,
          speed: 8 + Math.random() * 6,
          angle, life: 0, maxLife: 35 + Math.random() * 30,
        };
      }
      if (shootingStar) {
        const ss = shootingStar;
        ss.x += Math.cos(ss.angle) * ss.speed;
        ss.y += Math.sin(ss.angle) * ss.speed;
        ss.life++;
        const progress = ss.life / ss.maxLife;
        const fadeAlpha = progress < 0.2 ? progress / 0.2 : 1 - (progress - 0.2) / 0.8;
        const endX = ss.x - Math.cos(ss.angle) * ss.len;
        const endY = ss.y - Math.sin(ss.angle) * ss.len;
        const grad = ctx.createLinearGradient(ss.x, ss.y, endX, endY);
        grad.addColorStop(0, `rgba(255,255,255,${(fadeAlpha * 0.95).toFixed(2)})`);
        grad.addColorStop(0.3, `rgba(200,220,255,${(fadeAlpha * 0.5).toFixed(2)})`);
        grad.addColorStop(1, "rgba(200,220,255,0)");
        ctx.beginPath();
        ctx.moveTo(ss.x, ss.y);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.8;
        ctx.stroke();
        // Head glow
        ctx.beginPath();
        ctx.arc(ss.x, ss.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${(fadeAlpha * 0.8).toFixed(2)})`;
        ctx.fill();
        if (ss.life >= ss.maxLife) shootingStar = null;
      }
      animId = requestAnimationFrame(draw);
    };
    animId = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); window.removeEventListener("mousemove", onMouse); };
  }, []);
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none" style={{ zIndex: -1 }} />;
}

function Background() {
  return (
    <>
      <Starfield />
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: -2 }}>
        <div className="bg-orb bg-orb-1" />
        <div className="bg-orb bg-orb-2" />
        <div className="bg-orb bg-orb-3" />
        <div className="bg-orb bg-orb-4" />
        <div className="bg-orb bg-orb-5" />
      </div>
    </>
  );
}

// ==================== Types ====================

interface Agent {
  id: string; name: string; role: string; beliefStance: number;
  riskTolerance: number; conformityBias: number; stage: string;
  faction: string; pbtBalance: number; investedAmount: number;
  promotionCount: number;
  spiritValue: number; narrativeBias: number; voteWeight: number;
  missionaryCount: number; allianceId: string | null;
  taskRewards: number; apostasyCount: number;
}

interface Dialogue { speaker: string; text: string; }
interface InvestAction { amount: number; mintTxHash: string; eventTxHash: string; }

interface DebateRecord {
  round: number; prophetId: string; targetId: string; strategy: string;
  secondaryStrategy?: string; dialogues: Dialogue[]; converted: boolean;
  apostasized: boolean; stanceChange: { before: number; after: number };
  investAction: InvestAction | null; debatePhases: string[];
  historicalCase?: string; counterArguments?: string[];
  factionDebate?: boolean; isMissionary?: boolean;
}

interface NewsItem {
  id: number; headline: string; content: string; timestamp: number;
  round: number; sentiment: "bullish" | "bearish" | "neutral";
}

interface Scripture {
  id: number; title: string; content: string; author: string;
  round: number; timestamp: number;
}

interface Alliance {
  id: string; name: string; members: string[]; faction: string;
  strength: number; createdRound: number;
}

interface ExperimentConclusion {
  status: "ongoing" | "bull_wins" | "failed" | "stalemate";
  message: string; conversionRate: number; totalRounds: number;
  spiritMarketCap: number; narrativeDominance: number; canFalsify: boolean;
}

interface Metrics {
  totalAgents: number; convertedCount: number; totalInvested: number;
  totalPromotions: number; mainFaction: string;
  factionDistribution: { "pre-bull": number; neutral: number; realist: number; };
  rounds: number; spiritMarketCap: number; realMarketCap: number;
  totalMissionary: number; totalApostasy: number; totalTaskRewards: number;
  allianceCount: number; experimentStatus: string; narrativeDominance: number;
  strategyStats: Record<string, { total: number; success: number; rate: number }>;
}

// ==================== Config ====================

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// ==================== Helpers ====================

const ROLE_ICON: Record<string, (c?: string) => JSX.Element> = {
  prophet: Ic.flame, skeptic: Ic.question, neutral: Ic.user, realist: Ic.chart,
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

const CONCLUSION_COLORS: Record<string, string> = {
  ongoing: "border-blue-500/20 bg-blue-500/5 text-blue-300",
  bull_wins: "border-emerald-500/20 bg-emerald-500/5 text-emerald-300",
  failed: "border-rose-500/20 bg-rose-500/5 text-rose-300",
  stalemate: "border-amber-500/20 bg-amber-500/5 text-amber-300",
};

function truncHash(h: string): string {
  if (!h || h.length < 14) return h;
  return h.slice(0, 6) + "···" + h.slice(-4);
}

function stancePercent(stance: number): number {
  return ((stance + 1) / 2) * 100;
}

// ==================== Components ====================

function AnimNum({ value, prefix = "", suffix = "" }: { value: number; prefix?: string; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  const prev = useRef(0);
  useEffect(() => {
    const from = prev.current; const to = value; prev.current = value;
    if (from === to) { setDisplay(to); return; }
    const dur = 600; const start = performance.now();
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

function StatCard({ icon, label, value, sub, delay = 0, accent = "emerald" }: {
  icon: React.ReactNode; label: string; value: string | number; sub?: string; delay?: number; accent?: string;
}) {
  const accentMap: Record<string, { text: string; hoverText: string; bg: string; border: string; glow: string }> = {
    emerald: { text: "text-emerald-400/70", hoverText: "group-hover:text-emerald-400", bg: "bg-emerald-500/8", border: "hover:border-emerald-500/20", glow: "hover:shadow-[0_0_20px_rgba(0,255,136,0.08)]" },
    blue:    { text: "text-blue-400/70",    hoverText: "group-hover:text-blue-400",    bg: "bg-blue-500/8",    border: "hover:border-blue-500/20",    glow: "hover:shadow-[0_0_20px_rgba(59,130,246,0.08)]" },
    amber:   { text: "text-amber-400/70",   hoverText: "group-hover:text-amber-400",   bg: "bg-amber-500/8",   border: "hover:border-amber-500/20",   glow: "hover:shadow-[0_0_20px_rgba(245,158,11,0.08)]" },
    violet:  { text: "text-violet-400/70",  hoverText: "group-hover:text-violet-400",  bg: "bg-violet-500/8",  border: "hover:border-violet-500/20",  glow: "hover:shadow-[0_0_20px_rgba(139,92,246,0.08)]" },
    cyan:    { text: "text-cyan-400/70",    hoverText: "group-hover:text-cyan-400",    bg: "bg-cyan-500/8",    border: "hover:border-cyan-500/20",    glow: "hover:shadow-[0_0_20px_rgba(6,182,212,0.08)]" },
    rose:    { text: "text-rose-400/70",    hoverText: "group-hover:text-rose-400",    bg: "bg-rose-500/8",    border: "hover:border-rose-500/20",    glow: "hover:shadow-[0_0_20px_rgba(244,63,94,0.08)]" },
    indigo:  { text: "text-indigo-400/70",  hoverText: "group-hover:text-indigo-400",  bg: "bg-indigo-500/8",  border: "hover:border-indigo-500/20",  glow: "hover:shadow-[0_0_20px_rgba(99,102,241,0.08)]" },
    slate:   { text: "text-slate-400/70",   hoverText: "group-hover:text-slate-300",   bg: "bg-slate-500/8",   border: "hover:border-slate-400/20",   glow: "hover:shadow-[0_0_20px_rgba(148,163,184,0.06)]" },
  };
  const a = accentMap[accent] || accentMap.emerald;
  return (
    <div className={`glass rounded-2xl p-5 animate-fade-in-up group transition-all duration-300 ${a.border} ${a.glow}`} style={{ animationDelay: `${delay}ms` }}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-medium text-slate-500 uppercase tracking-widest mb-1">{label}</p>
          <p className="text-2xl font-bold tracking-tight">
            {typeof value === "number" ? <AnimNum value={value} /> : value}
          </p>
          {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
        </div>
        <div className={`w-9 h-9 rounded-xl ${a.bg} flex items-center justify-center ${a.text} ${a.hoverText} transition-colors`}>{icon}</div>
      </div>
    </div>
  );
}

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
              <circle key={seg.key} cx="50" cy="50" r="40" fill="none" stroke={seg.color}
                strokeWidth="8" strokeDasharray={`${dash} ${gap}`} strokeDashoffset={-offset}
                strokeLinecap="round" className="transition-all duration-700" opacity={0.8} />
            );
            offset += dash; return el;
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
            <span className="text-slate-400">{FACTION_CONFIG[seg.key]?.label}</span>
            <span className="font-mono font-bold text-slate-200">{seg.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- #1 Spirit Market Cap ---------- */
function SpiritMarketCap({ spirit, real }: { spirit: number; real: number }) {
  const ratio = real > 0 ? spirit / real : 0;
  return (
    <div className="glass rounded-2xl p-5 animate-fade-in-up">
      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-1.5">
        {Ic.sparkles("w-4 h-4 text-violet-400")} 精神市值 vs 实际市值
      </h3>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-[11px] text-slate-500">精神市值</p>
          <p className="text-xl font-bold text-violet-400"><AnimNum value={Math.round(spirit)} /></p>
        </div>
        <div>
          <p className="text-[11px] text-slate-500">实际 PBT 总量</p>
          <p className="text-xl font-bold text-amber-400"><AnimNum value={Math.round(real)} /></p>
        </div>
      </div>
      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700"
          style={{ width: `${Math.min(ratio * 100, 100)}%`, background: "linear-gradient(90deg, #a855f7, #06b6d4)" }} />
      </div>
      <p className="text-[10px] text-slate-600 mt-2">精神/实际 比率: {(ratio * 100).toFixed(1)}% — {ratio > 0.8 ? "信仰与价值高度吻合" : ratio > 0.3 ? "叙事正在积累" : "精神价值待提升"}</p>
    </div>
  );
}

/* ---------- #3 Experiment Conclusion ---------- */
function ConclusionBanner({ conclusion }: { conclusion: ExperimentConclusion }) {
  const color = CONCLUSION_COLORS[conclusion.status] || CONCLUSION_COLORS.ongoing;
  return (
    <div className={`rounded-2xl border p-4 ${color} animate-fade-in-up`}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
          {conclusion.status === "bull_wins" ? Ic.trophy("w-5 h-5") :
           conclusion.status === "failed" ? Ic.trendDown("w-5 h-5") :
           conclusion.status === "stalemate" ? Ic.shield("w-5 h-5") : Ic.zap("w-5 h-5")}
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold">{conclusion.message}</p>
          <div className="flex gap-4 mt-1 text-[11px] opacity-70">
            <span>转化率 {Math.round(conclusion.conversionRate * 100)}%</span>
            <span>叙事主导力 {Math.round(conclusion.narrativeDominance * 100)}%</span>
            {conclusion.canFalsify && <span className="text-rose-400">可证伪</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- #4 Narrative Bias ---------- */
function NarrativeBiasDisplay({ agents }: { agents: Agent[] }) {
  return (
    <div className="glass rounded-2xl p-5 animate-fade-in-up">
      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-1.5">
        {Ic.chart("w-4 h-4 text-cyan-400")} 叙事偏差记录
      </h3>
      <div className="space-y-2">
        {agents.map((a) => (
          <div key={a.id} className="flex items-center gap-2">
            <span className="text-xs w-12 text-slate-400 truncate">{a.name}</span>
            <div className="flex-1 h-3 bg-white/5 rounded-full relative overflow-hidden">
              <div className="absolute inset-y-0 left-1/2 w-px bg-white/10" />
              <div className="absolute inset-y-0 rounded-full transition-all duration-500"
                style={{
                  left: a.narrativeBias >= 0 ? "50%" : `${50 + a.narrativeBias * 50}%`,
                  width: `${Math.abs(a.narrativeBias) * 50}%`,
                  background: a.narrativeBias >= 0 ? "#00ff88" : "#f43f5e",
                  opacity: 0.6,
                }} />
            </div>
            <span className={`text-[10px] font-mono w-10 text-right ${a.narrativeBias >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
              {a.narrativeBias > 0 ? "+" : ""}{a.narrativeBias.toFixed(2)}
            </span>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-slate-600 mt-3">偏差 = 个体信仰 - 群体平均信仰。正值表示比群体更乐观。</p>
    </div>
  );
}

/* ---------- #9 Leaderboard ---------- */
function Leaderboard({ agents }: { agents: Agent[] }) {
  const categories = [
    { label: "PBT 持有", key: "pbtBalance", icon: Ic.coins, color: "text-amber-400" },
    { label: "传教次数", key: "missionaryCount", icon: Ic.megaphone, color: "text-emerald-400" },
    { label: "信仰指数", key: "beliefStance", icon: Ic.flame, color: "text-violet-400" },
    { label: "任务奖励", key: "taskRewards", icon: Ic.sparkles, color: "text-cyan-400" },
  ];
  return (
    <div className="glass rounded-2xl p-5 animate-fade-in-up">
      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-1.5">
        {Ic.trophy("w-4 h-4 text-amber-400")} 行为榜单
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {categories.map((cat) => {
          const sorted = [...agents].sort((a, b) =>
            (b as any)[cat.key] - (a as any)[cat.key]
          );
          const top = sorted[0];
          return (
            <div key={cat.key} className="bg-white/[0.02] rounded-xl p-3 border border-white/5">
              <div className="flex items-center gap-1.5 mb-2">
                <span className={cat.color}>{cat.icon("w-3.5 h-3.5")}</span>
                <span className="text-[11px] text-slate-400">{cat.label}</span>
              </div>
              {sorted.slice(0, 3).map((a, i) => (
                <div key={a.id} className="flex items-center gap-1.5 text-[11px] mb-0.5">
                  <span className={`w-4 font-mono ${i === 0 ? "text-amber-400" : "text-slate-600"}`}>{i + 1}</span>
                  <span className="text-slate-300 flex-1 truncate">{a.name}</span>
                  <span className="font-mono text-slate-400">
                    {typeof (a as any)[cat.key] === "number" && Math.abs((a as any)[cat.key]) < 10
                      ? (a as any)[cat.key].toFixed(2)
                      : Math.round((a as any)[cat.key]).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- #10 News Ticker ---------- */
function NewsTicker({ news }: { news: NewsItem[] }) {
  if (news.length === 0) return null;
  const sentColors = { bullish: "text-emerald-400 bg-emerald-500/10", bearish: "text-rose-400 bg-rose-500/10", neutral: "text-slate-400 bg-slate-500/10" };
  return (
    <div className="glass rounded-2xl p-5 animate-fade-in-up">
      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
        {Ic.newspaper("w-4 h-4 text-cyan-400")} 未来新闻
      </h3>
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {news.map((n) => (
          <div key={n.id} className="bg-white/[0.02] rounded-lg border border-white/5 p-3">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[10px] px-1.5 py-0.5 rounded ${sentColors[n.sentiment]}`}>
                {n.sentiment === "bullish" ? "看多" : n.sentiment === "bearish" ? "看空" : "中性"}
              </span>
              <span className="text-[10px] text-slate-600">R{n.round}</span>
            </div>
            <p className="text-sm font-semibold text-slate-200">{n.headline}</p>
            <p className="text-[11px] text-slate-500 mt-1">{n.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- #18 Scripture Display ---------- */
function ScriptureDisplay({ scriptures, onGenerate }: { scriptures: Scripture[]; onGenerate?: () => void }) {
  return (
    <div className="glass rounded-2xl p-5 animate-fade-in-up">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
          {Ic.book("w-4 h-4 text-amber-400")} 教会经文
        </h3>
        {onGenerate && (
          <button onClick={onGenerate} className="text-[10px] px-2 py-1 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-colors border border-amber-500/20">
            ✦ 生成经文
          </button>
        )}
      </div>
      {scriptures.length === 0 && <p className="text-[11px] text-slate-600 text-center py-4">暂无经文 — 点击生成或继续辩论</p>}
      <div className="space-y-3 max-h-48 overflow-y-auto">
        {scriptures.map((s) => (
          <div key={s.id} className="bg-white/[0.02] rounded-lg border border-amber-500/10 p-3">
            <p className="text-xs font-semibold text-amber-300 mb-1">{s.title}</p>
            <p className="text-[12px] text-slate-300 leading-relaxed italic">&ldquo;{s.content}&rdquo;</p>
            <p className="text-[10px] text-slate-600 mt-1.5">— {s.author} · R{s.round}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- #16 Alliance Display ---------- */
function AllianceDisplay({ alliances, agents }: { alliances: Alliance[]; agents: Agent[] }) {
  if (alliances.length === 0) return null;
  return (
    <div className="glass rounded-2xl p-5 animate-fade-in-up">
      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
        {Ic.link("w-4 h-4 text-violet-400")} 联盟
      </h3>
      <div className="space-y-2">
        {alliances.map((a) => (
          <div key={a.id} className="bg-white/[0.02] rounded-lg border border-white/5 p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-semibold text-slate-200">{a.name}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded ${FACTION_CONFIG[a.faction]?.bg} ${FACTION_CONFIG[a.faction]?.color}`}>
                {FACTION_CONFIG[a.faction]?.label}
              </span>
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {a.members.map((id) => {
                const ag = agents.find((x) => x.id === id);
                return (
                  <span key={id} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-slate-400">
                    {ag?.name || id}
                  </span>
                );
              })}
            </div>
            <p className="text-[10px] text-slate-600 mt-1">R{a.createdRound}成立 · 实力 {a.strength}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Agent Card (enhanced) ---------- */
function AgentCard({ agent, isActive, onApostasy }: { agent: Agent; isActive: boolean; onApostasy?: (id: string) => void }) {
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
            <p className="font-semibold text-sm leading-tight flex items-center gap-1">
              {agent.name}
              {agent.missionaryCount > 0 && <span className="text-[9px] px-1 py-0.5 rounded bg-emerald-500/10 text-emerald-400">传教</span>}
              {agent.apostasyCount > 0 && <span className="text-[9px] px-1 py-0.5 rounded bg-rose-500/10 text-rose-400">叛×{agent.apostasyCount}</span>}
            </p>
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
          {agent.pbtBalance > 0 && <span className="text-amber-400/80">{agent.pbtBalance.toLocaleString()} PBT</span>}
          {agent.promotionCount > 0 && <span className="flex items-center gap-0.5">{Ic.megaphone("w-3 h-3")}×{agent.promotionCount}</span>}
        </div>
      </div>

      {/* #6 Token Weight + #5 Task Rewards */}
      {(agent.voteWeight > 0 || agent.taskRewards > 0 || agent.allianceId) && (
        <div className="flex gap-3 mt-2 pt-2 border-t border-white/5 text-[10px] text-slate-500">
          {agent.voteWeight > 0 && <span className="flex items-center gap-1">{Ic.shield("w-3 h-3 text-cyan-400")} 权重 {agent.voteWeight}</span>}
          {agent.taskRewards > 0 && <span className="flex items-center gap-1">{Ic.sparkles("w-3 h-3 text-violet-400")} 任务 +{agent.taskRewards}</span>}
          {agent.allianceId && <span className="flex items-center gap-1">{Ic.link("w-3 h-3 text-violet-400")} 联盟</span>}
        </div>
      )}

      {/* #14 Apostasy - 叛教按钮 (仅已皈依 agent 可用) */}
      {isConverted && onApostasy && (
        <button onClick={() => onApostasy(agent.id)}
          className="w-full mt-2 text-[10px] py-1.5 rounded-lg bg-rose-500/5 text-rose-400/60 hover:bg-rose-500/15 hover:text-rose-400 transition-all border border-rose-500/10 hover:border-rose-500/30">
          ⚡ 触发叛教
        </button>
      )}
    </div>
  );
}

/* ---------- Strategy Stats ---------- */
function StrategyStats({ stats }: { stats: Record<string, { total: number; success: number; rate: number }> }) {
  const strategies = ["logical", "emotional", "social_proof", "miracle"];
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {strategies.map((s, i) => {
        const conf = STRATEGY_CONFIG[s];
        const st = stats[s] || { total: 0, success: 0, rate: 0 };
        return (
          <div key={s} className="glass rounded-xl p-4 animate-fade-in-up" style={{ animationDelay: `${i * 80}ms` }}>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-5 h-5">{conf?.icon("w-5 h-5")}</span>
              <span className="text-sm font-medium">{conf?.label}</span>
            </div>
            <div className="progress-bar h-1.5 bg-white/5 mb-2">
              <div className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${Math.max(st.rate * 100, st.total > 0 ? 4 : 0)}%`,
                  background: `linear-gradient(90deg, ${
                    s === "logical" ? "#3b82f6" : s === "emotional" ? "#f43f5e" :
                    s === "social_proof" ? "#f59e0b" : "#8b5cf6"
                  }, transparent)`,
                }} />
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">{st.success}/{st.total} 成功</span>
              <span className="font-mono font-bold text-slate-300">{Math.round(st.rate * 100)}%</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ---------- Debate Card (enhanced: 5-step, multi-strategy, cases, counter-args) ---------- */
function DebateCard({ debate, agents, expanded, onToggle }: {
  debate: DebateRecord; agents: Agent[]; expanded: boolean; onToggle: () => void;
}) {
  const prophet = agents.find((a) => a.id === debate.prophetId);
  const target = agents.find((a) => a.id === debate.targetId);
  const stratConf = STRATEGY_CONFIG[debate.strategy] || STRATEGY_CONFIG.logical;
  const secStratConf = debate.secondaryStrategy ? STRATEGY_CONFIG[debate.secondaryStrategy] : null;

  return (
    <div className={`glass rounded-2xl overflow-hidden transition-all duration-300 animate-fade-in-up ${
      debate.converted ? "animate-border-glow glow-green" : ""} ${debate.apostasized ? "border-rose-500/20" : ""} ${debate.factionDebate ? "border-violet-500/20" : ""}`}>
      <button onClick={onToggle} className="w-full text-left p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors hard-edge">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-sm font-mono font-bold text-slate-400">
            {debate.round}
          </div>
          <div>
            <div className="flex items-center gap-2 text-sm">
              <span className="font-semibold">{prophet?.name}</span>
              {debate.isMissionary && <span className="pixel-tag">传教士</span>}
              <span className="text-slate-600">vs</span>
              <span className="font-semibold">{target?.name}</span>
              {debate.factionDebate && <span className="pixel-tag">教派辩论</span>}
            </div>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className={`pixel-tag ${stratConf.color}`}>
                {stratConf.icon("w-3.5 h-3.5")} {stratConf.label}
              </span>
              {secStratConf && (
                <span className={`pixel-tag opacity-70 ${secStratConf.color}`}>
                  +{secStratConf.label}
                </span>
              )}
              {debate.historicalCase && (
                <span className="pixel-tag">
                  {debate.historicalCase}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {debate.apostasized && <span className="pixel-tag pixel-tag-danger">{Ic.ghost("w-3 h-3")} 叛教</span>}
          {debate.investAction && <span className="pixel-tag pixel-tag-warn">+{debate.investAction.amount.toLocaleString()} PBT</span>}
          <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm ${
            debate.converted ? "bg-emerald-500/15 text-emerald-400" : "bg-white/5 text-slate-500"
          }`}>
            {debate.converted ? "✓" : "✗"}
          </span>
          <svg className={`w-4 h-4 text-slate-500 transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-white/5">
          {/* #14 Debate Phases */}
          {debate.debatePhases && debate.debatePhases.length > 1 && (
            <div className="px-4 pt-3 flex gap-1 flex-wrap">
              {debate.debatePhases.map((phase, i) => (
                <span key={i} className="pixel-tag">
                  {phase}
                </span>
              ))}
            </div>
          )}

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

          {/* #11 Counter Arguments */}
          {debate.counterArguments && debate.counterArguments.length > 0 && (
            <div className="px-4 pb-2">
              <p className="text-[10px] text-slate-600 mb-1">使用的反驳模板：</p>
              <div className="flex gap-1 flex-wrap">
                {debate.counterArguments.map((c, i) => (
                  <span key={i} className="pixel-tag pixel-tag-danger">{c}</span>
                ))}
              </div>
            </div>
          )}

          {/* Result footer */}
          <div className="px-4 pb-4">
            <div className="hard-edge bg-white/[0.02] border border-white/10 p-3 flex flex-wrap gap-x-5 gap-y-1.5 text-[11px] text-slate-500">
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
  const [news, setNews] = useState<NewsItem[]>([]);
  const [scriptures, setScriptures] = useState<Scripture[]>([]);
  const [alliances, setAlliances] = useState<Alliance[]>([]);
  const [conclusion, setConclusion] = useState<ExperimentConclusion | null>(null);
  const [events, setEvents] = useState<string[]>([]);

  const apiCall = useCallback(
    async (path: string, method: "GET" | "POST" = "GET", body?: any) => {
      const res = await fetch(`${API_BASE}${path}`, {
        method,
        headers: { "Content-Type": "application/json" },
        ...(body ? { body: JSON.stringify(body) } : {}),
      });
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
      setNews([]); setScriptures([]); setAlliances([]);
      setConclusion(data.conclusion); setEvents([]);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }, [apiCall]);

  const handleRound = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const data = await apiCall("/api/round", "POST");
      setAgents(data.agents); setMetrics(data.metrics);
      if (data.debate) {
        setDebates((prev) => {
          const newDebates = [data.debate, ...prev];
          if (data.factionDebate) newDebates.unshift(data.factionDebate);
          return newDebates;
        });
        setExpandedDebate(data.debate.round);
        setLatestTarget(data.debate.targetId);
        setTimeout(() => setLatestTarget(null), 2000);
      }
      if (data.news) setNews(data.news);
      if (data.scriptures) setScriptures(data.scriptures);
      if (data.alliances) setAlliances(data.alliances);
      if (data.conclusion) setConclusion(data.conclusion);
      if (data.events) setEvents(data.events);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }, [apiCall]);

  const handleGenerateScripture = useCallback(async () => {
    try {
      const s = await apiCall("/api/generate-scripture", "POST");
      setScriptures((prev) => [s, ...prev]);
    } catch (e: any) { setError(e.message); }
  }, [apiCall]);

  const handleApostasy = useCallback(async (agentId: string) => {
    try {
      const data = await apiCall("/api/apostasy", "POST", { agentId });
      setAgents((prev) => prev.map((a) => a.id === agentId ? data.agent : a));
      if (data.metrics) setMetrics(data.metrics);
      if (data.conclusion) setConclusion(data.conclusion);
      setEvents((prev) => [data.message, ...prev]);
    } catch (e: any) { setError(e.message); }
  }, [apiCall]);

  // ==================== Landing ====================

  if (!started) {
    return (
      <div className="min-h-screen flex items-center justify-center relative">
        <Background />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative w-[350px] h-[350px]">
            <div className="absolute inset-0 rounded-full border border-white/[0.04]" />
            <div className="absolute inset-[-50px] rounded-full border border-white/[0.025]" />
            <div className="absolute inset-[-100px] rounded-full border border-white/[0.015]" />
            <div className="animate-orbit"><div className="w-2.5 h-2.5 rounded-full bg-emerald-400/50 shadow-[0_0_12px_rgba(0,255,136,0.4)]" /></div>
            <div className="animate-orbit-2"><div className="w-2 h-2 rounded-full bg-violet-400/40 shadow-[0_0_8px_rgba(168,85,247,0.3)]" /></div>
            <div className="animate-orbit-3"><div className="w-1.5 h-1.5 rounded-full bg-cyan-400/40 shadow-[0_0_8px_rgba(6,182,212,0.3)]" /></div>
          </div>
        </div>

        <div className="text-center max-w-lg relative z-10 animate-fade-in-up">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/10 border border-emerald-500/10 flex items-center justify-center animate-float text-emerald-400">
            {Ic.church("w-10 h-10")}
          </div>

          <h1 className="text-4xl font-bold mb-2 gradient-text">牛市预演教</h1>
          <p className="text-base text-slate-400 mb-1 font-medium tracking-wide">Pre-Bull Simulation Church</p>
          <p className="text-sm text-slate-600 mb-8 leading-relaxed">
            AI Agent 叙事说服实验 · 完整版
          </p>

          <button onClick={handleStart} disabled={loading} className="btn-primary px-10 py-3.5 rounded-xl text-base font-bold relative z-10">
            <span className="relative z-10 flex items-center gap-2">
              {loading ? (<><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> 初始化中...</>) :
               (<>{Ic.rocket("w-5 h-5")} 开始实验</>)}
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

          {/* #19 Enhanced Risk Disclaimer */}
          <div className="mt-6 max-w-md mx-auto p-3 rounded-lg border border-amber-500/10 bg-amber-500/[0.03]">
            <p className="text-[10px] text-amber-400/60 flex items-center gap-1 mb-1">
              {Ic.alert("w-3 h-3")} 风险声明
            </p>
            <p className="text-[9px] text-slate-600 leading-relaxed">
              本项目为虚构社会实验（Simulation / Fiction），旨在研究叙事如何影响信念和行为。
              PBT Token 仅是实验内部的度量工具，无任何金融价值。本项目不构成投资建议（Not Financial Advice）。
              参与者应知悉所有"预测"和"市值"均为虚构设定。
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ==================== Dashboard ====================

  const convRate = metrics ? Math.round((metrics.convertedCount / metrics.totalAgents) * 100) : 0;
  const currentDebate = debates[0] || null;
  const currentProphet = currentDebate ? agents.find((a) => a.id === currentDebate.prophetId) : null;
  const currentTarget = currentDebate ? agents.find((a) => a.id === currentDebate.targetId) : null;

  return (
    <div className="min-h-screen">
      <Background />

      {/* ===== Top Bar ===== */}
      <header className="sticky top-0 z-40 border-b border-white/5 bg-[#06060f]/80 backdrop-blur-xl">
        <div className="max-w-[1400px] mx-auto px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500/20 via-cyan-500/10 to-violet-500/10 flex items-center justify-center text-emerald-400 shadow-[0_0_12px_rgba(0,255,136,0.15)]">{Ic.church("w-4.5 h-4.5")}</div>
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
                {metrics.totalApostasy > 0 && (<><span className="text-slate-600 mx-1">·</span><span className="text-rose-400">{metrics.totalApostasy} 叛教</span></>)}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button onClick={handleGenerateScripture} disabled={loading} className="hidden md:flex px-3 py-2 rounded-lg text-[11px] text-amber-400 hover:bg-amber-500/10 border border-amber-500/15 transition-all items-center gap-1">
              {Ic.book("w-3.5 h-3.5")} 生成经文
            </button>

            <button onClick={handleRound} disabled={loading} className="btn-primary px-5 py-2 rounded-lg text-sm font-semibold">
              <span className="relative z-10 flex items-center gap-2">
                {loading ? (<><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /><span className="hidden sm:inline">辩论中...</span></>) :
                 (<>{Ic.zap("w-4 h-4")} 下一轮</>)}
              </span>
            </button>
            <button onClick={handleStart} disabled={loading} className="px-3 py-2 rounded-lg text-xs text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-all">
              重置
            </button>
          </div>
        </div>
      </header>

      {/* Events bar */}
      {events.length > 0 && (
        <div className="max-w-[1400px] mx-auto px-5 mt-2">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {events.map((e, i) => (
              <span key={i} className="text-[10px] px-2 py-1 rounded-full bg-violet-500/8 text-violet-400 border border-violet-500/15 whitespace-nowrap flex-shrink-0">
                {e}
              </span>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="max-w-[1400px] mx-auto px-5 mt-3">
          <div className="p-3 rounded-xl bg-rose-500/5 border border-rose-500/15 text-rose-400 text-xs flex items-center gap-2">
            <span className="w-4 h-4 flex-shrink-0">{Ic.alert("w-4 h-4")}</span> {error}
            <button onClick={() => setError(null)} className="ml-auto text-rose-500 hover:text-rose-300">✕</button>
          </div>
        </div>
      )}

      <main className="max-w-[1400px] mx-auto px-5 py-6 space-y-6">
        {/* ===== #3 Experiment Conclusion Banner ===== */}
        {conclusion && conclusion.status !== "ongoing" && <ConclusionBanner conclusion={conclusion} />}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <aside className="lg:col-span-3 space-y-4">
            <div className="glass rounded-2xl p-4">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">当前对阵</h3>
              {currentProphet && (
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04] p-3 mb-3">
                  <p className="text-[10px] text-emerald-300 uppercase tracking-wider mb-1">Prophet</p>
                  <p className="text-sm font-semibold">{currentProphet.name}</p>
                  <p className="text-[11px] text-slate-500">{currentProphet.role}</p>
                  <p className="text-[11px] text-slate-400 mt-1">立场 {currentProphet.beliefStance.toFixed(2)}</p>
                </div>
              )}
              {currentTarget && (
                <div className="rounded-xl border border-rose-500/20 bg-rose-500/[0.04] p-3">
                  <p className="text-[10px] text-rose-300 uppercase tracking-wider mb-1">Target</p>
                  <p className="text-sm font-semibold">{currentTarget.name}</p>
                  <p className="text-[11px] text-slate-500">{currentTarget.role}</p>
                  <p className="text-[11px] text-slate-400 mt-1">立场 {currentTarget.beliefStance.toFixed(2)}</p>
                </div>
              )}
              {!currentDebate && <p className="text-[12px] text-slate-500">还没有辩论，点击“下一轮”开始。</p>}
            </div>

            <details className="glass rounded-2xl p-4">
              <summary className="cursor-pointer text-xs font-semibold text-slate-400 uppercase tracking-widest">高级分析</summary>
              <div className="mt-3 space-y-4">
                {metrics && (
                  <>
                    <SpiritMarketCap spirit={metrics.spiritMarketCap} real={metrics.realMarketCap} />
                    <div className="glass rounded-2xl p-5">
                      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">教派分布</h3>
                      <FactionDonut distribution={metrics.factionDistribution} />
                    </div>
                  </>
                )}
                {agents.length > 0 && <div className="grid grid-cols-1 gap-3">{agents.map((agent) => (
                  <AgentCard key={agent.id} agent={agent} isActive={latestTarget === agent.id} onApostasy={handleApostasy} />
                ))}</div>}
              </div>
            </details>
          </aside>

          <section className="lg:col-span-6 space-y-4">
            <div className="glass rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold flex items-center gap-2">{Ic.swords("w-4 h-4 text-slate-400")} 辩论主舞台</h2>
                {currentDebate && <span className="text-[11px] text-slate-500">Round {currentDebate.round}</span>}
              </div>
              {metrics && (
                <div className="mb-3">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                    <span>叙事主导力</span>
                    <span className="font-mono text-emerald-300">{Math.round(metrics.narrativeDominance * 100)}%</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${metrics.narrativeDominance * 100}%`, background: "linear-gradient(90deg, #f43f5e, #f59e0b, #00ff88)" }} />
                  </div>
                </div>
              )}
              <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1 scrollbar-thin">
                {debates.length === 0 ? (
                  <div className="rounded-xl border border-white/10 bg-white/[0.02] p-8 text-center">
                    <p className="text-sm text-slate-400">点击“下一轮”后，这里会显示完整辩论过程。</p>
                  </div>
                ) : (
                  debates.map((debate) => (
                    <DebateCard
                      key={`${debate.round}-${debate.prophetId}`}
                      debate={debate}
                      agents={agents}
                      expanded={expandedDebate === debate.round}
                      onToggle={() => setExpandedDebate(expandedDebate === debate.round ? null : debate.round)}
                    />
                  ))
                )}
              </div>
            </div>
          </section>

          <aside className="lg:col-span-3 space-y-4">
            {metrics && (
              <div className="grid grid-cols-1 gap-3">
                <StatCard icon={Ic.check("w-5 h-5")} label="已转化" value={metrics.convertedCount} sub={`${convRate}%`} accent="emerald" />
                <StatCard icon={Ic.coins("w-5 h-5")} label="总投资" value={metrics.totalInvested} sub="PBT" accent="amber" />
                <StatCard icon={Ic.sparkles("w-5 h-5")} label="精神市值" value={Math.round(metrics.spiritMarketCap)} accent="violet" />
              </div>
            )}
            <NewsTicker news={news.slice(0, 3)} />
            <ScriptureDisplay scriptures={scriptures.slice(0, 2)} onGenerate={handleGenerateScripture} />
            <AllianceDisplay alliances={alliances} agents={agents} />
          </aside>
        </div>
      </main>

      {/* ===== #19 Enhanced Footer with Risk Disclaimer ===== */}
      <footer className="border-t border-white/[0.03] mt-8">
        <div className="max-w-[1400px] mx-auto px-5 py-6">
          <div className="risk-disclaimer rounded-xl border border-amber-500/10 bg-amber-500/[0.02] p-4 mb-4">
            <div className="flex items-start gap-3">
              <span className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0 text-amber-400">
                {Ic.alert("w-4 h-4")}
              </span>
              <div>
                <p className="text-xs font-semibold text-amber-400/80 mb-1">风险声明 / Risk Disclaimer</p>
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  本项目 ("牛市预演教 / Pre-Bull Simulation Church") 是一个虚构的社会实验 (Simulation / Fiction)，
                  旨在研究叙事说服如何影响AI Agent的信念和行为模式。PBT Token 仅作为实验内部的度量工具，
                  不具备任何真实金融价值，不可交易，不构成任何形式的投资产品。
                  本实验结果不构成投资建议 (Not Financial Advice)。
                  所有"市值"、"预测"、"经文"和"新闻"均为AI自动生成的虚构内容。
                  请勿以本实验内容指导任何真实金融决策。使用本项目即表示知悉并接受上述声明。
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-700">
            <span className="flex items-center gap-1">{Ic.church("w-3 h-3")} 牛市预演教 — Built on Monad Testnet</span>
            <span>19/19 Features Implemented</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
