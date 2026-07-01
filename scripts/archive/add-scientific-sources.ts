import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";
import yaml from "js-yaml";

const FOODS_DIR = path.join(process.cwd(), "content", "foods");
const PLANTS_DIR = path.join(process.cwd(), "content", "plants");

interface Source {
  name: string;
  url?: string;
}

interface SourceMapping {
  slugs: string[];
  sources: Source[];
}

const REVIEW_FOODS: Source = {
  name: "Cortinovis & Caloni, Front Vet Sci (2016)",
  url: "https://pubmed.ncbi.nlm.nih.gov/27047944/",
};

const REVIEW_KITCHEN: Source = {
  name: "Gugler et al., Compend Contin Educ Vet (2013)",
  url: "https://pubmed.ncbi.nlm.nih.gov/23677840/",
};

const MSD_FOOD_HAZARDS: Source = {
  name: "MSD Veterinary Manual — Food Hazards",
  url: "https://www.msdvetmanual.com/toxicology/food-hazards",
};

const MSD_TOXICOLOGY: Source = {
  name: "MSD Veterinary Manual — Toxicology",
  url: "https://www.msdvetmanual.com/toxicology",
};

const ASPCA_PEOPLE_FOODS: Source = {
  name: "ASPCA — People Foods to Avoid Feeding Your Pets",
  url: "https://www.aspca.org/pet-care/aspca-poison-control/people-foods-avoid-feeding-your-pets",
};

const ASPCA_CAT_PLANTS: Source = {
  name: "ASPCA — Toxic and Non-Toxic Plant List for Cats",
  url: "https://www.aspca.org/pet-care/animal-poison-control/cats-plant-list",
};

const ASPCA_DOG_PLANTS: Source = {
  name: "ASPCA — Toxic and Non-Toxic Plant List for Dogs",
  url: "https://www.aspca.org/pet-care/animal-poison-control/dogs-plant-list",
};

const FOOD_MAPPINGS: SourceMapping[] = [
  {
    slugs: ["chocolate", "dark-chocolate", "milk-chocolate", "cocoa-powder", "hot-chocolate", "chocolate-syrup", "chocolate-chip-cookies", "chocolate-ice-cream", "brownies"],
    sources: [
      REVIEW_FOODS,
      REVIEW_KITCHEN,
      MSD_FOOD_HAZARDS,
      {
        name: "MSD Veterinary Manual — Chocolate Toxicosis",
        url: "https://www.msdvetmanual.com/toxicology/food-hazards/chocolate-toxicosis-in-animals",
      },
      ASPCA_PEOPLE_FOODS,
      {
        name: "Cornell Riney Canine Health Center — Chocolate Toxicity",
        url: "https://www.vet.cornell.edu/departments-centers-and-institutes/riney-canine-health-center/canine-health-information/chocolate-toxicity-what-should-i-do-if-my-dog-eats-chocolate",
      },
    ],
  },
  {
    slugs: ["grapes", "raisins", "currants", "grape-juice", "raisin-bread"],
    sources: [
      REVIEW_FOODS,
      {
        name: "MSD Veterinary Manual — Grape, Raisin, and Tamarind Toxicosis",
        url: "https://www.msdvetmanual.com/toxicology/food-hazards/grape-raisin-and-tamarind-vitis-spp-tamarindus-spp-toxicosis-in-dogs",
      },
      {
        name: "PubMed — Toxicosis with grapes or raisins causing AKI in dogs (PMID 32893916)",
        url: "https://pubmed.ncbi.nlm.nih.gov/32893916/",
      },
      {
        name: "Cornell Riney Canine Health Center — Grape and Raisin Toxicity",
        url: "https://www.vet.cornell.edu/departments-centers-and-institutes/riney-canine-health-center/canine-health-information/grape-and-raisin-toxicity",
      },
      ASPCA_PEOPLE_FOODS,
    ],
  },
  {
    slugs: ["onions", "garlic", "chives", "leeks", "onion-powder"],
    sources: [
      REVIEW_FOODS,
      REVIEW_KITCHEN,
      {
        name: "MSD Veterinary Manual — Garlic and Onion (Allium spp) Toxicosis",
        url: "https://www.msdvetmanual.com/toxicology/food-hazards/garlic-and-onion-allium-spp-toxicosis-in-animals",
      },
      {
        name: "Salgado et al., J Venom Anim Toxins incl Trop Dis (2011) — Allium species poisoning in dogs and cats",
        url: "https://dx.doi.org/10.1590/S1678-91992011000100002",
      },
      ASPCA_PEOPLE_FOODS,
    ],
  },
  {
    slugs: ["xylitol", "sugar-free-gum", "gum", "candy", "hard-candy", "gummy-candy"],
    sources: [
      REVIEW_FOODS,
      REVIEW_KITCHEN,
      {
        name: "MSD Veterinary Manual — Xylitol Toxicosis in Dogs",
        url: "https://www.msdvetmanual.com/toxicology/food-hazards/xylitol-toxicosis-in-dogs",
      },
      {
        name: "Murphy & Dunayer, Vet Clin North Am Small Anim Pract (2012) — Xylitol toxicosis in dogs",
        url: "https://pubmed.ncbi.nlm.nih.gov/22381181/",
      },
      {
        name: "Murphy & Dunayer, Vet Clin North Am Small Anim Pract (2018) — Xylitol Toxicosis in Dogs: An Update",
        url: "https://pubmed.ncbi.nlm.nih.gov/30064708/",
      },
      {
        name: "Piscitelli et al., Compend Contin Educ Vet (2010) — Xylitol toxicity in dogs",
        url: "https://pubmed.ncbi.nlm.nih.gov/20473849/",
      },
      ASPCA_PEOPLE_FOODS,
    ],
  },
  {
    slugs: ["macadamia-nuts"],
    sources: [
      REVIEW_FOODS,
      MSD_FOOD_HAZARDS,
      ASPCA_PEOPLE_FOODS,
    ],
  },
  {
    slugs: ["alcohol", "beer", "wine"],
    sources: [
      REVIEW_FOODS,
      REVIEW_KITCHEN,
      MSD_FOOD_HAZARDS,
      ASPCA_PEOPLE_FOODS,
    ],
  },
  {
    slugs: ["raw-bread-dough"],
    sources: [
      REVIEW_FOODS,
      REVIEW_KITCHEN,
      MSD_FOOD_HAZARDS,
      ASPCA_PEOPLE_FOODS,
    ],
  },
  {
    slugs: ["avocado"],
    sources: [
      REVIEW_FOODS,
      MSD_FOOD_HAZARDS,
      ASPCA_PEOPLE_FOODS,
    ],
  },
  {
    slugs: ["coffee", "tea", "energy-drinks", "soda", "sports-drinks", "chai-latte"],
    sources: [
      REVIEW_KITCHEN,
      {
        name: "MSD Veterinary Manual — Chocolate Toxicosis (methylxanthines)",
        url: "https://www.msdvetmanual.com/toxicology/food-hazards/chocolate-toxicosis-in-animals",
      },
      ASPCA_PEOPLE_FOODS,
    ],
  },
];

const PLANT_MAPPINGS: SourceMapping[] = [
  {
    slugs: ["sago-palm"],
    sources: [
      MSD_TOXICOLOGY,
      ASPCA_CAT_PLANTS,
      ASPCA_DOG_PLANTS,
    ],
  },
  {
    slugs: ["oleander"],
    sources: [
      MSD_TOXICOLOGY,
      ASPCA_CAT_PLANTS,
      ASPCA_DOG_PLANTS,
    ],
  },
  {
    slugs: ["true-lily", "easter-lily", "lily-of-the-valley", "daylily"],
    sources: [
      MSD_TOXICOLOGY,
      ASPCA_CAT_PLANTS,
      ASPCA_DOG_PLANTS,
    ],
  },
  {
    slugs: ["azalea", "rhododendron"],
    sources: [
      MSD_TOXICOLOGY,
      ASPCA_CAT_PLANTS,
      ASPCA_DOG_PLANTS,
    ],
  },
  {
    slugs: ["foxglove"],
    sources: [
      MSD_TOXICOLOGY,
      ASPCA_CAT_PLANTS,
      ASPCA_DOG_PLANTS,
    ],
  },
  {
    slugs: ["dieffenbachia", "philodendron", "pothos", "monstera", "elephant-ear", "caladium", "alocasia"],
    sources: [
      MSD_TOXICOLOGY,
      ASPCA_CAT_PLANTS,
      ASPCA_DOG_PLANTS,
    ],
  },
  {
    slugs: ["hydrangea"],
    sources: [
      MSD_TOXICOLOGY,
      ASPCA_CAT_PLANTS,
      ASPCA_DOG_PLANTS,
    ],
  },
  {
    slugs: ["chrysanthemum"],
    sources: [
      MSD_TOXICOLOGY,
      ASPCA_CAT_PLANTS,
      ASPCA_DOG_PLANTS,
    ],
  },
  {
    slugs: ["cyclamen", "daffodil", "daffodils", "tulip", "tulips", "gladiolus", "hyacinth"],
    sources: [
      MSD_TOXICOLOGY,
      ASPCA_CAT_PLANTS,
      ASPCA_DOG_PLANTS,
    ],
  },
  {
    slugs: ["castor-bean"],
    sources: [
      MSD_TOXICOLOGY,
      ASPCA_CAT_PLANTS,
      ASPCA_DOG_PLANTS,
    ],
  },
  {
    slugs: ["yew"],
    sources: [
      MSD_TOXICOLOGY,
      ASPCA_CAT_PLANTS,
      ASPCA_DOG_PLANTS,
    ],
  },
  {
    slugs: ["autumn-crocus", "colchicum"],
    sources: [
      MSD_TOXICOLOGY,
      ASPCA_CAT_PLANTS,
      ASPCA_DOG_PLANTS,
    ],
  },
  {
    slugs: ["deadly-nightshade", "bittersweet-nightshade", "black-nightshade", "jimsonweed"],
    sources: [
      MSD_TOXICOLOGY,
      ASPCA_CAT_PLANTS,
      ASPCA_DOG_PLANTS,
    ],
  },
  {
    slugs: ["water-hemlock"],
    sources: [
      MSD_TOXICOLOGY,
      ASPCA_CAT_PLANTS,
      ASPCA_DOG_PLANTS,
    ],
  },
  {
    slugs: ["pokeberry", "mayapple", "white-snakeroot", "ragwort", "tansy"],
    sources: [
      MSD_TOXICOLOGY,
      ASPCA_CAT_PLANTS,
      ASPCA_DOG_PLANTS,
    ],
  },
];

function dedupeSources(existing: Source[], additions: Source[]): Source[] {
  const seen = new Set(existing.map((s) => s.url ?? s.name));
  const combined = [...existing];
  for (const source of additions) {
    const key = source.url ?? source.name;
    if (!seen.has(key)) {
      seen.add(key);
      combined.push(source);
    }
  }
  return combined;
}

async function updateDirectory(dir: string, mappings: SourceMapping[]) {
  const files = await fs.readdir(dir);
  const mdFiles = files.filter((file) => file.endsWith(".md"));

  let updated = 0;

  for (const file of mdFiles) {
    const slug = file.replace(/\.md$/, "");
    const filePath = path.join(dir, file);
    const raw = await fs.readFile(filePath, "utf-8");
    const { data, content } = matter(raw);

    const additions: Source[] = [];
    for (const mapping of mappings) {
      if (mapping.slugs.includes(slug)) {
        additions.push(...mapping.sources);
      }
    }

    if (additions.length === 0) continue;

    const existing: Source[] = Array.isArray(data.sources) ? data.sources : [];
    const combined = dedupeSources(existing, additions);

    if (combined.length === existing.length) continue;

    data.sources = combined;
    const frontmatter = yaml.dump(data, { lineWidth: -1, noRefs: true }).trimEnd();
    await fs.writeFile(filePath, `---\n${frontmatter}\n---\n${content}`, "utf-8");
    updated++;
    console.log(`Updated ${slug}: ${combined.length - existing.length} new source(s)`);
  }

  console.log(`\nUpdated ${updated} files in ${path.basename(dir)}`);
}

async function main() {
  await updateDirectory(FOODS_DIR, FOOD_MAPPINGS);
  await updateDirectory(PLANTS_DIR, PLANT_MAPPINGS);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
