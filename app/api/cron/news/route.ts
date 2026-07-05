import { NextRequest, NextResponse } from "next/server";
import { runNewsPipeline } from "@/scripts/news-pipeline";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const expected = process.env.CRON_SECRET ? `Bearer ${process.env.CRON_SECRET}` : undefined;

  if (expected && authHeader !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY is not configured" },
      { status: 500 }
    );
  }

  try {
    const results = await runNewsPipeline();
    const failed = results.find((r) => !r.success);

    return NextResponse.json(
      {
        success: !failed,
        results: results.map((r) => ({
          stage: r.stage,
          success: r.success,
          output: r.output.slice(-2000),
          error: r.error,
        })),
      },
      { status: failed ? 500 : 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
