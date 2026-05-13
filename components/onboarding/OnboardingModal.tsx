"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, Upload, Check, Briefcase, User, Users, Globe } from "lucide-react";
import { CircularProgress } from "./CircularProgress";
import { 
  saveClientType, 
  createWorkspace, 
  saveWritingStyle, 
  saveGenderAgreement, 
  saveEmojiPreference, 
  completeOnboarding,
  updateOnboardingStep
} from "@/app/actions/onboarding";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

interface OnboardingModalProps {
  initialStep?: string | number;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ initialStep = 0 }) => {
  const { user, isLoaded } = useUser();
  const [step, setStep] = useState<number | string>(initialStep);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    clientType: "",
    workspaceName: "",
    logoUrl: "",
    writingTone: "",
    genderAgreement: "",
    emojiPreference: "",
  });
  const router = useRouter();

  // Sync step from clerk metadata if available
  useEffect(() => {
    if (isLoaded && user?.publicMetadata?.onboardingStep !== undefined) {
      const savedStep = user.publicMetadata.onboardingStep;
      if (savedStep === "done") return;
      if (typeof savedStep === "number" || savedStep === "final") {
         setStep(savedStep);
      }
    }
  }, [isLoaded, user]);

  if (!isLoaded || user?.publicMetadata?.onboardingStep === "done") return null;

  const handleNext = async () => {
    setLoading(true);
    try {
      if (step === 0) {
        setStep(1);
        await updateOnboardingStep(1).catch(console.error);
      } else if (step === 1) {
        if (formData.clientType) {
          await saveClientType(formData.clientType).catch(console.error);
        }
        setStep(2);
      } else if (step === 2) {
        setStep(3);
        await updateOnboardingStep(3).catch(console.error);
      } else if (step === 3) {
        await createWorkspace({ 
          name: formData.workspaceName, 
          logoUrl: formData.logoUrl || undefined,
          clientType: formData.clientType || undefined
        }).catch(console.error);
        setStep(4);
        await updateOnboardingStep(4).catch(console.error);
      } else if (step === 4) {
        if (formData.writingTone) {
          await saveWritingStyle(formData.writingTone).catch(console.error);
        }
        setStep(5);
        await updateOnboardingStep(5).catch(console.error);
      } else if (step === 5) {
        if (formData.genderAgreement) {
          await saveGenderAgreement(formData.genderAgreement).catch(console.error);
        }
        setStep(6);
        await updateOnboardingStep(6).catch(console.error);
      } else if (step === 6) {
        if (formData.emojiPreference) {
          await saveEmojiPreference(formData.emojiPreference).catch(console.error);
        }
        setStep("final");
      } else if (step === "final") {
        await completeOnboarding().catch(console.error);
        await user?.reload(); // refresh Clerk user object
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    if (step === 2) {
      setStep(3);
      await updateOnboardingStep(3);
    }
  };

  const getProgress = () => {
    if (step === 0) return 0;
    if (step === "final") return 100;
    const progressMap: Record<number, number> = {
      1: 14,
      2: 29,
      3: 43,
      4: 57,
      5: 71,
      6: 86,
    };
    return progressMap[step as number] || 0;
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="text-center space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Bienvenue 🎉</h1>
            <p className="text-gray-600 text-lg">
              Nous allons te poser quelques questions pour paramétrer l'IA avec ton style d'écriture et tes objectifs.
            </p>
            <p className="text-gray-400 text-sm">Durée estimée : 45 secondes.</p>
          </div>
        );
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">STEP 1/6</p>
              <h2 className="text-2xl font-bold text-gray-900">Quel profil te correspond le mieux ?</h2>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {[
                { id: "creator", title: "Créateur / Individuel", subtitle: "Créer et publier mes propres posts", icon: User },
                { id: "agency", title: "Agence", subtitle: "Gérer le contenu des réseaux de mes clients", icon: Briefcase },
                { id: "team", title: "Équipe", subtitle: "Aider mon équipe à publier sur les réseaux", icon: Users },
                { id: "other", title: "Autre", subtitle: "Autre profil", icon: Globe },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setFormData({ ...formData, clientType: opt.id })}
                  className={`flex items-center p-4 rounded-xl border-2 transition-all text-left ${
                    formData.clientType === opt.id
                      ? "border-[#534AB7] bg-[#534AB7]/5 text-[#534AB7]"
                      : "border-gray-100 hover:border-gray-200 bg-white text-gray-700"
                  }`}
                >
                  <div className={`p-2 rounded-lg mr-4 ${formData.clientType === opt.id ? "bg-[#534AB7] text-white" : "bg-gray-100 text-gray-500"}`}>
                    <opt.icon size={20} />
                  </div>
                  <div>
                    <p className="font-bold">{opt.title}</p>
                    <p className="text-sm opacity-70">{opt.subtitle}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">STEP 2/6</p>
              <h2 className="text-2xl font-bold text-gray-900">Personnalise l'IA</h2>
            </div>
            <p className="text-gray-600">
              Tu peux connecter tes réseaux sociaux pour importer ton style d'écriture, planifier tes posts et tracker tes métriques.
            </p>
            <div className="space-y-4 pt-4">
              <button 
                onClick={() => router.push("/dashboard/settings/connections")}
                className="w-full bg-[#534AB7] text-white py-4 rounded-xl font-bold hover:bg-[#453da3] transition-colors"
              >
                Connecter mes réseaux
              </button>
              <button 
                onClick={handleSkip}
                className="w-full text-gray-500 underline text-sm hover:text-gray-700 transition-colors"
              >
                Le faire plus tard
              </button>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">STEP 3/6</p>
              <h2 className="text-2xl font-bold text-gray-900">Ton workspace</h2>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Comment s'appelle ton workspace ?
                </label>
                <input
                  type="text"
                  placeholder="Ex : Mon agence, Studio Léa, Marque perso..."
                  value={formData.workspaceName}
                  onChange={(e) => setFormData({ ...formData, workspaceName: e.target.value })}
                  className="w-full p-4 rounded-xl border border-gray-200 focus:border-[#534AB7] focus:ring-1 focus:ring-[#534AB7] outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Ajoute un logo (optionnel)
                </label>
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-xl bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                    {formData.logoUrl ? (
                      <img src={formData.logoUrl} className="w-full h-full object-cover" alt="Logo" />
                    ) : (
                      <Upload size={20} className="text-gray-300" />
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <input
                      type="file"
                      id="logo-upload"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setFormData({ ...formData, logoUrl: reader.result as string });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => document.getElementById('logo-upload')?.click()}
                      className="text-sm text-[#534AB7] font-bold hover:underline text-left"
                    >
                      Importer une image
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, logoUrl: "" });
                        const input = document.getElementById('logo-upload') as HTMLInputElement;
                        if (input) input.value = "";
                      }}
                      className="text-xs text-gray-400 hover:text-gray-600 text-left"
                    >
                      Passer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">STEP 4/6</p>
              <h2 className="text-2xl font-bold text-gray-900">Ton style d'écriture</h2>
            </div>
            <div className="grid grid-cols-1 gap-3">
              <label className="text-sm font-medium text-gray-700">Quel ton utilises-tu dans tes posts ?</label>
              {[
                { id: "professional", title: "Professionnel", subtitle: "Sérieux, structuré, crédible" },
                { id: "inspiring", title: "Inspirant", subtitle: "Motivant, positif, humain" },
                { id: "direct", title: "Direct", subtitle: "Court, percutant, sans détour" },
                { id: "casual", title: "Décontracté", subtitle: "Naturel, accessible, sympathique" },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setFormData({ ...formData, writingTone: opt.id })}
                  className={`flex items-center p-4 rounded-xl border-2 transition-all text-left ${
                    formData.writingTone === opt.id
                      ? "border-[#534AB7] bg-[#534AB7]/5 text-[#534AB7]"
                      : "border-gray-100 hover:border-gray-200 bg-white text-gray-700"
                  }`}
                >
                  <div className="flex-1">
                    <p className="font-bold">{opt.title}</p>
                    <p className="text-sm opacity-70">{opt.subtitle}</p>
                  </div>
                  {formData.writingTone === opt.id && <Check size={20} />}
                </button>
              ))}
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-6">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">STEP 5/6</p>
              <h2 className="text-2xl font-bold text-gray-900">Paramètres des posts</h2>
            </div>
            <div className="space-y-4">
              <label className="text-sm font-medium text-gray-700">Quel accord de genre souhaites-tu employer dans tes posts ?</label>
              <div className="space-y-2">
                {[
                  { id: "female", title: "Féminin" },
                  { id: "male", title: "Masculin" },
                  { id: "none", title: "Pas de préférence" },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setFormData({ ...formData, genderAgreement: opt.id })}
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                      formData.genderAgreement === opt.id
                        ? "border-[#534AB7] bg-[#534AB7]/5 text-[#534AB7]"
                        : "border-gray-100 hover:border-gray-200 bg-white text-gray-700"
                    }`}
                  >
                    <p className="font-bold">{opt.title}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );
      case 6:
        return (
          <div className="space-y-6">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">STEP 6/6</p>
              <h2 className="text-2xl font-bold text-gray-900">Paramètres des posts</h2>
            </div>
            <div className="space-y-4">
              <label className="text-sm font-medium text-gray-700">Quelle est ta préférence en nombre d'émojis par post ?</label>
              <div className="space-y-2">
                {[
                  { id: "none", title: "Aucun" },
                  { id: "moderate", title: "Modéré (1 à 4)" },
                  { id: "lots", title: "Beaucoup (4+)" },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setFormData({ ...formData, emojiPreference: opt.id })}
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                      formData.emojiPreference === opt.id
                        ? "border-[#534AB7] bg-[#534AB7]/5 text-[#534AB7]"
                        : "border-gray-100 hover:border-gray-200 bg-white text-gray-700"
                    }`}
                  >
                    <p className="font-bold">{opt.title}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );
      case "final":
        return (
          <div className="text-center space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Paramétrage terminé</h1>
            <p className="text-gray-600 text-lg">
              Tu pourras modifier tes paramètres d'écriture quand tu le souhaites.
            </p>
            <div className="flex justify-center py-4">
               <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                  <Check size={40} />
               </div>
            </div>
          </div>
        );
    }
  };

  const isNextDisabled = () => {
    if (step === 3 && !formData.workspaceName) return true;
    return false;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl relative"
      >
        {/* Header */}
        <div className="px-8 pt-8 flex justify-between items-start">
          <div>
            {step !== 0 && step !== "final" && (
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                STEP {step}/6
              </p>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {step !== 0 && (
               <CircularProgress percentage={getProgress()} />
            )}
            {step !== 0 && (
              <button 
                onClick={() => completeOnboarding().then(() => router.refresh())}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="px-8 py-10 min-h-[400px] flex flex-col justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-8 pb-8">
          {step !== 2 && (
            <button
              onClick={handleNext}
              disabled={loading || isNextDisabled()}
              className={`w-full flex items-center justify-center py-4 rounded-xl font-bold text-lg transition-all ${
                isNextDisabled()
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-[#534AB7] text-white hover:bg-[#453da3] shadow-lg shadow-[#534AB7]/20"
              }`}
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {step === "final" ? "Valider" : "Suivant"}
                  <ChevronRight size={20} className="ml-2" />
                </>
              )}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
