"use client";

import { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  Send,
  Paperclip,
  Trash2,
  FileSpreadsheet,
  Building2,
  Bot,
  User,
  RotateCcw,
  BarChart3,
  TrendingUp,
  Users,
  CheckCircle2,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { companies, groupKpis, customers, tasks, conversations, months, groupSales, sources } from "@/lib/data";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  time: string;
}

const DEFAULT_KEY = "";

export default function AnalysisPage() {
  const { lang, companyId } = useStore();
  const [apiKey, setApiKey] = useState("");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeFile, setActiveFile] = useState<{ name: string; content: string; size: number } | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const initialWelcome =
    lang === "ar"
      ? "مرحباً بك في مركز تحليل البيانات الذكي لمجموعة بن ربعي القابضة.\n\nيمكنك سؤالي مباشرة عن أي مؤشرات مبيعات، أداء الفروع، صفقات العملاء، أو **رفع ملف بيانات مخصص (CSV)** لبدء المحادثة والاستفسار عنه."
      : "Welcome to the Bin Rabie Holding AI Data Analyst Center.\n\nYou can query group KPIs, branch sales, deals, or **upload a custom CSV file** to start an analytical chat session.";

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: initialWelcome,
      time: "09:00",
    },
  ]);

  const quickPrompts =
    lang === "ar"
      ? [
          "📊 تحليل إجمالي مبيعات وأرباح المجموعة",
          "🏆 استخراج أعلى 3 صفقات قيد التفاوض",
          "📈 مقارنة كفاءة قنوات التواصل (واتساب مقابل إنستغرام)",
          "⚠️ ما هي أهم المهام المتأخرة أو العاجلة؟",
        ]
      : [
          "📊 Analyze total group sales and revenue",
          "🏆 Extract top 3 deals currently in negotiation",
          "📈 Compare channel efficiency (WhatsApp vs Instagram)",
          "⚠️ What are the high-priority pending tasks?",
        ];

  useEffect(() => {
    try {
      const stored = localStorage.getItem("binrabie.ai_key");
      setApiKey(stored || DEFAULT_KEY);
    } catch {}
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  function getCrmContext() {
    const activeComp = companyId ? companies.find((c) => c.id === companyId) : null;
    return {
      group: "مجموعة بن ربعي القابضة (Bin Rabie Holding Group)",
      selectedCompany: activeComp ? activeComp.ar : "جميع شركات المجموعة (All Companies)",
      companies: companies.map((c) => ({ id: c.id, nameAr: c.ar, nameEn: c.en })),
      kpis: groupKpis,
      monthlySalesMonths: months.map((m) => m.ar),
      monthlySalesValues: groupSales,
      marketingChannels: sources.map((s) => ({ channel: s.ar, sharePercent: s.value })),
      customers: customers.map((c) => ({
        name: c.nameAr,
        stage: c.stage,
        valueSAR: c.value,
        city: c.city,
      })),
      pendingTasks: tasks
        .filter((t) => !t.done)
        .map((t) => ({ task: t.titleAr, priority: t.priority })),
    };
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadLoading(true);
    try {
      const text = await file.text();
      setActiveFile({
        name: file.name,
        content: text,
        size: file.size,
      });

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content:
            lang === "ar"
              ? `✅ تم تحميل الملف **"${file.name}"** بنجاح (${Math.round(file.size / 1024)} KB).\nالملف متاح الآن كمصدر بيانات رئيسي للمحادثة، اسألني عنه ما تشاء!`
              : `✅ File **"${file.name}"** loaded successfully (${Math.round(file.size / 1024)} KB).\nYou can now ask me any questions regarding this dataset!`,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } catch {
      alert(lang === "ar" ? "فشل قراءة الملف" : "Failed to read file");
    } finally {
      setUploadLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function sendMessage(textToSend?: string) {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: query.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newHistory.map((m) => ({ role: m.role, content: m.content })),
          crmContext: getCrmContext(),
          fileData: activeFile?.content || null,
          fileName: activeFile?.name || null,
          apiKey: apiKey || DEFAULT_KEY,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${res.status}`);
      }

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.reply || (lang === "ar" ? "تم التحليل بنجاح." : "Done."),
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content:
            lang === "ar"
              ? `⚠️ تعذر إتمام التحليل: ${err.message}`
              : `⚠️ Analysis failed: ${err.message}`,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".csv,.txt,.json"
        className="hidden"
      />

      {/* Header Banner */}
      <div className="rounded-3xl border border-line bg-card p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 card-interactive">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand text-white shadow-lg shadow-brand/25">
            <Sparkles size={28} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">
              {lang === "ar" ? "مركز تحليل البيانات والمحادثة الذكية" : "AI Data Analyst Center"}
            </h1>
            <p className="text-xs text-muted mt-1">
              {lang === "ar"
                ? "مساعد تنفيذي ذكي مدعوم بنموذج GPT-4o لتحليل مؤشرات المجموعة والملفات المرفوعة فورياً"
                : "Executive AI assistant powered by GPT-4o for live CRM insights and file analysis"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeFile ? (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-600 dark:text-emerald-400">
              <FileSpreadsheet size={15} />
              <span className="font-semibold truncate max-w-[140px]">{activeFile.name}</span>
              <button
                onClick={() => setActiveFile(null)}
                className="text-red-500 hover:text-red-600 transition p-0.5"
                title={lang === "ar" ? "إلغاء الملف" : "Reset file"}
              >
                <Trash2 size={13} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadLoading}
              className="btn-interactive flex items-center gap-2 rounded-xl border border-line bg-card px-4 py-2 text-xs font-semibold text-brand hover:bg-muted/50 transition shadow-sm"
            >
              <Paperclip size={15} />
              <span>{uploadLoading ? "..." : lang === "ar" ? "رفع ملف CSV لتحليله" : "Upload CSV file"}</span>
            </button>
          )}

          <button
            onClick={() => setMessages([messages[0]])}
            className="btn-interactive flex items-center gap-1.5 rounded-xl border border-line bg-card px-3 py-2 text-xs font-semibold text-muted hover:text-foreground hover:bg-muted/50 transition"
            title={lang === "ar" ? "إعادة بدء المحادثة" : "Restart chat"}
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="rounded-3xl border border-line bg-card shadow-sm flex flex-col h-[600px] overflow-hidden">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {m.role === "assistant" && (
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-brand/20 text-brand border border-brand/30">
                  <Bot size={18} />
                </div>
              )}

              <div
                className={`max-w-[80%] rounded-2xl px-5 py-3.5 text-sm leading-relaxed shadow-sm ${
                  m.role === "user"
                    ? "bg-brand text-white rounded-br-xs"
                    : "bg-muted/60 text-foreground border border-line rounded-bl-xs"
                }`}
              >
                <div className="whitespace-pre-wrap font-sans">{m.content}</div>
                <div
                  className={`mt-2 text-[10px] ${
                    m.role === "user" ? "text-white/70 text-end" : "text-muted"
                  }`}
                >
                  {m.time}
                </div>
              </div>

              {m.role === "user" && (
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-brand text-white shadow-sm">
                  <User size={18} />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 justify-start">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-brand/20 text-brand border border-brand/30">
                <Bot size={18} />
              </div>
              <div className="rounded-2xl rounded-bl-xs bg-muted/60 border border-line px-5 py-3.5 text-sm text-foreground flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-brand animate-bounce"></span>
                <span className="h-2 w-2 rounded-full bg-brand animate-bounce [animation-delay:0.2s]"></span>
                <span className="h-2 w-2 rounded-full bg-brand animate-bounce [animation-delay:0.4s]"></span>
                <span className="text-muted text-xs ms-1">
                  {lang === "ar" ? "جاري قراءة البيانات وإعداد التحليل..." : "Analyzing data..."}
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestions */}
        {messages.length <= 2 && (
          <div className="border-t border-line bg-muted/20 px-6 py-3">
            <div className="text-xs font-semibold text-muted mb-2 flex items-center gap-1.5">
              <Sparkles size={13} className="text-amber-500" />
              {lang === "ar" ? "أسئلة مقترحة للبدء:" : "Suggested questions:"}
            </div>
            <div className="flex flex-wrap gap-2">
              {quickPrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => sendMessage(p)}
                  disabled={loading}
                  className="rounded-full border border-line bg-card hover:border-brand px-3 py-1.5 text-xs text-foreground hover:text-brand transition shadow-xs"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Bar */}
        <div className="border-t border-line bg-card p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="flex items-center gap-3"
          >
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadLoading || loading}
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-line bg-muted/40 text-muted hover:text-brand hover:border-brand transition flex-shrink-0"
              title={lang === "ar" ? "إرفاق ملف CSV أو نصي" : "Attach CSV/file"}
            >
              <Paperclip size={18} />
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                activeFile
                  ? lang === "ar"
                    ? `اسأل عن محتوى ملف (${activeFile.name})...`
                    : `Ask anything about (${activeFile.name})...`
                  : lang === "ar"
                  ? "اكتب استفسارك هنا (مثال: ما هي أعلى الصفقات؟ أو قارن بين المبيعات)..."
                  : "Type your query here (e.g. what are the top deals?)..."
              }
              className="flex-1 rounded-2xl border border-line bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-brand"
              disabled={loading}
            />

            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="btn-interactive flex h-11 w-11 items-center justify-center rounded-2xl bg-brand text-white disabled:opacity-40 hover:bg-brand/90 transition shadow-md shadow-brand/20 flex-shrink-0"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
