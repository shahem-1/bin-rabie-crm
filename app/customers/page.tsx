"use client";

import { useState, useMemo } from "react";
import { Search, X, ChevronUp, ChevronDown, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { customers, sources, companyName, stageLabels, type Customer } from "@/lib/data";
import { dictionary as d, tx } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { TableSkeleton } from "@/components/Skeleton";
import { cn } from "@/lib/utils";
import { useToastActions } from "@/components/Toast";

const stageColors: Record<string, string> = {
  lead: "bg-slate-100 text-slate-600",
  qualified: "bg-blue-50 text-blue-600",
  proposal: "bg-amber-50 text-amber-600",
  won: "bg-emerald-50 text-emerald-600",
  lost: "bg-red-50 text-red-500",
};

interface SortConfig {
  key: string;
  direction: "asc" | "desc";
}

interface ColumnFilter {
  key: string;
  value: string;
}

export default function CustomersPage() {
  const { lang, companyId } = useStore();
  const { success, error } = useToastActions();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Customer | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: "name", direction: "asc" });
  const [columnFilters, setColumnFilters] = useState<ColumnFilter[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showFilters, setShowFilters] = useState(false);

  const filteredList = useMemo(() => {
    let result = customers.filter((c) => {
      if (companyId && c.companyId !== companyId) return false;
      if (!query) return true;
      const q = query.toLowerCase();
      return (
        c.nameAr.toLowerCase().includes(q) ||
        c.nameEn.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.city.toLowerCase().includes(q)
      );
    });

    // Apply column filters
    columnFilters.forEach(({ key, value }) => {
      if (!value) return;
      const v = value.toLowerCase();
      result = result.filter((c) => {
        switch (key) {
          case "name":
            return (lang === "ar" ? c.nameAr : c.nameEn).toLowerCase().includes(v);
          case "stage":
            return tx(lang, stageLabels[c.stage]).toLowerCase().includes(v);
          case "company":
            return companyName(c.companyId, lang).toLowerCase().includes(v);
          case "source":
            return tx(lang, sources.find((s) => s.key === c.source)!).toLowerCase().includes(v);
          case "phone":
            return c.phone.includes(v);
          case "city":
            return c.city.toLowerCase().includes(v);
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
        case "stage":
          aVal = tx(lang, stageLabels[a.stage]);
          bVal = tx(lang, stageLabels[b.stage]);
          break;
        case "company":
          aVal = companyName(a.companyId, lang);
          bVal = companyName(b.companyId, lang);
          break;
        case "source":
          aVal = tx(lang, sources.find((s) => s.key === a.source)!);
          bVal = tx(lang, sources.find((s) => s.key === b.source)!);
          break;
        case "phone":
          aVal = a.phone;
          bVal = b.phone;
          break;
        case "city":
          aVal = a.city;
          bVal = b.city;
          break;
        case "value":
          aVal = a.value;
          bVal = b.value;
          break;
      }

      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [companyId, query, columnFilters, sortConfig, lang]);

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

  function clearFilters() {
    setColumnFilters([]);
    setPage(1);
  }

  const columns = [
    { key: "name", label: tx(lang, d.customer) },
    { key: "stage", label: tx(lang, d.stage) },
    { key: "company", label: tx(lang, d.company) },
    { key: "source", label: tx(lang, d.source) },
    { key: "phone", label: tx(lang, d.phone) },
    { key: "city", label: tx(lang, d.city) },
    { key: "value", label: tx(lang, d.value) },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-lg font-bold">{tx(lang, d.nav.customers)}</h1>
        <div className="relative w-80">
          <Search size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={tx(lang, d.searchCustomers)}
            className="w-full rounded-xl border border-line py-2 pe-3 ps-9 text-sm outline-none focus:border-brand"
          />
        </div>
      </div>

      {/* Table with sorting, filtering, pagination */}
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
              onClick={clearFilters}
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
              </tr>
            </thead>
            <tbody>
              {paginatedList.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => setSelected(c)}
                  className="border-b border-line last:border-0 cursor-pointer hover:bg-slate-50 transition"
                >
                  <td className="px-4 py-3 font-semibold">{lang === "ar" ? c.nameAr : c.nameEn}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${stageColors[c.stage]}`}>
                      {tx(lang, stageLabels[c.stage])}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted">{companyName(c.companyId, lang)}</td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full" style={{ background: sources.find((s) => s.key === c.source)?.color }} />
                      {tx(lang, sources.find((s) => s.key === c.source)!)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted">{c.phone}</td>
                  <td className="px-4 py-3 text-muted">{c.city}</td>
                  <td className="px-4 py-3 font-bold text-brand">{c.value.toLocaleString("en-US")} {tx(lang, d.currency)}</td>
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
              {filteredList.length} {tx(lang, d.nav.customers)} · {tx(lang, d.page)} {page} / {totalPages}
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

      {/* Detail drawer */}
      {selected && (
        <div className="fixed inset-0 z-30 flex justify-end bg-black/30" onClick={() => setSelected(null)}>
          <div
            className="h-full w-96 overflow-y-auto bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-bold">{lang === "ar" ? selected.nameAr : selected.nameEn}</h2>
              <button onClick={() => setSelected(null)} className="text-muted hover:text-foreground">
                <X size={20} />
              </button>
            </div>
            <dl className="space-y-3 text-sm">
              {([
                [d.company, companyName(selected.companyId, lang)],
                [d.stage, tx(lang, stageLabels[selected.stage])],
                [d.value, `${selected.value.toLocaleString("en-US")} ${tx(lang, d.currency)}`],
                [d.source, tx(lang, sources.find((s) => s.key === selected.source)!)],
                [d.phone, selected.phone],
                [d.email, selected.email],
                [d.city, selected.city],
                [d.since, selected.since],
              ] as [{ ar: string; en: string }, string][]).map(([label, val]) => (
                <div key={label.en} className="flex justify-between border-b border-line pb-2">
                  <dt className="text-muted">{tx(lang, label)}</dt>
                  <dd className="font-medium">{val}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      )}
    </div>
  );
}
