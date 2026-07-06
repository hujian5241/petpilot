import { NextRequest, NextResponse } from "next/server";
import { runNewsPipeline } from "@/scripts/news-pipeline";

export const dynamic = "force-dynamic";

// Constant-time string comparison to mitigate timing attacks.
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization") ?? "";
  const expected = process.env.CRON_SECRET
    ? `Bearer ${process.env.CRON_SECRET}`
    : "";

  if (!expected) {
    return NextResponse.json(
      { error: "CRON_SECRET is not configured" },
      { status: 500 }
    );
  }

  if (!timingSafeEqual(authHeader, expected)) {
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
