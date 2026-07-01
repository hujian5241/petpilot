import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";
import yaml from "js-yaml";

const CONTENT_DIR = path.join(process.cwd(), "content");

interface Frontmatter {
  name: string;
  slug: string;
  safety?: {
    dogs?: { status: string };
    cats?: { status: string };
  };
  meta_title?: string;
  meta_description?: string;
  [key: string]: unknown;
}

async function updateDirectory(
  dirName: string,
  buildTitle: (data: Frontmatter) => string,
  buildDescription: (data: Frontmatter) => string
) {
  const dir = path.join(CONTENT_DIR, dirName);
  const files = await fs.readdir(dir);
  const mdFiles = files.filter((file) => file.endsWith(".md"));

  let updated = 0;
  for (const file of mdFiles) {
    const filePath = path.join(dir, file);
    const raw = await fs.readFile(filePath, "utf-8");
    const { data, content } = matter(raw);

    let changed = false;
    if (!data.meta_title) {
      data.meta_title = buildTitle(data as Frontmatter);
      changed = true;
    }
    if (!data.meta_description) {
      data.meta_description = buildDescription(data as Frontmatter);
      changed = true;
    }

    if (changed) {
      const frontmatter = yaml.dump(data, { lineWidth: -1, noRefs: true }).trimEnd();
      await fs.writeFile(filePath, `---\n${frontmatter}\n---\n${content}`, "utf-8");
      updated++;
    }
  }

  console.log(`Updated ${updated} / ${mdFiles.length} ${dirName}`);
}

function foodTitle(data: Frontmatter): string {
  return `Can Dogs Eat ${data.name}? Safety, Risks & Vet Advice`;
}

function foodDescription(data: Frontmatter): string {
  const dogStatus = data.safety?.dogs?.status ?? "unknown";
  const catStatus = data.safety?.cats?.status ?? "unknown";
  return `Is ${data.name} safe for dogs and cats? ${data.name} is ${dogStatus} for dogs and ${catStatus} for cats. Learn symptoms, what to do, and vet-approved alternatives.`;
}

function plantTitle(data: Frontmatter): string {
  return `Is ${data.name} Safe for Dogs and Cats? Toxicity Guide`;
}

function plantDescription(data: Frontmatter): string {
  return `Find out if ${data.name} is toxic to dogs and cats. Learn symptoms, what to do if your pet eats it, and safe plant alternatives from PetPilot.`;
}

async function main() {
  await updateDirectory("foods", foodTitle, foodDescription);
  await updateDirectory("plants", plantTitle, plantDescription);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
