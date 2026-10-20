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
} from "lucide-react";
import { useStore } from "@/lib/store";
import { companies, groupKpis, customers, tasks, conversations, months, groupSales, sources } from "@/lib/data";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  time: string;
}

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export function AiAnalystChat() {
  const { lang, companyId } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeFile, setActiveFile] = useState<{ name: string; content: string; size: number } | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [sessionId] = useState("bin-rabie-chat");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);


  const initialWelcome = lang === "ar"
    ? "أهلاً بك! أنا مساعدك الذكي لمجموعة بن ربعي القابضة. اسألني أي شيء، ويمكنك رفع ملف بيانات لتحليله."
    : "Welcome! I’m Bin Rabie Holding Group’s AI assistant. Ask me anything, or upload a data file for analysis.";

  const [messages, setMessages] = useState<Message[]>([{
    id: "welcome",
    role: "assistant",
    content: initialWelcome,
    time: "09:00",
  }]);

  const quickPrompts = lang === "ar"
    ? [
        { text: "📊 لخّص مبيعات المجموعة", label: "ملخص المبيعات" },
        { text: "🏆 من أكبر 3 عملاء حسب قيمة الصفقات؟", label: "أكبر الصفقات" },
        { text: "📈 ما أفضل قناة تسويقية؟", label: "أفضل القنوات" },
        { text: "⚠️ ما المهام العاجلة؟", label: "المهام العاجلة" },
      ]
    : [
        { text: "📊 Summarize group sales", label: "Sales summary" },
        { text: "🏆 Who are the top 3 customers by deal value?", label: "Top deals" },
        { text: "📈 What is the best marketing channel?", label: "Best channels" },
        { text: "⚠️ What tasks are urgent?", label: "Urgent tasks" },
      ];

  useEffect(() => {
    if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen, loading]);

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
      customers: customers.map((c) => ({ name: c.nameAr, company: c.companyId, stage: c.stage, valueSAR: c.value, city: c.city, source: c.source })),
      pendingTasks: tasks.filter((t) => !t.done).map((t) => ({ task: t.titleAr, priority: t.priority, due: t.due })),
      recentConversationsCount: conversations.length,
      unreadConversationsCount: conversations.filter((c) => c.unread).length,
    };
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_UPLOAD_BYTES) {
      alert(lang === "ar" ? "حجم الملف الأقصى 5 ميغابايت." : "Maximum file size is 5 MB.");
      e.target.value = "";
      return;
    }
    const supported = /\.(csv|txt|json|xlsx)$/i.test(file.name);
    if (!supported) {
      alert(lang === "ar" ? "الملفات المدعومة: CSV وTXT وJSON وXLSX." : "Supported files: CSV, TXT, JSON, and XLSX.");
      e.target.value = "";
      return;
    }
    setUploadLoading(true);
    try {
      let content: string;
      if (/\.xlsx$/i.test(file.name)) {
        const bytes = new Uint8Array(await file.arrayBuffer());
        let binary = "";
        for (let i = 0; i < bytes.length; i += 0x8000) {
          binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
        }
        content = `base64:${btoa(binary)}`;
      } else {
        content = await file.text();
      }
      setActiveFile({ name: file.name, content, size: file.size });
      setMessages((prev) => [...prev, {
        id: Date.now().toString(),
        role: "assistant",
        content: lang === "ar"
          ? `تم إرفاق ${file.name}. اسألني عنه متى شئت.`
          : `Attached ${file.name}. Ask me about it whenever you like.`,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }]);
    } catch {
      alert(lang === "ar" ? "تعذرت قراءة الملف." : "Could not read the file.");
    } finally {
      setUploadLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function sendMessage(textToSend?: string) {
    const query = (textToSend ?? input).trim();
    if (!query || loading) return;
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: query,
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
          sessionId,
          messages: newHistory.filter((m) => m.id !== "welcome").map(({ role, content }) => ({ role, content })),
          crmContext: getCrmContext(),
          fileData: activeFile?.content ?? null,
          fileName: activeFile?.name ?? null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.reply || (lang === "ar" ? "لم يصل رد من المساعد." : "The assistant returned an empty response."),
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }]);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unexpected error";
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: lang === "ar" ? `تعذر إكمال الطلب: ${message}` : `Could not complete the request: ${message}`,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }]);
    } finally {
      setLoading(false);
    }
  }

  function clearConversation() {
    setMessages([{ id: "welcome", role: "assistant", content: initialWelcome, time: "09:00" }]);
  }

  return (
    <>
      <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".csv,.txt,.json,.xlsx" className="hidden" />
      {!isOpen && (
        <button type="button" onClick={() => setIsOpen(true)} className="btn-interactive fixed bottom-6 end-6 z-40 flex items-center gap-2.5 rounded-full bg-brand px-4 py-3.5 text-white shadow-2xl shadow-brand/40 hover:bg-brand/90 hover:scale-105 active:scale-95 transition-all duration-200 border-2 border-white/20" title={lang === "ar" ? "مساعد الذكاء الاصطناعي" : "AI assistant"}>
          <Sparkles size={20} className="text-amber-300" />
          <span className="text-sm font-bold">{lang === "ar" ? "المساعد الذكي" : "AI Assistant"}</span>
        </button>
      )}
      {isOpen && (
        <div className={`fixed z-50 flex flex-col bg-card border border-line shadow-2xl transition-all duration-300 rounded-3xl overflow-hidden ${isExpanded ? "inset-4 md:inset-10" : "bottom-6 end-6 w-[94vw] sm:w-[440px] h-[640px] max-h-[88vh]"}`}>
          <div className="flex items-center justify-between border-b border-line bg-sidebar px-4 py-3 text-sidebar-foreground">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/20 text-brand border border-brand/30"><Bot size={22} /></div>
              <div><h3 className="text-sm font-bold">{lang === "ar" ? "المساعد الذكي" : "AI Assistant"}</h3><div className="text-[11px] text-sidebar-foreground/70">Bin Rabie Holding</div></div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={clearConversation} className="rounded-lg p-1.5 hover:bg-white/10" title={lang === "ar" ? "مسح المحادثة" : "Clear conversation"}><RotateCcw size={15} /></button>
              <button onClick={() => setIsExpanded(!isExpanded)} className="hidden sm:flex rounded-lg p-1.5 hover:bg-white/10" title={isExpanded ? "Minimize" : "Maximize"}>{isExpanded ? <Minimize2 size={15} /> : <Maximize2 size={15} />}</button>
              <button onClick={() => setIsOpen(false)} className="rounded-lg p-1.5 hover:bg-white/10" title={lang === "ar" ? "إغلاق" : "Close"}><X size={18} /></button>
            </div>
          </div>
          <div className="flex items-center justify-between border-b border-line bg-muted/40 px-4 py-2 text-xs">
            <div className="flex items-center gap-2 truncate">{activeFile ? <><FileSpreadsheet size={14} className="text-emerald-500" /><span className="font-semibold truncate">{activeFile.name}</span><span className="text-muted">({Math.round(activeFile.size / 1024)} KB)</span></> : <><Building2 size={14} className="text-brand" /><span className="font-semibold">{lang === "ar" ? "بيانات CRM" : "CRM context"}</span></>}</div>
            <div className="flex items-center gap-1.5">{activeFile ? <button onClick={() => setActiveFile(null)} className="flex items-center gap-1 text-red-500"><Trash2 size={12} />{lang === "ar" ? "إزالة" : "Remove"}</button> : <button onClick={() => fileInputRef.current?.click()} disabled={uploadLoading} className="flex items-center gap-1 rounded-md bg-brand/10 px-2 py-0.5 text-[11px] font-semibold text-brand"><Paperclip size={12} />{uploadLoading ? "..." : lang === "ar" ? "إرفاق ملف" : "Attach file"}</button>}</div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((m) => <div key={m.id} className={`flex gap-2.5 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              {m.role === "assistant" && <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-brand/20 text-brand"><Bot size={15} /></div>}
              <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-sm ${m.role === "user" ? "bg-brand text-white rounded-br-xs" : "bg-muted/60 text-foreground border border-line rounded-bl-xs"}`}><div className="whitespace-pre-wrap font-sans">{m.content}</div><div className={`mt-1.5 text-[10px] ${m.role === "user" ? "text-white/70 text-end" : "text-muted"}`}>{m.time}</div></div>
              {m.role === "user" && <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-brand text-white"><User size={15} /></div>}
            </div>)}
            {loading && <div className="flex gap-2.5 justify-start"><div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand/20 text-brand"><Bot size={15} /></div><div className="rounded-2xl bg-muted/60 border border-line px-4 py-3 text-xs text-muted">{lang === "ar" ? "يفكر..." : "Thinking..."}</div></div>}
            <div ref={messagesEndRef} />
          </div>
          {messages.length <= 2 && <div className="border-t border-line bg-muted/20 px-3 py-2"><div className="text-[10px] font-semibold text-muted mb-1.5 flex items-center gap-1"><Sparkles size={11} className="text-amber-500" />{lang === "ar" ? "اقتراحات" : "Suggestions"}</div><div className="flex gap-1.5 overflow-x-auto pb-1">{quickPrompts.map((p) => <button key={p.text} onClick={() => sendMessage(p.text)} disabled={loading} className="flex-shrink-0 rounded-full border border-line bg-card px-2.5 py-1 text-[11px] hover:border-brand">{p.label}</button>)}</div></div>}
          <div className="border-t border-line bg-card p-3"><form onSubmit={(e) => { e.preventDefault(); void sendMessage(); }} className="flex items-center gap-2">
            <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploadLoading || loading} className="flex h-9 w-9 items-center justify-center rounded-xl border border-line bg-muted/40 text-muted"><Paperclip size={16} /></button>
            <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder={activeFile ? (lang === "ar" ? `اسأل عن ${activeFile.name}...` : `Ask about ${activeFile.name}...`) : (lang === "ar" ? "اكتب رسالتك..." : "Message the assistant...")} className="flex-1 rounded-xl border border-line bg-background px-3 py-2 text-xs text-foreground" disabled={loading} />
            <button type="submit" disabled={!input.trim() || loading} className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-white disabled:opacity-40"><Send size={15} /></button>
          </form></div>
        </div>
      )}
    </>
  );
}
