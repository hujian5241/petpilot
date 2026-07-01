import fs from "fs/promises";
import path from "path";

const FOODS_DIR = path.join(process.cwd(), "content", "foods");

async function main() {
  const files = await fs.readdir(FOODS_DIR);
  const mdFiles = files.filter((file) => file.endsWith(".md"));

  let repaired = 0;
  for (const file of mdFiles) {
    const filePath = path.join(FOODS_DIR, file);
    let raw = await fs.readFile(filePath, "utf-8");

    const openSep = raw.indexOf("---\n");
    if (openSep !== 0) continue;

    const closeSep = raw.indexOf("---\n", openSep + 4);
    if (closeSep === -1) continue;

    if (raw[closeSep - 1] !== "\n") {
      raw = raw.slice(0, closeSep) + "\n" + raw.slice(closeSep);
      await fs.writeFile(filePath, raw, "utf-8");
      repaired++;
    }
  }

  console.log(`Repaired ${repaired} / ${mdFiles.length} food files`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
