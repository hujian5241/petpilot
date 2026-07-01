import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";
import yaml from "js-yaml";

const CONTENT_DIR = path.join(process.cwd(), "content");

interface Rename {
  oldSlug: string;
  newSlug: string;
  newName: string;
}

const RENAMES: Rename[] = [
  { oldSlug: "basil", newSlug: "basil-plant", newName: "Basil Plant" },
  { oldSlug: "mint", newSlug: "mint-plant", newName: "Mint Plant" },
  { oldSlug: "rosemary", newSlug: "rosemary-plant", newName: "Rosemary Plant" },
  { oldSlug: "thyme", newSlug: "thyme-plant", newName: "Thyme Plant" },
];

async function renamePlant(slug: string, newSlug: string, newName: string) {
  const oldPath = path.join(CONTENT_DIR, "plants", `${slug}.md`);
  const newPath = path.join(CONTENT_DIR, "plants", `${newSlug}.md`);

  const raw = await fs.readFile(oldPath, "utf-8");
  const { data, content } = matter(raw);

  data.id = newSlug;
  data.name = newName;
  data.slug = newSlug;

  const frontmatter = yaml.dump(data, { lineWidth: -1, noRefs: true }).trimEnd();
  await fs.writeFile(newPath, `---\n${frontmatter}\n---\n${content}`, "utf-8");
  await fs.unlink(oldPath);
}

async function updateReferences() {
  const plantsDir = path.join(CONTENT_DIR, "plants");
  const files = await fs.readdir(plantsDir);
  const mdFiles = files.filter((file) => file.endsWith(".md"));

  for (const file of mdFiles) {
    const filePath = path.join(plantsDir, file);
    const raw = await fs.readFile(filePath, "utf-8");
    const { data, content } = matter(raw);

    let changed = false;

    for (const key of ["alternatives", "related_plants", "lookalikes"]) {
      const arr = data[key];
      if (!Array.isArray(arr)) continue;
      for (const rename of RENAMES) {
        const idx = arr.indexOf(rename.oldSlug);
        if (idx !== -1) {
          arr[idx] = rename.newSlug;
          changed = true;
        }
      }
    }

    if (changed) {
      const frontmatter = yaml.dump(data, { lineWidth: -1, noRefs: true }).trimEnd();
      await fs.writeFile(filePath, `---\n${frontmatter}\n---\n${content}`, "utf-8");
    }
  }
}

async function renameImages() {
  const imagesDir = path.join(process.cwd(), "public", "images", "plants");
  for (const rename of RENAMES) {
    const oldPath = path.join(imagesDir, `${rename.oldSlug}.svg`);
    const newPath = path.join(imagesDir, `${rename.newSlug}.svg`);
    try {
      await fs.rename(oldPath, newPath);
    } catch {
      // ignore missing
    }
  }
}

async function main() {
  for (const rename of RENAMES) {
    await renamePlant(rename.oldSlug, rename.newSlug, rename.newName);
  }
  await updateReferences();
  await renameImages();
  console.log("Renamed duplicate plant slugs.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
