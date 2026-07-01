import Link from "next/link";
import { Phone, AlertTriangle } from "lucide-react";

import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { Disclaimer } from "@/components/food/Disclaimer";
import { getAllFoods, getEmergencyInfo } from "@/lib/content";

export default async function EmergencyPage() {
  const [info, foods] = await Promise.all([getEmergencyInfo(), getAllFoods()]);

  const commonToxinFoods = info.common_toxins
    .map((slug) => foods.find((food) => food.slug === slug))
    .filter((food): food is NonNullable<typeof food> => food !== undefined);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumb items={[{ label: "Emergency" }]} />

      <header className="mt-6">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-8 w-8 text-emergency" />
          <h1 className="text-3xl font-bold text-foreground">{info.title}</h1>
        </div>
        <p className="mt-2 text-lg text-muted-foreground">{info.subtitle}</p>
      </header>

      <section className="mt-8 rounded-xl border border-emergency/20 bg-emergency-light p-6">
        <h2 className="text-xl font-semibold text-emergency">Poison Control Hotlines</h2>
        <div className="mt-4 space-y-4">
          {info.hotlines.map((hotline) => (
            <div key={hotline.name} className="rounded-lg bg-white p-4 shadow-sm">
              <p className="font-semibold text-foreground">{hotline.name}</p>
              <a
                href={`tel:${hotline.phone.replace(/\D/g, "")}`}
                className="mt-1 inline-flex items-center gap-2 text-2xl font-bold text-emergency hover:underline"
              >
                <Phone className="h-5 w-5" />
                {hotline.phone}
              </a>
              <p className="mt-1 text-sm text-muted-foreground">
                {hotline.available} · {hotline.cost}
              </p>
              {hotline.url && (
                <a
                  href={hotline.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-block text-sm text-primary hover:underline"
                >
                  Visit website
                </a>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-2xl font-semibold text-foreground">When to Call Immediately</h2>
        <ul className="mt-4 list-disc space-y-2 pl-6 text-foreground">
          {info.when_to_call.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-2xl font-semibold text-foreground">Steps to Take</h2>
        <ol className="mt-4 list-decimal space-y-2 pl-6 text-foreground">
          {info.steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>

      <section className="mt-8">
        <h2 className="text-2xl font-semibold text-foreground">Common Toxic Foods</h2>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {commonToxinFoods.map((food) => (
            <Link
              key={food.slug}
              href={`/foods/${food.slug}`}
              className="rounded-lg border border-border bg-card p-4 transition-shadow hover:shadow-sm"
            >
              <p className="font-semibold text-foreground">{food.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">{food.safety.dogs.summary}</p>
            </Link>
          ))}
        </div>
      </section>

      <div className="mt-8">
        <Disclaimer />
      </div>
    </div>
  );
}
