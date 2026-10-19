"use client";

import { useState } from "react";
import Link from "next/link";
import {
  MessagesSquare,
  UserPlus,
  Target,
  Banknote,
  ArrowUpRight,
  Sparkles,
  Send,
  ListChecks,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  companyKpis,
  companyName,
  companySales,
  companies,
  customers,
  employees,
  journey,
  months,
  sources,
} from "@/lib/data";
import { dictionary as d, tx } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import MobilePreviews from "./MobilePreviews";
import PipelineKanban from "./PipelineKanban";
import { cn } from "@/lib/utils";
import { ToastProvider } from "@/components/Toast";
import { useToastActions } from "@/components/Toast";

function formatNumber(n: number): string {
  return n.toLocaleString("en-US");
}

export default function Dashboard() {
  const { lang, companyId, tasks, toggleTask, conversations, mounted } = useStore();
  const [pipelineView, setPipelineView] = useState<"funnel" | "kanban">("funnel");

  // Use companyId from localStorage for SSR consistency to avoid hydration mismatch
  const ssrCompanyId = mounted ? companyId : (typeof window !== "undefined" ? localStorage.getItem("binrabie.companyId") : null);
  const kpis = companyKpis(ssrCompanyId);
  const sales = companySales(ssrCompanyId).map((value, i) => ({
    month: months[i][lang],
    value,
  }));

  // Revenue by Company
  const companyRevenue = companies
    .map((c) => ({
      name: c[lang],
      value: employees
        .filter((e) => e.companyId === c.id)
        .reduce((s, e) => s + e.revenue, 0),
    }))
    .filter((c) => c.value > 0)
    .sort((a, b) => b.value - a.value);

  // Pipeline Funnel Data
  const pipelineData = [
    { key: "lead", label: { ar: "عميل محتمل", en: "Lead" }, count: 1245 },
    { key: "contact", label: { ar: "تواصل", en: "Contact" }, count: 860 },
    { key: "qualified", label: { ar: "مؤهل", en: "Qualified" }, count: 342 },
    { key: "proposal", label: { ar: "عرض سعر", en: "Proposal" }, count: 89 },
    { key: "won", label: { ar: "عميل", en: "Customer" }, count: 54 },
  ];

  const [dateRange, setDateRange] = useState<"6m" | "12m" | "ytd">("6m");

  const visibleConversations = conversations
    .filter((c) => !companyId || customers.find((cu) => cu.id === c.customerId)?.companyId === companyId)
    .slice(0, 5);
  const visibleTasks = tasks.filter((t) => !companyId || t.companyId === companyId);

  const cards = [
    { label: d.kpi.conversations, value: formatNumber(kpis.conversations), icon: MessagesSquare, tint: "tint-conversations", pulse: "pulse-conversations" },
    { label: d.kpi.newClients, value: formatNumber(kpis.newClients), icon: UserPlus, tint: "tint-newclients", pulse: "pulse-newclients" },
    { label: d.kpi.opportunities, value: formatNumber(kpis.opportunities), icon: Target, tint: "tint-opportunities", pulse: "pulse-opportunities" },
    { label: d.kpi.dailySales, value: `${formatNumber(kpis.dailySales)} ${tx(lang, d.currency)}`, icon: Banknote, tint: "tint-dailysales", pulse: "pulse-dailysales" },
  ];

  return (
    <ToastProvider>
      <div className="space-y-6">
        <section className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {cards.map(({ label, value, icon: Icon, tint, pulse }) => (
          <div key={label.en} className="flex items-center justify-between rounded-2xl border border-line bg-card p-5 shadow-sm card-interactive">
            <div>
              <div className="text-sm text-muted">{tx(lang, label)}</div>
              <div className="mt-1 text-2xl font-bold">{value}</div>
            </div>
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${tint} ${pulse}`}>
              <Icon size={22} />
            </div>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="rounded-2xl border border-line bg-card p-5 shadow-sm xl:col-span-2">
          <h2 className="mb-4 text-base font-bold">{tx(lang, d.salesGrowth)}</h2>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={sales}>
              <CartesianGrid className="chart-grid" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} className="chart-axis" />
              <YAxis tick={{ fontSize: 12 }} className="chart-axis" />
              <Tooltip />
              <Line type="monotone" dataKey="value" className="chart-brand" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl border border-line bg-card p-5 shadow-sm">
          <h2 className="mb-2 text-base font-bold">{tx(lang, d.sources)}</h2>
          <ResponsiveContainer width="100%" height={150}>
            <PieChart data={sources}>
              <Pie data={sources} dataKey="value" innerRadius={42} outerRadius={68} paddingAngle={2}>
                {sources.map((s) => (
                  <Cell key={s.key} fill={s.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <ul className="mt-2 space-y-1 text-sm">
            {sources.map((s) => (
              <li key={s.key} className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
                  {tx(lang, s)}
                </span>
                <span className="font-semibold">{s.value}%</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Monthly Revenue Bar Chart */}
      <section className="rounded-2xl border border-line bg-card p-5 shadow-sm card-interactive">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-bold">{tx(lang, d.revenueByMonth)}</h2>
          <span className="text-sm font-bold text-success bg-success/10 px-2 py-0.5 rounded-full">+41%</span>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={sales}>
            <CartesianGrid className="chart-grid" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} className="chart-axis" />
            <YAxis tick={{ fontSize: 12 }} className="chart-axis" />
            <Tooltip />
            <Bar dataKey="value" className="chart-brand" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </section>

      {/* Revenue by Company + Pipeline Funnel */}
      <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {/* Revenue by Company */}
        <div className="rounded-2xl border border-line bg-card p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-bold">{tx(lang, d.revenueByCompany)}</h2>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as "6m" | "12m" | "ytd")}
              className="rounded-lg border border-line bg-card px-3 py-1.5 text-sm outline-none focus:border-brand"
            >
              <option value="6m">{tx(lang, d.last6Months)}</option>
              <option value="12m">{tx(lang, d.last12Months)}</option>
              <option value="ytd">{tx(lang, d.yearToDate)}</option>
            </select>
          </div>
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

        {/* Pipeline Funnel / Kanban Toggle */}
        <div className="rounded-2xl border border-line bg-card p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-bold">{tx(lang, d.pipeline)}</h2>
            <div className="flex items-center gap-1 border border-line rounded-xl p-1">
              <button
                onClick={() => setPipelineView("funnel")}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm font-medium transition",
                  pipelineView === "funnel" ? "bg-brand text-foreground" : "text-muted hover:text-foreground"
                )}
              >
                {tx(lang, d.funnel || { ar: "قمع", en: "Funnel" })}
              </button>
              <button
                onClick={() => setPipelineView("kanban")}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm font-medium transition",
                  pipelineView === "kanban" ? "bg-brand text-white" : "text-muted hover:text-foreground"
                )}
              >
                {tx(lang, d.kanban || { ar: "كانبان", en: "Kanban" })}
              </button>
            </div>
          </div>
          {pipelineView === "funnel" ? (
            <div className="space-y-4">
              {pipelineData.map((stage) => {
                const pct = Math.round((stage.count / pipelineData[0].count) * 100);
                return (
                  <div key={stage.key} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-foreground">{tx(lang, stage.label)}</span>
                      <div className="flex items-center gap-2">
                        <span className="rounded-md bg-brand/10 px-2 py-0.5 text-xs font-semibold text-brand">
                          {pct}%
                        </span>
                        <span className="font-bold text-foreground">{formatNumber(stage.count)}</span>
                      </div>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div
                        className="h-full rounded-full bg-brand transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <PipelineKanban />
          )}
        </div>
      </section>

      {/* Quick Actions */}
      <section className="rounded-2xl border border-line bg-card p-5 shadow-sm">
        <h2 className="mb-4 text-base font-bold">{tx(lang, d.quickActions)}</h2>
        <div className="flex flex-wrap gap-3">
          <button className="flex items-center gap-2 rounded-xl border border-line bg-card px-4 py-2 text-sm font-medium hover:bg-muted/50 transition">
            <UserPlus size={16} className="text-emerald-600" />
            {tx(lang, d.newCustomer)}
          </button>
          <button className="flex items-center gap-2 rounded-xl border border-line bg-card px-4 py-2 text-sm font-medium hover:bg-muted/50 transition">
            <MessagesSquare size={16} className="text-blue-600" />
            {tx(lang, d.newConversation)}
          </button>
          <button className="flex items-center gap-2 rounded-xl border border-line bg-card px-4 py-2 text-sm font-medium hover:bg-muted/50 transition">
            <ListChecks size={16} className="text-amber-600" />
            {tx(lang, d.newTask)}
          </button>
          <button className="flex items-center gap-2 rounded-xl border border-line bg-card px-4 py-2 text-sm font-medium hover:bg-muted/50 transition">
            <Target size={16} className="text-violet-600" />
            {tx(lang, d.newQuote)}
          </button>
        </div>
      </section>

      <Assistant />

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="rounded-2xl border border-line bg-card p-5 shadow-sm xl:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-bold">{tx(lang, d.recentConversations)}</h2>
            <Link href="/conversations" className="flex items-center gap-1 text-sm font-semibold text-brand">
              {tx(lang, d.viewAll)} <ArrowUpRight size={14} />
            </Link>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-start text-muted">
                {[d.customer, d.channel, d.company, d.lastMessage, d.time].map((h) => (
                  <th key={h.en} className="pb-2 text-start font-medium">{tx(lang, h)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visibleConversations.map((c) => {
                const customer = customers.find((cu) => cu.id === c.customerId)!;
                const last = c.messages[c.messages.length - 1];
                return (
                  <tr key={c.id} className="border-t border-line">
                    <td className="py-2.5 font-medium">{lang === "ar" ? customer.nameAr : customer.nameEn}</td>
                    <td>{tx(lang, sources.find((s) => s.key === c.channel)!)}</td>
                    <td className="text-muted">{companyName(customer.companyId, lang)}</td>
                    <td className="max-w-48 truncate text-muted">{last.text}</td>
                    <td className="whitespace-nowrap text-muted">{c.lastTime}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="rounded-2xl border border-line bg-card p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-bold">{tx(lang, d.todayTasks)}</h2>
            <Link href="/tasks" className="text-sm font-semibold text-brand">{tx(lang, d.viewAll)}</Link>
          </div>
          <ul className="space-y-2">
            {visibleTasks.slice(0, 5).map((t) => (
              <li key={t.id}>
                <button onClick={() => toggleTask(t.id)} className="flex w-full items-center gap-3 rounded-xl px-2 py-1.5 text-start hover:bg-muted/50">
                  <span className={`flex h-5 w-5 items-center justify-center rounded-md border ${t.done ? "border-success bg-success text-foreground" : "border-line"}`}>
                    {t.done ? "✓" : ""}
                  </span>
                  <span className={`flex-1 text-sm ${t.done ? "text-muted line-through" : ""}`}>
                    {lang === "ar" ? t.titleAr : t.titleEn}
                  </span>
                  <span className="text-xs text-muted">{t.due}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Leaderboard />
        <div className="rounded-2xl border border-line bg-card p-5 shadow-sm xl:col-span-2">
          <h2 className="mb-4 text-base font-bold">{tx(lang, d.journey)}</h2>
          <div className="flex items-stretch gap-2">
            {journey.map((step, i) => (
              <div key={step.en} className="flex-1 rounded-xl bg-blue-50 p-3 text-center">
                <div className="text-xs text-muted">{i + 1}. {tx(lang, step)}</div>
                <div className="mt-1 text-lg font-bold text-brand">{formatNumber(step.count)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <MobilePreviews />
      </div>
    </ToastProvider>
  );
}

function Assistant() {
  const { lang } = useStore();
  return <AssistantBox key={lang} />;
}

function AssistantBox() {
  const { lang, tasks, conversations, employees } = useStore();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ from: "user" | "ai"; text: string }[]>([
    {
      from: "ai",
      text: lang === "ar"
        ? "أهلاً بك. أقدر ألخص لك المبيعات، العملاء، المهام، ومصادر العملاء."
        : "Welcome. I can summarize sales, customers, tasks, and customer sources.",
    },
  ]);

  function answer(q: string): string {
    const s = q.toLowerCase();
    if (/مبيع|sales|إيراد|revenue/.test(s))
      return lang === "ar"
        ? "مبيعات اليوم 287,450 ر.س والمجموعة في نمو منذ يناير، وبلغت الذروة في يونيو عند 740 ألف ر.س."
        : "Today's sales are SAR 287,450. The group has grown since January, peaking in June at SAR 740k.";
    if (/مهم|task/.test(s)) {
      const open = tasks.filter((t) => !t.done).length;
      return lang === "ar" ? `عندك ${open} مهام مفتوحة اليوم، أهمها متابعة عرض الشحن مع شركة أفق.` : `You have ${open} open tasks today. Top one: follow up the freight quote with Ofuq.`;
    }
    if (/عميل|customer|عملا/.test(s))
      return lang === "ar"
        ? `إجمالي العملاء المسجّلين ${customers.length}، والجدد هذا الشهر 856 عميلاً.`
        : `${customers.length} customers on record, with 856 new ones this month.`;
    if (/مصدر|source|واتس|whatsapp/.test(s))
      return lang === "ar"
        ? "واتساب هو المصدر الأول بنسبة 45٪، يليه إنستغرام 20٪ ثم فيسبوك 15٪."
        : "WhatsApp leads at 45%, followed by Instagram at 20% and Facebook at 15%.";
    if (/موظف|employee|أفضل|best/.test(s))
      return lang === "ar"
        ? `أعلى أداء هذا الشهر: ${employees[0].nameAr} بإيراد ${employees[0].revenue.toLocaleString("en-US")} ر.س.`
        : `Top performer this month: ${employees[0].nameEn} with SAR ${employees[0].revenue.toLocaleString("en-US")}.`;
    if (/محادث|conversation|inbox/.test(s)) {
      const unread = conversations.filter((c) => c.unread).length;
      return lang === "ar" ? `صندوق الوارد فيه ${unread} محادثات غير مقروءة عبر واتساب وإنستغرام وفيسبوك.` : `The inbox has ${unread} unread conversations across WhatsApp, Instagram, and Facebook.`;
    }
    return lang === "ar"
      ? "أقدر أجاوب عن: المبيعات، العملاء، المهام، المصادر، الموظفين، والمحادثات."
      : "I can answer about: sales, customers, tasks, sources, employees, and conversations.";
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    setMessages((m) => [...m, { from: "user", text }, { from: "ai", text: answer(text) }]);
    setInput("");
  }

  return (
    <section className="rounded-2xl border border-line bg-card p-5 shadow-sm">
      <h2 className="mb-3 flex items-center gap-2 text-base font-bold">
        <Sparkles size={18} className="text-brand" /> {tx(lang, d.assistant)}
      </h2>
      <div className="mb-3 max-h-48 space-y-2 overflow-y-auto">
        {messages.map((m, i) => (
          <div key={i} className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${m.from === "ai" ? "bg-blue-50 dark:bg-blue-900/30 text-foreground" : "ms-auto bg-brand text-foreground"}`}>
            {m.text}
          </div>
        ))}
      </div>
      <form onSubmit={submit} className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={tx(lang, d.ask)}
          className="flex-1 rounded-xl border border-line px-4 py-2 text-sm outline-none focus:border-brand"
        />
        <button className="flex items-center gap-1 rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-foreground hover:bg-brand-dark">
          <Send size={15} /> {tx(lang, d.send)}
        </button>
      </form>
    </section>
  );
}

function Leaderboard() {
  const { lang, companyId } = useStore();
  const [sortBy, setSortBy] = useState<"revenue" | "deals">("revenue");

  const rows = employees
    .filter((e) => !companyId || e.companyId === companyId)
    .slice()
    .sort((a, b) => b[sortBy] - a[sortBy])
    .slice(0, 5);

  return (
    <div className="rounded-2xl border border-line bg-card p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-bold">{tx(lang, d.leaderboard)}</h2>
        <div className="flex items-center gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "revenue" | "deals")}
            className="rounded-lg border border-line bg-white px-2 py-1 text-sm outline-none focus:border-brand"
          >
            <option value="revenue">{tx(lang, d.revenue)}</option>
            <option value="deals">{tx(lang, d.deals)}</option>
          </select>
          <Link href="/employees" className="text-sm font-semibold text-brand">{tx(lang, d.viewAll)}</Link>
        </div>
      </div>
      <ul className="space-y-3">
        {rows.map((e, i) => (
          <li key={e.id} className="flex items-center gap-3">
            <span className="w-5 text-sm font-bold text-muted">{i + 1}</span>
            <div className="flex-1">
              <div className="text-sm font-medium">{lang === "ar" ? e.nameAr : e.nameEn}</div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-brand"
                  style={{ width: `${Math.min(100, (e[sortBy] / (sortBy === "revenue" ? e.target : e.deals * 10)) * 100)}%` }}
                />
              </div>
            </div>
            <span className="text-xs font-semibold text-muted">
              {sortBy === "revenue" ? `${(e.revenue / 1000).toFixed(0)}k` : e.deals}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
