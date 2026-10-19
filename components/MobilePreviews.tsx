"use client";

import { useState } from "react";
import { MessageSquare, Car, Truck, ShoppingBag, Send, CheckCheck, Phone, Video, MoreVertical } from "lucide-react";
import { useStore } from "@/lib/store";

interface MobileAppPreview {
  id: string;
  subsidiaryAr: string;
  subsidiaryEn: string;
  taglineAr: string;
  taglineEn: string;
  channel: "whatsapp" | "instagram";
  channelColor: string;
  avatarBg: string;
  icon: typeof Car;
  customerNameAr: string;
  customerNameEn: string;
  customerPhone: string;
  messages: {
    from: "customer" | "business" | "bot";
    textAr: string;
    textEn: string;
    time: string;
    quickReplies?: { ar: string; en: string }[];
  }[];
}

const previews: MobileAppPreview[] = [
  {
    id: "dom",
    subsidiaryAr: "شركة دوم لتأجير السيارات",
    subsidiaryEn: "Dom Car Rental",
    taglineAr: "خدمة تأجير سيارات فاخرة واقتصادية",
    taglineEn: "Luxury & Economy Car Rentals",
    channel: "whatsapp",
    channelColor: "#25D366",
    avatarBg: "bg-emerald-600",
    icon: Car,
    customerNameAr: "محمد السبيعي",
    customerNameEn: "Mohammed Al-Subaie",
    customerPhone: "+966 50 123 4567",
    messages: [
      {
        from: "customer",
        textAr: "السلام عليكم، أبغى أحجز مرسيدس S-Class لمدة ٣ أيام في الرياض.",
        textEn: "Hello, I want to book a Mercedes S-Class for 3 days in Riyadh.",
        time: "10:14 AM",
      },
      {
        from: "bot",
        textAr: "أهلاً بك أستاذ محمد! 🚗 متاح لدينا مرسيدس S-Class موديل 2024 بسعر خاص 1,800 ر.س/يوم شامل التأمين والتوصيل للمطار.",
        textEn: "Welcome Mr. Mohammed! 🚗 Mercedes S-Class 2024 is available at a special rate of 1,800 SAR/day including insurance and airport delivery.",
        time: "10:15 AM",
        quickReplies: [
          { ar: "تأكيد الحجز فوراً", en: "Confirm Booking Now" },
          { ar: "استعراض سيارات أخرى", en: "Browse Other Cars" },
        ],
      },
      {
        from: "business",
        textAr: "تم تجهيز العقد وتطبيق خصم 10% لعملاء مجموعة بن ربعي. أرسلنا الرابط للدفع.",
        textEn: "Contract is prepared with 10% discount for Bin Rabie clients. Link sent for payment.",
        time: "10:18 AM",
      },
    ],
  },
  {
    id: "qader",
    subsidiaryAr: "شركة قادر للتوصيل والنقل",
    subsidiaryEn: "Qader VIP Transport & Delivery",
    taglineAr: "نقل كبار الشخصيات والتوصيل الفوري",
    taglineEn: "VIP Mobility & Fast Delivery",
    channel: "whatsapp",
    channelColor: "#25D366",
    avatarBg: "bg-blue-600",
    icon: Truck,
    customerNameAr: "سلطان العتيبي",
    customerNameEn: "Sultan Al-Otaibi",
    customerPhone: "+966 55 987 6543",
    messages: [
      {
        from: "customer",
        textAr: "محتاج مشوار VIP من مطار الملك خالد إلى فندق الفورسيزونز.",
        textEn: "Need a VIP ride from KKIA Airport to Four Seasons Hotel.",
        time: "11:30 AM",
      },
      {
        from: "bot",
        textAr: "تم رصد طلبك عبر تطبيق قادر! كابتن VIP بسيارة لكزس ES بانتظارك في الصالة رقم 1.",
        textEn: "Your request is registered via Qader! VIP captain in Lexus ES is waiting at Terminal 1.",
        time: "11:31 AM",
        quickReplies: [
          { ar: "موقع الكابتن المباشر", en: "Live Captain Location" },
          { ar: "تحديث الموعد", en: "Update Pickup Time" },
        ],
      },
      {
        from: "business",
        textAr: "الكابتن وصل نقطة الالتقاء، رحلة موفقة مع قادر!",
        textEn: "Captain has arrived at pickup point. Have a great trip with Qader!",
        time: "11:35 AM",
      },
    ],
  },
  {
    id: "trading",
    subsidiaryAr: "شركة بن ربعي للتجارة والخدمات",
    subsidiaryEn: "Bin Rabie Trading & Services",
    taglineAr: "حلول التوريدات اللوجستية وتجارة الجملة",
    taglineEn: "Wholesale & Logistics Procurement",
    channel: "whatsapp",
    channelColor: "#25D366",
    avatarBg: "bg-amber-600",
    icon: ShoppingBag,
    customerNameAr: "م. خالد الحربي",
    customerNameEn: "Eng. Khaled Al-Harbi",
    customerPhone: "+966 54 321 8899",
    messages: [
      {
        from: "customer",
        textAr: "هل وصل أمر التوريد الخاص بمشروع مستودعات جدة؟",
        textEn: "Did the supply order for Jeddah warehouse project arrive?",
        time: "01:20 PM",
      },
      {
        from: "bot",
        textAr: "مرحباً بك مهندس خالد. رقم أمر التوريد #PO-8842 قيد المعالجة في مستودعات الرياض وسيتم الشحن غداً صباحاً.",
        textEn: "Hello Eng. Khaled. Supply PO #PO-8842 is being packed at Riyadh hub and ships tomorrow morning.",
        time: "01:21 PM",
        quickReplies: [
          { ar: "تحميل بوليصة الشحن", en: "Download Waybill PDF" },
          { ar: "التحدث مع مسؤول الحساب", en: "Talk to Account Mgr" },
        ],
      },
      {
        from: "business",
        textAr: "تم إرفاق الفاتورة الإلكترونية المعتمدة من هيئة الزكاة والضريبة والجمارك.",
        textEn: "ZATCA compliant e-invoice is attached to your customer file.",
        time: "01:24 PM",
      },
    ],
  },
];

export default function MobilePreviews() {
  const { lang, setCompanyId } = useStore();
  const [activeTab, setActiveTab] = useState("all");

  const visible = activeTab === "all" ? previews : previews.filter((p) => p.id === activeTab);

  return (
    <section className="rounded-3xl border border-line bg-card p-6 shadow-sm">
      <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
              <MessageSquare size={16} />
            </span>
            <h2 className="text-lg font-bold">
              {lang === "ar" ? "قنوات المحادثات الذكية عبر الجوال للشركات التابعة" : "Mobile Smart Omnichannel Previews for Subsidiaries"}
            </h2>
          </div>
          <p className="mt-1 text-xs text-muted">
            {lang === "ar"
              ? "معاينة حية لتكامل قنوات واتساب الموحدة والمساعد الذكي مع شركات المجموعة"
              : "Live preview of unified WhatsApp & AI bot integrations across group subsidiaries"}
          </p>
        </div>

        {/* Subsidiary Selector */}
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setActiveTab("all")}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
              activeTab === "all" ? "bg-brand text-white" : "border border-line bg-slate-50 text-muted hover:bg-slate-100"
            }`}
          >
            {lang === "ar" ? "الكل (3 نماذج)" : "All (3 Devices)"}
          </button>
          {previews.map((p) => (
            <button
              key={p.id}
              onClick={() => setActiveTab(p.id)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                activeTab === p.id ? "bg-brand text-white" : "border border-line bg-slate-50 text-muted hover:bg-slate-100"
              }`}
            >
              {lang === "ar" ? p.subsidiaryAr.replace("شركة ", "") : p.subsidiaryEn}
            </button>
          ))}
        </div>
      </div>

      {/* 3 Mobile Devices Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {visible.map((preview) => {
          const IconComponent = preview.icon;
          return (
            <div
              key={preview.id}
              className="mx-auto w-full max-w-[340px] rounded-[36px] border-[8px] border-slate-900 bg-slate-950 p-2 shadow-2xl transition hover:-translate-y-1"
            >
              {/* Dynamic Island / Speaker */}
              <div className="relative mb-2 flex h-5 items-center justify-center">
                <div className="h-3 w-24 rounded-full bg-slate-800" />
                <div className="absolute end-4 top-1 flex items-center gap-1 text-[9px] text-slate-400">
                  <span>5G</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Screen Area */}
              <div className="flex h-[460px] flex-col overflow-hidden rounded-[26px] bg-[#0b141a] text-slate-100">
                {/* WhatsApp Style Header */}
                <div className="flex items-center justify-between border-b border-white/10 bg-[#202c33] px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full text-white ${preview.avatarBg}`}>
                      <IconComponent size={15} />
                    </div>
                    <div>
                      <div className="text-xs font-bold leading-tight">
                        {lang === "ar" ? preview.subsidiaryAr : preview.subsidiaryEn}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-emerald-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        {lang === "ar" ? "متصل الآن (بوت ذكي)" : "Online (AI Bot)"}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 text-slate-300">
                    <Video size={14} className="opacity-80" />
                    <Phone size={14} className="opacity-80" />
                    <MoreVertical size={14} className="opacity-80" />
                  </div>
                </div>

                {/* Subtitle / Company Banner */}
                <div className="bg-[#111b21] px-3 py-1.5 text-center text-[10px] text-slate-400 border-b border-white/5">
                  {lang === "ar" ? preview.taglineAr : preview.taglineEn}
                </div>

                {/* Messages Body */}
                <div className="flex-1 space-y-3 overflow-y-auto p-3 text-xs bg-[radial-gradient(#1f2c34_1px,transparent_1px)] [background-size:16px_16px]">
                  {preview.messages.map((m, idx) => {
                    const isBusiness = m.from === "business" || m.from === "bot";
                    return (
                      <div key={idx} className={`flex flex-col ${isBusiness ? "items-start" : "items-end"}`}>
                        <div
                          className={`max-w-[85%] rounded-2xl px-3 py-2 shadow-sm ${
                            isBusiness ? "bg-[#202c33] text-slate-100 rounded-tr-sm" : "bg-[#005c4b] text-white rounded-tl-sm"
                          }`}
                        >
                          {m.from === "bot" && (
                            <span className="mb-1 inline-block rounded bg-blue-500/20 px-1.5 py-0.5 text-[9px] font-semibold text-blue-300">
                              🤖 {lang === "ar" ? "رد آلي ذكي" : "AI Assistant"}
                            </span>
                          )}
                          <p className="text-[11px] leading-relaxed">{lang === "ar" ? m.textAr : m.textEn}</p>
                          <div className="mt-1 flex items-center justify-end gap-1 text-[9px] text-slate-400">
                            <span>{m.time}</span>
                            {!isBusiness && <CheckCheck size={11} className="text-sky-400" />}
                          </div>
                        </div>

                        {/* Interactive Quick Replies */}
                        {m.quickReplies && (
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            {m.quickReplies.map((qr, i) => (
                              <button
                                key={i}
                                className="rounded-full border border-emerald-500/40 bg-emerald-950/60 px-2 py-0.5 text-[10px] font-medium text-emerald-300 hover:bg-emerald-900"
                              >
                                {lang === "ar" ? qr.ar : qr.en}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* WhatsApp Input Bar */}
                <div className="flex items-center gap-2 border-t border-white/10 bg-[#202c33] p-2">
                  <input
                    readOnly
                    value={lang === "ar" ? "اكتب رسالة..." : "Type a message..."}
                    className="flex-1 rounded-full bg-[#2a3942] px-3 py-1.5 text-[11px] text-slate-300 outline-none"
                  />
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-white shadow">
                    <Send size={12} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
