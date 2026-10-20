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

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error?.message || `OpenAI request failed: ${response.statusText}`);
  }

  return data.choices?.[0]?.message?.content || "No response from OpenAI.";
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

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (res.ok) {
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response from Gemini.";
  }

  throw new Error(data.error?.message || `Gemini API error (Status ${res.status})`);
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
          reply: `⚠️ Please enter your API key using the key icon (🔑) in the chat header.`,
        });
      }

      let reply = "";
      if (activeKey.startsWith("sk-")) {
        try {
          reply = await callOpenAi(activeKey, systemContent, messages);
        } catch (openaiErr: any) {
          if (openaiErr.message?.includes("quota") || openaiErr.message?.includes("credits") || openaiErr.message?.includes("insufficient")) {
            // Fallback to Gemini using environment variable or safe default
            const fallbackKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";
            if (fallbackKey) {
              reply = await callGemini(fallbackKey, systemContent, messages);
              reply = `*(Note: OpenAI returned a billing quota error, so I automatically answered using Google Gemini 3.8 Flash)*\n\n` + reply;
            } else {
              throw new Error("OpenAI quota exhausted and no backup Gemini API key found in environment variables.");
            }
          } else {
            throw openaiErr;
          }
        }
      } else {
        reply = await callGemini(activeKey, systemContent, messages);
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
    return NextResponse.json({ error: err.message || "Failed to process process upload" }, { status: 500 });
  }
}
