"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import Card from "@/components/Card";
import RingProgress from "@/components/RingProgress";
import { Flame, Droplets, Pill, Moon, Zap, Watch } from "lucide-react";
import Link from "next/link";

interface Summary {
  date: string;
  calories: { total: number; goal: number };
  water: { total: number; goal: number };
  vitamins: { taken: number; total: number };
  sleep: { duration: number; quality: number } | null;
  energy: number | null;
}

const energyColors = ["#ef4444","#f97316","#eab308","#84cc16","#22c55e","#06b6d4","#7c3aed","#ec4899","#6366f1","#14b8a6"];
const qualityLabel = ["","Poor","Fair","OK","Good","Great"];

export default function Dashboard() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const today = format(new Date(), "yyyy-MM-dd");
  const displayDate = format(new Date(), "EEEE, MMMM d");

  useEffect(() => {
    fetch(`/api/summary?date=${today}`).then((r) => r.json()).then(setSummary);
  }, [today]);

  if (!summary) return (
    <div className="flex items-center justify-center min-h-64">
      <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }} />
    </div>
  );

  const ringStats = [
    { href: "/calories", icon: Flame, label: "Calories", value: summary.calories.total, max: summary.calories.goal, display: `${summary.calories.total}`, sub: `/ ${summary.calories.goal} kcal`, color: "#f97316" },
    { href: "/water", icon: Droplets, label: "Water", value: summary.water.total, max: summary.water.goal, display: `${summary.water.total}`, sub: `/ ${summary.water.goal} ml`, color: "#06b6d4" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Today</h1>
        <p style={{ color: "var(--muted)" }}>{displayDate}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {ringStats.map(({ href, icon: Icon, label, value, max, display, sub, color }) => (
          <Link key={href} href={href}>
            <Card className="flex flex-col items-center gap-3 hover:scale-[1.02] transition-transform cursor-pointer">
              <div className="flex items-center gap-2 self-start">
                <Icon size={16} style={{ color }} />
                <span className="text-sm font-medium" style={{ color: "var(--muted)" }}>{label}</span>
              </div>
              <RingProgress value={value} max={max} size={110} color={color} label={display} sublabel={sub} />
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/vitamins">
          <Card className="hover:scale-[1.01] transition-transform cursor-pointer">
            <div className="flex items-center gap-2 mb-3">
              <Pill size={16} style={{ color: "#a855f7" }} />
              <span className="text-sm font-medium" style={{ color: "var(--muted)" }}>Vitamins</span>
            </div>
            <p className="text-3xl font-bold">{summary.vitamins.taken}<span className="text-lg" style={{ color: "var(--muted)" }}>/{summary.vitamins.total}</span></p>
            <div className="mt-2 h-1.5 rounded-full" style={{ background: "var(--border)" }}>
              <div className="h-1.5 rounded-full" style={{ width: `${(summary.vitamins.taken / Math.max(summary.vitamins.total, 1)) * 100}%`, background: "#a855f7" }} />
            </div>
            <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>taken today</p>
          </Card>
        </Link>

        <Link href="/sleep">
          <Card className="hover:scale-[1.01] transition-transform cursor-pointer">
            <div className="flex items-center gap-2 mb-3">
              <Moon size={16} style={{ color: "#818cf8" }} />
              <span className="text-sm font-medium" style={{ color: "var(--muted)" }}>Sleep</span>
            </div>
            {summary.sleep ? (
              <>
                <p className="text-3xl font-bold">{summary.sleep.duration.toFixed(1)}<span className="text-lg" style={{ color: "var(--muted)" }}>h</span></p>
                <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>Quality: {qualityLabel[summary.sleep.quality] ?? summary.sleep.quality}</p>
              </>
            ) : (
              <p className="text-sm" style={{ color: "var(--muted)" }}>Not logged yet</p>
            )}
          </Card>
        </Link>

        <Link href="/energy">
          <Card className="hover:scale-[1.01] transition-transform cursor-pointer">
            <div className="flex items-center gap-2 mb-3">
              <Zap size={16} style={{ color: "#facc15" }} />
              <span className="text-sm font-medium" style={{ color: "var(--muted)" }}>Energy</span>
            </div>
            {summary.energy !== null ? (
              <>
                <p className="text-3xl font-bold" style={{ color: energyColors[summary.energy - 1] }}>{summary.energy}<span className="text-lg" style={{ color: "var(--muted)" }}>/10</span></p>
                <div className="mt-2 h-1.5 rounded-full" style={{ background: "var(--border)" }}>
                  <div className="h-1.5 rounded-full" style={{ width: `${summary.energy * 10}%`, background: energyColors[summary.energy - 1] }} />
                </div>
              </>
            ) : (
              <p className="text-sm" style={{ color: "var(--muted)" }}>Not logged yet</p>
            )}
          </Card>
        </Link>
      </div>

      <Card style={{ background: "linear-gradient(135deg,#1e1030,#0f1e30)", borderColor: "#2a2a50" }}>
        <div className="flex items-center gap-3">
          <Watch size={24} style={{ color: "var(--accent)" }} />
          <div>
            <p className="font-semibold">Apple Watch Sync</p>
            <p className="text-sm" style={{ color: "var(--muted)" }}>Set up iOS Shortcuts to push health data automatically</p>
          </div>
          <Link href="/settings" className="ml-auto text-sm px-3 py-1.5 rounded-lg font-medium whitespace-nowrap" style={{ background: "var(--accent)", color: "#fff" }}>
            Setup
          </Link>
        </div>
      </Card>
    </div>
  );
}
