import Link from "next/link";
import Image from "next/image";
import { ExternalLink, Phone } from "lucide-react";

import { SafetyBadge } from "@/components/food/SafetyBadge";
import { EmergencyBanner } from "@/components/emergency/EmergencyBanner";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { ReportIssue } from "@/components/feedback/ReportIssue";
import { getEmergencyInfo } from "@/lib/content";
import type { PlantEntry } from "@/lib/types";

interface PlantDetailProps {
  plant: PlantEntry;
}

export async function PlantDetail({ plant }: PlantDetailProps) {
  const isUrgent =
    plant.safety.dogs.status === "toxic" ||
    plant.safety.cats.status === "toxic" ||
    plant.safety.dogs.status === "limited" ||
    plant.safety.cats.status === "limited";

  const info = await getEmergencyInfo();
  const [aspca, pph] = info.hotlines;

  const pageUrl = `/plants/${plant.slug}`;

  return (
    <article className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumb
        items={[
          { label: "Plants", href: "/plants" },
          { label: plant.name },
        ]}
      />

      <header className="mt-6">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          Is {plant.name} Safe for Pets?
        </h1>
        {plant.scientific_name && (
          <p className="mt-2 text-lg italic text-muted-foreground">{plant.scientific_name}</p>
        )}
        <p className="mt-2 text-lg text-muted-foreground">
          Find out if {plant.name.toLowerCase()} is safe for dogs and cats.
        </p>
      </header>

      {plant.images?.[0] && (
        <div className="mt-6 aspect-[16/9] overflow-hidden rounded-xl border border-border bg-muted">
          <Image
            src={plant.images[0].src}
            alt={plant.images[0].alt ?? plant.name}
            width={800}
            height={450}
            className="h-full w-full object-cover"
            priority
          />
        </div>
      )}

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <SafetyBadge species="dogs" status={plant.safety.dogs.status} />
        <SafetyBadge species="cats" status={plant.safety.cats.status} />
      </div>

      {isUrgent && (
        <div className="mt-6">
          <EmergencyBanner />
        </div>
      )}

      <div className="prose-pet mt-8">
        <div dangerouslySetInnerHTML={{ __html: plant.content ?? "" }} />

        <h2>Is {plant.name} Safe for Dogs?</h2>
        <p>{plant.safety.dogs.summary}</p>

        <h2>Is {plant.name} Safe for Cats?</h2>
        <p>{plant.safety.cats.summary}</p>

        <h2>Symptoms to Watch For</h2>
        <ul>
          {plant.symptoms.map((symptom) => (
            <li key={symptom}>{symptom}</li>
          ))}
        </ul>

        <h2>What If My Pet Ate {plant.name}?</h2>
        <p>{plant.what_to_do}</p>
        <div className="not-prose my-4 flex flex-wrap gap-3">
          {aspca && (
            <a
              href={`tel:${aspca.phone.replace(/\D/g, "")}`}
              className="inline-flex items-center gap-2 rounded-lg bg-emergency px-4 py-2 text-white hover:bg-emergency/90"
            >
              <Phone className="h-4 w-4" aria-hidden="true" />
              {aspca.name}
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

        <h2>Safe Alternatives</h2>
        <ul>
          {plant.alternatives.map((alt) => (
            <li key={alt}>
              <Link
                href={`/plants/${alt}`}
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
          {plant.sources.map((source) => (
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
        <ReportIssue itemName={plant.name} pageUrl={pageUrl} />
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
