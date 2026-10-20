import { NextRequest, NextResponse } from "next/server";

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

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`;

  // Add 10-second timeout to prevent hanging forever
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const data = await res.json();
    if (res.ok) {
      return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response from Gemini.";
    }
    throw new Error(data.error?.message || `Gemini API error (Status ${res.status})`);
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === "AbortError") {
      throw new Error("Connection to Google Gemini timed out after 10 seconds.");
    }
    throw err;
  }
}

export async function POST(req: NextRequest) {
  const contentType = req.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    try {
      const body = await req.json();
      const { messages, fileData, fileName, crmContext, apiKey } = body;

      const activeKey =
        apiKey ||
        process.env.GEMINI_API_KEY ||
        process.env.GOOGLE_API_KEY ||
        "";

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
          reply: `⚠️ Please enter your Gemini API key using the key icon (🔑) in the chat header, or set GEMINI_API_KEY in environment variables.`,
        });
      }

      const reply = await callGemini(activeKey, systemContent, messages);
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
