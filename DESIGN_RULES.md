# Creatabl Design Rules
## DO NOT MODIFY without explicit request

Source : design system Creatabl.ia (`design-system/`, version interactive :
https://claude.ai/artifact/4MbDbLwEx4iNcghpSo3EKf). Les tokens sont appliqués
dans `app/globals.css`.

### Colors
- Primary (actions, boutons) : #7225E3
- Primary light (fonds doux, élément actif) : #F3EEFD
- Primary dark (survol) : #5B1BB8
- Accent plateforme (barre latérale active, graphiques, compteurs) : #7C3AED
- Dégradé #7225E3 → #8A38F5 : boutons principaux uniquement
- Text : gray-900 (#14121F) / gray-600 (#4B4B63) / gray-500 (#6B6780, minimum pour du texte)
- Background : white / gray-50 (#F8F7FC)
- Bordures : #E8E6F0 (décoratives) / #878399 (champs, 3:1)
- Sémantiques : succès #0E7445 sur #E7F6EE, alerte #8A4B00 sur #FDF2DF,
  erreur #B42318 sur #FDECEA, info #1F5BB8 sur #E9F0FC

### Typography
- Titres : Outfit 600/700 (`font-heading`) ; texte : Inter 400/500/600 (`font-sans`)
- H1 (page title): text-2xl font-bold
- H2 (section): text-xl font-semibold
- H3 (card title): text-base font-semibold
- Body: text-sm text-gray-600
- Caption: text-xs text-gray-500
- Italic subtitle: text-sm italic text-[#7225E3] (Playfair Display, un seul mot par titre)

### Components
- All cards: rounded-2xl (12px)
- All buttons: rounded-full (pilule)
- Ombres : deux niveaux seulement (shadow-sm pour ce qui est posé, shadow-lg pour ce qui flotte)
- Page padding: p-8
- Card padding: p-6
- Crédits : 1 crédit = 1 post programmé ou publié (Free 20, Starter 50, Pro 120, Business 300)

### LOCKED — Never change without explicit instruction:
- Sidebar structure and colors
- Trial banner position and color
- Plan card layout (Starter/Pro/Business)
- Navigation items and order
- Logo "Creatabl.ia" style (symbole officiel `public/logo.png` + « Creatabl. » Outfit + « ia » Playfair italique violet)
