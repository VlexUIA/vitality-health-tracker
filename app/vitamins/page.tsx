"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import Card from "@/components/Card";
import { Pill, Check } from "lucide-react";

interface Vitamin { id: number | null; name: string; taken: boolean; }

export default function VitaminsPage() {
  const today = format(new Date(), "yyyy-MM-dd");
  const [vitamins, setVitamins] = useState<Vitamin[]>([]);

  const load = () => fetch(`/api/vitamins?date=${today}`).then(r => r.json()).then(setVitamins);

  useEffect(() => { load(); }, []);

  const toggle = async (v: Vitamin) => {
    await fetch("/api/vitamins", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: v.name, taken: !v.taken, date: today }),
    });
    load();
  };

  const taken = vitamins.filter(v => v.taken).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Pill size={24} style={{ color: "#a855f7" }} />
        <div>
          <h1 className="text-2xl font-bold">Vitamins</h1>
          <p className="text-sm" style={{ color: "var(--muted)" }}>{format(new Date(), "MMMM d, yyyy")}</p>
        </div>
      </div>

      {/* Progress */}
      <Card className="text-center">
        <p className="text-5xl font-bold" style={{ color: "#a855f7" }}>{taken}<span className="text-2xl" style={{ color: "var(--muted)" }}>/{vitamins.length}</span></p>
        <p className="mt-1" style={{ color: "var(--muted)" }}>vitamins taken today</p>
        <div className="mt-3 h-2 rounded-full" style={{ background: "var(--border)" }}>
          <div className="h-2 rounded-full transition-all duration-500" style={{ width: `${(taken / Math.max(vitamins.length, 1)) * 100}%`, background: "#a855f7" }} />
        </div>
      </Card>

      {/* Vitamin checklist */}
      <Card>
        <h2 className="font-semibold mb-4">Today&apos;s checklist</h2>
        <div className="space-y-2">
          {vitamins.map(v => (
            <button key={v.name} onClick={() => toggle(v)}
              className="w-full flex items-center gap-4 p-3 rounded-xl transition-all"
              style={{ background: v.taken ? "rgba(168,85,247,0.15)" : "var(--surface2)", border: `1px solid ${v.taken ? "#a855f7" : "var(--border)"}` }}>
              <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all" style={{ background: v.taken ? "#a855f7" : "var(--border)" }}>
                {v.taken && <Check size={14} color="#fff" strokeWidth={3} />}
              </div>
              <span className="font-medium text-left flex-1" style={{ color: v.taken ? "#a855f7" : "var(--text)" }}>{v.name}</span>
              <span className="text-xs" style={{ color: "var(--muted)" }}>{v.taken ? "✓ taken" : "tap to mark"}</span>
            </button>
          ))}
        </div>
      </Card>

      <p className="text-xs text-center" style={{ color: "var(--muted)" }}>
        Customize your vitamin list in <a href="/settings" className="underline" style={{ color: "var(--accent)" }}>Settings</a>
      </p>
    </div>
  );
}
