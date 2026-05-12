import { NextResponse } from "next/server";

import { analyzeIssue } from "@/lib/analyze-issue";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const issue = typeof body.issue === "string" ? body.issue.trim() : "";

    if (issue.length < 12) {
      return NextResponse.json(
        { error: "Paste a little more context so DebugPilot can produce a useful report." },
        { status: 400 }
      );
    }

    const analysis = await analyzeIssue(issue);
    return NextResponse.json(analysis);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to analyze the issue.";

    return NextResponse.json(
      {
        error:
          process.env.NODE_ENV === "development"
            ? message
            : "DebugPilot could not complete the analysis. Please try again."
      },
      { status: 500 }
    );
  }
}
