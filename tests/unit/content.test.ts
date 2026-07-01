import { describe, it, expect } from "vitest";

import { getAllFoods, getAllPlants, getAllCategories } from "../../lib/content";
import { buildSearchIndex } from "../../lib/search";

describe("Content loading", () => {
  it("loads all food entries", async () => {
    const foods = await getAllFoods();
    expect(foods.length).toBeGreaterThan(0);
  });

  it("loads all plant entries", async () => {
    const plants = await getAllPlants();
    expect(plants.length).toBeGreaterThan(0);
  });

  it("loads categories", async () => {
    const categories = await getAllCategories();
    expect(categories.length).toBeGreaterThan(0);
  });
});

describe("Search index", () => {
  it("builds a search index from foods", async () => {
    const foods = await getAllFoods();
    const index = buildSearchIndex(foods);
    expect(index.length).toBe(foods.length);
    expect(index[0]).toHaveProperty("type", "food");
  });
});
