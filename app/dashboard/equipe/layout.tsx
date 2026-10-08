import { Suspense } from "react";
import { TeamHeader } from "./team-header";

// Équipe : une seule entrée dans la sidebar. L'organisation est affichée à part,
// puis ses membres, ses invitations et ses projets en onglets.
export default function EquipeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto grid w-full max-w-screen-xl content-start gap-6">
      <Suspense fallback={null}>
        <TeamHeader />
      </Suspense>
      {children}
    </div>
  );
}
