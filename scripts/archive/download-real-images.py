#!/usr/bin/env python3
"""Download real food and plant images from Wikimedia Commons.

This script reads every markdown file in content/foods and content/plants,
searches Wikimedia Commons for a matching image, downloads the 800px thumbnail,
and updates the frontmatter `images:` field. Items that already have a non-SVG
image are skipped.
"""

import argparse
import json
import os
import time
import urllib.error
import urllib.request
from pathlib import Path
from urllib.parse import quote, urlparse

import yaml

ROOT = Path(__file__).resolve().parent.parent
CONTENT_FOODS = ROOT / "content" / "foods"
CONTENT_PLANTS = ROOT / "content" / "plants"
PUBLIC_FOODS = ROOT / "public" / "images" / "foods"
PUBLIC_PLANTS = ROOT / "public" / "images" / "plants"

USER_AGENT = "PetPilot/1.0 (educational pet safety site; image batch download)"
API_BASE = "https://commons.wikimedia.org/w/api.php"


def wikimedia_request(params: dict) -> dict:
    query = "&".join(f"{k}={quote(str(v))}" for k, v in params.items())
    url = f"{API_BASE}?{query}"
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": USER_AGENT,
            "Accept": "application/json",
        },
    )
    with urllib.request.urlopen(req, timeout=30) as response:
        return json.loads(response.read().decode("utf-8"))


def search_commons(query: str) -> str | None:
    data = wikimedia_request(
        {
            "action": "query",
            "list": "search",
            "srsearch": query,
            "srnamespace": 6,
            "srlimit": 1,
            "format": "json",
            "origin": "*",
        }
    )
    results = data.get("query", {}).get("search", [])
    return results[0]["title"] if results else None


def get_image_url(file_title: str) -> str | None:
    data = wikimedia_request(
        {
            "action": "query",
            "titles": file_title,
            "prop": "imageinfo",
            "iiprop": "url|mime|size",
            "iiurlwidth": 800,
            "format": "json",
            "origin": "*",
        }
    )
    pages = data.get("query", {}).get("pages", {})
    for page in pages.values():
        info = page.get("imageinfo", [])
        if info:
            return info[0].get("thumburl") or info[0].get("url")
    return None


def download_image(url: str, dest: Path) -> bool:
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": USER_AGENT,
            "Accept": "image/*,*/*",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=60) as response:
            data = response.read()
            if len(data) < 100:
                return False
            dest.write_bytes(data)
            return True
    except urllib.error.HTTPError as e:
        print(f"  HTTP error {e.code} for {url}")
        return False
    except Exception as e:
        print(f"  Download error: {e}")
        return False


def parse_frontmatter(text: str) -> tuple[dict, str]:
    if not text.startswith("---"):
        return {}, text
    parts = text.split("---", 2)
    if len(parts) < 3:
        return {}, text
    fm = yaml.safe_load(parts[1]) or {}
    return fm, parts[2]


def dump_frontmatter(fm: dict, content: str) -> str:
    # Use a custom YAML representer to keep lists compact and preserve order.
    yaml_text = yaml.dump(fm, allow_unicode=True, sort_keys=False, line_break="\n", default_flow_style=False)
    return f"---\n{yaml_text}---\n{content}"


def process_item(md_path: Path, out_dir: Path, base_path: str, query_suffix: str) -> str:
    text = md_path.read_text(encoding="utf-8")
    fm, content = parse_frontmatter(text)

    images = fm.get("images") or []
    if images and images[0].get("src") and not images[0]["src"].endswith(".svg"):
        return "skipped"

    slug = md_path.stem
    query = f"{slug.replace('-', ' ')} {query_suffix}"
    print(f"[{query_suffix}] {slug}: searching...", end=" ")

    try:
        file_title = search_commons(query)
    except Exception as e:
        print(f"search failed: {e}")
        return "failed"

    if not file_title:
        print("no results")
        return "failed"

    try:
        image_url = get_image_url(file_title)
    except Exception as e:
        print(f"image info failed: {e}")
        return "failed"

    if not image_url:
        print("no image url")
        return "failed"

    parsed = urlparse(image_url)
    ext = os.path.splitext(parsed.path)[1] or ".jpg"
    if ext.lower() not in {".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"}:
        ext = ".jpg"

    filename = f"{slug}{ext}"
    dest = out_dir / filename

    if download_image(image_url, dest):
        fm["images"] = [{"src": f"{base_path}/{filename}", "alt": fm.get("name", slug)}]
        md_path.write_text(dump_frontmatter(fm, content), encoding="utf-8")
        print(f"downloaded {filename}")
        return "downloaded"
    else:
        return "failed"


def process_dir(content_dir: Path, out_dir: Path, base_path: str, query_suffix: str, limit: int | None = None) -> dict:
    out_dir.mkdir(parents=True, exist_ok=True)
    md_files = sorted(content_dir.glob("*.md"))
    if limit is not None:
        md_files = md_files[:limit]
    results = {"downloaded": 0, "skipped": 0, "failed": 0}

    for i, md_path in enumerate(md_files):
        # Small delay to be kind to the API
        if i > 0:
            time.sleep(0.4)
        status = process_item(md_path, out_dir, base_path, query_suffix)
        results[status] += 1

    return results


def main():
    parser = argparse.ArgumentParser(description="Download real food/plant images from Wikimedia Commons")
    parser.add_argument("--limit", type=int, default=None, help="Only process first N items per category")
    args = parser.parse_args()

    food_results = process_dir(CONTENT_FOODS, PUBLIC_FOODS, "/images/foods", "food", limit=args.limit)
    plant_results = process_dir(CONTENT_PLANTS, PUBLIC_PLANTS, "/images/plants", "plant", limit=args.limit)

    print("\nFoods:", food_results)
    print("Plants:", plant_results)


if __name__ == "__main__":
    main()
