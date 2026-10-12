import type { ComponentProps } from "react";
import { cn } from "../../lib/utils.js";
export function Alert({ className, ...props }: ComponentProps<"div">) { return <div role="alert" className={cn("notice notice-error", className)} {...props} />; }
