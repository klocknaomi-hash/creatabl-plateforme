"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SignUpSuccess() {
  const router = useRouter();

  useEffect(() => {
    const plan = localStorage.getItem("selected_plan") || "starter";
    const billing = localStorage.getItem("selected_billing") || "monthly";
    localStorage.removeItem("selected_plan");
    localStorage.removeItem("selected_billing");
    router.push(`/api/stripe/create-checkout?plan=${plan}&billing=${billing}`);
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <h1 className="text-2xl font-bold">Inscription réussie !</h1>
        <p className="text-zinc-400">Redirection vers le paiement sécurisé...</p>
      </div>
    </div>
  );
}
