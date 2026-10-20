"use client";

import { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  X,
  Send,
  Paperclip,
  Trash2,
  FileSpreadsheet,
  Building2,
  Bot,
  User,
  RotateCcw,
  Maximize2,
  Minimize2,
  CheckCircle2,
  HelpCircle,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { companies, groupKpis, customers, tasks, conversations, months, groupSales, sources } from "@/lib/data";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  time: string;
}

export function AiAnalystChat() {
  const { lang, companyId } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeFile, setActiveFile] = useState<{ name: string; content: string; size: number } | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const initialWelcome =
    lang === "ar"
      ? "أهلاً بك! أنا مساعد تحليل البيانات الذكي لمجموعة بن ربعي القابضة.\n\nيمكنك سؤالي عن مبيعات الشركات، صفقات العملاء، أداء القنوات، أو يمكنك **رفع أي ملف CSV** وسأقوم بقراءته والإجابة على أي أسئلة تفصيلية عنه."
      : "Welcome! I am the AI Data Analyst for Bin Rabie Holding Group.\n\nYou can ask me about company sales, client deals, channel performance, or **upload any CSV file** and I will analyze it and answer your specific questions.";

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
          { text: "📊 ملخص أداء ومبيعات المجموعة", label: "ملخص المبيعات" },
          { text: "🏆 من هم أكبر 3 عملاء من حيث قيمة الصفقات؟", label: "أكبر الصفقات" },
          { text: "📈 ما هي أفضل قناة تسويقية من حيث التحويل؟", label: "أفضل القنوات" },
          { text: "⚠️ ما هي المهام المعلقة عالية الأولوية؟", label: "المهام العاجلة" },
        ]
      : [
          { text: "📊 Summary of group revenue and performance", label: "Sales Summary" },
          { text: "🏆 Who are the top 3 clients by deal value?", label: "Top Deals" },
          { text: "📈 Which marketing channel has the highest conversion?", label: "Best Channels" },
          { text: "⚠️ What are the pending high-priority tasks?", label: "Urgent Tasks" },
        ];

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, loading]);

  // Construct CRM live data context
  function getCrmContext() {
    const activeComp = companyId ? companies.find((c) => c.id === companyId) : null;
    return {
      group: "مجموعة بن ربعي القابضة (Bin Rabie Holding Group)",
      selectedCompany: activeComp ? activeComp.ar : "جميع شركات المجموعة (All Companies)",
      companies: companies.map((c) => ({ id: c.id, nameAr: c.ar, nameEn: c.en, sector: c.sectorAr })),
      kpis: groupKpis,
      monthlySalesMonths: months.map((m) => m.ar),
      monthlySalesValues: groupSales,
      marketingChannels: sources.map((s) => ({ channel: s.ar, sharePercent: s.value })),
      customers: customers.map((c) => ({
        name: c.nameAr,
        company: c.companyId,
        stage: c.stage,
        valueSAR: c.value,
        city: c.city,
        source: c.source,
      })),
      pendingTasks: tasks
        .filter((t) => !t.done)
        .map((t) => ({ task: t.titleAr, priority: t.priority, due: t.due })),
      recentConversationsCount: conversations.length,
      unreadConversationsCount: conversations.filter((c) => c.unread).length,
    };
  }

  // Handle File Upload
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

      const confirmMsg: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content:
          lang === "ar"
            ? `✅ تم تحميل الملف **"${file.name}"** بنجاح (${Math.round(file.size / 1024)} كيلوبايت).\nأنا الآن جاهز للإجابة على أي أسئلة أو استخراج إحصائيات من هذا الملف!`
            : `✅ File **"${file.name}"** loaded successfully (${Math.round(file.size / 1024)} KB).\nI am now ready to answer any questions or compute statistics on this dataset!`,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, confirmMsg]);
    } catch {
      alert(lang === "ar" ? "فشل قراءة الملف" : "Failed to read file");
    } finally {
      setUploadLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  // Handle Send Message
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
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with ${res.status}`);
      }

      const data = await res.json();
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.reply || (lang === "ar" ? "تم التحليل بنجاح." : "Analysis complete."),
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          lang === "ar"
            ? `⚠️ عذراً، تعذر إتمام التحليل: ${err.message || "حدث خطأ غير متوقع."}`
            : `⚠️ Sorry, analysis could not be completed: ${err.message || "Unexpected error."}`,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".csv,.txt,.json"
        className="hidden"
      />

      {/* Floating Action Bubble */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="btn-interactive fixed bottom-6 end-6 z-40 flex items-center gap-2.5 rounded-full bg-brand px-4 py-3.5 text-white shadow-2xl shadow-brand/40 hover:bg-brand/90 hover:scale-105 active:scale-95 transition-all duration-200 border-2 border-white/20"
          title={lang === "ar" ? "مساعد تحليل البيانات الذكي" : "AI Data Analyst"}
        >
          <div className="relative flex items-center justify-center">
            <Sparkles size={20} className="animate-spin text-amber-300" style={{ animationDuration: "6s" }} />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </div>
          <span className="text-sm font-bold">
            {lang === "ar" ? "تحليل البيانات AI" : "AI Analyst"}
          </span>
        </button>
      )}

      {/* Slide-over / Modal Chat Window */}
      {isOpen && (
        <div
          className={`fixed z-50 flex flex-col bg-card border border-line shadow-2xl transition-all duration-300 rounded-3xl overflow-hidden ${
            isExpanded
              ? "inset-4 md:inset-10"
              : "bottom-6 end-6 w-[94vw] sm:w-[440px] h-[640px] max-h-[88vh]"
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-line bg-sidebar px-4 py-3 text-sidebar-foreground">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/20 text-brand border border-brand/30">
                <Bot size={22} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-sidebar-foreground">
                    {lang === "ar" ? "محلل البيانات الذكي" : "AI Data Analyst"}
                  </h3>
                  <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                </div>
                <div className="text-[11px] text-sidebar-foreground/70">
                  {lang === "ar" ? "مجموعة بن ربعي القابضة · GPT-4o" : "Bin Rabie Holding · GPT-4o"}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setMessages([messages[0]])}
                className="rounded-lg p-1.5 text-sidebar-foreground/70 hover:bg-white/10 hover:text-sidebar-foreground transition"
                title={lang === "ar" ? "مسح المحادثة" : "Clear conversation"}
              >
                <RotateCcw size={15} />
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="hidden sm:flex rounded-lg p-1.5 text-sidebar-foreground/70 hover:bg-white/10 hover:text-sidebar-foreground transition"
                title={isExpanded ? "Minimize" : "Maximize"}
              >
                {isExpanded ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1.5 text-sidebar-foreground/70 hover:bg-white/10 hover:text-sidebar-foreground transition"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Active Data Source Status Banner */}
          <div className="flex items-center justify-between border-b border-line bg-muted/40 px-4 py-2 text-xs">
            <div className="flex items-center gap-2 truncate">
              {activeFile ? (
                <>
                  <FileSpreadsheet size={14} className="text-emerald-500 flex-shrink-0" />
                  <span className="font-semibold text-foreground truncate">{activeFile.name}</span>
                  <span className="text-muted text-[10px]">({Math.round(activeFile.size / 1024)} KB)</span>
                </>
              ) : (
                <>
                  <Building2 size={14} className="text-brand flex-shrink-0" />
                  <span className="font-semibold text-foreground">
                    {lang === "ar" ? "بيانات النظام المباشرة (CRM Data)" : "Live CRM System Data"}
                  </span>
                </>
              )}
            </div>

            <div className="flex items-center gap-1.5 flex-shrink-0">
              {activeFile ? (
                <button
                  onClick={() => setActiveFile(null)}
                  className="flex items-center gap-1 text-[11px] text-red-500 hover:text-red-600 transition"
                  title={lang === "ar" ? "إلغاء الملف والعودة لبيانات النظام" : "Reset to CRM data"}
                >
                  <Trash2 size={12} />
                  <span>{lang === "ar" ? "إلغاء" : "Reset"}</span>
                </button>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadLoading}
                  className="flex items-center gap-1 rounded-md bg-brand/10 hover:bg-brand/20 px-2 py-0.5 text-[11px] font-semibold text-brand transition"
                >
                  <Paperclip size={12} />
                  <span>{uploadLoading ? "..." : lang === "ar" ? "رفع ملف CSV" : "Upload CSV"}</span>
                </button>
              )}
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.role === "assistant" && (
                  <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-brand/20 text-brand">
                    <Bot size={15} />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-sm ${
                    m.role === "user"
                      ? "bg-brand text-white rounded-br-xs"
                      : "bg-muted/60 text-foreground border border-line rounded-bl-xs"
                  }`}
                >
                  <div className="whitespace-pre-wrap font-sans">{m.content}</div>
                  <div
                    className={`mt-1.5 text-[10px] ${
                      m.role === "user" ? "text-white/70 text-end" : "text-muted"
                    }`}
                  >
                    {m.time}
                  </div>
                </div>

                {m.role === "user" && (
                  <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-brand text-white">
                    <User size={15} />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-2.5 justify-start">
                <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-brand/20 text-brand">
                  <Bot size={15} />
                </div>
                <div className="rounded-2xl rounded-bl-xs bg-muted/60 border border-line px-4 py-3 text-xs text-foreground">
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand animate-bounce"></span>
                    <span className="h-1.5 w-1.5 rounded-full bg-brand animate-bounce [animation-delay:0.2s]"></span>
                    <span className="h-1.5 w-1.5 rounded-full bg-brand animate-bounce [animation-delay:0.4s]"></span>
                    <span className="text-muted text-[11px] ms-1">
                      {lang === "ar" ? "جاري قراءة البيانات والتحليل..." : "Analyzing data..."}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Carousel */}
          {messages.length <= 2 && (
            <div className="border-t border-line bg-muted/20 px-3 py-2">
              <div className="text-[10px] font-semibold text-muted mb-1.5 flex items-center gap-1">
                <Sparkles size={11} className="text-amber-500" />
                {lang === "ar" ? "أسئلة مقترحة سريعة:" : "Suggested queries:"}
              </div>
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {quickPrompts.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => sendMessage(p.text)}
                    disabled={loading}
                    className="flex-shrink-0 rounded-full border border-line bg-card hover:border-brand px-2.5 py-1 text-[11px] text-foreground hover:text-brand transition whitespace-nowrap shadow-xs"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Bar */}
          <div className="border-t border-line bg-card p-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
              className="flex items-center gap-2"
            >
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadLoading || loading}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-line bg-muted/40 text-muted hover:text-brand hover:border-brand transition flex-shrink-0"
                title={lang === "ar" ? "إرفاق ملف CSV أو نصي" : "Attach CSV/file"}
              >
                <Paperclip size={16} />
              </button>

              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  activeFile
                    ? lang === "ar"
                      ? `اسأل عن ملف (${activeFile.name})...`
                      : `Ask about (${activeFile.name})...`
                    : lang === "ar"
                    ? "اسأل أي سؤال عن البيانات والمبيعات..."
                    : "Ask anything about the CRM data..."
                }
                className="flex-1 rounded-xl border border-line bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-brand"
                disabled={loading}
              />

              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-white disabled:opacity-40 hover:bg-brand/90 transition shadow-sm flex-shrink-0"
              >
                <Send size={15} />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
