"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export interface CheckboxProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, ...props }, ref) => {
    const [checked, setChecked] = React.useState(false);

    return (
      <div className="relative">
        <input
          type="checkbox"
          ref={ref}
          className="sr-only peer"
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
          {...props}
        />
        <div
          onClick={() => setChecked(!checked)}
          className={cn(
            "h-4 w-4 shrink-0 rounded border border-primary-300 cursor-pointer transition-all duration-200 flex items-center justify-center",
            checked
              ? "bg-primary-700 border-primary-700"
              : "bg-white hover:border-primary-400",
            className
          )}
        >
          {checked && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
        </div>
      </div>
    );
  }
);
Checkbox.displayName = "Checkbox";

export { Checkbox };
