import { cn } from "@/lib/utils";

interface DisclaimerProps {
  className?: string;
}

export function Disclaimer({ className }: DisclaimerProps) {
  return (
    <div
      className={cn(
        "rounded-lg bg-muted p-4 text-sm text-muted-foreground",
        className
      )}
    >
      <strong className="text-foreground">Important:{" "}</strong>
      PetPilot provides general information only and is not a substitute for professional veterinary
      advice. If your pet is sick, injured, or may have eaten something toxic, contact your
      veterinarian or an animal poison control center immediately.
    </div>
  );
}
