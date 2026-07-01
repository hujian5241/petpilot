import Link from "next/link";
import Image from "next/image";
import { ExternalLink, Phone } from "lucide-react";

import { SafetyBadge } from "./SafetyBadge";
import { EmergencyBanner } from "@/components/emergency/EmergencyBanner";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { ReportIssue } from "@/components/feedback/ReportIssue";
import { buildFoodFaqSchema } from "@/lib/jsonld";
import { getEmergencyInfo } from "@/lib/content";
import type { FoodEntry } from "@/lib/types";

interface FoodDetailProps {
  food: FoodEntry;
}

export async function FoodDetail({ food }: FoodDetailProps) {
  const isUrgent =
    food.safety.dogs.status === "toxic" ||
    food.safety.cats.status === "toxic" ||
    food.safety.dogs.status === "limited" ||
    food.safety.cats.status === "limited";

  const jsonLd = buildFoodFaqSchema(food);
  const dogWarnings =
    food.condition_warnings?.filter((w) => w.appliesTo.includes("dogs")) ?? [];
  const catWarnings =
    food.condition_warnings?.filter((w) => w.appliesTo.includes("cats")) ?? [];

  const info = await getEmergencyInfo();
  const [aspca, pph] = info.hotlines;

  const pageUrl = `/foods/${food.slug}`;

  return (
    <article className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <Breadcrumb
        items={[
          { label: "Foods", href: "/foods" },
          { label: food.name },
        ]}
      />

      <header className="mt-6">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          Can Dogs Eat {food.name}?
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Find out if {food.name.toLowerCase()} is safe for dogs and cats.
        </p>
      </header>

      {food.images?.[0] && (
        <div className="mt-6 aspect-[16/9] overflow-hidden rounded-xl border border-border bg-muted">
          <Image
            src={food.images[0].src}
            alt={food.images[0].alt ?? food.name}
            width={800}
            height={450}
            className="h-full w-full object-cover"
            priority
          />
        </div>
      )}

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <SafetyBadge species="dogs" status={food.safety.dogs.status} />
        <SafetyBadge species="cats" status={food.safety.cats.status} />
      </div>

      {isUrgent && (
        <div className="mt-6">
          <EmergencyBanner />
        </div>
      )}

      <div className="prose-pet mt-8">
        <div dangerouslySetInnerHTML={{ __html: food.content ?? "" }} />

        <h2>Is {food.name} Safe for Dogs?</h2>
        <p>{food.safety.dogs.summary}</p>

        <h2>Is {food.name} Safe for Cats?</h2>
        <p>{food.safety.cats.summary}</p>

        {food.preparation_notes && (
          <>
            <h2>Preparation Notes</h2>
            <p>{food.preparation_notes}</p>
          </>
        )}

        {food.safe_amount && (
          <>
            <h2>Recommended Amount</h2>
            <p>{food.safe_amount}</p>
          </>
        )}

        {food.frequency && (
          <>
            <h2>How Often?</h2>
            <p>{food.frequency}</p>
          </>
        )}

        <h2>Symptoms to Watch For</h2>
        <ul>
          {food.symptoms.map((symptom) => (
            <li key={symptom}>{symptom}</li>
          ))}
        </ul>

        <h2>What If My Pet Ate {food.name}?</h2>
        <p>{food.what_to_do}</p>
        <div className="not-prose my-4 flex flex-wrap gap-3">
          {aspca && (
            <a
              href={`tel:${aspca.phone.replace(/\D/g, "")}`}
              className="inline-flex items-center gap-2 rounded-lg bg-emergency px-4 py-2 text-white hover:bg-emergency/90"
            >
              <Phone className="h-4 w-4" aria-hidden="true" />
              Call {aspca.name}
            </a>
          )}
          {pph && (
            <a
              href={`tel:${pph.phone.replace(/\D/g, "")}`}
              className="inline-flex items-center gap-2 rounded-lg border border-emergency bg-white px-4 py-2 text-emergency hover:bg-emergency-light"
            >
              <Phone className="h-4 w-4" aria-hidden="true" />
              {pph.name}
            </a>
          )}
        </div>

        {(dogWarnings.length > 0 || catWarnings.length > 0) && (
          <>
            <h2>Health Condition Considerations</h2>
            <p>
              Even if {food.name.toLowerCase()} is generally safe, it may not be appropriate for pets
              with certain medical conditions. Always check with your veterinarian if your pet has
              been diagnosed with any of the following.
            </p>
            {dogWarnings.length > 0 && (
              <>
                <h3>For Dogs</h3>
                <ul>
                  {dogWarnings.map((w) => (
                    <li key={w.condition}>
                      <strong>{w.condition}</strong>{" "}
                      —{" "}
                      {w.recommendation === "avoid"
                        ? "Avoid"
                        : w.recommendation === "limit"
                          ? "Limit"
                          : "Consult your vet"}
                      : {w.reason}
                      {w.notes && (
                        <span className="mt-1 block text-sm text-muted-foreground">{w.notes}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </>
            )}
            {catWarnings.length > 0 && (
              <>
                <h3>For Cats</h3>
                <ul>
                  {catWarnings.map((w) => (
                    <li key={w.condition}>
                      <strong>{w.condition}</strong>{" "}
                      —{" "}
                      {w.recommendation === "avoid"
                        ? "Avoid"
                        : w.recommendation === "limit"
                          ? "Limit"
                          : "Consult your vet"}
                      : {w.reason}
                      {w.notes && (
                        <span className="mt-1 block text-sm text-muted-foreground">{w.notes}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </>
        )}

        <h2>Safe Alternatives</h2>
        <ul>
          {food.alternatives.map((alt) => (
            <li key={alt}>
              <Link
                href={`/foods/${alt}`}
                className="text-primary hover:text-primary-dark"
              >
                {alt
                  .split("-")
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(" ")}
              </Link>
            </li>
          ))}
        </ul>

        <h2>Sources</h2>
        <ul>
          {food.sources.map((source) => (
            <li key={source.name}>
              {source.url ? (
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-primary hover:text-primary-dark"
                >
                  {source.name}
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              ) : (
                source.name
              )}
            </li>
          ))}
        </ul>

        <h2>Vet&apos;s Note</h2>
        <p>
          PetPilot provides general information for educational purposes. While we reference
          authoritative veterinary organizations, this page has not been individually reviewed by a
          veterinarian for your specific pet. Individual animals may react differently based on age,
          weight, breed, health conditions, and amount consumed. Always consult your veterinarian or
          a poison control center for personalized advice, especially if your pet is ill, injured,
          pregnant, nursing, or on medication.
        </p>
      </div>

      <div className="mt-8 space-y-4">
        <ReportIssue itemName={food.name} pageUrl={pageUrl} />
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <strong className="block text-amber-950">Medical Disclaimer</strong>
          The content on this page is not a substitute for professional veterinary diagnosis,
          treatment, or emergency care. If you suspect your pet has eaten something harmful, contact
          your veterinarian or call{" "}
          {aspca ? (
            <a
              href={`tel:${aspca.phone.replace(/\D/g, "")}`}
              className="font-semibold underline"
            >
              {aspca.name} {aspca.phone}
            </a>
          ) : (
            "ASPCA Poison Control"
          )}
          {" or "}
          {pph ? (
            <a
              href={`tel:${pph.phone.replace(/\D/g, "")}`}
              className="font-semibold underline"
            >
              {pph.name} {pph.phone}
            </a>
          ) : (
            "Pet Poison Helpline"
          )}
          {" immediately."}
        </div>
      </div>
    </article>
  );
}
