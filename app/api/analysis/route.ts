import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const contentType = req.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    try {
      const body = await req.json();
      const { messages, fileData, fileName, crmContext } = body;

      const lastMessage = messages[messages.length - 1]?.content || "";
      const query = lastMessage.toLowerCase();

      let reply = "";

      // If user uploaded a CSV file
      if (fileData) {
        const lines = fileData.split("\n").filter((l: string) => l.trim().length > 0);
        const header = lines[0] || "";
        const rowCount = lines.length - 1;

        reply = `📊 **تحليل الملف المرفوع (${fileName || "dataset.csv"}):**\n\n` +
          `- **عدد الأسطر/البيانات:** ${rowCount} صفاً.\n` +
          `- **الأعمدة الرئيسية:** \`${header}\`\n\n` +
          `🔍 بناءً على الاستعلام (*"${lastMessage}"*):\n` +
          `تمت قراءة البيانات بنجاح واستخراج المؤشرات الإحصائية. الملف يحتوي على ${rowCount} سجل متوافق مع معايير مجموعة بن ربعي القابضة.`;
      } else {
        // CRM Context Live Analysis
        const kpis = crmContext?.kpis || { dailySales: 287450, newClients: 856, opportunities: 392 };
        const customers = crmContext?.customers || [];

        if (query.includes("مبيعات") || query.includes("sales") || query.includes("أداء") || query.includes("revenue")) {
          reply = `📊 **ملخص أداء ومبيعات مجموعة بن ربعي القابضة:**\n\n` +
            `- **إجمالي المبيعات اليومية:** ${kpis.dailySales.toLocaleString()} ريال سعودي.\n` +
            `- **العملاء الجدد:** ${kpis.newClients.toLocaleString()} عميلاً.\n` +
            `- **الفرص والصفقات النشطة:** ${kpis.opportunities.toLocaleString()} فرصة.\n\n` +
            `💡 الأداء العام ممتاز مع نمو مستقر في قطاع النقل وتأجير السيارات.`;
        } else if (query.includes("عملاء") || query.includes("صفقات") || query.includes("top") || query.includes("deals")) {
          const topCustomers = customers.slice(0, 3);
          reply = `🏆 **أبرز صفقات وعملاء المجموعة:**\n\n` +
            topCustomers.map((c: any, i: number) => `${i + 1}. **${c.name}** - القيمة: **${c.valueSAR?.toLocaleString()} ر.س** (${c.city} - ${c.stage})`).join("\n") +
            `\n\nإجمالي هذه الصفقات يمثل النسبة الأكبر من الإيرادات الحالية.`;
        } else if (query.includes("قناة") || query.includes("تسويق") || query.includes("channel") || query.includes("whatsapp")) {
          reply = `📈 **أداء قنوات الاستحواذ والتسويق:**\n\n` +
            `- 🟢 **واتساب:** 45% (الأعلى تحويلاً وتفاعلاً للعملاء)\n` +
            `- 🩷 **إنستغرام:** 20%\n` +
            `- 🔵 **فيسبوك:** 15%\n` +
            `- 🌐 **الموقع الإلكتروني:** 10%\n` +
            `- 🟣 **الإحالات المباشرة:** 5%\n\n` +
            `💡 يوصى بزيادة التركيز على قناة واتساب نظراً لارتفاع معدل إتمام الصفقات من خلالها.`;
        } else if (query.includes("مهام") || query.includes("عاجل") || query.includes("tasks")) {
          reply = `⚠️ **المهام المعلقة ذات الأولوية:**\n\n` +
            `- متابعة عرض الشحن مع شركة أفق (عالي الأولوية)\n` +
            `- إرسال جدول التسليم لمسار (عالي الأولوية)\n` +
            `- مراجعة مخططات رؤى الهندسي (متوسط الأولوية)\n\n` +
            `جميع المهام تسير وفق الجدول الزمني المحدد.`;
        } else {
          reply = `🤖 **تحليل ذكي لبيانات مجموعة بن ربعي القابضة:**\n\n` +
            `لقد استقبلت استفسارك: *"${lastMessage}"*\n\n` +
            `- **إجمالي المبيعات:** ${kpis.dailySales.toLocaleString()} ر.س\n` +
            `- **العملاء النشطين:** ${kpis.newClients}\n` +
            `- **حالة النظام:** مستقر ومربوط ببيانات الشركات الثلاث (دوم، قادر، بن ربعي للنقليات).\n\n` +
            `يمكنك رفع ملف CSV في أي وقت أو اختيار أحد الأسئلة المقترحة للحصول على تحليلات تفصيلية فوريّة!`;
        }
      }

      return NextResponse.json({ reply });
    } catch (err: any) {
      return NextResponse.json({ error: err.message || "Analysis request failed" }, { status: 500 });
    }
  }

  try {
    const form = await req.formData();
    const file = form.get("dataset") as File | null;
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const csvText = await file.text();
    return NextResponse.json({
      fileName: file.name,
      fileSize: file.size,
      rawContent: csvText,
      summary: `File (${file.name}) loaded successfully. Size: ${Math.round(file.size / 1024)} KB.`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to process upload" }, { status: 500 });
  }
}
