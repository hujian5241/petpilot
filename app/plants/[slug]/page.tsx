import { notFound } from "next/navigation";

import { PlantDetail } from "@/components/plant/PlantDetail";
import { getPlantBySlug, getPlantSlugs } from "@/lib/content";
import { buildPlantMetadata } from "@/lib/metadata";

interface PlantPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await getPlantSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PlantPageProps) {
  const { slug } = await params;
  const plant = await getPlantBySlug(slug);
  if (!plant) return {};
  return buildPlantMetadata(plant);
}

export default async function PlantPage({ params }: PlantPageProps) {
  const { slug } = await params;
  const plant = await getPlantBySlug(slug);

  if (!plant) {
    notFound();
  }

  return <PlantDetail plant={plant} />;
}
