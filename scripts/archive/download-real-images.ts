import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";
import yaml from "js-yaml";

const FOODS_DIR = path.join(process.cwd(), "content", "foods");
const PLANTS_DIR = path.join(process.cwd(), "content", "plants");
const PUBLIC_FOODS = path.join(process.cwd(), "public", "images", "foods");
const PUBLIC_PLANTS = path.join(process.cwd(), "public", "images", "plants");

const USER_AGENT = "PetPilot/1.0 (educational pet safety site; image batch download)";
const FETCH_TIMEOUT_MS = 30_000;

interface WikimediaSearchResult {
  query?: {
    search?: Array<{
      title: string;
    }>;
  };
}

interface WikimediaImageInfo {
  query?: {
    pages?: Record<
      string,
      {
        imageinfo?: Array<{
          url?: string;
          thumburl?: string;
          mime?: string;
        }>;
      }
    >;
  };
}

async function fetchWithTimeout(url: string, timeoutMs = FETCH_TIMEOUT_MS): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      headers: { "User-Agent": USER_AGENT },
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function withRetry<T>(fn: () => Promise<T | undefined>, retries = 2): Promise<T | undefined> {
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === retries) return undefined;
      const delay = 1000 * (i + 1);
      console.warn(`Retry in ${delay}ms due to ${err instanceof Error ? err.message : err}`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

async function searchCommons(query: string): Promise<string | undefined> {
  const url = new URL("https://commons.wikimedia.org/w/api.php");
  url.searchParams.set("action", "query");
  url.searchParams.set("list", "search");
  url.searchParams.set("srsearch", query);
  url.searchParams.set("srnamespace", "6");
  url.searchParams.set("srlimit", "1");
  url.searchParams.set("format", "json");
  url.searchParams.set("origin", "*");

  const res = await withRetry(() => fetchWithTimeout(url.toString()));
  if (!res || !res.ok) return undefined;

  const data = (await res.json()) as WikimediaSearchResult;
  const result = data.query?.search?.[0];
  return result?.title;
}

async function getImageUrl(fileTitle: string): Promise<string | undefined> {
  const url = new URL("https://commons.wikimedia.org/w/api.php");
  url.searchParams.set("action", "query");
  url.searchParams.set("titles", fileTitle);
  url.searchParams.set("prop", "imageinfo");
  url.searchParams.set("iiprop", "url|mime|size");
  url.searchParams.set("iiurlwidth", "800");
  url.searchParams.set("format", "json");
  url.searchParams.set("origin", "*");

  const res = await withRetry(() => fetchWithTimeout(url.toString()));
  if (!res || !res.ok) return undefined;

  const data = (await res.json()) as WikimediaImageInfo;
  const pages = data.query?.pages;
  if (!pages) return undefined;

  const page = Object.values(pages)[0];
  const info = page.imageinfo?.[0];
  if (!info) return undefined;

  return info.thumburl ?? info.url;
}

async function downloadImage(url: string, dest: string): Promise<boolean> {
  const res = await withRetry(() => fetchWithTimeout(url));
  if (!res || !res.ok) return false;

  const buffer = Buffer.from(await res.arrayBuffer());
  if (buffer.length < 100) return false;

  await fs.writeFile(dest, buffer);
  return true;
}

async function* readSlugs(dir: string): AsyncGenerator<{ slug: string; filePath: string; data: Record<string, unknown>; content: string }> {
  const files = await fs.readdir(dir);
  const mdFiles = files.filter((file) => file.endsWith(".md"));

  for (const file of mdFiles) {
    const slug = file.replace(/\.md$/, "");
    const filePath = path.join(dir, file);
    const raw = await fs.readFile(filePath, "utf-8");
    const { data, content } = matter(raw);
    yield { slug, filePath, data: data as Record<string, unknown>, content };
  }
}

async function processBatch(items: Array<{ slug: string; filePath: string; data: Record<string, unknown>; content: string }>, type: "food" | "plant") {
  const outDir = type === "food" ? PUBLIC_FOODS : PUBLIC_PLANTS;
  const basePath = `/images/${type}s`;
  const querySuffix = type === "food" ? "food" : "plant";

  await fs.mkdir(outDir, { recursive: true });

  const results = { downloaded: 0, skipped: 0, failed: 0 };

  // Concurrency pool of 3 to avoid timeouts
  const pool: Promise<void>[] = [];

  for (const item of items) {
    const task = (async () => {
      const existingImages = Array.isArray(item.data.images) ? item.data.images : [];
      if (existingImages.length > 0 && existingImages[0].src && !existingImages[0].src.endsWith(".svg")) {
        results.skipped++;
        return;
      }

      const query = `${item.slug.replace(/-/g, " ")} ${querySuffix}`;
      const fileTitle = await searchCommons(query);
      if (!fileTitle) {
        results.failed++;
        return;
      }

      const imageUrl = await getImageUrl(fileTitle);
      if (!imageUrl) {
        results.failed++;
        return;
      }

      const ext = path.extname(new URL(imageUrl).pathname) || ".jpg";
      const filename = `${item.slug}${ext}`;
      const dest = path.join(outDir, filename);
      const ok = await downloadImage(imageUrl, dest);

      if (!ok) {
        results.failed++;
        return;
      }

      item.data.images = [
        {
          src: `${basePath}/${filename}`,
          alt: item.data.name as string,
        },
      ];

      const frontmatter = yaml.dump(item.data, { lineWidth: -1, noRefs: true }).trimEnd();
      await fs.writeFile(item.filePath, `---\n${frontmatter}\n---\n${item.content}`, "utf-8");
      results.downloaded++;
      console.log(`[${type}] ${item.slug} -> ${filename}`);
    })();

    pool.push(task);
    if (pool.length >= 3) {
      await Promise.all(pool);
      pool.length = 0;
    }
  }

  if (pool.length > 0) {
    await Promise.all(pool);
  }

  return results;
}

async function main() {
  const foodItems: Array<{ slug: string; filePath: string; data: Record<string, unknown>; content: string }> = [];
  for await (const item of readSlugs(FOODS_DIR)) foodItems.push(item);

  const plantItems: Array<{ slug: string; filePath: string; data: Record<string, unknown>; content: string }> = [];
  for await (const item of readSlugs(PLANTS_DIR)) plantItems.push(item);

  console.log(`Found ${foodItems.length} foods, ${plantItems.length} plants`);

  const foodResults = await processBatch(foodItems, "food");
  const plantResults = await processBatch(plantItems, "plant");

  console.log("\nFoods:", foodResults);
  console.log("Plants:", plantResults);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
