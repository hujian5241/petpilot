import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";
import yaml from "js-yaml";

const foodsDir = path.join(process.cwd(), "content", "foods");
const scriptsDir = path.join(process.cwd(), "scripts");

interface ConditionWarning {
  condition: string;
  appliesTo: ("dogs" | "cats")[];
  recommendation: "avoid" | "limit" | "consult_vet";
  reason: string;
  notes?: string;
}

async function loadWarnings(file: string): Promise<Record<string, ConditionWarning[]>> {
  try {
    const data = await fs.readFile(path.join(scriptsDir, file), "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.warn(`Could not load ${file}:`, (err as Error).message);
    return {};
  }
}

async function main() {
  const allWarnings: Record<string, ConditionWarning[]> = {
    ...(await loadWarnings("condition-warnings-A.json")),
    ...(await loadWarnings("condition-warnings-B.json")),
    ...(await loadWarnings("condition-warnings-C.json")),
    ...(await loadWarnings("condition-warnings-D.json")),
    ...(await loadWarnings("condition-warnings-E.json")),
  };

  const files = await fs.readdir(foodsDir);
  const mdFiles = files.filter((f) => f.endsWith(".md"));
  let updated = 0;
  let skipped = 0;
  let notFound = 0;

  for (const file of mdFiles) {
    const slug = file.replace(/\.md$/, "");
    const warnings = allWarnings[slug];
    if (!warnings) {
      notFound++;
      continue;
    }

    const filePath = path.join(foodsDir, file);
    const raw = await fs.readFile(filePath, "utf-8");
    const { data, content } = matter(raw);

    if (Array.isArray(data.condition_warnings) && data.condition_warnings.length > 0) {
      skipped++;
      continue;
    }

    data.condition_warnings = warnings;
    const yamlContent = yaml.dump(data, { lineWidth: -1, noRefs: true, sortKeys: false });
    const newContent = `---\n${yamlContent}---\n${content}`;
    await fs.writeFile(filePath, newContent, "utf-8");
    updated++;
  }

  console.log(
    `Added condition warnings to ${updated} food entries. Skipped ${skipped} already containing warnings. Missing warnings for ${notFound} files.`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
