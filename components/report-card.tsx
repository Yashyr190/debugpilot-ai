"use client";

import {
  AlertTriangle,
  BrainCircuit,
  CheckCircle2,
  ClipboardList,
  Gauge,
  ShieldCheck,
  Sparkles,
  Wrench
} from "lucide-react";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";

import { CopyButton } from "@/components/copy-button";
import { SeverityBadge } from "@/components/severity-badge";
import { formatDebugReport } from "@/lib/report";
import type { DebugReport } from "@/lib/report";

interface ReportCardProps {
  report: DebugReport;
  source: "ai" | "mock";
}

export function ReportCard({ report, source }: ReportCardProps) {
  const confidencePercent = Math.round(report.confidence * 100);
  const checklistText = report.debuggingChecklist.map((item) => `- ${item}`).join("\n");
  const preventionText = report.preventionTips.map((item) => `- ${item}`).join("\n");

  return (
    <section className="premium-surface animate-fade-up rounded-lg border border-white/10 bg-white/[0.05] p-5 shadow-glow backdrop-blur-xl">
      <div className="flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-lg border border-teal-300/25 bg-teal-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-teal-100">
              <BrainCircuit className="h-4 w-4" />
              {source === "ai" ? "AI analysis" : "Local analysis"}
            </span>
            <span className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-black/20 px-3 py-1 text-xs text-slate-300">
              <Sparkles className="h-3.5 w-3.5 text-teal-200" />
              Structured triage
            </span>
          </div>
          <h2 className="text-2xl font-semibold text-white">Debugging report</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
            Practical next steps from the first useful read of the failure.
          </p>
        </div>
        <CopyButton text={formatDebugReport(report)} label="Copy report" />
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <DebugReportCard
          index={0}
          icon={<AlertTriangle className="h-5 w-5" />}
          title="Error Category"
        >
          <p className="text-lg font-semibold text-white">{report.category}</p>
        </DebugReportCard>

        <DebugReportCard
          index={1}
          icon={<BrainCircuit className="h-5 w-5" />}
          title="Likely Subsystem"
        >
          <p className="text-lg font-semibold text-white">{report.likelySubsystem}</p>
        </DebugReportCard>

        <DebugReportCard index={2} icon={<Gauge className="h-5 w-5" />} title="Severity Level">
          <SeverityBadge severity={report.severity} />
        </DebugReportCard>

        <DebugReportCard
          index={3}
          icon={<ClipboardList className="h-5 w-5" />}
          title="Immediate Next Step"
          copyText={report.immediateNextStep}
        >
          <p>
            <InlineCodeText text={report.immediateNextStep} />
          </p>
        </DebugReportCard>

        <DebugReportCard
          index={4}
          icon={<BrainCircuit className="h-5 w-5" />}
          title="Root Cause"
          copyText={report.rootCause}
          className="md:col-span-2"
        >
          <p>
            <InlineCodeText text={report.rootCause} />
          </p>
        </DebugReportCard>

        <DebugReportCard
          index={5}
          icon={<Wrench className="h-5 w-5" />}
          title="Suggested Fix"
          copyText={report.suggestedFix}
          className="md:col-span-2"
        >
          <p>
            <InlineCodeText text={report.suggestedFix} />
          </p>
        </DebugReportCard>

        <DebugReportCard
          index={6}
          icon={<ClipboardList className="h-5 w-5" />}
          title="Debugging Checklist"
          copyText={checklistText}
        >
          <ActionList items={report.debuggingChecklist} />
        </DebugReportCard>

        <DebugReportCard
          index={7}
          icon={<ShieldCheck className="h-5 w-5" />}
          title="Prevention Tips"
          copyText={preventionText}
        >
          <ActionList items={report.preventionTips} />
        </DebugReportCard>

        <DebugReportCard
          index={8}
          icon={<Gauge className="h-5 w-5" />}
          title="Confidence Score"
          className="md:col-span-2"
        >
          <div className="flex items-center justify-between gap-4">
            <AnimatedConfidenceValue value={confidencePercent} />
            <span className="rounded-lg border border-white/10 bg-black/20 px-2.5 py-1 text-xs text-slate-300">
              {confidencePercent >= 85 ? "Strong signal" : "Needs verification"}
            </span>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="confidence-fill h-full rounded-full bg-gradient-to-r from-teal-300 via-sky-300 to-yellow-200"
              style={{ width: `${confidencePercent}%` }}
            />
          </div>
        </DebugReportCard>
      </div>
    </section>
  );
}

function DebugReportCard({
  index,
  icon,
  title,
  children,
  copyText,
  className = ""
}: {
  index: number;
  icon: ReactNode;
  title: string;
  children: ReactNode;
  copyText?: string;
  className?: string;
}) {
  return (
    <article
      className={`report-card-enter premium-surface rounded-lg border border-white/10 bg-black/25 p-4 backdrop-blur-xl transition duration-200 hover:-translate-y-0.5 hover:border-teal-300/35 hover:bg-white/[0.07] hover:shadow-[0_24px_70px_rgba(45,212,191,0.12)] ${className}`}
      style={{ animationDelay: `${80 + index * 70}ms` }}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2 text-sm font-semibold text-slate-200">
          <span className="flex h-8 w-8 flex-none items-center justify-center rounded-lg border border-teal-300/20 bg-teal-300/10 text-teal-200">
            {icon}
          </span>
          <span className="leading-5">{title}</span>
        </div>
        {copyText ? <CopyButton text={copyText} label="Copy" /> : null}
      </div>
      <div className="text-sm leading-6 text-slate-300">{children}</div>
    </article>
  );
}

function AnimatedConfidenceValue({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let frame = 0;
    const duration = 760;
    const startTime = performance.now();

    function tick(now: number) {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(value * eased));

      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    }

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return (
    <p className="confidence-value text-2xl font-semibold tabular-nums text-white">
      {displayValue}%
    </p>
  );
}

function ActionList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item} className="flex gap-3 text-sm leading-6 text-slate-300">
          <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none text-teal-300" />
          <span>
            <InlineCodeText text={item} />
          </span>
        </li>
      ))}
    </ul>
  );
}

function InlineCodeText({ text }: { text: string }) {
  const parts = text.split(/(`[^`]+`)/g);

  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith("`") && part.endsWith("`")) {
          return (
            <code
              key={`${part}-${index}`}
              className="rounded border border-white/10 bg-white/[0.07] px-1.5 py-0.5 font-mono text-[0.85em] text-teal-100"
            >
              {part.slice(1, -1)}
            </code>
          );
        }

        return part;
      })}
    </>
  );
}
