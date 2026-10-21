import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";

const MAX_BODY_BYTES = 5 * 1024 * 1024;
const runtime = "nodejs";
const MAX_DATA_CHARS = 60_000;
const REQUEST_TIMEOUT_MS = 25_000;

const NVIDIA_API_URL = "https://integrate.api.nvidia.com/v1/chat/completions";
const NVIDIA_DEFAULT_MODEL = "nvidia/nemotron-3-ultra-550b-a55b";

type ChatMessage = { role: "user" | "assistant"; content: string };
type RequestBody = {
  messages?: ChatMessage[];
  fileData?: string | null;
  fileName?: string | null;
  crmContext?: unknown;
};

async function postJson(url: string, headers: Record<string, string>, body: unknown) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      signal: controller.signal,
      cache: "no-store",
    });
  } finally {
    clearTimeout(timeout);
  }
}

function parseExcelBase64(fileData: string) {
  const base64 = fileData.startsWith("base64:") ? fileData.slice(7) : fileData;
  const bytes = Buffer.from(base64, "base64");
  if (bytes.length === 0) throw new Error("The uploaded Excel file is empty or invalid.");
  const workbook = XLSX.read(bytes, { type: "buffer", cellDates: true });
  return workbook.SheetNames.map((name) =>
    `Sheet: ${name}\n${XLSX.utils.sheet_to_csv(workbook.Sheets[name])}`
  ).join("\n\n");
}

async function getReply(body: RequestBody) {
  const messages = Array.isArray(body.messages) ? body.messages : [];
  const safeMessages = messages
    .filter((message) => message && (message.role === "user" || message.role === "assistant") && typeof message.content === "string")
    .slice(-20);
  const latest = safeMessages.at(-1);
  if (!latest || latest.role !== "user" || !latest.content.trim()) {
    return NextResponse.json({ error: "A non-empty user message is required." }, { status: 400 });
  }

  // Never trust or accept API keys from a browser request. Use a server-side secret.
  // Prefer NVIDIA NIM when configured, then Gemini, then OpenAI.
  const nvidiaKey = process.env.NVIDIA_API_KEY || "";
  const nvidiaModel = process.env.NVIDIA_MODEL || NVIDIA_DEFAULT_MODEL;
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";
  const openaiKey = process.env.OPENAI_API_KEY || "";
  let apiKey = "";
  let provider: "nvidia" | "gemini" | "openai" = "nvidia";

  if (nvidiaKey) {
    apiKey = nvidiaKey;
    provider = "nvidia";
  } else if (geminiKey) {
    apiKey = geminiKey;
    provider = "gemini";
  } else if (openaiKey) {
    apiKey = openaiKey;
    provider = "openai";
  }

  if (!apiKey) {
    return NextResponse.json({ error: "AI is not configured. Add NVIDIA_API_KEY, GEMINI_API_KEY, or OPENAI_API_KEY to the server environment." }, { status: 503 });
  }

  let dataset = "";
  if (typeof body.fileData === "string" && body.fileData) {
    try {
      dataset = body.fileName && /\.xlsx$/i.test(body.fileName)
        ? parseExcelBase64(body.fileData)
        : body.fileData;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not parse uploaded file.";
      return NextResponse.json({ error: message }, { status: 400 });
    }
    dataset = dataset.slice(0, MAX_DATA_CHARS);
  }

  const systemInstruction = [
    "You are a helpful, natural conversational AI assistant for Bin Rabie Holding Group. Have an open-ended conversation, answer greetings and ordinary messages normally, follow the user's intent, and do not return a canned dashboard summary unless requested. Respond in the language of the user's latest message. Be truthful and never invent facts.",
    body.crmContext ? `CRM context (use only when relevant; do not treat it as authoritative beyond its contents):\n${JSON.stringify(body.crmContext).slice(0, 20_000)}` : "",
    dataset ? `Uploaded data (${body.fileName || "file"}; content may be truncated):\n${dataset}\nAnswer questions about this data from its actual contents. If the requested field/value is missing or ambiguous, say so rather than guessing.` : "",
  ].filter(Boolean).join("\n\n");

  try {
    if (provider === "nvidia") {
      const response = await postJson(NVIDIA_API_URL, {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      }, {
        model: nvidiaModel,
        temperature: 0.7,
        messages: [
          { role: "system", content: systemInstruction },
          ...safeMessages.map(({ role, content }) => ({ role, content })),
        ],
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error?.message || `NVIDIA request failed (${response.status})`);
      const reply = data.choices?.[0]?.message?.content;
      if (typeof reply !== "string" || !reply.trim()) throw new Error("NVIDIA returned an empty response.");
      return NextResponse.json({ reply });
    }

    if (provider === "openai") {
      const response = await postJson("https://api.openai.com/v1/chat/completions", {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      }, {
        model: "gpt-4o-mini",
        temperature: 0.7,
        messages: [
          { role: "system", content: systemInstruction },
          ...safeMessages.map(({ role, content }) => ({ role, content })),
        ],
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error?.message || `OpenAI request failed (${response.status})`);
      const reply = data.choices?.[0]?.message?.content;
      if (typeof reply !== "string" || !reply.trim()) throw new Error("OpenAI returned an empty response.");
      return NextResponse.json({ reply });
    }

    const response = await postJson(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
      { "Content-Type": "application/json" },
      {
        systemInstruction: { parts: [{ text: systemInstruction }] },
        contents: safeMessages.map(({ role, content }) => ({
          role: role === "assistant" ? "model" : "user",
          parts: [{ text: content }],
        })),
        generationConfig: { temperature: 0.7 },
      },
    );
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error?.message || `Gemini request failed (${response.status})`);
    const parts = data.candidates?.[0]?.content?.parts as Array<{ text?: string }> | undefined;
    const reply = parts?.map((part) => part.text || "").join("").trim();
    if (!reply) throw new Error(data.promptFeedback?.blockReason || "Gemini returned an empty response.");
    return NextResponse.json({ reply });
  } catch (error) {
    const message = error instanceof Error && error.name === "AbortError"
      ? "AI request timed out. Please try again."
      : error instanceof Error ? error.message : "AI request failed.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

export async function POST(req: NextRequest) {
  const contentLength = Number(req.headers.get("content-length") || 0);
  if (contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Request too large. Please upload a file smaller than 5 MB." }, { status: 413 });
  }

  if ((req.headers.get("content-type") || "").includes("application/json")) {
    try {
      return await getReply(await req.json() as RequestBody);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Invalid request.";
      return NextResponse.json({ error: message }, { status: 400 });
    }
  }

  try {
    const form = await req.formData();
    const file = form.get("dataset");
    if (!(file instanceof File)) return NextResponse.json({ error: 'No file provided under "dataset".' }, { status: 400 });
    if (file.size > MAX_BODY_BYTES) return NextResponse.json({ error: "File exceeds the 5 MB upload limit." }, { status: 413 });
    const content = /\.xlsx$/i.test(file.name)
      ? `base64:${Buffer.from(await file.arrayBuffer()).toString("base64")}`
      : await file.text();
    return NextResponse.json({ fileName: file.name, fileSize: file.size, rawContent: content, summary: `File (${file.name}) loaded successfully.` });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to process upload.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
