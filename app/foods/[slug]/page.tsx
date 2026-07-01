import { notFound } from "next/navigation";

import { FoodDetail } from "@/components/food/FoodDetail";
import { getFoodBySlug, getFoodSlugs } from "@/lib/content";
import { buildFoodMetadata } from "@/lib/metadata";

interface FoodPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await getFoodSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: FoodPageProps) {
  const { slug } = await params;
  const food = await getFoodBySlug(slug);
  if (!food) return {};
  return buildFoodMetadata(food);
}

export default async function FoodPage({ params }: FoodPageProps) {
  const { slug } = await params;
  const food = await getFoodBySlug(slug);

  if (!food) {
    notFound();
  }

  return <FoodDetail food={food} />;
}
