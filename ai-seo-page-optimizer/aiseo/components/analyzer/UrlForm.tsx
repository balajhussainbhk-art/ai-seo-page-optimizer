"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface UrlFormProps {
  onSubmit: (url: string) => void;
  disabled?: boolean;
}

function isLikelyValidUrl(value: string): boolean {
  if (!/^https?:\/\//i.test(value)) return false;
  try {
    // eslint-disable-next-line no-new
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

export function UrlForm({ onSubmit, disabled }: UrlFormProps) {
  const [value, setValue] = useState("");
  const [touched, setTouched] = useState(false);

  const valid = isLikelyValidUrl(value.trim());

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (!valid || disabled) return;
    onSubmit(value.trim());
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <label htmlFor="page-url" className="sr-only">
            Webpage URL to analyze
          </label>
          <input
            id="page-url"
            type="text"
            inputMode="url"
            autoComplete="off"
            spellCheck={false}
            placeholder="https://example.com/product-page"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={() => setTouched(true)}
            disabled={disabled}
            className="w-full rounded-md border border-line bg-white px-4 py-3.5 text-[15px] text-ink placeholder:text-ink/35 focus:border-signal"
            aria-invalid={touched && !valid}
            aria-describedby="page-url-error"
          />
        </div>
        <Button type="submit" variant="signal" size="lg" disabled={disabled} className="shrink-0">
          Analyze My Page
          <ArrowRight size={16} />
        </Button>
      </div>
      <p id="page-url-error" className="mt-2 min-h-[1.25rem] text-sm text-score-bad">
        {touched && !valid && value.length > 0 ? "Please enter a valid public webpage URL." : ""}
      </p>
    </form>
  );
}
