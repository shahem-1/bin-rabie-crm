"use client";

import { useStore } from "@/lib/store";
import { dictionary as d, tx } from "@/lib/i18n";
import { Settings, Sun, Moon, Monitor, LayoutGrid, LayoutList, Languages, Bell, Building2, Shield, Check } from "lucide-react";
import { companies } from "@/lib/data";

export default function SettingsPage() {
  const {
    lang,
    toggleLang,
    theme,
    setTheme,
    density,
    setDensity,
    companyId,
    setCompanyId,
    mounted,
  } = useStore();

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/10 text-brand">
          <Settings size={24} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">{tx(lang, d.settings)}</h1>
          <p className="text-sm text-muted">
            {lang === "ar" ? "إدارة تفضيلات النظام وإعدادات الحساب" : "Manage system preferences and account settings"}
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Appearance & Theme */}
        <div className="rounded-2xl border border-line bg-card p-6 shadow-sm space-y-4 card-interactive">
          <div className="flex items-center gap-2 border-b border-line pb-4">
            <Sun size={18} className="text-brand" />
            <h2 className="text-base font-bold text-foreground">{tx(lang, d.theme)}</h2>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: "light", label: tx(lang, d.light), icon: Sun },
              { id: "dark", label: tx(lang, d.dark), icon: Moon },
              { id: "system", label: tx(lang, d.system), icon: Monitor },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTheme(id as any)}
                className={`btn-interactive flex items-center justify-center gap-2 rounded-xl border p-4 text-sm font-semibold transition ${
                  theme === id
                    ? "border-brand bg-brand/10 text-brand shadow-sm"
                    : "border-line bg-card text-foreground hover:bg-muted/20"
                }`}
              >
                <Icon size={16} />
                <span>{label}</span>
                {theme === id && <Check size={14} className="ms-auto" />}
              </button>
            ))}
          </div>
        </div>

        {/* Density */}
        <div className="rounded-2xl border border-line bg-card p-6 shadow-sm space-y-4 card-interactive">
          <div className="flex items-center gap-2 border-b border-line pb-4">
            <LayoutGrid size={18} className="text-brand" />
            <h2 className="text-base font-bold text-foreground">{tx(lang, d.density)}</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: "comfy", label: tx(lang, d.comfy), icon: LayoutGrid, desc: lang === "ar" ? "مساحات مريحة وواسعة" : "Spacious and comfortable" },
              { id: "compact", label: tx(lang, d.compact), icon: LayoutList, desc: lang === "ar" ? "عرض مدمج للمعلومات المكثفة" : "Dense view for maximum data" },
            ].map(({ id, label, icon: Icon, desc }) => (
              <button
                key={id}
                onClick={() => setDensity(id as any)}
                className={`btn-interactive flex flex-col items-start gap-1 rounded-xl border p-4 text-start transition ${
                  density === id
                    ? "border-brand bg-brand/10 text-brand shadow-sm"
                    : "border-line bg-card text-foreground hover:bg-muted/20"
                }`}
              >
                <div className="flex items-center gap-2 font-semibold">
                  <Icon size={16} />
                  <span>{label}</span>
                  {density === id && <Check size={14} className="ms-auto text-brand" />}
                </div>
                <span className="text-xs text-muted">{desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Language & Regional */}
        <div className="rounded-2xl border border-line bg-card p-6 shadow-sm space-y-4 card-interactive">
          <div className="flex items-center gap-2 border-b border-line pb-4">
            <Languages size={18} className="text-brand" />
            <h2 className="text-base font-bold text-foreground">{lang === "ar" ? "اللغة والمنطقة" : "Language & Region"}</h2>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-foreground">{lang === "ar" ? "لغة واجهة المستخدم" : "Interface Language"}</div>
              <div className="text-xs text-muted">{lang === "ar" ? "التبديل بين العربية والإنجليزية" : "Switch between Arabic and English"}</div>
            </div>
            <button
              onClick={toggleLang}
              className="btn-interactive flex items-center gap-2 rounded-xl border border-line bg-card px-4 py-2 text-sm font-semibold text-brand hover:bg-muted/20 transition shadow-sm"
            >
              <Languages size={16} />
              {lang === "ar" ? "English (EN)" : "العربية (AR)"}
            </button>
          </div>
        </div>

        {/* Default Company */}
        <div className="rounded-2xl border border-line bg-card p-6 shadow-sm space-y-4 card-interactive">
          <div className="flex items-center gap-2 border-b border-line pb-4">
            <Building2 size={18} className="text-brand" />
            <h2 className="text-base font-bold text-foreground">{lang === "ar" ? "الشركة الافتراضية" : "Default Company"}</h2>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-foreground">{lang === "ar" ? "الشركة النشطة عند بدء التشغيل" : "Active company on startup"}</div>
              <div className="text-xs text-muted">{lang === "ar" ? "اختر الشركة التي تظهر افتراضياً في لوحة التحكم" : "Choose default company view"}</div>
            </div>
            <select
              value={companyId ?? ""}
              onChange={(e) => setCompanyId(e.target.value || null)}
              className="rounded-xl border border-line bg-card text-foreground px-3 py-2 text-sm outline-none focus:border-brand shadow-sm"
            >
              <option value="">{tx(lang, d.allCompanies)}</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c[lang]}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
