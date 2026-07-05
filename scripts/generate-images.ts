import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";

const CONTENT_DIR = path.join(process.cwd(), "content", "en");
const IMAGES_DIR = path.join(process.cwd(), "public", "images");

type ContentType = "food" | "plant" | "medication" | "household-chemical" | "pesticide";

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

function iconFor(type: ContentType): string {
  switch (type) {
    case "plant":
      return `
      <svg x="170" y="90" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 22v-8"/>
        <path d="M12 14c-3-3-7-2-7-7 4 0 6 3 7 4"/>
        <path d="M12 14c3-3 7-2 7-7-4 0-6 3-7 4"/>
      </svg>`;
    case "medication":
      return `
      <svg x="170" y="90" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/>
        <path d="m8.5 8.5 7 7"/>
      </svg>`;
    case "household-chemical":
      return `
      <svg x="170" y="90" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M9 5v16"/>
        <path d="M9 5H6.5a2.5 2.5 0 0 0 0 5H9V5Z"/>
        <path d="M9 5h4.5a2.5 2.5 0 0 1 0 5H9V5Z"/>
        <path d="M9 14h6"/>
        <path d="M9 18h6"/>
      </svg>`;
    case "pesticide":
      return `
      <svg x="170" y="90" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 17v4"/>
        <path d="M8 21h8"/>
        <path d="m2.3 9.5 4-1.7"/>
        <path d="m21.7 9.5-4-1.7"/>
        <path d="M12 2v3"/>
        <circle cx="12" cy="12" r="5"/>
      </svg>`;
    default:
      return `
    <svg x="170" y="90" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 22c4.97-4.97 8-9.13 8-13.5A7.5 7.5 0 0 0 12 1 7.5 7.5 0 0 0 4 8.5C4 12.87 7.03 17.03 12 22z"/>
      <circle cx="12" cy="9" r="2"/>
    </svg>`;
  }
}

function titleFor(type: ContentType): string {
  switch (type) {
    case "plant":
      return "Pet Plant Guide";
    case "medication":
      return "Pet Medication Guide";
    case "household-chemical":
      return "Pet Chemical Guide";
    case "pesticide":
      return "Pet Pesticide Guide";
    default:
      return "Pet Food Guide";
  }
}

function generateSvg(data: Frontmatter, type: ContentType): string {
  const status = data.safety?.dogs?.status ?? "unknown";
  const bg = backgroundColor(status);
  const icon = iconFor(type);
  const title = data.name;
  const subtitle = titleFor(type);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
  <rect width="400" height="300" fill="${bg}"/>
  <circle cx="200" cy="120" r="80" fill="white" fill-opacity="0.12"/>
  ${icon}
  <text x="200" y="190" text-anchor="middle" font-family="ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif" font-size="28" font-weight="700" fill="white">${escapeXml(title)}</text>
  <text x="200" y="225" text-anchor="middle" font-family="ui-sans-serif, system-ui, sans-serif" font-size="16" fill="white" fill-opacity="0.9">${escapeXml(subtitle)}</text>
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

interface DirectoryMapping {
  dirName: string;
  outputDirName: string;
  type: ContentType;
}

const mappings: DirectoryMapping[] = [
  { dirName: "foods", outputDirName: "foods", type: "food" },
  { dirName: "plants", outputDirName: "plants", type: "plant" },
  { dirName: "medications", outputDirName: "medications", type: "medication" },
  { dirName: "household-chemicals", outputDirName: "household-chemicals", type: "household-chemical" },
  { dirName: "pesticides", outputDirName: "pesticides", type: "pesticide" },
];

async function generateForDirectory(mapping: DirectoryMapping) {
  const dir = path.join(CONTENT_DIR, mapping.dirName);
  const outputDir = path.join(IMAGES_DIR, mapping.outputDirName);
  await fs.mkdir(outputDir, { recursive: true });

  let files: string[] = [];
  try {
    files = await fs.readdir(dir);
  } catch {
    console.log(`${mapping.dirName}: directory not found, skipping`);
    return;
  }
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

    const svg = generateSvg(data as Frontmatter, mapping.type);
    await fs.writeFile(outputPath, svg, "utf-8");
    created++;
  }

  console.log(`${mapping.dirName}: created ${created}, skipped ${skipped} of ${mdFiles.length}`);
}

async function main() {
  for (const mapping of mappings) {
    await generateForDirectory(mapping);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
