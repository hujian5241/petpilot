import type { FAQPage, Question, Answer, WithContext } from "schema-dts";

import type { FoodEntry } from "./types";

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
