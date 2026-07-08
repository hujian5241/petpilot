import type {
  FAQPage,
  Question,
  Answer,
  WithContext,
  ItemList,
  ListItem,
} from "schema-dts";

import type {
  FoodEntry,
  PlantEntry,
  MedicationEntry,
  HouseholdChemicalEntry,
  PesticideEntry,
  SafetyStatus,
  Species,
} from "./types";

const speciesNames: Record<Species, string> = {
  dogs: "dogs",
  cats: "cats",
};

const statusVerdict: Record<SafetyStatus, string> = {
  safe: "safe",
  limited: "limited",
  toxic: "toxic",
  unknown: "unknown",
};

function makeAnswer(text: string): Answer {
  return {
    "@type": "Answer",
    text,
  };
}

function formatAltName(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function isBeverage(food: FoodEntry): boolean {
  return food.categories.includes("beverages");
}

function ingestVerb(food: FoodEntry): string {
  return isBeverage(food) ? "drink" : "eat";
}

function ingestPast(food: FoodEntry): string {
  return isBeverage(food) ? "drank" : "ate";
}

function buildDogVerdict(food: FoodEntry): string {
  const verb = ingestVerb(food);
  return `${food.name} is ${statusVerdict[food.safety.dogs.status]} for dogs to ${verb}. ${food.safety.dogs.summary}`;
}

function buildCatVerdict(food: FoodEntry): string {
  const verb = ingestVerb(food);
  return `${food.name} is ${statusVerdict[food.safety.cats.status]} for cats to ${verb}. ${food.safety.cats.summary}`;
}

export function buildFoodFaqSchema(food: FoodEntry): WithContext<FAQPage> {
  const questions: Question[] = [];

  if (food.faq_extras && food.faq_extras.length > 0) {
    for (const item of food.faq_extras) {
      questions.push({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: makeAnswer(item.answer),
      });
    }
  }

  // Fallback generic long-tail questions that do not duplicate main headings.
  if (questions.length === 0) {
    const name = food.name;
    const dogStatus = food.safety.dogs.status;
    const catStatus = food.safety.cats.status;

    const dogYesNo =
      dogStatus === "safe"
        ? `Yes, ${name.toLowerCase()} is generally considered safe for dogs in appropriate amounts.`
        : dogStatus === "limited"
          ? `Dogs should only have ${name.toLowerCase()} in limited amounts or under specific conditions.`
          : `No, ${name.toLowerCase()} is not considered safe for dogs.`;

    const catYesNo =
      catStatus === "safe"
        ? `Yes, ${name.toLowerCase()} is generally considered safe for cats in appropriate amounts.`
        : catStatus === "limited"
          ? `Cats should only have ${name.toLowerCase()} in limited amounts or under specific conditions.`
          : `No, ${name.toLowerCase()} is not considered safe for cats.`;

    questions.push({
      "@type": "Question",
      name: `Can I give ${name} to my dog as a treat?`,
      acceptedAnswer: makeAnswer(dogYesNo),
    });
    questions.push({
      "@type": "Question",
      name: `Is ${name} okay for cats in small amounts?`,
      acceptedAnswer: makeAnswer(catYesNo),
    });

    if (food.notes_for_puppies || food.notes_for_kittens) {
      const parts = [
        food.notes_for_puppies ? `For puppies: ${food.notes_for_puppies}` : undefined,
        food.notes_for_kittens ? `For kittens: ${food.notes_for_kittens}` : undefined,
      ].filter(Boolean);
      questions.push({
        "@type": "Question",
        name: `Should puppies or kittens be given ${name}?`,
        acceptedAnswer: makeAnswer(parts.join(" ")),
      });
    }

    if (food.safe_amount) {
      questions.push({
        "@type": "Question",
        name: `How much ${name} can a dog or cat safely have?`,
        acceptedAnswer: makeAnswer(food.safe_amount),
      });
    }

    if (food.lookalikes && food.lookalikes.length > 0) {
      questions.push({
        "@type": "Question",
        name: `What foods look like ${name} but may be dangerous?`,
        acceptedAnswer: makeAnswer(`Lookalikes to keep in mind: ${food.lookalikes.join(", ")}.`),
      });
    }

    questions.push({
      "@type": "Question",
      name: `What should I do if my pet accidentally eats ${name}?`,
      acceptedAnswer: makeAnswer(food.what_to_do),
    });
  }

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: questions,
  };
}

export function buildPlantFaqSchema(plant: PlantEntry): WithContext<FAQPage> {
  const questions: Question[] = [
    {
      "@type": "Question",
      name: `Is ${plant.name} toxic to dogs?`,
      acceptedAnswer: makeAnswer(
        `${plant.name} is ${statusVerdict[plant.safety.dogs.status]} for dogs. ${plant.safety.dogs.summary}`
      ),
    },
    {
      "@type": "Question",
      name: `Is ${plant.name} toxic to cats?`,
      acceptedAnswer: makeAnswer(
        `${plant.name} is ${statusVerdict[plant.safety.cats.status]} for cats. ${plant.safety.cats.summary}`
      ),
    },
  ];

  if (plant.symptoms.length > 0) {
    questions.push({
      "@type": "Question",
      name: `What are the symptoms of ${plant.name} poisoning in pets?`,
      acceptedAnswer: makeAnswer(plant.symptoms.join(". ")),
    });
  }

  questions.push({
    "@type": "Question",
    name: `What should I do if my pet ate ${plant.name}?`,
    acceptedAnswer: makeAnswer(plant.what_to_do),
  });

  if (plant.alternatives.length > 0) {
    const altText = plant.alternatives.map(formatAltName).join(", ");
    questions.push({
      "@type": "Question",
      name: `What are pet-safe alternatives to ${plant.name}?`,
      acceptedAnswer: makeAnswer(`Pet-safe alternatives include ${altText}.`),
    });
  }

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: questions,
  };
}

export function buildMedicationFaqSchema(
  medication: MedicationEntry
): WithContext<FAQPage> {
  const questions: Question[] = [
    {
      "@type": "Question",
      name: `Is ${medication.name} toxic to dogs?`,
      acceptedAnswer: makeAnswer(
        `${medication.name} is ${statusVerdict[medication.safety.dogs.status]} for dogs. ${medication.safety.dogs.summary}`
      ),
    },
    {
      "@type": "Question",
      name: `Is ${medication.name} toxic to cats?`,
      acceptedAnswer: makeAnswer(
        `${medication.name} is ${statusVerdict[medication.safety.cats.status]} for cats. ${medication.safety.cats.summary}`
      ),
    },
  ];

  if (medication.active_ingredients.length > 0 || medication.toxic_ingredients?.length) {
    const active = medication.active_ingredients.join(", ") || "Not listed";
    const toxic = medication.toxic_ingredients?.join(", ") || "Not listed";
    questions.push({
      "@type": "Question",
      name: `What ingredients in ${medication.name} are dangerous to pets?`,
      acceptedAnswer: makeAnswer(
        `Active ingredients: ${active}. Toxic ingredients: ${toxic}.`
      ),
    });
  }

  if (medication.symptoms.length > 0) {
    questions.push({
      "@type": "Question",
      name: `What symptoms can ${medication.name} cause in pets?`,
      acceptedAnswer: makeAnswer(medication.symptoms.join(". ")),
    });
  }

  questions.push({
    "@type": "Question",
    name: `What should I do if my pet ingested ${medication.name}?`,
    acceptedAnswer: makeAnswer(medication.what_to_do),
  });

  if (medication.alternatives.length > 0) {
    const altText = medication.alternatives.map(formatAltName).join(", ");
    questions.push({
      "@type": "Question",
      name: `What are safer alternatives to ${medication.name} for pets?`,
      acceptedAnswer: makeAnswer(`Safer alternatives include ${altText}.`),
    });
  }

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: questions,
  };
}

export function buildHouseholdChemicalFaqSchema(
  chemical: HouseholdChemicalEntry
): WithContext<FAQPage> {
  const questions: Question[] = [
    {
      "@type": "Question",
      name: `Is ${chemical.name} safe to use around dogs and cats?`,
      acceptedAnswer: makeAnswer(
        `${chemical.name} is ${statusVerdict[chemical.safety.dogs.status]} for dogs and ${statusVerdict[chemical.safety.cats.status]} for cats. ${chemical.safety.dogs.summary} ${chemical.safety.cats.summary}`.trim()
      ),
    },
  ];

  if (chemical.common_products?.length) {
    questions.push({
      "@type": "Question",
      name: `What household products contain ${chemical.name}?`,
      acceptedAnswer: makeAnswer(chemical.common_products.join(", ")),
    });
  }

  if (chemical.symptoms.length > 0) {
    questions.push({
      "@type": "Question",
      name: `What are the symptoms of ${chemical.name} exposure in pets?`,
      acceptedAnswer: makeAnswer(chemical.symptoms.join(". ")),
    });
  }

  questions.push({
    "@type": "Question",
    name: `What should I do if my pet was exposed to ${chemical.name}?`,
    acceptedAnswer: makeAnswer(chemical.what_to_do),
  });

  if (chemical.alternatives.length > 0) {
    const altText = chemical.alternatives.map(formatAltName).join(", ");
    questions.push({
      "@type": "Question",
      name: `Are there pet-safe alternatives to ${chemical.name}?`,
      acceptedAnswer: makeAnswer(`Pet-safe alternatives include ${altText}.`),
    });
  }

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: questions,
  };
}

export function buildPesticideFaqSchema(
  pesticide: PesticideEntry
): WithContext<FAQPage> {
  const questions: Question[] = [
    {
      "@type": "Question",
      name: `Is ${pesticide.name} toxic to dogs and cats?`,
      acceptedAnswer: makeAnswer(
        `${pesticide.name} is ${statusVerdict[pesticide.safety.dogs.status]} for dogs and ${statusVerdict[pesticide.safety.cats.status]} for cats. ${pesticide.safety.dogs.summary} ${pesticide.safety.cats.summary}`.trim()
      ),
    },
  ];

  if (pesticide.active_ingredients.length > 0) {
    questions.push({
      "@type": "Question",
      name: `What active ingredients are in ${pesticide.name}?`,
      acceptedAnswer: makeAnswer(pesticide.active_ingredients.join(", ")),
    });
  }

  if (pesticide.pest_targeted?.length) {
    questions.push({
      "@type": "Question",
      name: `What pests does ${pesticide.name} target?`,
      acceptedAnswer: makeAnswer(pesticide.pest_targeted.join(", ")),
    });
  }

  if (pesticide.symptoms.length > 0) {
    questions.push({
      "@type": "Question",
      name: `What are the symptoms of ${pesticide.name} poisoning in pets?`,
      acceptedAnswer: makeAnswer(pesticide.symptoms.join(". ")),
    });
  }

  questions.push({
    "@type": "Question",
    name: `What should I do if my pet was exposed to ${pesticide.name}?`,
    acceptedAnswer: makeAnswer(pesticide.what_to_do),
  });

  if (pesticide.alternatives.length > 0) {
    const altText = pesticide.alternatives.map(formatAltName).join(", ");
    questions.push({
      "@type": "Question",
      name: `What are pet-safe alternatives to ${pesticide.name}?`,
      acceptedAnswer: makeAnswer(`Pet-safe alternatives include ${altText}.`),
    });
  }

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: questions,
  };
}

export function buildItemListSchema(items: { name: string; url: string }[]): WithContext<ItemList> {
  const listItems: ListItem[] = items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.name,
    url: item.url,
  }));

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: listItems,
  };
}

export function buildGuideFaqSchema(
  entry: Pick<
    PlantEntry | MedicationEntry | HouseholdChemicalEntry | PesticideEntry,
    "name" | "safety" | "what_to_do" | "alternatives"
  >
): WithContext<FAQPage> {
  const questions: Question[] = [
    {
      "@type": "Question",
      name: `Is ${entry.name} safe for dogs?`,
      acceptedAnswer: makeAnswer(
        `${entry.name} is ${statusVerdict[entry.safety.dogs.status]} for dogs. ${entry.safety.dogs.summary}`
      ),
    },
    {
      "@type": "Question",
      name: `Is ${entry.name} safe for cats?`,
      acceptedAnswer: makeAnswer(
        `${entry.name} is ${statusVerdict[entry.safety.cats.status]} for cats. ${entry.safety.cats.summary}`
      ),
    },
    {
      "@type": "Question",
      name: `What should I do if my pet is exposed to ${entry.name}?`,
      acceptedAnswer: makeAnswer(entry.what_to_do),
    },
  ];

  if (entry.alternatives.length > 0) {
    const altText = entry.alternatives.map(formatAltName).join(", ");
    questions.push({
      "@type": "Question",
      name: `What are safer alternatives to ${entry.name}?`,
      acceptedAnswer: makeAnswer(`Safer alternatives include ${altText}.`),
    });
  }

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: questions,
  };
}
