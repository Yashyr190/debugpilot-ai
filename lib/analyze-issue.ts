import {
  DebugReport,
  IssueCategory,
  SeverityLevel,
  issueCategories,
  severityLevels
} from "@/lib/report";

const categoryPlaybook: Record<
  IssueCategory,
  Pick<DebugReport, "rootCause" | "suggestedFix" | "debuggingChecklist" | "preventionTips">
> = {
  "React Error": {
    rootCause:
      "The component is rendering before the data shape is guaranteed. A nullable value is being used as if it already matched the UI's expected structure.",
    suggestedFix:
      "Normalize the incoming data, initialize state with a safe default, and add a rendering guard around the failing expression.",
    debuggingChecklist: [
      "Confirm the API response shape in the browser network panel.",
      "Check the initial state and props passed into the component.",
      "Add a loading or empty state before rendering lists.",
      "Reproduce with React strict mode enabled."
    ],
    preventionTips: [
      "Type API responses explicitly instead of relying on inferred shapes.",
      "Use defensive rendering for nullable server data.",
      "Add tests around loading, empty, and malformed states."
    ]
  },
  "API Error": {
    rootCause:
      "The application received an unsuccessful or unexpected API response, so the caller is handling data that does not match the happy path contract.",
    suggestedFix:
      "Inspect the request, response status, and payload. Add explicit handling for non-2xx responses before parsing or rendering data.",
    debuggingChecklist: [
      "Verify the endpoint URL, method, headers, and request body.",
      "Check the server logs for the matching request id or timestamp.",
      "Confirm whether the response is JSON before parsing it.",
      "Handle rate limits, validation errors, and empty responses."
    ],
    preventionTips: [
      "Create a small typed API client with shared error handling.",
      "Log request ids for failed API calls.",
      "Add contract tests for critical endpoints."
    ]
  },
  "Database Error": {
    rootCause:
      "A database operation failed because the connection, schema, query, or data constraint is not aligned with what the application expects.",
    suggestedFix:
      "Validate the database connection, run pending migrations, and inspect the failing query or ORM call with real parameters.",
    debuggingChecklist: [
      "Check database connectivity from the running environment.",
      "Confirm migrations have run against the target database.",
      "Inspect constraints, indexes, and nullable columns involved in the query.",
      "Review connection pool limits and timeout settings."
    ],
    preventionTips: [
      "Run migrations in CI before deployment.",
      "Use schema validation around write paths.",
      "Alert on slow queries, pool exhaustion, and migration drift."
    ]
  },
  "Authentication Error": {
    rootCause:
      "The request is missing valid identity context, or the server is rejecting the provided credentials, token, cookie, or session.",
    suggestedFix:
      "Trace the auth flow from login to the failing request and verify token freshness, scopes, cookie settings, and server-side session lookup.",
    debuggingChecklist: [
      "Confirm the request includes the expected auth header or cookie.",
      "Check token expiration, audience, issuer, and scopes.",
      "Verify secure cookie settings across local and production domains.",
      "Review middleware or route guards for redirect loops."
    ],
    preventionTips: [
      "Centralize auth checks and error responses.",
      "Add integration tests for expired and missing sessions.",
      "Keep auth configuration environment-specific and documented."
    ]
  },
  "Runtime Error": {
    rootCause:
      "The code is reaching a state it does not safely handle, usually because a value is undefined, the type is wrong, or execution order changed.",
    suggestedFix:
      "Start at the first application frame in the stack trace, verify the value assumptions there, and add a focused guard or data normalization step.",
    debuggingChecklist: [
      "Find the first stack frame that belongs to your codebase.",
      "Log or inspect the values used on that line.",
      "Reproduce with the smallest input that triggers the failure.",
      "Add a regression test once the fix is confirmed."
    ],
    preventionTips: [
      "Prefer narrow TypeScript types at module boundaries.",
      "Avoid assuming optional values are present.",
      "Keep error boundaries around user-facing runtime surfaces."
    ]
  },
  "Network Failure": {
    rootCause:
      "A network dependency is unreachable, timing out, blocked by CORS, or failing DNS/TLS before the application can receive a valid response.",
    suggestedFix:
      "Confirm the service is reachable from the same environment, then check DNS, CORS, TLS, proxy, and timeout configuration.",
    debuggingChecklist: [
      "Test the URL from the deployed environment, not only your laptop.",
      "Check DNS resolution, TLS certificate validity, and proxy settings.",
      "Review CORS headers for browser-originated calls.",
      "Add retry and timeout behavior where the workflow can tolerate it."
    ],
    preventionTips: [
      "Monitor third-party dependency health.",
      "Use clear timeout defaults and circuit breakers for external calls.",
      "Document required CORS origins and environment URLs."
    ]
  },
  "Build/Deployment Error": {
    rootCause:
      "The build or deployment environment differs from local development, or the project has a compile-time issue that was not caught earlier.",
    suggestedFix:
      "Compare local and CI environments, install with a clean dependency tree, and resolve the first compiler or deployment error before chasing follow-on failures.",
    debuggingChecklist: [
      "Re-run the build locally from a clean install.",
      "Check Node.js, package manager, and environment variable versions.",
      "Fix the first TypeScript, lint, or bundler error in the log.",
      "Confirm required secrets are available in the deployment target."
    ],
    preventionTips: [
      "Run typecheck, lint, and build in CI for every pull request.",
      "Pin runtime versions with project-level configuration.",
      "Keep deployment secrets documented and validated at startup."
    ]
  }
};

const systemPrompt = `You are DebugPilot AI, a concise senior software engineer helping debug developer issues.
Return only valid JSON with this shape:
{
  "category": "React Error | API Error | Database Error | Authentication Error | Runtime Error | Network Failure | Build/Deployment Error",
  "severity": "Low | Medium | High | Critical",
  "likelySubsystem": "short subsystem label, e.g. React Rendering Layer or Auth Middleware",
  "immediateNextStep": "one concise engineering action",
  "rootCause": "clear practical explanation",
  "suggestedFix": "specific fix",
  "debuggingChecklist": ["step", "step", "step"],
  "preventionTips": ["tip", "tip", "tip"],
  "confidence": 0.82
}
Keep rootCause and suggestedFix to one or two practical sentences.
Use 3-5 checklist items and 2-4 prevention tips.
Avoid generic chatbot phrasing, disclaimers, and markdown fences.`;

export async function analyzeIssue(issue: string) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return {
      report: buildMockReport(issue),
      source: "mock" as const
    };
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: issue.slice(0, 12000) }
      ]
    })
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "The AI provider returned an error.");
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("The AI provider returned an empty response.");
  }

  return {
    report: normalizeReport(JSON.parse(content)),
    source: "ai" as const
  };
}

function buildMockReport(issue: string): DebugReport {
  const normalizedIssue = issue.toLowerCase();
  const category = detectCategory(normalizedIssue);
  const severity = detectSeverity(normalizedIssue, category);
  const playbook = categoryPlaybook[category];

  return {
    category,
    severity,
    likelySubsystem: detectLikelySubsystem(normalizedIssue, category),
    immediateNextStep: deriveImmediateNextStep(normalizedIssue, category),
    rootCause: refineRootCause(normalizedIssue, playbook.rootCause),
    suggestedFix: refineSuggestedFix(normalizedIssue, playbook.suggestedFix),
    debuggingChecklist: playbook.debuggingChecklist,
    preventionTips: playbook.preventionTips,
    confidence: detectConfidence(normalizedIssue, category)
  };
}

function detectCategory(issue: string): IssueCategory {
  if (matches(issue, ["hydration", "react", "jsx", "useeffect", "usestate", ".map", "renderwithhooks"])) {
    return "React Error";
  }

  if (matches(issue, ["prisma", "postgres", "mysql", "mongodb", "sqlite", "sqlstate", "migration", "deadlock"])) {
    return "Database Error";
  }

  if (matches(issue, ["401", "403", "unauthorized", "forbidden", "jwt", "oauth", "csrf", "token expired", "jwtexpired", "auth"])) {
    return "Authentication Error";
  }

  if (matches(issue, ["cors", "enotfound", "econnrefused", "etimedout", "networkerror", "fetch failed", "dns"])) {
    return "Network Failure";
  }

  if (matches(issue, ["next build", "webpack", "vercel", "deployment", "failed to compile", "typescript error", "tsc"])) {
    return "Build/Deployment Error";
  }

  if (matches(issue, ["api", "http", "endpoint", "500", "502", "404", "429", "json parse", "unexpected token"])) {
    return "API Error";
  }

  return "Runtime Error";
}

function detectSeverity(issue: string, category: IssueCategory): SeverityLevel {
  if (matches(issue, ["critical", "production down", "data loss", "security", "payment failed", "token leaked"])) {
    return "Critical";
  }

  if (matches(issue, ["expired token", "jwtexpired", "token expired", "deprecated", "warning", "lint"])) {
    return category === "Authentication Error" ? "Medium" : "Low";
  }

  if (
    category === "Database Error" ||
    category === "Authentication Error" ||
    (category === "Build/Deployment Error" && issue.includes("failed")) ||
    matches(issue, ["500", "502", "503", "failed deployment", "cannot connect", "timeout"])
  ) {
    return "High";
  }

  if (matches(issue, ["warning", "deprecated", "lint"])) {
    return "Low";
  }

  return "Medium";
}

function detectLikelySubsystem(issue: string, category: IssueCategory) {
  if (category === "React Error") {
    return issue.includes("api") || issue.includes("response")
      ? "React Rendering Layer"
      : "Frontend Component Layer";
  }

  if (category === "API Error") {
    return issue.includes("validation") || issue.includes("missing")
      ? "Backend Validation Layer"
      : "Frontend API Layer";
  }

  if (category === "Authentication Error") {
    return issue.includes("middleware") ? "Auth Middleware" : "Session Validation Layer";
  }

  if (category === "Database Error") {
    return issue.includes("pool") || issue.includes("timeout")
      ? "Database Connection Layer"
      : "Data Access Layer";
  }

  if (category === "Network Failure") {
    return "Network Boundary Layer";
  }

  if (category === "Build/Deployment Error") {
    return issue.includes("vercel") || issue.includes("deployment")
      ? "Deployment Build Pipeline"
      : "TypeScript Build Layer";
  }

  return "Application Runtime Layer";
}

function deriveImmediateNextStep(issue: string, category: IssueCategory) {
  if (issue.includes("cannot read") && issue.includes("map")) {
    return "Log and normalize the list payload before rendering, then guard the `.map()` call with an empty-array fallback.";
  }

  if (issue.includes("500") && (issue.includes("api") || issue.includes("route"))) {
    return "Inspect the request/session object in the failing route and return a typed 4xx response when required fields are missing.";
  }

  if (issue.includes("jwtexpired") || issue.includes("token expired")) {
    return "Trace the refresh-token path and confirm it runs before retrying the protected account request.";
  }

  if (
    (issue.includes("database") || issue.includes("postgres") || issue.includes("prisma")) &&
    issue.includes("timeout")
  ) {
    return "Run a production-region database health check and compare it with current pool usage.";
  }

  if (category === "Build/Deployment Error") {
    return "Open the first failing TypeScript frame and guard the nullable value before passing it into the component.";
  }

  if (category === "Network Failure") {
    return "Reproduce the request from the deployed environment and verify DNS, TLS, and timeout behavior there.";
  }

  const fallbackSteps: Record<IssueCategory, string> = {
    "React Error": "Inspect the first component frame and verify every rendered value matches the expected data shape.",
    "API Error": "Log the request id, status code, and raw response body at the failing API boundary.",
    "Database Error": "Check database reachability and pool metrics from the same runtime that produced the error.",
    "Authentication Error": "Verify the token/session state immediately before the protected route handler runs.",
    "Runtime Error": "Reproduce the failure locally and inspect the first application-owned stack frame before changing code.",
    "Network Failure": "Reproduce the request from the deployed environment and verify DNS, TLS, and timeout behavior there.",
    "Build/Deployment Error": "Open the first failing compiler frame and fix that type or build error before chasing later output."
  };

  return fallbackSteps[category];
}

function detectConfidence(issue: string, category: IssueCategory) {
  const categorySignals: Record<IssueCategory, string[]> = {
    "React Error": ["react", "render", "component", ".map", "hydration"],
    "API Error": ["api", "endpoint", "http", "status", "json"],
    "Database Error": ["database", "prisma", "sql", "migration", "connection"],
    "Authentication Error": ["auth", "jwt", "session", "unauthorized", "forbidden"],
    "Runtime Error": ["typeerror", "referenceerror", "undefined", "null", "stack"],
    "Network Failure": ["network", "cors", "timeout", "dns", "econnrefused"],
    "Build/Deployment Error": ["build", "deploy", "compile", "webpack", "vercel"]
  };

  const hits = categorySignals[category].filter((signal) => issue.includes(signal)).length;
  return Math.min(0.94, 0.66 + hits * 0.07);
}

function refineRootCause(issue: string, fallback: string) {
  if (issue.includes("cannot read") && issue.includes("map")) {
    return "A value expected to be an array is undefined or null before `.map()` runs, so React crashes during render instead of showing an empty or loading state.";
  }

  if (issue.includes("500") && (issue.includes("api") || issue.includes("route"))) {
    return "The API route is throwing inside the server handler before it can return a controlled error response. The stack points to a missing value in the checkout/session path.";
  }

  if (issue.includes("jwtexpired") || issue.includes("token expired") || issue.includes("expired token")) {
    return "The request reaches a protected endpoint with an expired token, so the auth guard rejects it before account data is loaded.";
  }

  if (
    (issue.includes("database") || issue.includes("postgres") || issue.includes("prisma")) &&
    issue.includes("timeout")
  ) {
    return "The app cannot get a database connection quickly enough, which points to an unreachable database host, pool exhaustion, or a production networking mismatch.";
  }

  if (issue.includes("next build") || issue.includes("type error")) {
    return "The production build is failing TypeScript validation because a nullable organization value is passed into a prop that requires a string.";
  }

  if (issue.includes("unexpected token") && issue.includes("json")) {
    return "The client is parsing the response as JSON, but the server likely returned HTML, an empty body, or a non-JSON error payload.";
  }

  if (issue.includes("econnrefused")) {
    return "The application is trying to reach a service that is not accepting connections from the current environment.";
  }

  if (issue.includes("401") || issue.includes("unauthorized")) {
    return "The failing request does not include valid authentication context, or the token/session is expired before the protected route runs.";
  }

  return fallback;
}

function refineSuggestedFix(issue: string, fallback: string) {
  if (issue.includes("cannot read") && issue.includes("map")) {
    return "Initialize the list as an empty array, normalize the API payload with `items ?? []`, and render a loading or empty state while data is unavailable.";
  }

  if (issue.includes("500") && (issue.includes("api") || issue.includes("route"))) {
    return "Validate the required request/session fields before calling the billing service, then return a typed 4xx error for missing customer data instead of letting the route throw.";
  }

  if (issue.includes("jwtexpired") || issue.includes("token expired") || issue.includes("expired token")) {
    return "Refresh the token before retrying protected requests, and make the route return a clear 401 state that the client can use to re-authenticate cleanly.";
  }

  if (
    (issue.includes("database") || issue.includes("postgres") || issue.includes("prisma")) &&
    issue.includes("timeout")
  ) {
    return "Verify the production database URL, network access, and pool size. Add a shorter health check path so connection failures surface before rendering the dashboard.";
  }

  if (issue.includes("next build") || issue.includes("type error")) {
    return "Guard `org.slug` before rendering `SettingsForm`, or make the form handle a missing organization state explicitly before the build can typecheck.";
  }

  if (issue.includes("unexpected token") && issue.includes("json")) {
    return "Check `response.ok` and the `Content-Type` header before calling `response.json()`, then surface the server error body separately.";
  }

  if (issue.includes("econnrefused")) {
    return "Verify the target service is running, confirm the host and port for this environment, and avoid using localhost for services that live outside the same container.";
  }

  return fallback;
}

function normalizeReport(input: Partial<DebugReport>): DebugReport {
  const category = issueCategories.includes(input.category as IssueCategory)
    ? (input.category as IssueCategory)
    : "Runtime Error";
  const severity = severityLevels.includes(input.severity as SeverityLevel)
    ? (input.severity as SeverityLevel)
    : "Medium";
  const playbook = categoryPlaybook[category];

  return {
    category,
    severity,
    likelySubsystem: cleanText(input.likelySubsystem) || detectLikelySubsystem("", category),
    immediateNextStep:
      cleanText(input.immediateNextStep) || deriveImmediateNextStep("", category),
    rootCause: cleanText(input.rootCause) || playbook.rootCause,
    suggestedFix: cleanText(input.suggestedFix) || playbook.suggestedFix,
    debuggingChecklist: normalizeList(input.debuggingChecklist, playbook.debuggingChecklist),
    preventionTips: normalizeList(input.preventionTips, playbook.preventionTips),
    confidence:
      typeof input.confidence === "number" && Number.isFinite(input.confidence)
        ? Math.min(1, Math.max(0, input.confidence))
        : 0.78
  };
}

function normalizeList(value: unknown, fallback: string[]) {
  if (!Array.isArray(value)) {
    return fallback;
  }

  const cleaned = value.map((item) => cleanText(String(item))).filter(Boolean).slice(0, 5);
  return cleaned.length > 0 ? cleaned : fallback;
}

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function matches(text: string, signals: string[]) {
  return signals.some((signal) => text.includes(signal));
}
