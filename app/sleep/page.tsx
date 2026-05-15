"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import Card from "@/components/Card";
import { Moon, Watch, Save } from "lucide-react";

interface SleepEntry { id: number; bedtime: string; wakeTime: string; duration: number; quality: number; fromWatch: boolean; }

const qualityOptions = [
  { value: 1, label: "Poor", color: "#ef4444" },
  { value: 2, label: "Fair", color: "#f97316" },
  { value: 3, label: "OK", color: "#eab308" },
  { value: 4, label: "Good", color: "#22c55e" },
  { value: 5, label: "Great", color: "#06b6d4" },
];

function calcDuration(bed: string, wake: string): number {
  if (!bed || !wake) return 0;
  const [bh, bm] = bed.split(":").map(Number);
  const [wh, wm] = wake.split(":").map(Number);
  let mins = (wh * 60 + wm) - (bh * 60 + bm);
  if (mins < 0) mins += 24 * 60;
  return Math.round((mins / 60) * 10) / 10;
}

export default function SleepPage() {
  const today = format(new Date(), "yyyy-MM-dd");
  const [entry, setEntry] = useState<SleepEntry | null>(null);
  const [form, setForm] = useState({ bedtime: "22:30", wakeTime: "07:00", quality: 3 });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch(`/api/sleep?date=${today}`).then(r => r.json()).then(data => {
      if (data) {
        setEntry(data);
        setForm({ bedtime: data.bedtime, wakeTime: data.wakeTime, quality: data.quality });
      }
    });
  }, [today]);

  const duration = calcDuration(form.bedtime, form.wakeTime);

  const save = async () => {
    await fetch("/api/sleep", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, duration, date: today }),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    fetch(`/api/sleep?date=${today}`).then(r => r.json()).then(setEntry);
  };

  const sleepScore = entry ? Math.round((Math.min(entry.duration / 8, 1) * 0.7 + (entry.quality / 5) * 0.3) * 100) : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Moon size={24} style={{ color: "#818cf8" }} />
        <div>
          <h1 className="text-2xl font-bold">Sleep</h1>
          <p className="text-sm" style={{ color: "var(--muted)" }}>{format(new Date(), "MMMM d, yyyy")}</p>
        </div>
      </div>

      {/* Score card */}
      {entry && (
        <Card className="text-center">
          <p className="text-5xl font-bold" style={{ color: "#818cf8" }}>{entry.duration.toFixed(1)}<span className="text-2xl" style={{ color: "var(--muted)" }}>h</span></p>
          <p className="mt-1" style={{ color: "var(--muted)" }}>{entry.bedtime} → {entry.wakeTime}</p>
          {sleepScore !== null && (
            <div className="mt-3">
              <div className="h-2 rounded-full" style={{ background: "var(--border)" }}>
                <div className="h-2 rounded-full transition-all" style={{ width: `${sleepScore}%`, background: "#818cf8" }} />
              </div>
              <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>Sleep Score: {sleepScore}/100{entry.fromWatch && <span className="ml-2"><Watch size={10} className="inline" /> from Watch</span>}</p>
            </div>
          )}
        </Card>
      )}

      {/* Log form */}
      <Card>
        <h2 className="font-semibold mb-4">{entry ? "Update sleep" : "Log sleep"}</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs mb-1 block" style={{ color: "var(--muted)" }}>Bedtime</label>
              <input type="time" value={form.bedtime}
                onChange={e => setForm(p => ({ ...p, bedtime: e.target.value }))}
                className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                style={{ background: "var(--surface2)", border: "1px solid var(--border)", color: "var(--text)" }}
              />
            </div>
            <div>
              <label className="text-xs mb-1 block" style={{ color: "var(--muted)" }}>Wake time</label>
              <input type="time" value={form.wakeTime}
                onChange={e => setForm(p => ({ ...p, wakeTime: e.target.value }))}
                className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                style={{ background: "var(--surface2)", border: "1px solid var(--border)", color: "var(--text)" }}
              />
            </div>
          </div>

          {duration > 0 && (
            <p className="text-center text-sm" style={{ color: "#818cf8" }}>Duration: <strong>{duration}h</strong></p>
          )}

          <div>
            <label className="text-xs mb-2 block" style={{ color: "var(--muted)" }}>Sleep quality</label>
            <div className="grid grid-cols-5 gap-2">
              {qualityOptions.map(q => (
                <button key={q.value} onClick={() => setForm(p => ({ ...p, quality: q.value }))}
                  className="py-2 rounded-lg text-xs font-medium transition-all"
                  style={{
                    background: form.quality === q.value ? q.color : "var(--surface2)",
                    border: `1px solid ${form.quality === q.value ? q.color : "var(--border)"}`,
                    color: form.quality === q.value ? "#fff" : "var(--muted)",
                  }}>
                  {q.label}
                </button>
              ))}
            </div>
          </div>

          <button onClick={save} className="w-full py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 transition-all" style={{ background: saved ? "#22c55e" : "#818cf8", color: "#fff" }}>
            <Save size={16} /> {saved ? "Saved!" : "Save Sleep"}
          </button>
        </div>
      </Card>
    </div>
  );
}
