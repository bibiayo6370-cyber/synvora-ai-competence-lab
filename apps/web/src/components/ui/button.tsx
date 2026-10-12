import type { ComponentProps } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils.js";
const variants = cva("button", { variants: { variant: { default: "button-primary", outline: "button-outline" } }, defaultVariants: { variant: "default" } });
export function Button({ className, variant, asChild = false, type = "button", ...props }: ComponentProps<"button"> & VariantProps<typeof variants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return <Comp type={type} className={cn(variants({ variant }), className)} {...props} />;
}
