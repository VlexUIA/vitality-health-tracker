"use client";

import { useEffect, useState } from "react";
import Card from "@/components/Card";
import { Settings, Watch, Plus, Trash2, Save } from "lucide-react";

interface SettingsData { calorieGoal: number; waterGoal: number; vitamins: string[]; apiKey: string; }

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [saved, setSaved] = useState(false);
  const [newVitamin, setNewVitamin] = useState("");

  useEffect(() => {
    fetch("/api/settings").then(r => r.json()).then(setSettings);
  }, []);

  const save = async () => {
    const updated = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    }).then(r => r.json());
    setSettings(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const addVitamin = () => {
    if (!newVitamin.trim() || !settings) return;
    setSettings(p => p ? { ...p, vitamins: [...p.vitamins, newVitamin.trim()] } : p);
    setNewVitamin("");
  };

  const removeVitamin = (i: number) => {
    if (!settings) return;
    setSettings(p => p ? { ...p, vitamins: p.vitamins.filter((_, idx) => idx !== i) } : p);
  };

  const inputCls = "w-full rounded-lg px-3 py-2 text-sm outline-none";
  const inputStyle = { background: "var(--surface2)", border: "1px solid var(--border)", color: "var(--text)" };

  if (!settings) return <div className="flex items-center justify-center min-h-64"><div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }} /></div>;

  const apiUrl = typeof window !== "undefined" ? `${window.location.origin}/api/watch-sync` : "https://your-app.vercel.app/api/watch-sync";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Settings size={24} style={{ color: "var(--muted)" }} />
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

      {/* Goals */}
      <Card>
        <h2 className="font-semibold mb-4">Daily Goals</h2>
        <div className="space-y-3">
          <div>
            <label className="text-xs mb-1 block" style={{ color: "var(--muted)" }}>Calorie Goal (kcal)</label>
            <input className={inputCls} style={inputStyle} type="number" value={settings.calorieGoal}
              onChange={e => setSettings(p => p ? { ...p, calorieGoal: Number(e.target.value) } : p)} />
          </div>
          <div>
            <label className="text-xs mb-1 block" style={{ color: "var(--muted)" }}>Water Goal (ml)</label>
            <input className={inputCls} style={inputStyle} type="number" value={settings.waterGoal}
              onChange={e => setSettings(p => p ? { ...p, waterGoal: Number(e.target.value) } : p)} />
          </div>
        </div>
      </Card>

      {/* Vitamins */}
      <Card>
        <h2 className="font-semibold mb-4">My Vitamins</h2>
        <div className="space-y-2 mb-3">
          {settings.vitamins.map((v, i) => (
            <div key={i} className="flex items-center justify-between py-2 px-3 rounded-lg" style={{ background: "var(--surface2)", border: "1px solid var(--border)" }}>
              <span className="text-sm">{v}</span>
              <button onClick={() => removeVitamin(i)} className="hover:text-red-400" style={{ color: "var(--muted)" }}>
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input className={`${inputCls} flex-1`} style={inputStyle} placeholder="Add vitamin..." value={newVitamin}
            onChange={e => setNewVitamin(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addVitamin()} />
          <button onClick={addVitamin} className="px-3 py-2 rounded-lg" style={{ background: "var(--accent)", color: "#fff" }}>
            <Plus size={16} />
          </button>
        </div>
      </Card>

      {/* Apple Watch Sync */}
      <Card style={{ borderColor: "var(--accent)" }}>
        <div className="flex items-center gap-2 mb-4">
          <Watch size={20} style={{ color: "var(--accent)" }} />
          <h2 className="font-semibold">Apple Watch / HealthKit Sync</h2>
        </div>
        <p className="text-sm mb-4" style={{ color: "var(--muted)" }}>
          Use an iOS Shortcut with the <strong>Get Health Samples</strong> action to read Apple Watch data and POST it to this app automatically.
        </p>

        <div className="space-y-3">
          <div>
            <label className="text-xs mb-1 block" style={{ color: "var(--muted)" }}>API Key (optional — protects your endpoint)</label>
            <input className={inputCls} style={inputStyle} placeholder="Leave blank for no auth" value={settings.apiKey}
              onChange={e => setSettings(p => p ? { ...p, apiKey: e.target.value } : p)} />
          </div>

          <div className="rounded-lg p-3 text-xs font-mono break-all" style={{ background: "var(--surface2)", color: "var(--accent)", border: "1px solid var(--border)" }}>
            POST {apiUrl}
          </div>

          <div className="rounded-lg p-3 text-xs" style={{ background: "var(--surface2)", border: "1px solid var(--border)" }}>
            <p className="font-semibold mb-2" style={{ color: "var(--text)" }}>iOS Shortcut JSON body:</p>
            <pre className="text-xs overflow-auto" style={{ color: "var(--muted)" }}>{JSON.stringify({
              apiKey: settings.apiKey || "<your-api-key>",
              date: "2024-01-15",
              sleep: { bedtime: "22:30", wakeTime: "07:00", duration: 8.5, quality: 4 },
              water: 500,
              energy: 8,
            }, null, 2)}</pre>
          </div>

          <div className="rounded-lg p-3 text-sm" style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.3)" }}>
            <p className="font-semibold mb-1" style={{ color: "var(--accent)" }}>Setup steps:</p>
            <ol className="list-decimal list-inside space-y-1 text-xs" style={{ color: "var(--muted)" }}>
              <li>Open the <strong>Shortcuts</strong> app on your iPhone</li>
              <li>Create a new shortcut with <strong>Automation</strong> (runs daily at 8am)</li>
              <li>Add <strong>Get Health Samples</strong> → Sleep Analysis</li>
              <li>Add <strong>Get Contents of URL</strong> → set to POST to the URL above</li>
              <li>Set the JSON body with your sleep/health data</li>
              <li>Save and enable the automation</li>
            </ol>
          </div>
        </div>
      </Card>

      <button onClick={save} className="w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all" style={{ background: saved ? "#22c55e" : "var(--accent)", color: "#fff" }}>
        <Save size={18} /> {saved ? "Saved!" : "Save Settings"}
      </button>
    </div>
  );
}
