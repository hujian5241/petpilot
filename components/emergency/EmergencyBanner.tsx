import Link from "next/link";
import { Phone } from "lucide-react";

import { cn } from "@/lib/utils";
import { getEmergencyInfo } from "@/lib/content";

interface EmergencyBannerProps {
  variant?: "inline" | "card";
  className?: string;
}

export async function EmergencyBanner({
  variant = "inline",
  className,
}: EmergencyBannerProps) {
  const info = await getEmergencyInfo();
  const primary = info.hotlines[0];

  return (
    <div
      className={cn(
        "border-l-4 border-emergency bg-emergency-light p-4",
        variant === "card" && "rounded-lg border",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <Phone className="mt-0.5 h-5 w-5 shrink-0 text-emergency" aria-hidden="true" />
        <div>
          <p className="font-semibold text-emergency">Think your pet ate something toxic?</p>
          <p className="mt-1 text-sm text-foreground">
            Call {primary?.name ?? "ASPCA Poison Control"}:{" "}
            <a
              href={`tel:${primary?.phone?.replace(/\D/g, "") ?? "8884264435"}`}
              className="font-semibold text-emergency hover:underline"
            >
              {primary?.phone ?? "(888) 426-4435"}
            </a>
            {" "}or{" "}
            <Link href="/emergency" className="font-semibold text-emergency hover:underline">
              view emergency guide
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
