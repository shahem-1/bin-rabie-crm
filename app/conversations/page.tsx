"use client";

import { useState, useMemo } from "react";
import { Send, ChevronUp, ChevronDown, Filter, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { customers, sources, companyName, type Channel } from "@/lib/data";
import { dictionary as d, tx } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { TableSkeleton } from "@/components/Skeleton";
import { cn } from "@/lib/utils";

const channelFilters: (Channel | "all")[] = ["all", "whatsapp", "instagram", "facebook", "website"];

interface SortConfig {
  key: string;
  direction: "asc" | "desc";
}

interface ColumnFilter {
  key: string;
  value: string;
}

export default function ConversationsPage() {
  const { lang, companyId, conversations, sendReply } = useStore();
  const [filter, setFilter] = useState<Channel | "all">("all");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: "lastTime", direction: "desc" });
  const [columnFilters, setColumnFilters] = useState<ColumnFilter[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showFilters, setShowFilters] = useState(false);

  const filteredList = useMemo(() => {
    let result = conversations.filter((c) => {
      if (filter !== "all" && c.channel !== filter) return false;
      if (companyId) {
        const cu = customers.find((cu) => cu.id === c.customerId);
        if (cu && cu.companyId !== companyId) return false;
      }
      return true;
    });

    // Apply column filters
    columnFilters.forEach(({ key, value }) => {
      if (!value) return;
      const v = value.toLowerCase();
      result = result.filter((c) => {
        const cu = customers.find((cu) => cu.id === c.customerId);
        switch (key) {
          case "customer":
            return (lang === "ar" ? cu?.nameAr : cu?.nameEn)?.toLowerCase().includes(v);
          case "channel":
            return c.channel.toLowerCase().includes(v);
          case "company":
            return companyName(cu?.companyId || "", lang).toLowerCase().includes(v);
          case "lastMessage":
            return c.messages[c.messages.length - 1]?.text.toLowerCase().includes(v);
          case "time":
            return c.lastTime.toLowerCase().includes(v);
          default:
            return true;
        }
      });
    });

    // Apply sorting
    result.sort((a, b) => {
      const cuA = customers.find((cu) => cu.id === a.customerId);
      const cuB = customers.find((cu) => cu.id === b.customerId);
      let aVal: string | number = "";
      let bVal: string | number = "";

      switch (sortConfig.key) {
        case "customer":
          aVal = lang === "ar" ? cuA?.nameAr || "" : cuA?.nameEn || "";
          bVal = lang === "ar" ? cuB?.nameAr || "" : cuB?.nameEn || "";
          break;
        case "channel":
          aVal = a.channel;
          bVal = b.channel;
          break;
        case "company":
          aVal = companyName(cuA?.companyId || "", lang);
          bVal = companyName(cuB?.companyId || "", lang);
          break;
        case "lastMessage":
          aVal = a.messages[a.messages.length - 1]?.text || "";
          bVal = b.messages[b.messages.length - 1]?.text || "";
          break;
        case "time":
          aVal = a.lastTime;
          bVal = b.lastTime;
          break;
      }

      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [conversations, filter, companyId, columnFilters, sortConfig, lang]);

  const totalPages = Math.ceil(filteredList.length / pageSize);
  const paginatedList = filteredList.slice((page - 1) * pageSize, page * pageSize);

  const active = filteredList.find((c) => c.id === activeId) ?? filteredList[0] ?? null;
  const activeCustomer = active ? customers.find((cu) => cu.id === active.customerId) : null;

  function handleSort(key: string) {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  }

  function handleFilterChange(key: string, value: string) {
    setColumnFilters((prev) => {
      const existing = prev.find((f) => f.key === key);
      if (existing) {
        return prev.map((f) => (f.key === key ? { ...f, value } : f));
      }
      return [...prev, { key, value }];
    });
    setPage(1);
  }

  function clearFilters() {
    setColumnFilters([]);
    setPage(1);
  }

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!reply.trim() || !active) return;
    sendReply(active.id, reply.trim());
    setReply("");
  }

  const columns = [
    { key: "customer", label: tx(lang, d.customer) },
    { key: "channel", label: tx(lang, d.channel) },
    { key: "company", label: tx(lang, d.company) },
    { key: "lastMessage", label: tx(lang, d.lastMessage) },
    { key: "time", label: tx(lang, d.time) },
  ];

  return (
    <div className="flex h-[calc(100vh-5rem)] gap-4">
      {/* list */}
      <div className="w-80 flex-none overflow-y-auto rounded-2xl border border-line bg-card shadow-sm">
        <div className="sticky top-0 flex gap-1 border-b border-line bg-card p-3">
          {channelFilters.map((ch) => (
            <button
              key={ch}
              onClick={() => setFilter(ch)}
              className={`rounded-lg px-3 py-1 text-xs font-semibold ${filter === ch ? "bg-brand text-white" : "text-muted hover:bg-muted/20 dark:hover:bg-card-hover"}`}
            >
              {ch === "all" ? tx(lang, d.all) : tx(lang, sources.find((s) => s.key === ch)!)}
            </button>
          ))}
        </div>
        <ul>
          {paginatedList.map((c) => {
            const cu = customers.find((cu) => cu.id === c.customerId)!;
            const last = c.messages[c.messages.length - 1];
            const isActive = c.id === (active?.id ?? "");
            return (
              <li key={c.id}>
                <button
                  onClick={() => setActiveId(c.id)}
                  className={`flex w-full items-start gap-3 border-b border-line px-4 py-3 text-start ${
                    isActive
                      ? "bg-blue-50 dark:bg-blue-950/50 text-foreground font-medium"
                      : "hover:bg-muted/20 dark:hover:bg-card-hover text-foreground"
                  }`}
                >
                  <div className={`mt-0.5 h-2.5 w-2.5 flex-none rounded-full ${c.unread ? "bg-brand" : "bg-transparent"}`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-semibold">{lang === "ar" ? cu.nameAr : cu.nameEn}</span>
                      <span className="text-xs text-muted">{c.lastTime}</span>
                    </div>
                    <div className="mt-0.5 truncate text-xs text-muted">{last.text}</div>
                  </div>
                </button>
              </li>
            );
          })}
          {paginatedList.length === 0 && (
            <li className="p-6 text-center text-sm text-muted">{tx(lang, d.noConversations)}</li>
          )}
        </ul>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="border-t border-line p-3">
            <div className="flex items-center justify-between text-sm text-muted">
              <span>
                {filteredList.length} {tx(lang, d.conversations)} · {tx(lang, d.page)} {page} / {totalPages}
              </span>
              <div className="flex items-center gap-1">
                <select
                  value={pageSize}
                  onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                  className="rounded border border-line bg-card text-foreground px-2 py-1 text-xs outline-none"
                >
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="btn-interactive p-1 rounded hover:bg-muted/20 dark:hover:bg-card-hover disabled:opacity-50"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="btn-interactive p-1 rounded hover:bg-muted/20 dark:hover:bg-card-hover disabled:opacity-50"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* thread */}
      <div className="flex flex-1 flex-col rounded-2xl border border-line bg-card shadow-sm">
        {active && activeCustomer ? (
          <>
            <div className="flex items-center gap-4 border-b border-line px-5 py-3">
              <div>
                <div className="font-semibold">{lang === "ar" ? activeCustomer.nameAr : activeCustomer.nameEn}</div>
                <div className="text-xs text-muted">
                  {tx(lang, sources.find((s) => s.key === active.channel)!)} · {companyName(activeCustomer.companyId, lang)}
                </div>
              </div>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto p-5">
              {active.messages.map((m) => (
                <div
                  key={m.id}
                  className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm ${
                    m.from === "agent"
                      ? "ms-auto bg-brand text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  }`}
                >
                  {m.text}
                  <div className={`mt-1 text-[10px] ${m.from === "agent" ? "text-blue-200" : "text-muted"}`}>{m.time}</div>
                </div>
              ))}
            </div>
            <form onSubmit={handleSend} className="flex gap-2 border-t border-line p-3">
              <input
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder={tx(lang, d.reply)}
                className="flex-1 rounded-xl border border-line bg-card text-foreground px-4 py-2 text-sm outline-none focus:border-brand"
              />
              <button className="flex items-center gap-1 rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark">
                <Send size={15} />
              </button>
            </form>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center text-muted">{tx(lang, d.noConversations)}</div>
        )}
      </div>
    </div>
  );
}
