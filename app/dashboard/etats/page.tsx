import type { Metadata } from "next"
import { StatesGallery } from "./states-gallery"

export const metadata: Metadata = {
  title: "États de l'interface · Creatabl.ia",
}

// Revue des états du design system avec des données d'exemple : alertes, statuts,
// boutons, Network Tags, Post Cards, bannière d'essai, états vides, fonctions Business.
// Rien ici n'envoie de requête : c'est une vitrine, pas un écran de travail.
export default function EtatsPage() {
  return <StatesGallery nowIso={new Date().toISOString()} />
}
