import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { PlanSelection } from "./plan-selection";

export default async function OnboardingPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  });

  if (user?.trialStartedAt) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Bienvenue sur Creatabl !</h1>
          <p className="text-xl text-gray-600">Choisis ton plan pour commencer ton essai gratuit de 7 jours.</p>
        </div>
        
        <PlanSelection />
      </div>
    </div>
  );
}
