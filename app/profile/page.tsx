"use client";

import { useStore } from "@/lib/store";
import { dictionary as d, tx } from "@/lib/i18n";
import { User, Mail, Phone, Building2, Shield, Calendar, Award, CheckCircle2 } from "lucide-react";

export default function ProfilePage() {
  const { lang } = useStore();

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-4 rounded-3xl border border-line bg-card p-6 shadow-sm card-interactive">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-brand text-white text-3xl font-bold shadow-lg shadow-brand/25">
          ي
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-foreground">{tx(lang, d.userName)}</h1>
            <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              {lang === "ar" ? "نشط الآن" : "Active"}
            </span>
          </div>
          <div className="text-sm font-medium text-brand mt-0.5">{tx(lang, d.userRole)}</div>
          <div className="text-xs text-muted mt-1">
            {lang === "ar" ? "مجموعة بن ربعي القابضة · الإدارة العليا" : "Bin Rabie Holding Group · Executive Management"}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contact Info */}
        <div className="rounded-2xl border border-line bg-card p-6 shadow-sm space-y-4 card-interactive">
          <div className="flex items-center gap-2 border-b border-line pb-4">
            <User size={18} className="text-brand" />
            <h2 className="text-base font-bold text-foreground">{lang === "ar" ? "معلومات الاتصال" : "Contact Information"}</h2>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3 text-muted">
              <Mail size={16} className="text-brand" />
              <span className="text-foreground font-medium">ceo@binrabie.ae</span>
            </div>
            <div className="flex items-center gap-3 text-muted">
              <Phone size={16} className="text-brand" />
              <span className="text-foreground font-medium">+971 4 000 0000</span>
            </div>
            <div className="flex items-center gap-3 text-muted">
              <Building2 size={16} className="text-brand" />
              <span className="text-foreground font-medium">{lang === "ar" ? "المقر الرئيسي - دبي / أبوظبي" : "HQ - Dubai / Abu Dhabi"}</span>
            </div>
          </div>
        </div>

        {/* Security & Access */}
        <div className="rounded-2xl border border-line bg-card p-6 shadow-sm space-y-4 card-interactive">
          <div className="flex items-center gap-2 border-b border-line pb-4">
            <Shield size={18} className="text-brand" />
            <h2 className="text-base font-bold text-foreground">{lang === "ar" ? "الأمان والصلاحيات" : "Security & Permissions"}</h2>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted">{lang === "ar" ? "صلاحيات النظام" : "System Access"}</span>
              <span className="font-semibold text-brand">{lang === "ar" ? "مدير عام (Full Admin)" : "Full Administrator"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted">{lang === "ar" ? "المصادقة الثنائية" : "Two-Factor Auth"}</span>
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold text-xs">
                <CheckCircle2 size={14} /> {lang === "ar" ? "مفعلة" : "Enabled"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted">{lang === "ar" ? "آخر تسجيل دخول" : "Last Login"}</span>
              <span className="font-medium text-foreground">Today, 08:30 AM</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
