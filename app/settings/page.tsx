"use client";

import { useEffect, useState } from "react";
import Card from "@/components/Card";
import { Settings, Watch, Plus, Trash2, Save, Copy, Wifi } from "lucide-react";

interface SettingsData { calorieGoal: number; waterGoal: number; proteinGoal: number; vitamins: string[]; apiKey: string; }

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [saved, setSaved] = useState(false);
  const [newVitamin, setNewVitamin] = useState("");
  const [syncTab, setSyncTab] = useState<"sleep" | "daily">("sleep");
  const [testStatus, setTestStatus] = useState<"" | "ok" | "error" | "testing">("");

  useEffect(() => {
    fetch("/api/settings").then(r => r.json()).then(setSettings);
  }, []);

  const testConnection = async () => {
    setTestStatus("testing");
    try {
      const r = await fetch("/api/watch-sync");
      setTestStatus(r.ok ? "ok" : "error");
    } catch {
      setTestStatus("error");
    }
    setTimeout(() => setTestStatus(""), 3000);
  };

  const copyUrl = (url: string) => { navigator.clipboard.writeText(url).catch(() => {}); };

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
          <div>
            <label className="text-xs mb-1 block" style={{ color: "var(--muted)" }}>Protein Goal (g)</label>
            <input className={inputCls} style={inputStyle} type="number" value={settings.proteinGoal}
              onChange={e => setSettings(p => p ? { ...p, proteinGoal: Number(e.target.value) } : p)} />
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

      {/* Apple Watch / iPhone Health Sync */}
      <Card style={{ borderColor: "var(--accent)" }}>
        <div className="flex items-center gap-2 mb-3">
          <Watch size={20} style={{ color: "var(--accent)" }} />
          <h2 className="font-semibold">Apple Watch / iPhone Health Sync</h2>
        </div>
        <p className="text-xs mb-4" style={{ color: "var(--muted)" }}>
          iOS Shortcuts reads your Health data (sleep stages, calories, protein) and pushes it here automatically. Works with Apple Watch, and any app that writes to Apple Health — MyFitnessPal, Cronometer, WaterMinder, etc.
        </p>

        {/* API Key */}
        <div className="mb-3">
          <label className="text-xs mb-1 block" style={{ color: "var(--muted)" }}>API Key (recommended — prevents unauthorized access)</label>
          <input className={inputCls} style={inputStyle} placeholder="e.g. my-secret-key-123" value={settings.apiKey}
            onChange={e => setSettings(p => p ? { ...p, apiKey: e.target.value } : p)} />
        </div>

        {/* Webhook URL + buttons */}
        <div className="mb-4">
          <label className="text-xs mb-1 block" style={{ color: "var(--muted)" }}>Your webhook URL</label>
          <div className="flex gap-2 items-stretch">
            <div className="flex-1 rounded-lg px-3 py-2 text-xs font-mono break-all flex items-center min-w-0"
              style={{ background: "var(--surface2)", border: "1px solid var(--border)", color: "var(--accent)" }}>
              <span className="truncate">{apiUrl}</span>
            </div>
            <button onClick={() => copyUrl(apiUrl)} title="Copy URL"
              className="px-3 rounded-lg text-xs font-medium flex items-center gap-1 shrink-0"
              style={{ background: "var(--surface2)", border: "1px solid var(--border)", color: "var(--text)" }}>
              <Copy size={13} /> Copy
            </button>
            <button onClick={testConnection} title="Test connection"
              className="px-3 rounded-lg text-xs font-medium flex items-center gap-1 shrink-0 transition-all"
              style={{
                background: testStatus === "ok" ? "#22c55e" : testStatus === "error" ? "#ef4444" : "var(--surface2)",
                border: "1px solid var(--border)",
                color: testStatus === "ok" || testStatus === "error" ? "#fff" : "var(--text)",
              }}>
              <Wifi size={13} />
              {testStatus === "ok" ? "OK!" : testStatus === "error" ? "Failed" : testStatus === "testing" ? "…" : "Test"}
            </button>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-1 mb-4 p-1 rounded-lg" style={{ background: "var(--surface2)" }}>
          {(["sleep", "daily"] as const).map(t => (
            <button key={t} onClick={() => setSyncTab(t)}
              className="flex-1 py-1.5 rounded-md text-xs font-medium transition-all"
              style={{ background: syncTab === t ? "var(--accent)" : "transparent", color: syncTab === t ? "#fff" : "var(--muted)" }}>
              {t === "sleep" ? "Sleep Shortcut" : "Daily Health"}
            </button>
          ))}
        </div>

        {/* Sleep Shortcut */}
        {syncTab === "sleep" && (
          <div className="space-y-3">
            <p className="text-xs" style={{ color: "var(--muted)" }}>
              Create a daily automation at <strong>8:00 AM</strong>. It reads last night&apos;s Apple Watch sleep and pushes it here. Sleep quality is auto-calculated from deep + REM percentages.
            </p>
            <div className="rounded-lg p-3 text-xs space-y-2" style={{ background: "var(--surface2)", border: "1px solid var(--border)" }}>
              <p className="font-semibold" style={{ color: "var(--text)" }}>Shortcuts app steps:</p>
              <ol className="list-decimal list-inside space-y-1.5" style={{ color: "var(--muted)" }}>
                <li>Open <strong>Shortcuts</strong> → <strong>Automation</strong> tab → <strong>+</strong> → <strong>Time of Day</strong> → 8:00 AM → Daily</li>
                <li>Add action: <strong>Find Health Samples</strong> → type <strong>Asleep (Deep)</strong> → Last 1 day → name it <em>deep</em></li>
                <li>Add action: <strong>Calculate Statistics</strong> on <em>deep</em> → <strong>Sum</strong> of <strong>Duration (min)</strong> → name it <em>deepMins</em></li>
                <li>Repeat steps 2–3 for <strong>Asleep (REM)</strong> → name outputs <em>rem</em>, <em>remMins</em></li>
                <li>Add action: <strong>Find Health Samples</strong> → type <strong>In Bed</strong> → Last 1 day → Calculate Sum Duration → name it <em>totalMins</em></li>
                <li>Add action: <strong>Get Contents of URL</strong> → URL: paste your webhook above → Method: <strong>POST</strong> → Body: <strong>JSON</strong></li>
                <li>Add these JSON fields (tap each + to add a key/value pair):</li>
              </ol>
            </div>
            <div className="rounded-lg p-3 text-xs" style={{ background: "var(--surface2)", border: "1px solid var(--border)" }}>
              <p className="font-semibold mb-2" style={{ color: "var(--text)" }}>JSON body (use Shortcut variables for deepMins / remMins / totalMins):</p>
              <pre className="overflow-auto" style={{ color: "var(--accent)" }}>{JSON.stringify({
                apiKey: settings.apiKey || "<your-api-key>",
                sleep: {
                  bedtime: "23:00",
                  wakeTime: "07:00",
                  duration: "«totalMins / 60»",
                  deepMins: "«deepMins»",
                  remMins: "«remMins»",
                  totalMins: "«totalMins»",
                }
              }, null, 2)}</pre>
              <p className="mt-2 text-xs" style={{ color: "var(--muted)" }}>
                Replace <code>«...»</code> with the matching Shortcut variable. Quality 1–5 is computed automatically from deep + REM percentage. Or pass <code>&quot;quality&quot;: 3</code> directly to set it manually.
              </p>
            </div>
            <div className="rounded-lg p-3 text-xs" style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.25)" }}>
              <p className="font-medium mb-1" style={{ color: "var(--accent)" }}>Quality scale derived from stages:</p>
              <div className="grid grid-cols-5 gap-1" style={{ color: "var(--muted)" }}>
                {[["1 Poor","<15%"],["2 Fair","15-20%"],["3 OK","20-25%"],["4 Good","25-30%"],["5 Great",">30%"]].map(([l,p]) => (
                  <div key={l} className="text-center rounded p-1" style={{ background: "var(--surface)" }}>
                    <p className="font-medium" style={{ color: "var(--text)" }}>{l}</p>
                    <p>{p} deep+REM</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Daily Health Shortcut */}
        {syncTab === "daily" && (
          <div className="space-y-3">
            <p className="text-xs" style={{ color: "var(--muted)" }}>
              Create a daily automation at <strong>9:00 PM</strong>. It reads today&apos;s dietary calories and protein from Apple Health (logged by MyFitnessPal, Cronometer, or manually) and syncs them here.
            </p>
            <div className="rounded-lg p-3 text-xs space-y-2" style={{ background: "var(--surface2)", border: "1px solid var(--border)" }}>
              <p className="font-semibold" style={{ color: "var(--text)" }}>Shortcuts app steps:</p>
              <ol className="list-decimal list-inside space-y-1.5" style={{ color: "var(--muted)" }}>
                <li>Open <strong>Shortcuts</strong> → <strong>Automation</strong> → <strong>+</strong> → <strong>Time of Day</strong> → 9:00 PM → Daily</li>
                <li>Add action: <strong>Find Health Samples</strong> → type <strong>Dietary Energy</strong> → Today → Calculate <strong>Sum</strong> → name it <em>totalCal</em></li>
                <li>Add action: <strong>Find Health Samples</strong> → type <strong>Dietary Protein</strong> → Today → Calculate <strong>Sum</strong> → name it <em>totalProtein</em></li>
                <li>Add action: <strong>Get Contents of URL</strong> → paste webhook URL → POST → JSON body below</li>
                <li>Save and enable the automation</li>
              </ol>
            </div>
            <div className="rounded-lg p-3 text-xs" style={{ background: "var(--surface2)", border: "1px solid var(--border)" }}>
              <p className="font-semibold mb-2" style={{ color: "var(--text)" }}>JSON body:</p>
              <pre className="overflow-auto" style={{ color: "var(--accent)" }}>{JSON.stringify({
                apiKey: settings.apiKey || "<your-api-key>",
                calories: "«totalCal»",
                protein: "«totalProtein»",
              }, null, 2)}</pre>
              <p className="mt-2" style={{ color: "var(--muted)" }}>
                Calories and protein are <strong>replaced</strong> each sync (not duplicated) — safe to run multiple times per day.
              </p>
            </div>
            <div className="rounded-lg p-3 text-xs" style={{ background: "rgba(6,182,212,0.07)", border: "1px solid rgba(6,182,212,0.2)" }}>
              <p className="font-medium mb-1.5" style={{ color: "#06b6d4" }}>Apps that write to Apple Health automatically:</p>
              <ul className="space-y-1" style={{ color: "var(--muted)" }}>
                <li><strong>MyFitnessPal</strong> — calories + macros (enable in MFP Settings → Apps → Apple Health)</li>
                <li><strong>Cronometer</strong> — detailed macros (Settings → Integrations → Apple Health)</li>
                <li><strong>Lose It!</strong> — calories + macros (Settings → Apple Health)</li>
                <li><strong>Apple Watch</strong> — active calories burned (separate from dietary)</li>
              </ul>
            </div>
          </div>
        )}
      </Card>

      <button onClick={save} className="w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all" style={{ background: saved ? "#22c55e" : "var(--accent)", color: "#fff" }}>
        <Save size={18} /> {saved ? "Saved!" : "Save Settings"}
      </button>
    </div>
  );
}
