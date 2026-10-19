"use client";

import { useState, useMemo } from "react";
import { ChevronUp, ChevronDown, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { customers, sources, companyName } from "@/lib/data";
import { dictionary as d, tx } from "@/lib/i18n";
import { useStore } from "@/lib/store";

interface SortConfig {
  key: string;
  direction: "asc" | "desc";
}

interface ColumnFilter {
  key: string;
  value: string;
}

export default function ScheduledPage() {
  const { lang, companyId, scheduled, toggleScheduled } = useStore();
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: "when", direction: "desc" });
  const [columnFilters, setColumnFilters] = useState<ColumnFilter[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const baseList = scheduled.filter((s) => {
    if (!companyId) return true;
    const cu = customers.find((c) => c.id === s.customerId);
    return cu?.companyId === companyId;
  });

  const filteredList = useMemo(() => {
    let result = [...baseList];

    // Apply column filters
    columnFilters.forEach(({ key, value }) => {
      if (!value) return;
      const v = value.toLowerCase();
      result = result.filter((s) => {
        const cu = customers.find((c) => c.id === s.customerId);
        switch (key) {
          case "customer":
            return cu ? (lang === "ar" ? cu.nameAr : cu.nameEn).toLowerCase().includes(v) : false;
          case "channel":
            return tx(lang, sources.find((src) => src.key === s.channel)!).toLowerCase().includes(v);
          case "company":
            return cu ? companyName(cu.companyId, lang).toLowerCase().includes(v) : false;
          case "lastMessage":
            return s.text.toLowerCase().includes(v);
          case "when":
            return s.when.toLowerCase().includes(v);
          case "status":
            return (s.sent ? tx(lang, d.sent) : tx(lang, d.pending)).toLowerCase().includes(v);
          default:
            return true;
        }
      });
    });

    // Apply sorting
    result.sort((a, b) => {
      const cuA = customers.find((c) => c.id === a.customerId);
      const cuB = customers.find((c) => c.id === b.customerId);
      let aVal: string | number = "";
      let bVal: string | number = "";

      switch (sortConfig.key) {
        case "customer":
          aVal = cuA ? (lang === "ar" ? cuA.nameAr : cuA.nameEn) : "";
          bVal = cuB ? (lang === "ar" ? cuB.nameAr : cuB.nameEn) : "";
          break;
        case "channel":
          aVal = a.channel;
          bVal = b.channel;
          break;
        case "company":
          aVal = cuA ? companyName(cuA.companyId, lang) : "";
          bVal = cuB ? companyName(cuB.companyId, lang) : "";
          break;
        case "lastMessage":
          aVal = a.text;
          bVal = b.text;
          break;
        case "when":
          aVal = a.when;
          bVal = b.when;
          break;
        case "status":
          aVal = a.sent ? 1 : 0;
          bVal = b.sent ? 1 : 0;
          break;
      }

      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [baseList, columnFilters, sortConfig, lang]);

  const totalPages = Math.ceil(filteredList.length / pageSize);
  const paginatedList = filteredList.slice((page - 1) * pageSize, page * pageSize);

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

  const columns = [
    { key: "customer", label: tx(lang, d.customer) },
    { key: "channel", label: tx(lang, d.channel) },
    { key: "company", label: tx(lang, d.company) },
    { key: "lastMessage", label: tx(lang, d.lastMessage) },
    { key: "when", label: tx(lang, d.scheduledFor) },
    { key: "status", label: tx(lang, d.status) },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold">{tx(lang, d.nav.scheduled)}</h1>
      <div className="rounded-2xl border border-line bg-card shadow-sm overflow-hidden card-interactive">
        {/* Modern Horizontal Filter Bar */}
        <div className="flex flex-wrap items-center gap-3 p-4 border-b border-line bg-muted/5 dark:bg-card">
          <div className="flex items-center gap-2 text-sm font-semibold text-muted">
            <Filter size={16} className="text-brand" />
            <span>{lang === "ar" ? "تصفية:" : "Filters:"}</span>
          </div>
          {columns.map((col) => (
            <div key={col.key} className="flex flex-col gap-1">
              <span className="text-[11px] font-medium text-muted">{col.label}</span>
              <input
                type="text"
                placeholder={lang === "ar" ? "بحث..." : "Search..."}
                value={columnFilters.find((f) => f.key === col.key)?.value || ""}
                onChange={(e) => handleFilterChange(col.key, e.target.value)}
                className="w-32 rounded-lg border border-line bg-card text-foreground px-2.5 py-1 text-xs outline-none focus:border-brand transition"
              />
            </div>
          ))}
          {columnFilters.length > 0 && columnFilters.some(f => f.value) && (
            <button
              onClick={() => setColumnFilters([])}
              className="mt-5 text-xs text-brand hover:underline font-semibold"
            >
              {lang === "ar" ? "مسح" : "Clear"}
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line bg-muted/20 text-muted">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    onClick={() => handleSort(col.key)}
                    className="px-4 py-3 text-start font-medium cursor-pointer select-none hover:bg-muted/30 transition"
                  >
                    <div className="flex items-center gap-1.5">
                      {col.label}
                      <span className="flex items-center">
                        {sortConfig.key === col.key ? (
                          sortConfig.direction === "asc" ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                        ) : (
                          <span className="opacity-0"><ChevronUp size={12} /></span>
                        )}
                      </span>
                    </div>
                  </th>
                ))}
                <th className="px-4 py-3 text-start font-medium" />
              </tr>
            </thead>
            <tbody>
              {paginatedList.map((s) => {
                const cu = customers.find((c) => c.id === s.customerId);
                return (
                  <tr key={s.id} className="border-b border-line last:border-0">
                    <td className="px-4 py-3 font-medium">{cu ? (lang === "ar" ? cu.nameAr : cu.nameEn) : "-"}</td>
                    <td className="px-4 py-3">{tx(lang, sources.find((src) => src.key === s.channel)!)}</td>
                    <td className="px-4 py-3 text-muted">{cu ? companyName(cu.companyId, lang) : "-"}</td>
                    <td className="max-w-60 truncate px-4 py-3 text-muted">{s.text}</td>
                    <td className="px-4 py-3 text-muted">{s.when}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.sent ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>
                        {s.sent ? tx(lang, d.sent) : tx(lang, d.pending)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleScheduled(s.id)}
                        className="text-xs font-semibold text-brand hover:underline"
                      >
                        {s.sent ? tx(lang, d.markPending) : tx(lang, d.markSent)}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredList.length === 0 && (
          <div className="p-8 text-center text-sm text-muted">{tx(lang, d.noResults)}</div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="border-t border-line p-3 flex items-center justify-between">
            <div className="text-sm text-muted">
              {filteredList.length} {tx(lang, d.nav.scheduled)} · {tx(lang, d.page)} {page} / {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <select
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                className="rounded border border-line px-2 py-1 text-xs outline-none"
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-interactive p-1 rounded hover:bg-slate-100 disabled:opacity-50"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="btn-interactive p-1 rounded hover:bg-slate-100 disabled:opacity-50"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
