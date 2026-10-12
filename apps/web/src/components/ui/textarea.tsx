import type { ComponentProps } from "react";
import { cn } from "../../lib/utils.js";
export function Textarea({ className, ...props }: ComponentProps<"textarea">) { return <textarea className={cn("field-input", className)} {...props} />; }
