"use client";

import { createContext, useContext, useMemo, useState, useEffect } from "react";
import {
  conversations as seedConversations,
  scheduledMessages as seedScheduled,
  tasks as seedTasks,
  employees as seedEmployees,
  customers as seedCustomers,
  type ChatMessage,
  type Conversation,
  type ScheduledMessage,
  type Task,
  type Employee,
  type Customer,
} from "./data";
import { type Lang } from "./i18n";

type Theme = "light" | "dark" | "system";
type Density = "compact" | "comfy";

interface Store {
  lang: Lang;
  toggleLang: () => void;
  companyId: string | null;
  setCompanyId: (id: string | null) => void;
  tasks: Task[];
  toggleTask: (id: string) => void;
  conversations: Conversation[];
  sendReply: (conversationId: string, text: string) => void;
  scheduled: ScheduledMessage[];
  toggleScheduled: (id: string) => void;
  employees: Employee[];
  customers: Customer[];
  // New state
  theme: Theme;
  setTheme: (theme: Theme) => void;
  density: Density;
  setDensity: (density: Density) => void;
  notificationOpen: boolean;
  setNotificationOpen: (open: boolean) => void;
  userMenuOpen: boolean;
  setUserMenuOpen: (open: boolean) => void;
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
  // Hydration state
  mounted: boolean;
  setMounted: (mounted: boolean) => void;
}

const StoreContext = createContext<Store | null>(null);

// localStorage keys
const STORAGE_KEYS = {
  lang: "binrabie.lang",
  companyId: "binrabie.companyId",
  theme: "binrabie.theme",
  density: "binrabie.density",
} as const;

// Initialize state from localStorage (client-side only)
function getInitialLang(): Lang {
  if (typeof window === "undefined") return "ar";
  return (localStorage.getItem(STORAGE_KEYS.lang) as Lang) || "ar";
}

function getInitialCompanyId(): string | null {
  if (typeof window === "undefined") return null;
  const saved = localStorage.getItem(STORAGE_KEYS.companyId);
  // Check if it's a valid company ID
  return saved || null;
}

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "system";
  return (localStorage.getItem(STORAGE_KEYS.theme) as Theme) || "system";
}

function getInitialDensity(): Density {
  if (typeof window === "undefined") return "comfy";
  return (localStorage.getItem(STORAGE_KEYS.density) as Density) || "comfy";
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>(getInitialLang);
  const [companyId, setCompanyId] = useState<string | null>(getInitialCompanyId);
  const [tasks, setTasks] = useState<Task[]>(seedTasks);
  const [conversations, setConversations] = useState<Conversation[]>(seedConversations);
  const [scheduled, setScheduled] = useState<ScheduledMessage[]>(seedScheduled);
  const [employees] = useState<Employee[]>(seedEmployees);
  const [customers] = useState<Customer[]>(seedCustomers);
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [density, setDensity] = useState<Density>(getInitialDensity);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Mark as mounted after initial render to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.lang, lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.companyId, companyId || "");
  }, [companyId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.theme, theme);
    // Apply theme to document
    const root = document.documentElement;
    if (theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.density, density);
    // Apply density to document
    const root = document.documentElement;
    if (density === "compact") {
      root.classList.add("density-compact");
    } else {
      root.classList.remove("density-compact");
    }
  }, [density]);

  
  const value = useMemo<Store>(
    () => ({
      lang,
      toggleLang: () => setLang((l) => (l === "ar" ? "en" : "ar")),
      companyId,
      setCompanyId: (id) => {
        setCompanyId(id);
        localStorage.setItem(STORAGE_KEYS.companyId, id || "");
      },
      tasks,
      toggleTask: (id) =>
        setTasks((list) => list.map((t) => (t.id === id ? { ...t, done: !t.done } : t))),
      conversations,
      sendReply: (conversationId, text) =>
        setConversations((list) =>
          list.map((c) =>
            c.id === conversationId
              ? {
                  ...c,
                  unread: false,
                  lastTime: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
                  messages: [
                    ...c.messages,
                    { id: `local-${Date.now()}`, from: "agent", text, time: "الآن" } satisfies ChatMessage,
                  ],
                }
              : c,
          ),
        ),
      scheduled,
      toggleScheduled: (id) =>
        setScheduled((list) => list.map((m) => (m.id === id ? { ...m, sent: !m.sent } : m))),
      employees,
      customers,
      // New state
      theme,
      setTheme,
      density,
      setDensity,
      notificationOpen,
      setNotificationOpen,
      userMenuOpen,
      setUserMenuOpen,
      commandPaletteOpen,
      setCommandPaletteOpen,
      // Hydration state
      mounted,
      setMounted,
    }),
    [lang, companyId, tasks, conversations, scheduled, theme, density, notificationOpen, userMenuOpen, commandPaletteOpen],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): Store {
  const store = useContext(StoreContext);
  if (!store) throw new Error("useStore must be used inside StoreProvider");
  return store;
}
