import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

const STAGE_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes per stage

interface PipelineResult {
  success: boolean;
  stage: string;
  output: string;
  error?: string;
}

export async function runNewsPipeline(): Promise<PipelineResult[]> {
  const results: PipelineResult[] = [];

  const stages = [
    {
      name: "fetch",
      command: "npx",
      args: ["tsx", "scripts/fetch-news.ts"],
      env: { NEWS_PUBLISH: "true" },
    },
    {
      name: "clusters",
      command: "npx",
      args: ["tsx", "scripts/generate-news-clusters.ts"],
    },
    {
      name: "sitemaps",
      command: "npx",
      args: ["tsx", "scripts/generate-sitemaps.ts"],
    },
  ];

  for (const stage of stages) {
    try {
      const { stdout, stderr } = await execFileAsync(stage.command, stage.args, {
        env: { ...process.env, ...stage.env },
        maxBuffer: 10 * 1024 * 1024,
        timeout: STAGE_TIMEOUT_MS,
      });
      results.push({
        success: true,
        stage: stage.name,
        output: stdout + (stderr ? `\n${stderr}` : ""),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const stdout = (error as { stdout?: string }).stdout ?? "";
      const stderr = (error as { stderr?: string }).stderr ?? "";
      results.push({
        success: false,
        stage: stage.name,
        output: stdout + (stderr ? `\n${stderr}` : ""),
        error: message,
      });
      break;
    }
  }

  return results;
}

async function main() {
  const results = await runNewsPipeline();

  for (const result of results) {
    console.log(`\n=== Stage: ${result.stage} (${result.success ? "OK" : "FAILED"}) ===`);
    console.log(result.output);
    if (result.error) {
      console.error("Error:", result.error);
    }
  }

  const failed = results.find((r) => !r.success);
  if (failed) {
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
