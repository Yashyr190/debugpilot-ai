"use client";

import { AlertCircle, Eraser, Loader2, Play, Sparkles, TerminalSquare } from "lucide-react";
import { useState } from "react";

import { ReportCard } from "@/components/report-card";
import { AnalyzeResponse } from "@/lib/report";
import { samplePresets } from "@/lib/sample-error";
import type { SamplePreset } from "@/lib/sample-error";

const emptyStateTips = [
  "Include the first application-owned stack frame.",
  "Keep request ids, route names, and timestamps intact.",
  "Use a preset when you want to demo the workflow quickly."
];

export function DebugPilotApp() {
  const [issue, setIssue] = useState("");
  const [analysis, setAnalysis] = useState<AnalyzeResponse | null>(null);
  const [analysisRun, setAnalysisRun] = useState(0);
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function analyzeIssue() {
    const trimmedIssue = issue.trim();

    if (trimmedIssue.length < 12) {
      setError("Paste a stack trace, log, or error message with enough context to analyze.");
      return;
    }

    setIsLoading(true);
    setError("");
    setAnalysis(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ issue: trimmedIssue })
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "DebugPilot could not analyze this issue.");
      }

      setAnalysis(payload);
      setAnalysisRun((currentRun) => currentRun + 1);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  }

  function loadPreset(preset: SamplePreset) {
    setIssue(preset.issue);
    setActivePreset(preset.label);
    setError("");
    setAnalysis(null);
  }

  function clearInput() {
    setIssue("");
    setActivePreset(null);
    setError("");
    setAnalysis(null);
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-ink text-slate-100">
      <div className="absolute inset-0 debug-grid opacity-60" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-5 sm:px-6 lg:px-8">
        <nav className="premium-surface flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.045] px-4 py-3 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-teal-300/30 bg-teal-300/10 text-teal-200">
              <TerminalSquare className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-teal-100">
                DebugPilot AI
              </p>
              <p className="text-xs text-slate-400">Developer debugging assistant</p>
            </div>
          </div>
          <span className="hidden rounded-lg border border-white/10 bg-black/20 px-3 py-1.5 text-xs font-medium text-slate-300 sm:inline-flex">
            Next.js 14 + TypeScript
          </span>
        </nav>

        <main className="grid flex-1 items-start gap-6 py-8 lg:grid-cols-[0.92fr_1.08fr] lg:py-10">
          <section className="space-y-5">
            <div className="animate-fade-up">
              <div className="mb-4 inline-flex items-center gap-2 rounded-lg border border-teal-300/20 bg-teal-300/10 px-3 py-1 text-sm font-medium text-teal-100">
                <Sparkles className="h-4 w-4" />
                Senior-level triage in seconds
              </div>
              <h1 className="max-w-3xl text-4xl font-semibold tracking-normal text-white sm:text-5xl">
                Paste the failure. Get a practical debugging plan.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
                DebugPilot AI classifies stack traces, API failures, logs, and runtime errors into
                a clear report with root cause, severity, fix steps, and prevention notes.
              </p>
            </div>

            <div className="premium-surface rounded-lg border border-white/10 bg-white/[0.055] p-4 shadow-glow backdrop-blur-xl">
              <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <label htmlFor="issue" className="text-sm font-semibold text-slate-200">
                  Error input
                </label>
                <button
                  type="button"
                  onClick={clearInput}
                  disabled={isLoading || (!issue && !analysis)}
                  className="premium-control inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 text-sm font-medium text-slate-200 hover:border-teal-300/50 hover:bg-teal-300/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-45"
                >
                  <Eraser className="h-4 w-4" />
                  Clear input
                </button>
              </div>

              <div className="mb-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                {samplePresets.map((preset) => {
                  const isActive = activePreset === preset.label;

                  return (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => loadPreset(preset)}
                      disabled={isLoading}
                      className={`premium-control inline-flex min-h-10 items-center justify-start gap-2 rounded-lg border px-3 py-2 text-left text-xs font-medium disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-50 ${
                        isActive
                          ? "border-teal-300/50 bg-teal-300/10 text-white"
                          : "border-white/10 bg-black/20 text-slate-300 hover:border-teal-300/40 hover:bg-teal-300/10 hover:text-white"
                      }`}
                    >
                      <TerminalSquare className="h-4 w-4 flex-none text-teal-200" />
                      <span className="leading-4">{preset.label}</span>
                    </button>
                  );
                })}
              </div>

              <textarea
                id="issue"
                value={issue}
                onChange={(event) => {
                  setIssue(event.target.value);
                  setActivePreset(null);
                }}
                spellCheck={false}
                placeholder="Paste a stack trace, failed API response, deployment log, runtime error, or code-related issue..."
                className="min-h-[320px] w-full resize-y rounded-lg border border-white/10 bg-black/35 p-4 font-mono text-sm leading-6 text-slate-100 outline-none transition duration-200 placeholder:text-slate-500 hover:border-white/15 focus:border-teal-300/60 focus:ring-4 focus:ring-teal-300/10"
              />

              {error ? (
                <div className="mt-3 flex gap-2 rounded-lg border border-rose-300/25 bg-rose-300/10 p-3 text-sm text-rose-100">
                  <AlertCircle className="mt-0.5 h-4 w-4 flex-none" />
                  <span>{error}</span>
                </div>
              ) : null}

              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs leading-5 text-slate-400">
                  Uses a local heuristic report automatically when no API key is configured.
                </p>
                <button
                  type="button"
                  onClick={analyzeIssue}
                  disabled={isLoading}
                  className="premium-control inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-teal-300 px-5 text-sm font-semibold text-slate-950 hover:bg-teal-200 hover:shadow-[0_14px_40px_rgba(94,234,212,0.16)] disabled:cursor-not-allowed disabled:bg-slate-600 disabled:text-slate-300"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4 fill-slate-950" />
                  )}
                  {isLoading ? "Analyzing issue..." : "Analyze Issue"}
                </button>
              </div>
            </div>
          </section>

          <section className="lg:sticky lg:top-6">
            {isLoading ? <LoadingPanel /> : null}
            {!isLoading && analysis ? (
              <ReportCard
                key={analysisRun}
                report={analysis.report}
                source={analysis.source}
              />
            ) : null}
            {!isLoading && !analysis ? <EmptyPanel /> : null}
          </section>
        </main>
      </div>
    </div>
  );
}

function LoadingPanel() {
  return (
    <div className="premium-surface animate-fade-up rounded-lg border border-white/10 bg-white/[0.055] p-5 shadow-glow backdrop-blur-xl">
      <div className="flex items-center gap-3 border-b border-white/10 pb-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-300/10 text-teal-200">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
        <div>
          <h2 className="flex items-center text-lg font-semibold text-white">
            Analyzing issue...
            <span className="ml-1 inline-flex w-5 justify-between" aria-hidden="true">
              {[0, 1, 2].map((dot) => (
                <span
                  key={dot}
                  className="h-1 w-1 rounded-full bg-teal-200 animate-pulse"
                  style={{ animationDelay: `${dot * 140}ms` }}
                />
              ))}
            </span>
          </h2>
          <p className="text-sm text-slate-400">
            Building subsystem, severity, fix path, and prevention notes.
          </p>
        </div>
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {([
          "short",
          "short",
          "short",
          "short",
          "wide",
          "wide",
          "list",
          "list",
          "wide"
        ] as SkeletonVariant[]).map((variant, item) => (
          <SkeletonCard key={`${variant}-${item}`} index={item} variant={variant} />
        ))}
      </div>
    </div>
  );
}

type SkeletonVariant = "short" | "wide" | "list";

function SkeletonCard({ index, variant }: { index: number; variant: SkeletonVariant }) {
  const isWide = variant === "wide";
  const isList = variant === "list";

  return (
    <div
      className={`report-card-enter rounded-lg border border-white/10 bg-black/20 p-4 ${
        isWide ? "md:col-span-2" : ""
      }`}
      style={{ animationDelay: `${60 + index * 45}ms` }}
    >
      <div className="flex items-center gap-3">
        <div className="shimmer h-8 w-8 rounded-lg" />
        <div className="shimmer h-3 w-32 rounded" />
      </div>
      {isList ? (
        <div className="mt-4 space-y-3">
          <div className="shimmer h-3 w-full rounded" />
          <div className="shimmer h-3 w-11/12 rounded" />
          <div className="shimmer h-3 w-4/5 rounded" />
        </div>
      ) : (
        <div className="mt-4 space-y-2">
          <div className="shimmer h-3 w-full rounded" />
          <div className="shimmer h-3 w-2/3 rounded" />
        </div>
      )}
    </div>
  );
}

function EmptyPanel() {
  return (
    <div className="premium-surface animate-fade-up rounded-lg border border-white/10 bg-white/[0.045] p-5 backdrop-blur-xl">
      <div className="empty-state-frame rounded-lg border border-dotted border-white/15 bg-black/20 p-5">
        <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-teal-300/20 bg-teal-300/10 text-teal-200">
          <TerminalSquare className="h-5 w-5" />
        </div>
        <h2 className="text-lg font-semibold text-white">Ready for an issue</h2>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          The report will appear here as staged debugging cards after analysis.
        </p>
        <ul className="mt-5 space-y-3">
          {emptyStateTips.map((tip) => (
            <li key={tip} className="flex gap-3 text-sm leading-6 text-slate-400">
              <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-teal-300" />
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
