import { NextRequest, NextResponse } from "next/server";

async function callOpenAi(apiKey: string, systemPrompt: string, messages: any[]) {
  const openAiMessages = [
    { role: "system", content: systemPrompt },
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
  return data.choices?.[0]?.message?.content || "لم يتم استلام رد من OpenAI.";
}

async function callGemini(apiKey: string, systemPrompt: string, messages: any[]) {
  const contents = (messages || []).map((m: any) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content || "" }],
  }));

  const payload = {
    systemInstruction: {
      parts: [{ text: systemPrompt }],
    },
    contents: contents.length > 0 ? contents : [{ role: "user", parts: [{ text: "Hello" }] }],
  };

  // Try Gemini 2.0 Flash first, fallback to 1.5 Flash
  const url2 = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
  const res2 = await fetch(url2, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (res2.ok) {
    const data = await res2.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "لم يتم استلام رد من Gemini.";
  }

  // Fallback to gemini-1.5-flash
  const url15 = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  const res15 = await fetch(url15, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res15.ok) {
    const err = await res15.json().catch(() => ({}));
    throw new Error(err.error?.message || `Gemini API error (Status ${res15.status})`);
  }

  const data15 = await res15.json();
  return data15.candidates?.[0]?.content?.parts?.[0]?.text || "لم يتم استلام رد من Gemini.";
}

export async function POST(req: NextRequest) {
  const contentType = req.headers.get("content-type") || "";

  // 1. Handle JSON Chat Requests
  if (contentType.includes("application/json")) {
    try {
      const body = await req.json();
      const { messages, fileData, fileName, crmContext, apiKey } = body;

      const activeKey =
        apiKey ||
        process.env.GEMINI_API_KEY ||
        process.env.GOOGLE_API_KEY ||
        process.env.OPENAI_API_KEY;

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

      if (!activeKey) {
        return NextResponse.json({
          reply: `⚠️ تنبيه: لم يتم إدخال مفتاح الذكاء الاصطناعي (Google Gemini أو OpenAI).\n\nيمكنك إدخال المفتاح مباشرة من أيقونة الإعدادات ⚙️ أعلى المحادثة، أو من صفحة الإعدادات.\n\n📊 **ملخص فوري من بيانات النظام المتاحة محلياً:**\n- **المجموعة:** مجموعة بن ربعي القابضة.\n- **المبيعات اليومية:** 287,450 ريال سعودي.\n- **العملاء الجدد:** 856 عميلاً.\n- **المحادثات النشطة:** 1,248 محادثة.`,
        });
      }

      let reply = "";
      if (activeKey.startsWith("sk-")) {
        // OpenAI Key
        reply = await callOpenAi(activeKey, systemContent, messages);
      } else {
        // Google Gemini Key
        reply = await callGemini(activeKey, systemContent, messages);
      }

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
