import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";
import yaml from "js-yaml";

const FOODS_DIR = path.join(process.cwd(), "content", "foods");

const REMOVED_CATEGORIES = new Set(["toxic-foods", "safe-treats"]);

const ALIAS_OVERRIDES: Record<string, string[]> = {
  avocado: ["aguacate"],
  garlic: ["garlic clove"],
  "macadamia-nuts": ["macadamia"],
  cherries: ["cherry"],
  rhubarb: ["pie plant"],
  nutmeg: ["ground nutmeg"],
  "wild-mushrooms": ["mushrooms", "toadstools"],
  "green-tomatoes": ["unripe tomatoes"],
  watermelon: ["melon"],
  broccoli: ["broccoli florets"],
  peas: ["green peas"],
  spinach: ["leafy greens"],
  cheese: ["cheddar", "mozzarella"],
  milk: ["dairy milk"],
  bread: ["loaf bread"],
  popcorn: ["popped corn"],
  bacon: ["pork bacon"],
  ham: ["ham meat"],
  shrimp: ["prawns"],
  tuna: ["tuna fish"],
  coconut: ["coconut flesh"],
  honey: ["raw honey"],
  almonds: ["raw almonds"],
  cashews: ["raw cashews"],
};

const ALTERNATIVE_FALLBACKS: Record<string, string[]> = {
  water: ["cucumber", "white-rice"],
  carob: ["carrots", "peanut-butter"],
  "cooked-bread": ["white-rice", "oatmeal"],
  "cooked-rice": ["white-rice", "oatmeal"],
  "cooked-button-mushrooms": ["carrots", "green-beans"],
  cinnamon: ["carrots", "cucumber"],
  ginger: ["carrots", "cucumber"],
};

function deriveAliases(name: string, slug: string): string[] {
  const lower = name.toLowerCase();
  const aliases = new Set<string>();
  if (!lower.endsWith("s")) {
    aliases.add(`${lower}s`);
  } else {
    aliases.add(lower.slice(0, -1));
  }
  if (slug !== lower) {
    aliases.add(slug.replace(/-/g, " "));
  }
  return Array.from(aliases);
}

async function main() {
  const files = (await fs.readdir(FOODS_DIR)).filter((f) => f.endsWith(".md"));
  const validSlugs = new Set(files.map((f) => f.replace(/\.md$/, "")));

  for (const file of files) {
    const slug = file.replace(/\.md$/, "");
    const filePath = path.join(FOODS_DIR, file);
    const raw = await fs.readFile(filePath, "utf-8");
    const { data, content } = matter(raw);

    // Fix categories
    const categories = Array.isArray(data.categories)
      ? data.categories.filter((c: string) => !REMOVED_CATEGORIES.has(c))
      : [];
    if (categories.length === 0) {
      categories.push("human-foods");
    }
    data.categories = categories;

    // Fix aliases
    let aliases: string[] = Array.isArray(data.aliases) ? data.aliases : [];
    if (aliases.length === 0) {
      aliases = ALIAS_OVERRIDES[slug] ?? deriveAliases(data.name, slug);
    }
    data.aliases = aliases.filter((a: string) => typeof a === "string" && a.trim().length > 0);

    // Fix tags
    let tags: string[] = Array.isArray(data.tags) ? data.tags : [];
    if (tags.length === 0) {
      const status = data.safety?.dogs?.status as string | undefined;
      if (status === "toxic") tags = ["toxic"];
      else if (status === "safe") tags = ["safe-treat"];
      else if (status === "limited") tags = ["limited-treat"];
      else tags = ["pet-food"];
    }
    data.tags = tags.filter((t: string) => typeof t === "string" && t.trim().length > 0);

    // Fix alternatives
    let alternatives: string[] = Array.isArray(data.alternatives) ? data.alternatives : [];
    alternatives = alternatives.flatMap((alt: string) => {
      if (validSlugs.has(alt)) return [alt];
      const fallback = ALTERNATIVE_FALLBACKS[alt];
      if (fallback) return fallback.filter((s) => validSlugs.has(s) && s !== slug);
      return [];
    });
    // Deduplicate and remove self-reference
    alternatives = Array.from(new Set(alternatives)).filter((a) => a !== slug);
    if (alternatives.length === 0) {
      alternatives = ["carrots"];
    }
    data.alternatives = alternatives;

    const frontmatterYaml = yaml.dump(data, {
      lineWidth: -1,
      noRefs: true,
      sortKeys: false,
    });

    const newContent = `---\n${frontmatterYaml}---\n${content}`;
    await fs.writeFile(filePath, newContent, "utf-8");
  }

  console.log(`Patched ${files.length} food entries.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
