import { readFileSync } from "fs";
import { resolve } from "path";

const KEY = "3b4a87ed7d6709654ef55f4c53f5b5f9e3ff1a6e16c89cdf4a31b590bccb47dc";
const HOST = "petpilot.top";
const SITEMAP_URL = `https://${HOST}/sitemap.xml`;

async function fetchUrls(): Promise<string[]> {
  const res = await fetch(SITEMAP_URL);
  if (!res.ok) {
    throw new Error(`Failed to fetch sitemap: ${res.status}`);
  }
  const xml = await res.text();
  const matches = xml.matchAll(/<loc>([^<]+)<\/loc>/g);
  return Array.from(matches)
    .map((m) => m[1]?.trim())
    .filter((url): url is string => typeof url === "string" && url.length > 0);
}

async function submitIndexNow(urls: string[]) {
  const endpoint = `https://www.bing.com/indexnow?url=${encodeURIComponent(
    urls[0] ?? ""
  )}&key=${KEY}`;
  // IndexNow also supports bulk submission via POST to api.indexnow.org
  const bulkEndpoint = "https://api.indexnow.org/indexnow";
  const body = JSON.stringify({
    host: HOST,
    key: KEY,
    keyLocation: `https://${HOST}/${KEY}.txt`,
    urlList: urls,
  });

  const res = await fetch(bulkEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body,
  });

  return {
    status: res.status,
    statusText: res.statusText,
    body: await res.text(),
  };
}

async function main() {
  console.log("Fetching URLs from sitemap...");
  const urls = await fetchUrls();
  console.log(`Found ${urls.length} URLs`);

  if (urls.length === 0) {
    console.log("No URLs to submit.");
    return;
  }

  // IndexNow accepts up to 10,000 URLs per request
  const result = await submitIndexNow(urls);
  console.log(`IndexNow response: ${result.status} ${result.statusText}`);
  if (result.body) {
    console.log(result.body);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
