"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MessagesSquare,
  CalendarClock,
  Users,
  ListChecks,
  Trophy,
  BarChart3,
  UserPlus,
  MessageSquare,
  Target,
  Settings,
  Sun,
  Moon,
  Monitor,
  LayoutList,
  LayoutGrid,
  Languages,
  ChevronRight,
  Search,
  Keyboard,
  X,
} from "lucide-react";
import { companies } from "@/lib/data";
import { dictionary as d, tx } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  shortcut?: string;
  icon?: React.ReactNode;
  section: "navigate" | "actions" | "preferences";
  onSelect: () => void;
  keywords: string[];
}

export function CommandPalette() {
  const {
    lang,
    companyId,
    theme,
    setTheme,
    density,
    setDensity,
    toggleLang,
    commandPaletteOpen,
    setCommandPaletteOpen,
  } = useStore();

  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Build command items
  const items = useMemo<CommandItem[]>(() => {
    const navItems: CommandItem[] = [
      { id: "dashboard", label: tx(lang, d.nav.dashboard), description: "Go to dashboard", shortcut: "⌘1", icon: <LayoutDashboard size={16} />, section: "navigate", onSelect: () => router.push("/"), keywords: ["dash", "home", "لوحة", "الرئيسية"] },
      { id: "conversations", label: tx(lang, d.nav.conversations), description: "View conversations", shortcut: "⌘2", icon: <MessagesSquare size={16} />, section: "navigate", onSelect: () => router.push("/conversations"), keywords: ["chat", "messages", "محادثات", "رسائل"] },
      { id: "scheduled", label: tx(lang, d.nav.scheduled), description: "View scheduled messages", shortcut: "⌘3", icon: <CalendarClock size={16} />, section: "navigate", onSelect: () => router.push("/scheduled"), keywords: ["schedule", "مجدولة", "مواعيد"] },
      { id: "customers", label: tx(lang, d.nav.customers), description: "View customers", shortcut: "⌘4", icon: <Users size={16} />, section: "navigate", onSelect: () => router.push("/customers"), keywords: ["clients", "عملاء", "زبائن"] },
      { id: "tasks", label: tx(lang, d.nav.tasks), description: "View tasks", shortcut: "⌘5", icon: <ListChecks size={16} />, section: "navigate", onSelect: () => router.push("/tasks"), keywords: ["todo", "مهام", "مهام اليوم"] },
      { id: "employees", label: tx(lang, d.nav.employees), description: "View employees", shortcut: "⌘6", icon: <Trophy size={16} />, section: "navigate", onSelect: () => router.push("/employees"), keywords: ["staff", "team", "موظفين", "فريق"] },
      { id: "reports", label: tx(lang, d.nav.reports), description: "View reports", shortcut: "⌘7", icon: <BarChart3 size={16} />, section: "navigate", onSelect: () => router.push("/reports"), keywords: ["analytics", "تقارير", "إحصائيات"] },
    ];

    const actionItems: CommandItem[] = [
      { id: "new-customer", label: tx(lang, d.newCustomer), description: "Create new customer", shortcut: "", icon: <UserPlus size={16} />, section: "actions", onSelect: () => {}, keywords: ["add", "client", "عميل", "جديد"] },
      { id: "new-conversation", label: tx(lang, d.newConversation), description: "Start new conversation", shortcut: "", icon: <MessageSquare size={16} />, section: "actions", onSelect: () => {}, keywords: ["chat", "message", "محادثة", "جديدة"] },
      { id: "new-task", label: tx(lang, d.newTask), description: "Create new task", shortcut: "", icon: <ListChecks size={16} />, section: "actions", onSelect: () => {}, keywords: ["todo", "مهمة", "جديدة"] },
      { id: "new-quote", label: tx(lang, d.newQuote), description: "Create new quote", shortcut: "", icon: <Target size={16} />, section: "actions", onSelect: () => {}, keywords: ["proposal", "عرض", "سعر"] },
    ];

    const preferenceItems: CommandItem[] = [
      { id: "theme-light", label: tx(lang, d.light), description: "Light theme", shortcut: "", icon: <Sun size={16} />, section: "preferences", onSelect: () => setTheme("light"), keywords: ["light", "فاتح", "مظهر"] },
      { id: "theme-dark", label: tx(lang, d.dark), description: "Dark theme", shortcut: "", icon: <Moon size={16} />, section: "preferences", onSelect: () => setTheme("dark"), keywords: ["dark", "داكن", "مظهر"] },
      { id: "theme-system", label: tx(lang, d.system), description: "System theme", shortcut: "", icon: <Monitor size={16} />, section: "preferences", onSelect: () => setTheme("system"), keywords: ["system", "نظام", "تلقائي"] },
      { id: "density-comfy", label: tx(lang, d.comfy), description: "Comfy spacing", shortcut: "", icon: <LayoutGrid size={16} />, section: "preferences", onSelect: () => setDensity("comfy"), keywords: ["comfy", "مريح", "كثافة", "تباعد"] },
      { id: "density-compact", label: tx(lang, d.compact), description: "Compact spacing", shortcut: "", icon: <LayoutList size={16} />, section: "preferences", onSelect: () => setDensity("compact"), keywords: ["compact", "مدمج", "كثافة", "ضيق"] },
      { id: "toggle-lang", label: lang === "ar" ? "English" : "العربية", description: "Switch language", shortcut: "", icon: <Languages size={16} />, section: "preferences", onSelect: toggleLang, keywords: ["language", "lang", "لغة", "عربي", "انجليزي"] },
    ];

    return [...navItems, ...actionItems, ...preferenceItems];
  }, [lang, theme, density, router, toggleLang, setTheme, setDensity]);

  // Filter items based on query
  const filteredItems = useMemo(() => {
    if (!query.trim()) return items;
    const q = query.toLowerCase();
    return items.filter((item) =>
      item.label.toLowerCase().includes(q) ||
      item.description?.toLowerCase().includes(q) ||
      item.keywords.some((k) => k.toLowerCase().includes(q))
    );
  }, [items, query]);

  // Group by section
  const groupedItems = useMemo(() => {
    const groups: Record<string, CommandItem[]> = { navigate: [], actions: [], preferences: [] };
    filteredItems.forEach((item) => groups[item.section].push(item));
    return groups;
  }, [filteredItems]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!commandPaletteOpen) return;
    setSelectedIndex(0);
    inputRef.current?.focus();
  }, [commandPaletteOpen]);

  useEffect(() => {
    if (!commandPaletteOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      const totalItems = filteredItems.length;
      if (totalItems === 0) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((i) => (i + 1) % totalItems);
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((i) => (i - 1 + totalItems) % totalItems);
          break;
        case "Enter":
          e.preventDefault();
          filteredItems[selectedIndex]?.onSelect();
          setCommandPaletteOpen(false);
          setQuery("");
          break;
        case "Escape":
          setCommandPaletteOpen(false);
          setQuery("");
          break;
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [commandPaletteOpen, filteredItems, selectedIndex, setCommandPaletteOpen]);

  // Scroll selected item into view
  useEffect(() => {
    if (!commandPaletteOpen) return;
    const selectedElement = document.getElementById(`cmd-item-${selectedIndex}`);
    if (selectedElement) {
      selectedElement.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex, commandPaletteOpen]);

  if (!commandPaletteOpen) return null;

  const isMac = typeof navigator !== "undefined" && navigator.platform.includes("Mac");
  const modifierKey = isMac ? "⌘" : "Ctrl";

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setCommandPaletteOpen(false)} />
      <div className="relative w-full max-w-2xl rounded-2xl border border-line bg-card shadow-2xl overflow-hidden dropdown-enter dark:bg-slate-800">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-line px-4 py-3">
          <div className="flex items-center gap-2 text-muted">
            <Search size={18} />
            <span className="text-xs uppercase tracking-wider">{tx(lang, d.commandPalette)}</span>
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={tx(lang, d.searchActions)}
            className="flex-1 bg-transparent text-foreground placeholder:text-muted text-sm outline-none"
            autoFocus
          />
          <div className="flex items-center gap-1.5 text-xs text-muted px-2 py-1 rounded bg-muted/50">
            <Keyboard size={12} />
            <span>{modifierKey}K</span>
          </div>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-96 overflow-y-auto p-2">
          {Object.entries(groupedItems).map(([section, sectionItems]) => {
            if (sectionItems.length === 0) return null;
            return (
              <div key={section} className="space-y-1">
                <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted">
                  {section === "navigate" && tx(lang, d.navigate)}
                  {section === "actions" && tx(lang, d.actions)}
                  {section === "preferences" && tx(lang, d.preferences)}
                </div>
                {sectionItems.map((item, index) => {
                  const globalIndex = filteredItems.indexOf(item);
                  const isSelected = globalIndex === selectedIndex;
                  return (
                    <button
                      key={item.id}
                      id={`cmd-item-${globalIndex}`}
                      onClick={() => {
                        item.onSelect();
                        setCommandPaletteOpen(false);
                        setQuery("");
                      }}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                        isSelected
                          ? "bg-brand/10 text-brand"
                          : "text-foreground hover:bg-muted/50",
                        "dark:hover:bg-slate-700/50"
                      )}
                      role="option"
                      aria-selected={isSelected}
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/50 text-muted">
                        {item.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{item.label}</div>
                        {item.description && (
                          <div className="text-xs text-muted truncate">{item.description}</div>
                        )}
                      </div>
                      {item.shortcut && (
                        <span className="text-xs text-muted font-mono">{item.shortcut}</span>
                      )}
                      {isSelected && <ChevronRight size={14} className="text-brand" />}
                    </button>
                  );
                })}
              </div>
            );
          })}

          {filteredItems.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted">
              <Search size={32} className="mb-3 opacity-50" />
              <p>{tx(lang, d.noResults)}</p>
              <p className="text-xs">Try different keywords</p>
            </div>
          )}
        </div>

        {/* Footer hint */}
        <div className="border-t border-line px-4 py-2 text-center">
          <span className="text-xs text-muted">
            {modifierKey}{" "}
            <kbd className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono">Enter</kbd>{" "}
            {tx(lang, d.select)} ·{" "}
            <kbd className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono">Esc</kbd>{" "}
            {tx(lang, d.close)}
          </span>
        </div>
      </div>
    </div>
  );
}