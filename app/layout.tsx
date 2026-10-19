import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import Shell from "@/components/Shell";
import { StoreProvider } from "@/lib/store";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "بن ربعي القابضة — CRM",
  description: "نظام إدارة العملاء لمجموعة بن ربعي القابضة",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('binrabie.theme') || 'system';
                  var root = document.documentElement;
                  if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    root.classList.add('dark');
                  } else {
                    root.classList.remove('dark');
                  }

                  var density = localStorage.getItem('binrabie.density');
                  if (density === 'compact') {
                    root.classList.add('density-compact');
                  } else {
                    root.classList.remove('density-compact');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <StoreProvider>
          <Shell>{children}</Shell>
        </StoreProvider>
      </body>
    </html>
  );
}
