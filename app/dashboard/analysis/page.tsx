// Make "AnalysisPage" a "client" component.
"use client";

import { useState } from "react";
import Link from "next/link";

export default function AnalysisPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("dataset", file);
      const res = await fetch("/api/analysis", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Unknown server error");
      }
      const { summary } = await res.json();
      setResult(summary);
    } catch (err: any) {
      setError(err.message ?? "Unhandled error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">AI‑Powered Data Analysis</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <input
          type="file"
          accept=".csv"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          required
          className="border rounded p-2 w-full"
        />
        <button
          type="submit"
          disabled={loading || !file}
          className="px-4 py-2 rounded bg-brand text-white disabled:opacity-50"
        >
          {loading ? "Analyzing…" : "Send to AI"}
        </button>
      </form>
      {error && (
        <div className="mt-4 text-red-600">{error}</div>
      )}
      {result && (
        <div className="mt-8 p-4 border rounded bg-gray-50">
          <h2 className="font-semibold mb-2">Summary</h2>
          <pre className="whitespace-pre-wrap">{result}</pre>
        </div>
      )}
    </div>
  );
}
