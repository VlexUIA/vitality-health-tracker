"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import Card from "@/components/Card";
import RingProgress from "@/components/RingProgress";
import { Droplets, Plus, Trash2 } from "lucide-react";

interface Entry { id: number; amount: number; createdAt: string; }

const QUICK = [150, 250, 350, 500];

export default function WaterPage() {
  const today = format(new Date(), "yyyy-MM-dd");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [goal, setGoal] = useState(2500);
  const [custom, setCustom] = useState("");

  const load = () => {
    fetch(`/api/water?date=${today}`).then(r => r.json()).then(d => setEntries(d.entries));
    fetch("/api/settings").then(r => r.json()).then(s => setGoal(s.waterGoal));
  };

  useEffect(() => { load(); }, []);

  const total = entries.reduce((s, e) => s + e.amount, 0);

  const add = async (amount: number) => {
    if (!amount || amount <= 0) return;
    await fetch("/api/water", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount }),
    });
    setCustom("");
    load();
  };

  const del = async (id: number) => {
    await fetch(`/api/water?id=${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Droplets size={24} style={{ color: "#06b6d4" }} />
        <div>
          <h1 className="text-2xl font-bold">Water</h1>
          <p className="text-sm" style={{ color: "var(--muted)" }}>{format(new Date(), "MMMM d, yyyy")}</p>
        </div>
      </div>

      <div className="flex justify-center">
        <RingProgress value={total} max={goal} size={160} stroke={14} color="#06b6d4" label={`${total}`} sublabel={`/ ${goal} ml`} />
      </div>

      {/* Quick add buttons */}
      <Card>
        <h2 className="font-semibold mb-3">Quick add</h2>
        <div className="grid grid-cols-4 gap-2 mb-4">
          {QUICK.map(ml => (
            <button key={ml} onClick={() => add(ml)} className="py-3 rounded-xl text-sm font-semibold transition-all hover:scale-105 active:scale-95" style={{ background: "var(--surface2)", border: "1px solid var(--border)", color: "#06b6d4" }}>
              {ml >= 1000 ? `${ml/1000}L` : `${ml}ml`}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="number" placeholder="Custom ml" value={custom}
            onChange={e => setCustom(e.target.value)}
            className="flex-1 rounded-lg px-3 py-2 text-sm outline-none"
            style={{ background: "var(--surface2)", border: "1px solid var(--border)", color: "var(--text)" }}
          />
          <button onClick={() => add(Number(custom))} className="px-4 py-2 rounded-lg font-medium flex items-center gap-1" style={{ background: "#06b6d4", color: "#000" }}>
            <Plus size={16} /> Add
          </button>
        </div>
      </Card>

      {/* Log */}
      {entries.length > 0 && (
        <Card>
          <h2 className="font-semibold mb-3">Today&apos;s log</h2>
          <div className="space-y-2">
            {entries.map(e => (
              <div key={e.id} className="flex items-center justify-between py-2 border-b last:border-0" style={{ borderColor: "var(--border)" }}>
                <span style={{ color: "var(--muted)" }}>{new Date(e.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                <span className="font-bold" style={{ color: "#06b6d4" }}>{e.amount} ml</span>
                <button onClick={() => del(e.id)} className="hover:text-red-400 transition-colors" style={{ color: "var(--muted)" }}>
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
          <p className="text-right text-sm mt-2 font-semibold" style={{ color: "#06b6d4" }}>Total: {total} ml</p>
        </Card>
      )}
    </div>
  );
}
