import { SeverityLevel } from "@/lib/report";

const severityStyles: Record<SeverityLevel, string> = {
  Low: "border-sky-300/30 bg-sky-300/10 text-sky-200",
  Medium: "border-yellow-300/30 bg-yellow-300/10 text-yellow-200",
  High: "border-orange-300/30 bg-orange-300/10 text-orange-200",
  Critical: "border-rose-300/30 bg-rose-300/10 text-rose-200"
};

export function SeverityBadge({ severity }: { severity: SeverityLevel }) {
  return (
    <span
      className={`inline-flex items-center rounded-lg border px-2.5 py-1 text-xs font-semibold ${severityStyles[severity]}`}
    >
      {severity}
    </span>
  );
}
