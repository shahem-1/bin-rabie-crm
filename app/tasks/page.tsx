"use client";

import { useState, useMemo } from "react";
import { ChevronUp, ChevronDown, Filter, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { companyName } from "@/lib/data";
import { dictionary as d, tx } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { TableSkeleton } from "@/components/Skeleton";
import { cn } from "@/lib/utils";
import { useToastActions } from "@/components/Toast";

const priorityStyle: Record<string, string> = {
  high: "bg-red-50 text-red-600",
  medium: "bg-amber-50 text-amber-600",
  low: "bg-slate-100 text-slate-500",
};

const priorityLabel: Record<string, { ar: string; en: string }> = {
  high: d.high,
  medium: d.medium,
  low: d.low,
};

interface SortConfig {
  key: string;
  direction: "asc" | "desc";
}

interface ColumnFilter {
  key: string;
  value: string;
}

export default function TasksPage() {
  const { lang, companyId, tasks, toggleTask } = useStore();
  const { success, error } = useToastActions();
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: "title", direction: "asc" });
  const [columnFilters, setColumnFilters] = useState<ColumnFilter[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showFilters, setShowFilters] = useState(false);

  const filteredList = useMemo(() => {
    let result = tasks.filter((t) => !companyId || t.companyId === companyId);

    // Apply column filters
    columnFilters.forEach(({ key, value }) => {
      if (!value) return;
      const v = value.toLowerCase();
      result = result.filter((t) => {
        switch (key) {
          case "title":
            return (lang === "ar" ? t.titleAr : t.titleEn).toLowerCase().includes(v);
          case "company":
            return companyName(t.companyId, lang).toLowerCase().includes(v);
          case "due":
            return t.due.toLowerCase().includes(v);
          case "priority":
            return tx(lang, priorityLabel[t.priority]).toLowerCase().includes(v);
          case "status":
            return (t.done ? tx(lang, d.done) : tx(lang, d.open)).toLowerCase().includes(v);
          default:
            return true;
        }
      });
    });

    // Apply sorting
    result.sort((a, b) => {
      let aVal: string | number = "";
      let bVal: string | number = "";

      switch (sortConfig.key) {
        case "title":
          aVal = lang === "ar" ? a.titleAr : a.titleEn;
          bVal = lang === "ar" ? b.titleAr : b.titleEn;
          break;
        case "company":
          aVal = companyName(a.companyId, lang);
          bVal = companyName(b.companyId, lang);
          break;
        case "due":
          aVal = a.due;
          bVal = b.due;
          break;
        case "priority":
          aVal = tx(lang, priorityLabel[a.priority]);
          bVal = tx(lang, priorityLabel[b.priority]);
          break;
        case "status":
          aVal = a.done ? 1 : 0;
          bVal = b.done ? 1 : 0;
          break;
      }

      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [tasks, companyId, columnFilters, sortConfig, lang]);

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
    { key: "title", label: lang === "ar" ? "المهمة" : "Task" },
    { key: "company", label: tx(lang, d.company) },
    { key: "due", label: tx(lang, d.time) },
    { key: "priority", label: tx(lang, d.priority) },
    { key: "status", label: tx(lang, d.status) },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold">{tx(lang, d.nav.tasks)}</h1>
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
                <th className="w-10 px-4 py-3" />
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
              </tr>
            </thead>
            <tbody>
              {paginatedList.map((t) => (
                <tr key={t.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3">
                    <button
                      onClick={() => {
                        toggleTask(t.id);
                        if (t.done) {
                          error(tx(lang, d.open), tx(lang, d.open) + " " + (lang === "ar" ? t.titleAr : t.titleEn));
                        } else {
                          success(tx(lang, d.done), tx(lang, d.done) + " " + (lang === "ar" ? t.titleAr : t.titleEn));
                        }
                      }}
                      className={`flex h-5 w-5 items-center justify-center rounded-md border transition ${
                        t.done ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-300 hover:border-emerald-500"
                      }`}
                    >
                      {t.done && <Check size={14} />}
                    </button>
                  </td>
                  <td className={`px-4 py-3 font-medium ${t.done ? "text-muted line-through" : ""}`}>
                    {lang === "ar" ? t.titleAr : t.titleEn}
                  </td>
                  <td className="px-4 py-3 text-muted">{companyName(t.companyId, lang)}</td>
                  <td className="px-4 py-3 text-muted">{t.due}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${priorityStyle[t.priority]}`}>
                      {tx(lang, priorityLabel[t.priority])}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${t.done ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"}`}>
                      {t.done ? tx(lang, d.done) : tx(lang, d.open)}
                    </span>
                  </td>
                </tr>
              ))}
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
              {filteredList.length} {tx(lang, d.nav.tasks)} · {tx(lang, d.page)} {page} / {totalPages}
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
