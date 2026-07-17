"use client";

import { FormEvent, useState } from "react";

type Priority = "Low" | "Medium" | "High" | "Urgent";

interface SummaryResult {
  summary: string;
  actionItems: string[];
  priority: Priority;
}

const priorityStyles: Record<Priority, string> = {
  Low: "bg-emerald-100 text-emerald-700 ring-emerald-200",
  Medium: "bg-amber-100 text-amber-800 ring-amber-200",
  High: "bg-orange-100 text-orange-800 ring-orange-200",
  Urgent: "bg-red-100 text-red-700 ring-red-200",
};

function Spinner() {
  return <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden />;
}

function SkeletonCards() {
  return (
    <div className="space-y-4" aria-label="Processing email" aria-busy="true">
      {["h-36", "h-44", "h-28"].map((height) => (
        <div key={height} className={`${height} animate-pulse rounded-2xl border border-slate-200 bg-white p-6 shadow-sm`}>
          <div className="mb-5 h-4 w-24 rounded bg-slate-200" />
          <div className="mb-3 h-3 w-full rounded bg-slate-100" />
          <div className="h-3 w-3/4 rounded bg-slate-100" />
        </div>
      ))}
    </div>
  );
}

function ResultCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-500">{title}</h2>
      {children}
    </section>
  );
}

export default function Home() {
  const [emailContent, setEmailContent] = useState("");
  const [result, setResult] = useState<SummaryResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!emailContent.trim() || isLoading) return;

    setIsLoading(true);
    setHasError(false);

    try {
      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailContent }),
      });
      if (!response.ok) throw new Error("Request failed");
      setResult((await response.json()) as SummaryResult);
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }

  function handleClear() {
    setEmailContent("");
    setResult(null);
    setHasError(false);
  }

  return (
    <main className="min-h-screen px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-100">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" /> AI-powered inbox clarity
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">AI Email Summarizer</h1>
          <p className="mt-3 max-w-2xl text-slate-600">Turn a long email into a focused summary, clear next steps, and an instant priority signal.</p>
        </header>

        {hasError && (
          <div role="alert" className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            Không thể xử lý email. Vui lòng thử lại.
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
          <form onSubmit={handleSubmit} className="flex min-h-[430px] flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <label htmlFor="email-content" className="mb-3 text-sm font-semibold text-slate-700">Email content</label>
            <textarea
              id="email-content"
              value={emailContent}
              onChange={(event) => setEmailContent(event.target.value)}
              placeholder="Paste email here..."
              maxLength={50_000}
              className="min-h-[300px] flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
            />
            <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button type="button" onClick={handleClear} disabled={isLoading || (!emailContent && !result)} className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50">Clear</button>
              <button type="submit" disabled={isLoading || !emailContent.trim()} className="inline-flex min-w-32 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50">
                {isLoading && <Spinner />}{isLoading ? "Summarizing..." : "Summarize"}
              </button>
            </div>
          </form>

          <div aria-live="polite">
            {isLoading ? <SkeletonCards /> : result ? (
              <div className="space-y-4">
                <ResultCard title="Summary"><p className="leading-7 text-slate-700">{result.summary}</p></ResultCard>
                <ResultCard title="Action Items">
                  {result.actionItems.length ? (
                    <ul className="space-y-3">
                      {result.actionItems.map((item, index) => (
                        <li key={`${item}-${index}`} className="flex gap-3 text-slate-700">
                          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 border-indigo-200 bg-indigo-50 text-xs text-indigo-600">✓</span>
                          <span className="leading-6">{item}</span>
                        </li>
                      ))}
                    </ul>
                  ) : <p className="text-slate-500">No action items found.</p>}
                </ResultCard>
                <ResultCard title="Priority"><span className={`inline-flex rounded-full px-3 py-1 text-sm font-bold ring-1 ring-inset ${priorityStyles[result.priority]}`}>{result.priority}</span></ResultCard>
              </div>
            ) : (
              <div className="flex min-h-[430px] items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/60 p-8 text-center">
                <div><div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-xl text-indigo-600">✦</div><p className="font-medium text-slate-600">Paste an email and click Summarize.</p></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
