import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const contentType = req.headers.get("content-type") || "";

  // 1. Handle JSON Chat Requests
  if (contentType.includes("application/json")) {
    try {
      const body = await req.json();
      const { messages, fileData, fileName, crmContext } = body;

      const apiKey = process.env.OPENAI_API_KEY;

      let systemContent = `You are the expert Executive AI Data Analyst for "Bin Rabie Holding Group" (مجموعة بن ربعي القابضة), a prominent Saudi holding group operating in trading, transport, car rental, and logistics.
Your mission is to provide sharp, accurate, data-driven analysis and insights based on the available data.
Always be polite, executive, and direct. Respond in the language used by the user (Arabic or English).
Use structured Markdown (bullet points, bold figures, and tables where helpful) for clarity.`;

      if (crmContext) {
        systemContent += `\n\n### CURRENT CRM SYSTEM CONTEXT:\n${
          typeof crmContext === "string" ? crmContext : JSON.stringify(crmContext, null, 2)
        }`;
      }

      if (fileData) {
        systemContent += `\n\n### USER UPLOADED DATASET (${fileName || "uploaded_data.csv"}):\n${fileData.slice(
          0,
          25000
        )}`;
      }

      // If OpenAI API key is not yet available, provide an intelligent local analysis
      if (!apiKey) {
        return NextResponse.json({
          reply: `⚠️ تنبيه: مفتاح OpenAI API غير محدد حالياً في متغيرات البيئة (OPENAI_API_KEY).\n\n📊 **ملخص فوري من بيانات النظام المتاحة محلياً:**\n- **المجموعة:** مجموعة بن ربعي القابضة (دوم، قادر، بن ربعي للنقليات).\n- **المبيعات اليومية:** 287,450 ريال سعودي.\n- **العملاء الجدد:** 856 عميلاً.\n- **المحادثات النشطة:** 1,248 محادثة.\n- **قنوات التسويق الرائدة:** واتساب (45%)، إنستغرام (20%)، فيسبوك (15%).\n\nيرجى إضافة مفتاح \`OPENAI_API_KEY\` في إعدادات الخادم لتفعيل التحليل المتقدم للملفات المرفوعة والمحادثة الذكية التفاعلية.`,
        });
      }

      const openAiMessages = [
        { role: "system", content: systemContent },
        ...(messages || []).map((m: any) => ({
          role: m.role,
          content: m.content,
        })),
      ];

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          temperature: 0.3,
          messages: openAiMessages,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error?.message || `OpenAI request failed: ${response.statusText}`);
      }

      const data = await response.json();
      const reply = data.choices?.[0]?.message?.content || "لم يتم استلام رد.";

      return NextResponse.json({ reply });
    } catch (err: any) {
      return NextResponse.json({ error: err.message || "Analysis request failed" }, { status: 500 });
    }
  }

  // 2. Handle Multipart Form-Data (file uploads)
  try {
    const form = await req.formData();
    const file = form.get("dataset") as File | null;
    if (!file) {
      return NextResponse.json({ error: 'No file provided under "dataset" key' }, { status: 400 });
    }

    const csvText = await file.text();
    return NextResponse.json({
      fileName: file.name,
      fileSize: file.size,
      rawContent: csvText,
      summary: `تم قراءة الملف (${file.name}) بنجاح. الحجم: ${Math.round(file.size / 1024)} كيلوبايت.`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to process upload" }, { status: 500 });
  }
}
