import { cva, type VariantProps } from "class-variance-authority";
import { type HTMLAttributes, type ReactNode, forwardRef } from "react";

import { cn } from "@/lib/utils";

const cardVariants = cva("border border-border bg-card transition-shadow", {
  variants: {
    variant: {
      default: "rounded-xl p-6",
      feature: "rounded-xl p-8 shadow-card",
      compact: "rounded-lg p-4",
      dark: "rounded-xl border-brand-dark-900 bg-brand-dark-900 p-6 text-primary-foreground",
      cream: "rounded-xl border-canvas-cream bg-canvas-cream p-6",
      interactive: "rounded-xl p-6 hover:shadow-card",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export interface CardProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  children: ReactNode;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(cardVariants({ variant }), className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";
