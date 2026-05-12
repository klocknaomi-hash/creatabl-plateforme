import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { Check, Loader2 } from "lucide-react";

export default async function OnboardingPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  });

  // If already activated, go to dashboard
  if (user?.trialStartedAt) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <Check className="w-10 h-10 text-green-600" />
        </div>
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-gray-900">Abonnement activé !</h1>
          <p className="text-xl text-gray-600">
            Préparation de votre espace de travail...
          </p>
        </div>
        <div className="flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#7F77DD]" />
        </div>
        {/* Simple client-side redirect to dashboard after 2 seconds to allow webhook to fire */}
        <RedirectToDashboard />
      </div>
    </div>
  );
}

function RedirectToDashboard() {
  return (
    <script dangerouslySetInnerHTML={{
      __html: `
        localStorage.removeItem('selectedPlan');
        localStorage.removeItem('selectedBilling');
        localStorage.removeItem('selected_plan');
        localStorage.removeItem('selected_billing');
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 2000);
      `
    }} />
  );
}
