import { getTranslations } from "next-intl/server";

import type { FoodEntry } from "@/lib/types";
import type { Locale } from "@/lib/i18n";

interface FoodFaqSectionProps {
  food: FoodEntry;
  locale: Locale;
}

interface FaqItem {
  question: string;
  answer: string;
}

export async function FoodFaqSection({ food, locale }: FoodFaqSectionProps) {
  const t = await getTranslations({ locale, namespace: "FoodDetail" });

  const items: FaqItem[] = [];

  if (food.faq_extras) {
    items.push(...food.faq_extras);
  }

  // If no custom FAQ extras are provided, fall back to a small set of
  // generic long-tail questions that do not duplicate main headings.
  if (items.length === 0) {
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

    items.push({
      question: `Can I give ${name} to my dog as a treat?`,
      answer: dogYesNo,
    });
    items.push({
      question: `Is ${name} okay for cats in small amounts?`,
      answer: catYesNo,
    });

    if (food.notes_for_puppies || food.notes_for_kittens) {
      items.push({
        question: `Should puppies or kittens be given ${name}?`,
        answer: `${food.notes_for_puppies ?? ""} ${food.notes_for_kittens ?? ""}`.trim(),
      });
    }

    if (food.safe_amount) {
      items.push({
        question: `How much ${name} can a dog or cat safely have?`,
        answer: food.safe_amount,
      });
    }

    if (food.lookalikes && food.lookalikes.length > 0) {
      items.push({
        question: `What foods look like ${name} but may be dangerous?`,
        answer: `Lookalikes to keep in mind: ${food.lookalikes.join(", ")}.`,
      });
    }

    items.push({
      question: `What should I do if my pet accidentally eats ${name}?`,
      answer: food.what_to_do,
    });
  }

  if (items.length === 0) return null;

  return (
    <section className="mt-10" aria-labelledby="food-faq-title">
      <h2 id="food-faq-title" className="text-2xl font-light tracking-tight text-foreground">
        {t("faqTitle")}
      </h2>
      <div className="mt-4 space-y-3">
        {items.map((item, index) => (
          <details
            key={index}
            className="group rounded-xl border border-border bg-card open:ring-1 open:ring-primary/20"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between p-4 text-base font-medium text-foreground transition-colors hover:bg-muted/50">
              {item.question}
              <span className="ml-3 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground transition-transform group-open:rotate-180">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </span>
            </summary>
            <div className="px-4 pb-4 text-sm leading-relaxed text-muted-foreground">
              {item.answer}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
