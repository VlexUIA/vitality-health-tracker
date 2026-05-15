"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Flame, Droplets, Pill, Moon, Zap, Settings } from "lucide-react";

const links = [
  { href: "/", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/calories", icon: Flame, label: "Calories" },
  { href: "/water", icon: Droplets, label: "Water" },
  { href: "/vitamins", icon: Pill, label: "Vitamins" },
  { href: "/sleep", icon: Moon, label: "Sleep" },
  { href: "/energy", icon: Zap, label: "Energy" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

export default function Nav() {
  const path = usePathname();

  return (
    <>
      {/* Sidebar for desktop */}
      <aside className="hidden md:flex flex-col w-60 min-h-screen border-r fixed top-0 left-0 z-30"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <div className="px-6 py-6">
          <span className="text-xl font-bold" style={{ color: "var(--accent)" }}>Vitality</span>
          <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>Health Tracker</p>
        </div>
        <nav className="flex-1 px-3">
          {links.map(({ href, icon: Icon, label }) => {
            const active = path === href;
            return (
              <Link key={href} href={href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 text-sm font-medium transition-all"
                style={{
                  background: active ? "var(--accent)" : "transparent",
                  color: active ? "#fff" : "var(--muted)",
                }}>
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Bottom bar for mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 flex justify-around items-center py-2 border-t"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        {links.slice(0, 6).map(({ href, icon: Icon, label }) => {
          const active = path === href;
          return (
            <Link key={href} href={href} className="flex flex-col items-center gap-0.5 px-2 py-1">
              <Icon size={22} style={{ color: active ? "var(--accent)" : "var(--muted)" }} />
              <span className="text-[10px]" style={{ color: active ? "var(--accent)" : "var(--muted)" }}>{label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
