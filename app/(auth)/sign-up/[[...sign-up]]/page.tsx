"use client";

import { SignUp } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";

function PlanTracker() {
  const searchParams = useSearchParams();
  const plan = searchParams.get("plan") || "starter";
  const billing = searchParams.get("billing") || "monthly";

  useEffect(() => {
    localStorage.setItem("selected_plan", plan);
    localStorage.setItem("selected_billing", billing);
  }, [plan, billing]);

  return null;
}

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <Suspense fallback={null}>
        <PlanTracker />
      </Suspense>
      <SignUp
        forceRedirectUrl="/sign-up/success"
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "bg-zinc-900 border border-zinc-800 shadow-xl",
            headerTitle: "text-zinc-100",
            headerSubtitle: "text-zinc-400",
            formButtonPrimary: "bg-indigo-600 hover:bg-indigo-500",
            formFieldLabel: "text-zinc-300",
            formFieldInput: "bg-zinc-800 border-zinc-700 text-zinc-100",
            footerActionText: "text-zinc-400",
            footerActionLink: "text-indigo-400 hover:text-indigo-300",
            socialButtonsBlockButton: "bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700",
            dividerText: "text-zinc-500",
            dividerLine: "bg-zinc-800",
          },
        }}
      />
    </div>
  );
}
