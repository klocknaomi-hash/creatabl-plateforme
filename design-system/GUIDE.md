Creatabl.ia est une plateforme SaaS française qui crée, planifie et analyse les publications d'une marque sur Instagram, Facebook, LinkedIn, X et TikTok. L'interface est claire, précise et un peu éditoriale : fond blanc, beaucoup d'air, un violet franc réservé à l'action, une touche de serif italique dans les titres. Thème clair uniquement.

## Contenu et ton

- Tout est en français, vouvoiement. Phrases courtes, actives, concrètes : « Programmez un mois de posts en une heure », pas « Boostez votre présence digitale ».
- Les boutons disent ce qui se passe : « Programmer », « Importer 2 designs », « Générer une semaine ». Après l'action, une confirmation au participe : « Publication programmée ».
- Casse de phrase partout (« Comptes connectés », pas « Comptes Connectés »). Les sur-titres `overline` sont les seuls en capitales, via `text-transform`.
- Typographie française : espace insécable avant `: ; ? ! %` et `€`, guillemets « … », milliers séparés par une espace (« 48 230 »), virgule décimale (« 4,7 % »), heures « 9 h 30 » dans le texte et « 09:30 » dans les champs.
- Les erreurs disent quoi faire : « Le texte dépasse 280 caractères. Raccourcissez-le puis relancez. » Pas d'excuses, pas de « Oups ».
- Aucun emoji dans l'interface ni dans le site. Les emojis n'existent que dans le contenu des posts écrits par l'utilisateur.
- Le produit s'appelle « Creatabl » dans les phrases (« Creatabl publie à votre place ») et « Creatabl.ia » dans le logo. L'assistant s'appelle « Agent IA ». Les styles d'écriture proposés sont Professionnel, Storytelling et Viral.
- Offre : Free (20 crédits), Starter 49 € (50 crédits), Pro 99 € (120 crédits, le plus populaire), Business 199 € (300 crédits) par mois ; 39 €, 79 €, 159 € en annuel. 14 jours d'essai sur les plans payants.
- Crédits : 1 crédit = 1 post programmé ou publié, brouillons gratuits, renouvelés le 1er du mois. Dites toujours « crédits », jamais « tokens » ni « générations ».
- Les chiffres affichés sont réels ou absents : un nouveau compte voit « — » et « Pas encore de données », jamais des statistiques d'exemple.

## Couleur

- Fond de page `white`. Sections alternées et fond de l'application en `surface`. Texte principal `ink`, texte secondaire `ink-muted`, tertiaire (placeholders, horodatages) `ink-subtle` : jamais plus clair pour du texte.
- `violet-600` est la couleur d'action : boutons principaux, liens, focus, onglet actif. Dans l'application connectée, l'élément actif de la barre latérale, les barres de progression et les graphiques prennent `violet-platform`.
- Les teintes `violet-50` et `violet-100` servent aux fonds doux (tag sélectionné, pastille d'icône, bannière d'essai). Texte violet sur teinte : `violet-700`.
- **Dégradé** : `--gradient-cta` (`violet-600` vers `violet-500`, 135°) uniquement sur le bouton principal, la bande du hero et le bloc CTA final. Jamais en fond de page, jamais en arc-en-ciel, jamais mélangé à du bleu.
- Sémantique douce : texte `success-600|warning-600|error-600|info-600` sur `*-50`. Chaque statut porte aussi un mot et une icône.
- `border` (#E8E6F0) est décorative ; le contour d'un champ ou d'un interrupteur utilise `border-control` (3,7:1).
- Contrastes vérifiés (AA) : `ink` sur `surface` 17,3:1, `ink-muted` sur `surface` 7,9:1, `ink-subtle` sur `surface` 5,1:1, blanc sur `violet-600` 6,8:1, blanc sur `violet-500` 5,3:1, `violet-700` sur `violet-50` 8,0:1, `on-ink-muted` sur `ink` 9,3:1.
- Les logos des réseaux gardent leurs couleurs officielles. Les aperçus Instagram/Facebook reprennent les gris et la typographie système de chaque réseau.

## Typographie

- Titres en Outfit (`font-display`) 600 ou 700 : `h1` 56/64, `h2` 40/48, `h3` 28/36, `h4` 20/28 (titres de cartes). Interlettrage légèrement resserré sur les grands titres.
- Texte en Inter (`font-text`) 400/500/600 : `body` 16/26, `small` 14/22 (taille de base de l'application), `caption` 12/18, `lead` 18/28 sous un titre.
- Accent éditorial : `cr-accent` (Playfair Display italique 500, `violet-600`), **un mot au maximum par titre**, à la taille du titre. Jamais dans un paragraphe, un bouton ou l'application connectée (sauf écrans d'accueil).
- Lignes de texte limitées à environ 65 caractères. Titres en `text-wrap: balance`.
- Polices Google Fonts : `Outfit:wght@500;600;700`, `Inter:wght@400;500;600`, `Playfair Display:ital,wght@1,500`.

## Espacement et mise en page

- Grille de 8 px : `space-1` (8) à `space-12` (96). `space-0-5` (4) seulement pour des ajustements optiques.
- Site : contenu dans `container` (1200px) avec 24px de gouttière, sections séparées de `space-12` (96px), titre de section à `space-6` (48px) de son contenu. Sur mobile, sections à `space-8`.
- Application : barre latérale 248px, barre du haut 64px, contenu avec 32px de marge, cartes espacées de 24px.
- Varier les compositions : une section en tableau à trois colonnes, une en ligne d'étapes, une en grille irrégulière avec une grande carte. Pas deux sections de suite faites de cartes identiques.

## Formes, bordures et ombres

- `radius-md` (12px) pour cartes, champs, modales, aperçus. `radius-pill` (999px) pour boutons, tags, badges, interrupteurs, recherche. `radius-sm` (8px) pour vignettes et éléments de menu.
- Une carte posée sur la page a une bordure `border` et **pas d'ombre**. `shadow-1` : bouton principal, aperçu de publication. `shadow-2` : ce qui flotte (menus, modales, vidéo du hero, carte tarif mise en avant). Pas d'autre niveau.
- Pas de liseré coloré sur le côté des cartes, pas de cartes toutes identiques avec ombre.

## États et focus

- Focus clavier : anneau plein 2px `focus-ring` décalé de 2px sur tout élément interactif ; champs : bordure `violet-600` + halo 3px `violet-100`.
- Survol : bouton principal passe en `violet-600` uni, secondaire en `surface`, éléments de liste en `violet-50`.
- Désactivé : fond `surface`, texte `ink-subtle`, curseur interdit, et la raison écrite à côté.
- Chargement : `aria-busy="true"`, icône qui tourne, libellé au participe (« Publication… »).
- Animations courtes (150–200ms) et coupées sous `prefers-reduced-motion`.

## Iconographie

- Icônes Lucide au trait 1,75px, angles arrondis, en `currentColor` ; 20px par défaut, 16px dans les tags, 18px dans les boutons. Jamais d'emoji comme icône.
- `<span data-icon="calendar-days"></span>` puis `Creatabl.hydrate()` (fourni par `components/bundle.js`, liste dans `Creatabl.icons`).
- Logos réseaux (Simple Icons) : `<span data-network="instagram|facebook|linkedin|x|tiktok|canva">`, ajoutez `data-mono` pour une version blanche sur `ink`. Fichiers SVG dans le groupe d'assets Reseaux.
- Illustrations d'états vides : géométrie au trait `ink`, aplats `violet-50`/`violet-100`, un seul accent `violet-600`, sans personnage.
- Logo : symbole soleil à 16 rayons (#8A38F5, asset `Logos/creatabl-mark.png`) + « Creatabl. » en Outfit 600 + « ia » en Playfair italique `violet-600`. Composant `Logo`, classe `cr-wordmark`. Ne jamais redessiner le symbole.

## Utiliser le système

- Chargez `tokens.css`, les trois polices Google, `components/bundle.css`, puis `components/bundle.js` (script classique, sans dépendance) et appelez `Creatabl.hydrate()` après avoir inséré du HTML.
- Les composants sont des classes CSS préfixées `cr-` : copiez le balisage de leur aperçu. `hydrate()` branche les interrupteurs (`role="switch"`), les onglets (`role="tablist"`, flèches clavier) et les boutons à bascule (`data-selectable`).
- Pages de référence : `HomePage` (site), `DashboardPage` (nouveau client, états vides) et `ComposerPage` (création de post avec aperçu).
