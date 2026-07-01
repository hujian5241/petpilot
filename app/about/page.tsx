import Link from "next/link";
import { Shield, BookOpen, Heart } from "lucide-react";

import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { getSiteConfig } from "@/lib/content";

export default async function AboutPage() {
  const config = await getSiteConfig();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumb items={[{ label: "About" }]} />

      <header className="mt-6">
        <h1 className="text-3xl font-bold text-foreground">About {config.name}</h1>
        <p className="mt-2 text-lg text-muted-foreground">{config.tagline}</p>
      </header>

      <section className="prose-pet mt-8">
        <p>
          {config.name} was created to help pet owners make fast, confident decisions about what
          their pets can safely eat. Whether you are wondering if a treat is okay or dealing with a
          potential emergency, our goal is to give you clear, trustworthy information when you need
          it most.
        </p>

        <h2>Our Mission</h2>
        <p>
          We believe every pet owner deserves quick access to accurate safety information. By
          starting with food safety and expanding into nutrition planning, plant identification, and
          preventive care, we aim to become the first place pet owners turn when they have a
          question.
        </p>

        <h2>How We Source Content</h2>
        <p>
          Our content is built on authoritative veterinary sources, including the ASPCA Animal Poison
          Control Center, Pet Poison Helpline, AVMA, AKC, and peer-reviewed veterinary literature.
          However, not every entry has been individually verified by a veterinarian for every species,
          breed, age group, or health condition.
        </p>
        <p>
          We flag high-risk items (such as chocolate, grapes, xylitol, onions, garlic, alcohol,
          caffeine, and macadamia nuts) with prominent warnings and emergency hotlines. Even so, our
          guidance cannot account for individual variations in sensitivity, dose, or pre-existing
          disease.
        </p>

        <h2>Important Disclaimer</h2>
        <p>
          {config.name} provides educational information only and is not a substitute for
          professional veterinary advice, diagnosis, or emergency care. If your pet is sick, injured,
          pregnant, nursing, on medication, or may have eaten something toxic, contact your
          veterinarian or call{" "}
          <a href="tel:8884264435" className="font-semibold underline">ASPCA Poison Control (888) 426-4435</a>
          {" or "}
          <a href="tel:8557647661" className="font-semibold underline">Pet Poison Helpline (855) 764-7661</a>
          {" immediately."}
        </p>
      </section>

      <section className="mt-12 grid gap-6 md:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-6 text-center">
          <Shield className="mx-auto h-8 w-8 text-primary" />
          <h3 className="mt-3 font-semibold">Trustworthy</h3>
          <p className="mt-1 text-sm text-muted-foreground">Sourced from leading veterinary organizations.</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-6 text-center">
          <BookOpen className="mx-auto h-8 w-8 text-primary" />
          <h3 className="mt-3 font-semibold">Clear</h3>
          <p className="mt-1 text-sm text-muted-foreground">Simple answers designed for stressful moments.</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-6 text-center">
          <Heart className="mx-auto h-8 w-8 text-primary" />
          <h3 className="mt-3 font-semibold">Caring</h3>
          <p className="mt-1 text-sm text-muted-foreground">Built by people who love pets.</p>
        </div>
      </section>

      <section className="mt-12 rounded-lg bg-muted p-6">
        <h2 className="text-xl font-semibold">Contact Us</h2>
        <p className="mt-2 text-muted-foreground">
          Have feedback or a suggestion? Email us at{" "}
          <a href={`mailto:${config.contact_email}`} className="text-primary hover:underline">
            {config.contact_email}
          </a>
          .
        </p>
        <div className="mt-4">
          <Link
            href="/emergency"
            className="inline-flex items-center rounded-lg bg-emergency px-4 py-2 text-white hover:bg-emergency/90"
          >
            View Emergency Guide
          </Link>
        </div>
      </section>
    </div>
  );
}
