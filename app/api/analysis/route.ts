import { NextRequest, NextResponse } from 'next/server';

// The route is executed on the server side (Node.js runtime).
// It accepts a multipart/form‑data POST with a single file input called "dataset".
// The file is read in its entirety as text and sent to OpenAI.
// The function returns a concise natural‑language summary.

export const runtime = 'nodejs' as const;

async function readFileAsText(file: File): Promise<string> {
  // `File.text()` is async and part of the browser API,
  // but Next.js exposes it on the server side via the experimental API.
  return await file.text();
}

async function summarize(csv: string): Promise<string> {
  const prompt = `You are an analytical assistant. From the following CSV text analyze the data and return a concise 2‑3 sentence summary highlighting key trends and any obvious outliers.\n\n${csv}`;

  const body = {
    model: 'gpt-4o-mini',
    temperature: 0.2,
    messages: [
      { role: 'user', content: prompt },
    ],
  } as const;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'OpenAI request failed');
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

export async function POST(req: NextRequest) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch (err) {
    return NextResponse.json({ error: 'Failed to parse form data' }, { status: 400 });
  }

  const file = form.get('dataset') as File | null;
  if (!file) {
    return NextResponse.json({ error: 'No file provided under "dataset" key' }, { status: 400 });
  }

  const csvText = await readFileAsText(file);
  let summary: string;
  try {
    summary = await summarize(csvText);
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Analysis failed' }, { status: 500 });
  }

  return NextResponse.json({ summary });
}
