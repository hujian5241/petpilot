import type { FAQPage, Question, Answer, WithContext } from "schema-dts";

import type { FoodEntry, SafetyStatus } from "./types";

export function buildFoodFaqSchema(food: FoodEntry): WithContext<FAQPage> {
  const makeAnswer = (text: string): Answer => ({
    "@type": "Answer",
    text,
  });

  const questions: Question[] = [
    {
      "@type": "Question",
      name: `Can dogs eat ${food.name}?`,
      acceptedAnswer: makeAnswer(food.safety.dogs.summary),
    },
    {
      "@type": "Question",
      name: `Can cats eat ${food.name}?`,
      acceptedAnswer: makeAnswer(food.safety.cats.summary),
    },
    {
      "@type": "Question",
      name: `What should I do if my pet ate ${food.name}?`,
      acceptedAnswer: makeAnswer(food.what_to_do),
    },
  ];

  if (food.alternatives.length > 0) {
    const altText = food.alternatives
      .map((slug) => slug.split("-").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" "))
      .join(", ");
    questions.push({
      "@type": "Question",
      name: `What are safe alternatives to ${food.name}?`,
      acceptedAnswer: makeAnswer(`Safe alternatives include ${altText}.`),
    });
  }

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: questions,
  };
}

interface GuideFaqEntry {
  name: string;
  safety: {
    dogs: { status: SafetyStatus; summary: string };
    cats: { status: SafetyStatus; summary: string };
  };
  what_to_do: string;
  alternatives: string[];
}

function formatAltName(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function buildGuideFaqSchema(entry: GuideFaqEntry): WithContext<FAQPage> {
  const makeAnswer = (text: string): Answer => ({
    "@type": "Answer",
    text,
  });

  const questions: Question[] = [
    {
      "@type": "Question",
      name: `Is ${entry.name} safe for dogs?`,
      acceptedAnswer: makeAnswer(entry.safety.dogs.summary),
    },
    {
      "@type": "Question",
      name: `Is ${entry.name} safe for cats?`,
      acceptedAnswer: makeAnswer(entry.safety.cats.summary),
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
