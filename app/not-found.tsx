import Link from "next/link";
import { Suspense } from "react";
import { Search, Phone, Home, AlertTriangle } from "lucide-react";

import { SearchBar } from "@/components/search/SearchBar";

export default function NotFoundPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6 lg:px-8">
      <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-muted">
        <AlertTriangle className="h-12 w-12 text-muted-foreground" />
      </div>

      <h1 className="mt-6 text-4xl font-bold tracking-tight text-foreground">
        Page not found
      </h1>
      <p className="mt-4 text-lg text-muted-foreground">
        We couldn&apos;t find the page you were looking for. Try searching for a food,
        plant, or browse our categories.
      </p>

      <div className="mt-8">
        <Suspense fallback={<div className="h-12 rounded-lg border border-border bg-muted" />}>
          <SearchBar size="large" />
        </Suspense>
      </div>

      <div className="mt-10 flex flex-wrap justify-center gap-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-white hover:bg-primary/90"
        >
          <Home className="h-4 w-4" />
          Go home
        </Link>
        <Link
          href="/search"
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-5 py-2.5 text-foreground hover:bg-muted"
        >
          <Search className="h-4 w-4" />
          Search
        </Link>
        <Link
          href="/emergency"
          className="inline-flex items-center gap-2 rounded-lg bg-emergency px-5 py-2.5 text-white hover:bg-emergency/90"
        >
          <Phone className="h-4 w-4" />
          Emergency
        </Link>
      </div>

      <div className="mt-12 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <strong className="block text-amber-950">If this is an emergency</strong>
        Contact your veterinarian or call{" "}
        <a href="tel:8884264435" className="font-semibold underline">ASPCA Poison Control (888) 426-4435</a>
        {" or "}
        <a href="tel:8557647661" className="font-semibold underline">Pet Poison Helpline (855) 764-7661</a>
        {" immediately."}
      </div>
    </div>
  );
}
