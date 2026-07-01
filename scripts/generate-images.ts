import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";

const CONTENT_DIR = path.join(process.cwd(), "content");
const IMAGES_DIR = path.join(process.cwd(), "public", "images");

interface Frontmatter {
  name: string;
  slug: string;
  safety?: {
    dogs?: { status: string };
    cats?: { status: string };
  };
  images?: { src: string; alt: string }[];
}

function backgroundColor(status?: string): string {
  switch (status) {
    case "toxic":
      return "#ef4444"; // red-500
    case "limited":
      return "#f59e0b"; // amber-500
    case "safe":
      return "#10b981"; // emerald-500
    default:
      return "#6b7280"; // gray-500
  }
}

function iconFor(type: "food" | "plant"): string {
  if (type === "plant") {
    return `
      <svg x="170" y="90" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 22v-8"/>
        <path d="M12 14c-3-3-7-2-7-7 4 0 6 3 7 4"/>
        <path d="M12 14c3-3 7-2 7-7-4 0-6 3-7 4"/>
      </svg>`;
  }
  return `
    <svg x="170" y="90" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 22c4.97-4.97 8-9.13 8-13.5A7.5 7.5 0 0012 1 7.5 7.5 0 004 8.5C4 12.87 7.03 17.03 12 22z"/>
      <circle cx="12" cy="9" r="2"/>
    </svg>`;
}

function generateSvg(data: Frontmatter, type: "food" | "plant"): string {
  const status = data.safety?.dogs?.status ?? "unknown";
  const bg = backgroundColor(status);
  const icon = iconFor(type);
  const title = data.name;
  const subtitle = type === "food" ? "Pet Food Guide" : "Pet Plant Guide";

  return `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
  <rect width="400" height="300" fill="${bg}"/>
  <circle cx="200" cy="120" r="80" fill="white" fill-opacity="0.12"/>
  ${icon}
  <text x="200" y="190" text-anchor="middle" font-family="ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif" font-size="28" font-weight="700" fill="white">${escapeXml(title)}</text>
  <text x="200" y="225" text-anchor="middle" font-family="ui-sans-serif, system-ui, sans-serif" font-size="16" fill="white" fill-opacity="0.9">${subtitle}</text>
  <text x="200" y="260" text-anchor="middle" font-family="ui-sans-serif, system-ui, sans-serif" font-size="14" fill="white" fill-opacity="0.75">PetPilot.com</text>
</svg>`;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

async function generateForDirectory(
  dirName: "foods" | "plants",
  outputDirName: "foods" | "plants"
) {
  const dir = path.join(CONTENT_DIR, dirName);
  const outputDir = path.join(IMAGES_DIR, outputDirName);
  await fs.mkdir(outputDir, { recursive: true });

  const files = await fs.readdir(dir);
  const mdFiles = files.filter((file) => file.endsWith(".md"));

  let created = 0;
  let skipped = 0;

  for (const file of mdFiles) {
    const slug = file.replace(/\.md$/, "");
    const filePath = path.join(dir, file);
    const raw = await fs.readFile(filePath, "utf-8");
    const { data } = matter(raw);

    const outputPath = path.join(outputDir, `${slug}.svg`);
    try {
      await fs.access(outputPath);
      skipped++;
      continue;
    } catch {
      // file does not exist, generate it
    }

    const type = dirName === "foods" ? "food" : "plant";
    const svg = generateSvg(data as Frontmatter, type);
    await fs.writeFile(outputPath, svg, "utf-8");
    created++;
  }

  console.log(`${dirName}: created ${created}, skipped ${skipped} of ${mdFiles.length}`);
}

async function main() {
  await generateForDirectory("foods", "foods");
  await generateForDirectory("plants", "plants");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
