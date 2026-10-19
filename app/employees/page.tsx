"use client";

import { useState, useMemo } from "react";
import { ChevronUp, ChevronDown, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { employees, companyName } from "@/lib/data";
import { dictionary as d, tx } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { TableSkeleton } from "@/components/Skeleton";
import { cn } from "@/lib/utils";

interface SortConfig {
  key: string;
  direction: "asc" | "desc";
}

interface ColumnFilter {
  key: string;
  value: string;
}

export default function EmployeesPage() {
  const { lang, companyId } = useStore();
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: "revenue", direction: "desc" });
  const [columnFilters, setColumnFilters] = useState<ColumnFilter[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showFilters, setShowFilters] = useState(false);

  const filteredList = useMemo(() => {
    let result = employees.filter((e) => !companyId || e.companyId === companyId);

    // Apply column filters
    columnFilters.forEach(({ key, value }) => {
      if (!value) return;
      const v = value.toLowerCase();
      result = result.filter((e) => {
        switch (key) {
          case "name":
            return (lang === "ar" ? e.nameAr : e.nameEn).toLowerCase().includes(v);
          case "role":
            return (lang === "ar" ? e.roleAr : e.roleEn).toLowerCase().includes(v);
          case "company":
            return companyName(e.companyId, lang).toLowerCase().includes(v);
          case "deals":
            return e.deals.toString().includes(v);
          case "revenue":
            return e.revenue.toString().includes(v);
          case "target":
            return e.target.toString().includes(v);
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
        case "name":
          aVal = lang === "ar" ? a.nameAr : a.nameEn;
          bVal = lang === "ar" ? b.nameAr : b.nameEn;
          break;
        case "role":
          aVal = lang === "ar" ? a.roleAr : a.roleEn;
          bVal = lang === "ar" ? b.roleAr : b.roleEn;
          break;
        case "company":
          aVal = companyName(a.companyId, lang);
          bVal = companyName(b.companyId, lang);
          break;
        case "deals":
          aVal = a.deals;
          bVal = b.deals;
          break;
        case "revenue":
          aVal = a.revenue;
          bVal = b.revenue;
          break;
        case "target":
          aVal = a.target;
          bVal = b.target;
          break;
      }

      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [companyId, columnFilters, sortConfig, lang]);

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
    { key: "name", label: lang === "ar" ? "الموظف" : "Employee" },
    { key: "role", label: lang === "ar" ? "المسمى" : "Role" },
    { key: "company", label: tx(lang, d.company) },
    { key: "deals", label: tx(lang, d.deals) },
    { key: "revenue", label: tx(lang, d.revenue) },
    { key: "target", label: tx(lang, d.ofTarget).replace("%", "").trim() },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold">{tx(lang, d.nav.employees)}</h1>
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
                <th className="w-10 px-4 py-3 text-start font-medium">#</th>
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
              {paginatedList.map((e, i) => {
                const pct = Math.min(100, Math.round((e.revenue / e.target) * 100));
                return (
                  <tr key={e.id} className="border-b border-line last:border-0">
                    <td className="px-4 py-3 font-bold text-muted">{i + 1 + (page - 1) * pageSize}</td>
                    <td className="px-4 py-3 font-semibold">{lang === "ar" ? e.nameAr : e.nameEn}</td>
                    <td className="px-4 py-3 text-muted">{lang === "ar" ? e.roleAr : e.roleEn}</td>
                    <td className="px-4 py-3 text-muted">{companyName(e.companyId, lang)}</td>
                    <td className="px-4 py-3 font-semibold">{e.deals}</td>
                    <td className="px-4 py-3 font-semibold">{e.revenue.toLocaleString("en-US")} {tx(lang, d.currency)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-100">
                          <div className="h-full rounded-full bg-brand" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs font-semibold text-muted">{pct}%</span>
                      </div>
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
              {filteredList.length} {tx(lang, d.nav.employees)} · {tx(lang, d.page)} {page} / {totalPages}
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
