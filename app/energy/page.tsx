"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import Card from "@/components/Card";
import { Zap, Plus, Trash2 } from "lucide-react";

interface Entry { id: number; level: number; note: string | null; createdAt: string; }

const ENERGY_COLORS = ["#ef4444","#f97316","#f97316","#eab308","#eab308","#84cc16","#22c55e","#06b6d4","#7c3aed","#a855f7"];
const LABELS = ["","Very Low","Low","Below Average","Average","Moderate","Good","Great","Excellent","Peak","Max"];

export default function EnergyPage() {
  const today = format(new Date(), "yyyy-MM-dd");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [level, setLevel] = useState(7);
  const [note, setNote] = useState("");

  const load = () => fetch(`/api/energy?date=${today}`).then(r => r.json()).then(setEntries);
  useEffect(() => { load(); }, []);

  const add = async () => {
    await fetch("/api/energy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ level, note: note || null }),
    });
    setNote("");
    load();
  };

  const del = async (id: number) => {
    await fetch(`/api/energy?id=${id}`, { method: "DELETE" });
    load();
  };

  const latest = entries[entries.length - 1];
  const color = ENERGY_COLORS[level - 1];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Zap size={24} style={{ color: "#facc15" }} />
        <div>
          <h1 className="text-2xl font-bold">Energy</h1>
          <p className="text-sm" style={{ color: "var(--muted)" }}>{format(new Date(), "MMMM d, yyyy")}</p>
        </div>
      </div>

      {latest && (
        <Card className="text-center">
          <p className="text-6xl font-bold" style={{ color: ENERGY_COLORS[latest.level - 1] }}>{latest.level}</p>
          <p className="text-lg mt-1" style={{ color: "var(--muted)" }}>{LABELS[latest.level]}</p>
          <div className="mt-3 h-2 rounded-full" style={{ background: "var(--border)" }}>
            <div className="h-2 rounded-full transition-all" style={{ width: `${latest.level * 10}%`, background: ENERGY_COLORS[latest.level - 1] }} />
          </div>
          {latest.note && <p className="text-sm mt-2" style={{ color: "var(--muted)" }}>{latest.note}</p>}
        </Card>
      )}

      {/* Slider */}
      <Card>
        <h2 className="font-semibold mb-4">Log energy level</h2>
        <div className="text-center mb-4">
          <span className="text-5xl font-bold" style={{ color }}>{level}</span>
          <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>{LABELS[level]}</p>
        </div>

        <input type="range" min={1} max={10} value={level} onChange={e => setLevel(Number(e.target.value))}
          className="w-full mb-4 accent-[var(--accent)]" style={{ accentColor: color }} />

        <div className="grid grid-cols-10 gap-1 mb-4">
          {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
            <button key={n} onClick={() => setLevel(n)}
              className="h-8 rounded text-xs font-bold transition-all"
              style={{ background: level === n ? ENERGY_COLORS[n - 1] : "var(--surface2)", color: level === n ? "#fff" : "var(--muted)" }}>
              {n}
            </button>
          ))}
        </div>

        <input placeholder="Optional note (e.g. 'after coffee')" value={note}
          onChange={e => setNote(e.target.value)}
          className="w-full rounded-lg px-3 py-2 text-sm outline-none mb-3"
          style={{ background: "var(--surface2)", border: "1px solid var(--border)", color: "var(--text)" }}
        />

        <button onClick={add} className="w-full py-2.5 rounded-lg font-medium flex items-center justify-center gap-2" style={{ background: color, color: "#fff" }}>
          <Plus size={16} /> Log Energy
        </button>
      </Card>

      {entries.length > 0 && (
        <Card>
          <h2 className="font-semibold mb-3">Today&apos;s log</h2>
          <div className="space-y-2">
            {[...entries].reverse().map(e => (
              <div key={e.id} className="flex items-center justify-between py-2 border-b last:border-0" style={{ borderColor: "var(--border)" }}>
                <span style={{ color: "var(--muted)" }}>{new Date(e.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                <div className="flex-1 mx-3">
                  {e.note && <p className="text-xs" style={{ color: "var(--muted)" }}>{e.note}</p>}
                </div>
                <span className="font-bold mr-3" style={{ color: ENERGY_COLORS[e.level - 1] }}>{e.level}/10</span>
                <button onClick={() => del(e.id)} className="hover:text-red-400" style={{ color: "var(--muted)" }}>
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
