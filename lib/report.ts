export const issueCategories = [
  "React Error",
  "API Error",
  "Database Error",
  "Authentication Error",
  "Runtime Error",
  "Network Failure",
  "Build/Deployment Error"
] as const;

export const severityLevels = ["Low", "Medium", "High", "Critical"] as const;

export type IssueCategory = (typeof issueCategories)[number];
export type SeverityLevel = (typeof severityLevels)[number];
export type AnalysisSource = "ai" | "mock";

export interface DebugReport {
  category: IssueCategory;
  severity: SeverityLevel;
  likelySubsystem: string;
  immediateNextStep: string;
  rootCause: string;
  suggestedFix: string;
  debuggingChecklist: string[];
  preventionTips: string[];
  confidence: number;
}

export interface AnalyzeResponse {
  report: DebugReport;
  source: AnalysisSource;
}

export function formatDebugReport(report: DebugReport) {
  return [
    "## Error Category",
    report.category,
    "",
    "## Severity Level",
    report.severity,
    "",
    "## Likely Subsystem",
    report.likelySubsystem,
    "",
    "## Immediate Next Step",
    report.immediateNextStep,
    "",
    "## Root Cause",
    report.rootCause,
    "",
    "## Suggested Fix",
    report.suggestedFix,
    "",
    "## Debugging Checklist",
    ...report.debuggingChecklist.map((item) => `- ${item}`),
    "",
    "## Prevention Tips",
    ...report.preventionTips.map((item) => `- ${item}`),
    "",
    "## Confidence Score",
    `${Math.round(report.confidence * 100)}%`
  ].join("\n");
}
