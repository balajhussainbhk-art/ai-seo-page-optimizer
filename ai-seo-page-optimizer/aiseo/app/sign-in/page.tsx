import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Sign In",
  alternates: { canonical: "/sign-in" },
};

export default function SignInPage() {
  return (
    <div className="mx-auto max-w-md px-6 py-24 text-center">
      <h1 className="font-display text-2xl text-ink">Accounts are coming soon</h1>
      <p className="mt-3 text-ink/60">
        You don&apos;t need an account to run a free page analysis today. Account sign-in, saved projects,
        and audit history are on the roadmap.
      </p>
      <ButtonLink href="/#analyze" variant="signal" className="mt-6">
        Analyze a page
      </ButtonLink>
    </div>
  );
}
