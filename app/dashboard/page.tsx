"use client";

export default function DashboardPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Dashboard
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <p className="text-sm text-gray-500 mb-1">Posts créés</p>
          <p className="text-3xl font-bold text-gray-900">0</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <p className="text-sm text-gray-500 mb-1">Réseaux connectés</p>
          <p className="text-3xl font-bold text-gray-900">0</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <p className="text-sm text-gray-500 mb-1">Plan actuel</p>
          <p className="text-3xl font-bold text-[#534AB7]">Business</p>
        </div>
      </div>
      <div className="bg-white border-2 border-dashed border-gray-200 
        rounded-2xl p-12 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-[#534AB7]/10 rounded-2xl flex 
          items-center justify-center mb-4">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" 
            stroke="#534AB7" strokeWidth="2">
            <path d="M12 5v14M5 12h14"/>
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Crée ton premier post
        </h2>
        <p className="text-gray-500 mb-6 max-w-sm">
          Connecte tes réseaux sociaux et génère ton premier contenu 
          avec l'IA en moins de 30 secondes.
        </p>
        <div className="flex gap-3">
          <a href="/dashboard/settings/connections"
            className="px-6 py-3 border border-[#534AB7] text-[#534AB7] 
            rounded-xl font-bold hover:bg-[#534AB7]/5 transition-colors">
            Connecter mes réseaux
          </a>
          <a href="/dashboard/compose"
            className="px-6 py-3 bg-[#534AB7] text-white rounded-xl 
            font-bold hover:bg-[#453da3] transition-colors">
            Créer un post
          </a>
        </div>
      </div>
    </div>
  );
}
