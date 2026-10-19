"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Lock, Mail, ArrowRight, Languages } from "lucide-react";
import { useStore } from "@/lib/store";
import { dictionary as d, tx } from "@/lib/i18n";

export default function LoginPage() {
  const router = useRouter();
  const { lang, toggleLang } = useStore();
  const [email, setEmail] = useState("ceo@binrabie.ae");
  const [password, setPassword] = useState("••••••••");
  const [loading, setLoading] = useState(false);

  const dir = lang === "ar" ? "rtl" : "ltr";

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      router.push("/");
    }, 600);
  }

  return (
    <div dir={dir} className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="absolute top-6 end-6">
        <button
          onClick={toggleLang}
          className="btn-interactive flex items-center gap-2 rounded-xl border border-line bg-card px-4 py-2 text-sm font-semibold text-brand shadow-sm hover:bg-muted/50 transition"
        >
          <Languages size={16} />
          {lang === "ar" ? "English" : "العربية"}
        </button>
      </div>

      <div className="w-full max-w-md space-y-8 rounded-3xl border border-line bg-card p-8 shadow-xl card-interactive">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand text-white text-2xl font-bold shadow-lg shadow-brand/20">
            بر
          </div>
          <h2 className="mt-6 text-2xl font-bold tracking-tight text-foreground">
            {tx(lang, d.brand)}
          </h2>
          <p className="mt-2 text-sm text-muted">
            {tx(lang, d.brandSub)}
          </p>
        </div>

        <form onSubmit={handleLogin} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-muted mb-1.5">
                {tx(lang, d.email) || "البريد الإلكتروني"}
              </label>
              <div className="relative">
                <Mail size={18} className="absolute start-3.5 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-xl border border-line bg-card py-2.5 pe-4 ps-10 text-sm text-foreground outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted mb-1.5">
                {lang === "ar" ? "كلمة المرور" : "Password"}
              </label>
              <div className="relative">
                <Lock size={18} className="absolute start-3.5 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-xl border border-line bg-card py-2.5 pe-4 ps-10 text-sm text-foreground outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded border-line text-brand focus:ring-brand" />
              <span className="text-muted">{lang === "ar" ? "تذكرني" : "Remember me"}</span>
            </label>
            <a href="#" className="text-brand hover:underline font-semibold">
              {lang === "ar" ? "نسيت كلمة المرور؟" : "Forgot password?"}
            </a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-interactive flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-3 text-sm font-bold text-white shadow-lg shadow-brand/25 hover:bg-brand-dark transition disabled:opacity-50"
          >
            {loading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <>
                <span>{lang === "ar" ? "تسجيل الدخول" : "Sign In"}</span>
                <ArrowRight size={16} className={lang === "ar" ? "rotate-180" : ""} />
              </>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-muted pt-4 border-t border-line">
          {lang === "ar" ? "مجموعة بن ربعي القابضة © 2026" : "Bin Rabie Holding Group © 2026"}
        </div>
      </div>
    </div>
  );
}
