"use client";

import { useEffect, useState, useCallback } from "react";
import { format } from "date-fns";
import Card from "@/components/Card";
import { Zap, Coffee, Plus, Trash2, Moon, Beef, Flame, ChevronDown, ChevronUp } from "lucide-react";
import type { EnergyBreakdown } from "@/lib/energy-calc";

interface StimulantEntry { id: number; time: string; name: string; caffeineMg: number; durationHours: number; }
interface CustomStimulant { id: number; name: string; caffeineMg: number; durationHours: number; }

const PRESETS = [
  { name: "Coffee", caffeineMg: 95, durationHours: 5, emoji: "☕" },
  { name: "Espresso", caffeineMg: 63, durationHours: 5, emoji: "☕" },
  { name: "Energy Drink", caffeineMg: 80, durationHours: 5, emoji: "⚡" },
  { name: "Large Energy Drink", caffeineMg: 160, durationHours: 6, emoji: "⚡" },
  { name: "Pre-workout", caffeineMg: 200, durationHours: 4, emoji: "💪" },
  { name: "Green Tea", caffeineMg: 30, durationHours: 3, emoji: "🍵" },
];

function scoreColor(val: number, max: number) {
  const pct = val / max;
  if (pct >= 0.75) return "#22c55e";
  if (pct >= 0.5) return "#eab308";
  return "#f97316";
}

function BreakdownBar({ label, value, max, color, icon }: { label: string; value: number; max: number; color: string; icon: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5 text-sm">
          {icon}
          <span style={{ color: "var(--muted)" }}>{label}</span>
        </div>
        <span className="text-sm font-semibold" style={{ color }}>
          {value.toFixed(1)} <span style={{ color: "var(--muted)", fontWeight: 400 }}>/ {max}</span>
        </span>
      </div>
      <div className="h-2 rounded-full" style={{ background: "var(--border)" }}>
        <div className="h-2 rounded-full transition-all duration-700" style={{ width: `${Math.min(value / max, 1) * 100}%`, background: color }} />
      </div>
    </div>
  );
}

export default function EnergyPage() {
  const today = format(new Date(), "yyyy-MM-dd");
  const nowHHMM = format(new Date(), "HH:mm");

  const [breakdown, setBreakdown] = useState<EnergyBreakdown | null>(null);
  const [stimulants, setStimulants] = useState<StimulantEntry[]>([]);
  const [customs, setCustoms] = useState<CustomStimulant[]>([]);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [customForm, setCustomForm] = useState({ name: "", caffeineMg: "", durationHours: "" });
  const [manualLevel, setManualLevel] = useState(7);
  const [manualNote, setManualNote] = useState("");
  const [logTime, setLogTime] = useState(nowHHMM);

  const loadBreakdown = useCallback(() => {
    fetch(`/api/energy-calc?date=${today}&now=${format(new Date(), "HH:mm")}`)
      .then(r => r.json()).then(setBreakdown);
  }, [today]);

  const loadStimulants = useCallback(() => {
    fetch(`/api/stimulants?date=${today}`).then(r => r.json()).then(setStimulants);
  }, [today]);

  useEffect(() => {
    loadBreakdown();
    loadStimulants();
    fetch("/api/custom-stimulants").then(r => r.json()).then(setCustoms);
    const interval = setInterval(loadBreakdown, 60000); // refresh every minute
    return () => clearInterval(interval);
  }, [loadBreakdown, loadStimulants]);

  const logStimulant = async (preset: { name: string; caffeineMg: number; durationHours: number }) => {
    await fetch("/api/stimulants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: preset.name, caffeineMg: preset.caffeineMg, durationHours: preset.durationHours, time: logTime }),
    });
    loadStimulants();
    setTimeout(loadBreakdown, 300);
  };

  const deleteStimulant = async (id: number) => {
    await fetch(`/api/stimulants?id=${id}`, { method: "DELETE" });
    loadStimulants();
    setTimeout(loadBreakdown, 300);
  };

  const saveCustom = async () => {
    if (!customForm.name || !customForm.caffeineMg) return;
    const newCustom = await fetch("/api/custom-stimulants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: customForm.name, caffeineMg: Number(customForm.caffeineMg), durationHours: Number(customForm.durationHours) || 5 }),
    }).then(r => r.json());
    setCustoms(p => [...p, newCustom]);
    setCustomForm({ name: "", caffeineMg: "", durationHours: "" });
    setShowCustomForm(false);
  };

  const deleteCustom = async (id: number) => {
    await fetch(`/api/custom-stimulants?id=${id}`, { method: "DELETE" });
    setCustoms(p => p.filter(c => c.id !== id));
  };

  const logManual = async () => {
    await fetch("/api/energy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ level: manualLevel, note: manualNote || null }),
    });
    setManualNote("");
  };

  const inp = "w-full rounded-lg px-3 py-2 text-sm outline-none";
  const inpStyle = { background: "var(--surface2)", border: "1px solid var(--border)", color: "var(--text)" };

  const totalScore = breakdown?.total ?? 0;
  const totalColor = totalScore >= 7 ? "#22c55e" : totalScore >= 4.5 ? "#eab308" : "#ef4444";
  const allPresets = [...PRESETS, ...customs.map(c => ({ name: c.name, caffeineMg: c.caffeineMg, durationHours: c.durationHours, emoji: "⚗️" }))];

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Zap size={24} style={{ color: "#facc15" }} />
        <div>
          <h1 className="text-2xl font-bold">Energy</h1>
          <p className="text-sm" style={{ color: "var(--muted)" }}>{format(new Date(), "MMMM d, yyyy")}</p>
        </div>
      </div>

      {/* Calculated score */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--muted)" }}>Calculated Energy</p>
            {breakdown && (
              <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                Base {breakdown.base.toFixed(1)}{breakdown.stimulantBoost > 0.01 ? ` + ☕ ${breakdown.stimulantBoost.toFixed(2)}` : ""}
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-5xl font-bold leading-none" style={{ color: totalColor }}>{totalScore.toFixed(1)}</p>
            <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>out of 10</p>
          </div>
        </div>

        {/* Score bar */}
        <div className="h-3 rounded-full mb-5" style={{ background: "var(--border)" }}>
          <div className="h-3 rounded-full transition-all duration-700" style={{ width: `${totalScore * 10}%`, background: totalColor }} />
        </div>

        {/* Breakdown bars */}
        {breakdown && (
          <div className="space-y-3">
            <BreakdownBar
              label={breakdown.sleepDetail.hasData ? "Sleep" : "Sleep (no data — showing neutral)"}
              value={breakdown.sleepScore}
              max={5}
              color={scoreColor(breakdown.sleepScore, 5)}
              icon={<Moon size={14} style={{ color: "#818cf8" }} />}
            />
            <BreakdownBar
              label="Nutrition"
              value={breakdown.nutritionScore}
              max={3}
              color={scoreColor(breakdown.nutritionScore, 3)}
              icon={<Flame size={14} style={{ color: "#f97316" }} />}
            />
            <BreakdownBar
              label="Stimulants"
              value={breakdown.stimulantBoost}
              max={2}
              color="#06b6d4"
              icon={<Coffee size={14} style={{ color: "#06b6d4" }} />}
            />

            {/* Nutrition sub-details */}
            <div className="pt-1 grid grid-cols-2 gap-2 text-xs" style={{ color: "var(--muted)" }}>
              <div className="flex items-center gap-1">
                <Flame size={11} style={{ color: "#f97316" }} />
                Calories: {Math.round(breakdown.nutritionDetail.calorieRatio * 100)}%
              </div>
              <div className="flex items-center gap-1">
                <Beef size={11} style={{ color: "#22c55e" }} />
                Protein: {Math.round(breakdown.nutritionDetail.proteinRatio * 100)}%
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Active stimulants today */}
      {breakdown && breakdown.stimulantDetail.length > 0 && (
        <Card>
          <p className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: "var(--muted)" }}>Active Today</p>
          <div className="space-y-2">
            {breakdown.stimulantDetail.map((s, i) => (
              <div key={i} className="flex items-center justify-between py-1.5 border-b last:border-0" style={{ borderColor: "var(--border)" }}>
                <div>
                  <p className="text-sm font-medium">{s.name}</p>
                  <p className="text-xs" style={{ color: "var(--muted)" }}>
                    {s.timeAgoHours < 1 ? `${Math.round(s.timeAgoHours * 60)}m ago` : `${s.timeAgoHours.toFixed(1)}h ago`}
                  </p>
                </div>
                <div className="text-right">
                  {s.isActive ? (
                    <p className="text-sm font-semibold" style={{ color: "#06b6d4" }}>+{s.boost.toFixed(2)}</p>
                  ) : (
                    <p className="text-xs" style={{ color: "var(--muted)" }}>worn off</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Log a stimulant */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <p className="font-semibold">Log Stimulant</p>
          <div className="flex items-center gap-2">
            <label className="text-xs" style={{ color: "var(--muted)" }}>Time</label>
            <input type="time" value={logTime} onChange={e => setLogTime(e.target.value)}
              className="rounded px-2 py-1 text-xs outline-none"
              style={{ background: "var(--surface2)", border: "1px solid var(--border)", color: "var(--text)" }} />
          </div>
        </div>

        {/* Presets grid */}
        <div className="flex flex-wrap gap-2 mb-3">
          {allPresets.map((p) => (
            <button key={p.name} onClick={() => logStimulant(p)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105 active:scale-95"
              style={{ background: "var(--surface2)", border: "1px solid var(--border)", color: "var(--text)" }}>
              <span>{p.emoji}</span>
              <span>{p.name}</span>
              <span className="text-xs" style={{ color: "var(--muted)" }}>{p.caffeineMg}mg</span>
            </button>
          ))}
          <button onClick={() => setShowCustomForm(p => !p)}
            className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium"
            style={{ background: "var(--accent)", color: "#fff" }}>
            <Plus size={14} /> Custom
          </button>
        </div>

        {/* Custom stimulant form */}
        {showCustomForm && (
          <div className="space-y-2 pt-2 border-t" style={{ borderColor: "var(--border)" }}>
            <p className="text-xs font-medium" style={{ color: "var(--muted)" }}>Create custom stimulant</p>
            <input className={inp} style={inpStyle} placeholder="Name (e.g. Matcha)" value={customForm.name}
              onChange={e => setCustomForm(p => ({ ...p, name: e.target.value }))} />
            <div className="grid grid-cols-2 gap-2">
              <input className={inp} style={inpStyle} type="number" placeholder="Caffeine (mg)" value={customForm.caffeineMg}
                onChange={e => setCustomForm(p => ({ ...p, caffeineMg: e.target.value }))} />
              <input className={inp} style={inpStyle} type="number" placeholder="Duration (hrs)" value={customForm.durationHours}
                onChange={e => setCustomForm(p => ({ ...p, durationHours: e.target.value }))} />
            </div>
            <button onClick={saveCustom} className="w-full py-2 rounded-lg text-sm font-medium" style={{ background: "var(--accent)", color: "#fff" }}>
              Save Custom Stimulant
            </button>
          </div>
        )}

        {/* Custom stimulants list */}
        {customs.length > 0 && (
          <div className="mt-3 pt-3 border-t" style={{ borderColor: "var(--border)" }}>
            <p className="text-xs mb-2" style={{ color: "var(--muted)" }}>Your custom stimulants</p>
            <div className="space-y-1">
              {customs.map(c => (
                <div key={c.id} className="flex items-center justify-between">
                  <span className="text-sm">⚗️ {c.name} — {c.caffeineMg}mg / {c.durationHours}h</span>
                  <button onClick={() => deleteCustom(c.id)} className="hover:text-red-400" style={{ color: "var(--muted)" }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Today's stimulant log */}
      {stimulants.length > 0 && (
        <Card>
          <p className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: "var(--muted)" }}>Today&apos;s Log</p>
          <div className="space-y-1">
            {stimulants.map(s => (
              <div key={s.id} className="flex items-center justify-between py-1.5 border-b last:border-0" style={{ borderColor: "var(--border)" }}>
                <span className="text-sm">{s.time} — {s.name}</span>
                <div className="flex items-center gap-3">
                  <span className="text-xs" style={{ color: "var(--muted)" }}>{s.caffeineMg}mg</span>
                  <button onClick={() => deleteStimulant(s.id)} className="hover:text-red-400" style={{ color: "var(--muted)" }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Manual override (collapsible) */}
      <Card>
        <button onClick={() => setShowManual(p => !p)} className="w-full flex items-center justify-between">
          <span className="font-semibold text-sm">Manual Energy Override</span>
          {showManual ? <ChevronUp size={16} style={{ color: "var(--muted)" }} /> : <ChevronDown size={16} style={{ color: "var(--muted)" }} />}
        </button>
        {showManual && (
          <div className="mt-4 space-y-3">
            <p className="text-xs" style={{ color: "var(--muted)" }}>Log how you actually feel (1–10) to compare against calculated.</p>
            <div className="text-center">
              <span className="text-4xl font-bold" style={{ color: "#facc15" }}>{manualLevel}</span>
            </div>
            <input type="range" min={1} max={10} value={manualLevel}
              onChange={e => setManualLevel(Number(e.target.value))}
              className="w-full" style={{ accentColor: "#facc15" }} />
            <input className={inp} style={inpStyle} placeholder="Note (optional)" value={manualNote}
              onChange={e => setManualNote(e.target.value)} />
            <button onClick={logManual} className="w-full py-2.5 rounded-lg font-medium flex items-center justify-center gap-2" style={{ background: "#facc15", color: "#000" }}>
              <Plus size={16} /> Log Manual
            </button>
          </div>
        )}
      </Card>
    </div>
  );
}
