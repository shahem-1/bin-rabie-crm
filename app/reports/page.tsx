"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  companies,
  companySales,
  customers,
  employees,
  months,
  sources,
} from "@/lib/data";
import { dictionary as d, tx } from "@/lib/i18n";
import { useStore } from "@/lib/store";

export default function ReportsPage() {
  const { lang, companyId } = useStore();

  const sales = companySales(companyId).map((v, i) => ({
    month: months[i][lang],
    value: v,
  }));

  const companyRevenue = companies.map((c) => ({
    name: c[lang],
    value: employees
      .filter((e) => e.companyId === c.id)
      .reduce((s, e) => s + e.revenue, 0),
  })).filter((c) => c.value > 0).sort((a, b) => b.value - a.value);

  const wonCount = customers.filter((c) => c.stage === "won" && (!companyId || c.companyId === companyId)).length;
  const totalCount = customers.filter((c) => !companyId || c.companyId === companyId).length;
  const conversion = totalCount ? Math.round((wonCount / totalCount) * 100) : 0;
  const pipelineValue = customers
    .filter((c) => ["lead", "qualified", "proposal"].includes(c.stage) && (!companyId || c.companyId === companyId))
    .reduce((s, c) => s + c.value, 0);

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-bold">{tx(lang, d.nav.reports)}</h1>

      {/* summary cards */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-line bg-card p-5 shadow-sm text-center card-interactive">
          <div className="text-sm text-muted">{tx(lang, d.conversion)}</div>
          <div className="mt-1 text-3xl font-bold text-brand">{conversion}%</div>
        </div>
        <div className="rounded-2xl border border-line bg-card p-5 shadow-sm text-center card-interactive">
          <div className="text-sm text-muted">{tx(lang, d.wonDeals)}</div>
          <div className="mt-1 text-3xl font-bold text-emerald-600">{wonCount}</div>
        </div>
        <div className="rounded-2xl border border-line bg-card p-5 shadow-sm text-center card-interactive">
          <div className="text-sm text-muted">{tx(lang, d.pipeline)}</div>
          <div className="mt-1 text-3xl font-bold text-amber-600">{pipelineValue.toLocaleString("en-US")} {tx(lang, d.currency)}</div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {/* revenue by month */}
        <div className="rounded-2xl border border-line bg-card p-5 shadow-sm card-interactive">
          <h2 className="mb-4 text-base font-bold">{tx(lang, d.revenueByMonth)}</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={sales}>
              <CartesianGrid className="chart-grid" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} className="chart-axis" />
              <YAxis tick={{ fontSize: 12 }} className="chart-axis" />
              <Tooltip />
              <Bar dataKey="value" className="chart-brand" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* revenue by company */}
        <div className="rounded-2xl border border-line bg-card p-5 shadow-sm card-interactive">
          <h2 className="mb-4 text-base font-bold">{tx(lang, d.revenueByCompany)}</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={companyRevenue} layout="vertical">
              <CartesianGrid className="chart-grid" horizontal={false} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} className="chart-axis" width={120} />
              <XAxis type="number" tick={{ fontSize: 12 }} className="chart-axis" />
              <Tooltip />
              <Bar dataKey="value" className="chart-brand" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* top sources */}
      <section className="rounded-2xl border border-line bg-card p-5 shadow-sm card-interactive">
        <h2 className="mb-4 text-base font-bold">{tx(lang, d.topSources)}</h2>
        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <ResponsiveContainer width={200} height={200}>
            <PieChart data={sources}>
              <Pie data={sources} dataKey="value" innerRadius={50} outerRadius={80} paddingAngle={2}>
                {sources.map((s) => (
                  <Cell key={s.key} fill={s.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <ul className="flex-1 space-y-2 text-sm">
            {sources.map((s) => (
              <li key={s.key} className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full" style={{ background: s.color }} />
                  {tx(lang, s)}
                </span>
                <span className="font-semibold">{s.value}%</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
