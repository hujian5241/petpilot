export function SearchBarSkeleton({ size = "default" }: { size?: "default" | "large" }) {
  const sizeClasses = size === "large" ? "h-14" : "h-10";
  return (
    <div
      className={`w-full animate-pulse rounded-full bg-muted ${sizeClasses}`}
      aria-hidden="true"
    />
  );
}
