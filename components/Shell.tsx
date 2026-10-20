"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  MessagesSquare,
  CalendarClock,
  Users,
  ListChecks,
  Trophy,
  BarChart3,
  Languages,
  Building2,
  Bell,
  Sun,
  Moon,
  Monitor,
  LayoutList,
  LayoutGrid,
  Command,
  User,
  Settings,
  LogOut,
  ChevronDown,
  Search,
} from "lucide-react";
import { companies } from "@/lib/data";
import { dictionary as d, tx } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { Dropdown } from "./Dropdown";
import { CommandPalette } from "./CommandPalette";
import { ToastProvider } from "./Toast";
import { AiAnalystChat } from "./AiAnalystChat";

const subsidiaries = [
  { ar: "شركة بن ربعي للتجارة والخدمات", en: "Bin Rabie Trading & Services" },
  { ar: "شركة قادر للتوصيل والنقل", en: "Qader Delivery & Transport" },
  { ar: "شركة دوم لتأجير السيارات", en: "Dom Car Rental" },
];

const links = [
  { href: "/", key: "dashboard", icon: LayoutDashboard },
  { href: "/conversations", key: "conversations", icon: MessagesSquare },
  { href: "/scheduled", key: "scheduled", icon: CalendarClock },
  { href: "/customers", key: "customers", icon: Users },
  { href: "/tasks", key: "tasks", icon: ListChecks },
  { href: "/employees", key: "employees", icon: Trophy },
  { href: "/reports", key: "reports", icon: BarChart3 },
] as const;

export default function Shell({ children }: { children: React.ReactNode }) {
  const {
    lang,
    toggleLang,
    companyId,
    setCompanyId,
    theme,
    setTheme,
    density,
    setDensity,
    conversations,
    notificationOpen,
    setNotificationOpen,
    userMenuOpen,
    setUserMenuOpen,
    commandPaletteOpen,
    setCommandPaletteOpen,
    mounted,
  } = useStore();

  const pathname = usePathname();
  const router = useRouter();
  const dir = lang === "ar" ? "rtl" : "ltr";
  const unreadCount = conversations.filter((c) => c.unread).length;

  // Command palette keyboard shortcut
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
      if (e.key === "Escape") {
        setCommandPaletteOpen(false);
        setNotificationOpen(false);
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [setCommandPaletteOpen, setNotificationOpen, setUserMenuOpen]);

  const themeIcons = {
    light: Sun,
    dark: Moon,
    system: Monitor,
  };

  const densityIcons = {
    compact: LayoutList,
    comfy: LayoutGrid,
  };

  // Use "system" icon during SSR to avoid hydration mismatch
  const ThemeIcon = mounted ? themeIcons[theme] : themeIcons.system;
  const DensityIcon = densityIcons[density];

  const notificationItems = [
    ...conversations
      .filter((c) => c.unread)
      .slice(0, 5)
      .map((c) => ({
        label: `${c.messages[c.messages.length - 1]?.text || "New message"}`,
        onClick: () => {},
      })),
    unreadCount > 5 && {
      label: `${tx(lang, d.markAllRead)} (${unreadCount})`,
      onClick: () => {},
    },
  ].filter(Boolean) as { label: string; onClick: () => void }[];

  const userMenuItems = [
    { label: tx(lang, d.profile), icon: <User size={14} />, onClick: () => router.push("/profile") },
    { label: tx(lang, d.settings), icon: <Settings size={14} />, onClick: () => router.push("/settings") },
    { label: tx(lang, d.signOut), icon: <LogOut size={14} />, onClick: () => router.push("/login"), danger: true },
  ];

  return (
    <ToastProvider>
      <div dir={dir} className="flex min-h-screen">
        <aside className="fixed inset-y-0 start-0 z-20 flex w-64 flex-col bg-sidebar text-sidebar-foreground">
        <div className="flex items-center gap-3 px-5 py-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand text-white text-lg font-bold">
            بر
          </div>
          <div className="leading-tight">
            <div className="text-sm font-bold text-sidebar-foreground">{tx(lang, d.brand)}</div>
            <div className="text-xs text-sidebar-foreground/70">{tx(lang, d.brandSub)}</div>
          </div>
        </div>

        {/* Subsidiaries */}
        <div className="px-5 pb-4 border-b border-line">
          <div className="flex flex-wrap gap-1.5 text-[10px] text-sidebar-foreground/70">
            {subsidiaries.map((s, i) => (
              <span key={s.ar} className="flex items-center gap-1">
                {i > 0 && <span className="text-sidebar-foreground/70">·</span>}
                {lang === "ar" ? s.ar : s.en}
              </span>
            ))}
          </div>
        </div>

        <nav className="mt-2 flex-1 space-y-1 px-3">
          {links.map(({ href, key, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                  active ? "bg-brand font-semibold text-sidebar-foreground" : "text-sidebar-foreground/70 hover:bg-muted/50 hover:text-sidebar-foreground"
                }`}
              >
                <Icon size={18} />
                {tx(lang, d.nav[key])}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-4">
          <Dropdown
            trigger={
              <span className="btn-interactive flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-sidebar-foreground hover:bg-muted/50 transition">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand/20 text-brand text-sm font-bold">
                  ي
                </div>
                <div className="flex-1 text-start leading-tight">
                  <div className="text-sm font-semibold text-sidebar-foreground">{tx(lang, d.userName)}</div>
                  <div className="text-xs text-sidebar-foreground/70">{tx(lang, d.userRole)}</div>
                </div>
              </span>
            }
            items={userMenuItems}
            align="start"
          />
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col ps-64">
        <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-line bg-card/90 px-6 py-3 backdrop-blur">
          <div className="flex items-center gap-2 text-sm">
            <Dropdown
              trigger={
                <span className="btn-interactive flex items-center gap-2.5 rounded-xl border border-line bg-card px-3.5 py-2 text-sm font-semibold text-foreground hover:bg-muted/50 transition shadow-sm" style={{ minWidth: 220 }}>
                  <Building2 size={16} className="text-brand flex-shrink-0" />
                  <span className="truncate flex-1 text-start">
                    {companyId ? companies.find((c) => c.id === companyId)?.[lang] : tx(lang, d.allCompanies)}
                  </span>
                </span>
              }
              items={[
                {
                  label: tx(lang, d.allCompanies),
                  onClick: () => setCompanyId(null),
                  icon: <Building2 size={14} className={!companyId ? "text-brand" : "text-muted"} />,
                },
                ...companies.map((c) => ({
                  label: c[lang],
                  onClick: () => setCompanyId(c.id),
                  icon: <Building2 size={14} className={companyId === c.id ? "text-brand" : "text-muted"} />,
                })),
              ]}
              align="start"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Density Toggle */}
            <Dropdown
              trigger={
                <span className="btn-interactive flex items-center gap-2 rounded-lg border border-line bg-card px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted/50 transition" title={tx(lang, d.density)}>
                  <DensityIcon size={16} />
                </span>
              }
              items={[
                { label: tx(lang, d.comfy), icon: <LayoutGrid size={14} />, onClick: () => setDensity("comfy") },
                { label: tx(lang, d.compact), icon: <LayoutList size={14} />, onClick: () => setDensity("compact") },
              ]}
              align="end"
            />

            {/* Theme Toggle */}
            <Dropdown
              trigger={
                <span className="btn-interactive flex items-center gap-2 rounded-lg border border-line bg-card px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted/50 transition" title={tx(lang, d.theme)}>
                  <ThemeIcon size={16} />
                </span>
              }
              items={[
                { label: tx(lang, d.light), icon: <Sun size={14} />, onClick: () => setTheme("light") },
                { label: tx(lang, d.dark), icon: <Moon size={14} />, onClick: () => setTheme("dark") },
                { label: tx(lang, d.system), icon: <Monitor size={14} />, onClick: () => setTheme("system") },
              ]}
              align="end"
            />

            {/* Notification Bell */}
            <Dropdown
              trigger={
                <span className="btn-interactive relative flex h-10 w-10 items-center justify-center rounded-lg border border-line bg-card text-foreground hover:bg-muted/50 transition" title={tx(lang, d.notifications)}>
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-red-200 animate-pulse">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </span>
              }
              items={[
                ...notificationItems,
                notificationItems.length === 0 && {
                  label: tx(lang, d.notifications),
                  onClick: () => {},
                  disabled: true,
                },
              ].filter(Boolean) as { label: string; onClick: () => void; icon?: React.ReactNode; danger?: boolean; disabled?: boolean }[]}
              align="end"
            />

            {/* Language Toggle */}
            <button
              onClick={toggleLang}
              className="btn-interactive flex items-center gap-2 rounded-lg border border-line bg-card px-3 py-1.5 text-sm font-semibold text-brand hover:bg-muted/50 transition"
            >
              <Languages size={16} />
              {lang === "ar" ? "EN" : "عربي"}
            </button>
          </div>
        </header>

        <main className="flex-1 p-6">{children}</main>
      </div>

      <AiAnalystChat />
      <CommandPalette />
      </div>
    </ToastProvider>
  );
}
