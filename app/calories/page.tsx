"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import Card from "@/components/Card";
import RingProgress from "@/components/RingProgress";
import { Flame, Plus, Trash2 } from "lucide-react";

interface Entry { id: number; meal: string; calories: number; protein: number | null; carbs: number | null; fat: number | null; }

export default function CaloriesPage() {
  const today = format(new Date(), "yyyy-MM-dd");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [goal, setGoal] = useState(2000);
  const [form, setForm] = useState({ meal: "", calories: "", protein: "", carbs: "", fat: "" });
  const [loading, setLoading] = useState(false);

  const load = () => {
    fetch(`/api/calories?date=${today}`).then(r => r.json()).then(setEntries);
    fetch("/api/settings").then(r => r.json()).then(s => setGoal(s.calorieGoal));
  };

  useEffect(() => { load(); }, []);

  const total = entries.reduce((s, e) => s + e.calories, 0);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.meal || !form.calories) return;
    setLoading(true);
    await fetch("/api/calories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, calories: Number(form.calories), protein: form.protein ? Number(form.protein) : null, carbs: form.carbs ? Number(form.carbs) : null, fat: form.fat ? Number(form.fat) : null }),
    });
    setForm({ meal: "", calories: "", protein: "", carbs: "", fat: "" });
    setLoading(false);
    load();
  };

  const del = async (id: number) => {
    await fetch(`/api/calories?id=${id}`, { method: "DELETE" });
    load();
  };

  const inputCls = "w-full rounded-lg px-3 py-2 text-sm outline-none focus:ring-1";
  const inputStyle = { background: "var(--surface2)", border: "1px solid var(--border)", color: "var(--text)", "--ring-color": "var(--accent)" } as React.CSSProperties;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Flame size={24} style={{ color: "#f97316" }} />
        <div>
          <h1 className="text-2xl font-bold">Calories</h1>
          <p className="text-sm" style={{ color: "var(--muted)" }}>{format(new Date(), "MMMM d, yyyy")}</p>
        </div>
      </div>

      <div className="flex justify-center">
        <RingProgress value={total} max={goal} size={160} stroke={14} color="#f97316" label={`${total}`} sublabel={`/ ${goal} kcal`} />
      </div>

      {/* Quick macros summary */}
      {entries.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Protein", value: entries.reduce((s, e) => s + (e.protein ?? 0), 0).toFixed(0), unit: "g", color: "#22c55e" },
            { label: "Carbs", value: entries.reduce((s, e) => s + (e.carbs ?? 0), 0).toFixed(0), unit: "g", color: "#f97316" },
            { label: "Fat", value: entries.reduce((s, e) => s + (e.fat ?? 0), 0).toFixed(0), unit: "g", color: "#facc15" },
          ].map(m => (
            <Card key={m.label} className="text-center">
              <p className="text-xl font-bold" style={{ color: m.color }}>{m.value}<span className="text-sm" style={{ color: "var(--muted)" }}>{m.unit}</span></p>
              <p className="text-xs" style={{ color: "var(--muted)" }}>{m.label}</p>
            </Card>
          ))}
        </div>
      )}

      {/* Add form */}
      <Card>
        <h2 className="font-semibold mb-4">Log a meal</h2>
        <form onSubmit={add} className="space-y-3">
          <input className={inputCls} style={inputStyle} placeholder="Meal name" value={form.meal} onChange={e => setForm(p => ({ ...p, meal: e.target.value }))} />
          <div className="grid grid-cols-2 gap-2">
            <input className={inputCls} style={inputStyle} type="number" placeholder="Calories *" value={form.calories} onChange={e => setForm(p => ({ ...p, calories: e.target.value }))} />
            <input className={inputCls} style={inputStyle} type="number" placeholder="Protein (g)" value={form.protein} onChange={e => setForm(p => ({ ...p, protein: e.target.value }))} />
            <input className={inputCls} style={inputStyle} type="number" placeholder="Carbs (g)" value={form.carbs} onChange={e => setForm(p => ({ ...p, carbs: e.target.value }))} />
            <input className={inputCls} style={inputStyle} type="number" placeholder="Fat (g)" value={form.fat} onChange={e => setForm(p => ({ ...p, fat: e.target.value }))} />
          </div>
          <button type="submit" disabled={loading} className="w-full py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 transition-opacity disabled:opacity-50" style={{ background: "#f97316", color: "#fff" }}>
            <Plus size={16} /> Add Meal
          </button>
        </form>
      </Card>

      {/* Entries list */}
      {entries.length > 0 && (
        <Card>
          <h2 className="font-semibold mb-3">Today&apos;s meals</h2>
          <div className="space-y-2">
            {entries.map(e => (
              <div key={e.id} className="flex items-center justify-between py-2 border-b last:border-0" style={{ borderColor: "var(--border)" }}>
                <div>
                  <p className="font-medium">{e.meal}</p>
                  <p className="text-xs" style={{ color: "var(--muted)" }}>
                    {e.protein != null && `P: ${e.protein}g `}{e.carbs != null && `C: ${e.carbs}g `}{e.fat != null && `F: ${e.fat}g`}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold" style={{ color: "#f97316" }}>{e.calories} kcal</span>
                  <button onClick={() => del(e.id)} style={{ color: "var(--muted)" }} className="hover:text-red-400 transition-colors">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
