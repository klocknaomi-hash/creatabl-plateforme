// lib/ai/utils.ts
// Utilitaires pour la génération de contenu IA - Creatabl

/**
 * Vérifie si le texte se termine par une ponctuation finale (. ! ?) ou un hashtag.
 * Si ce n'est pas le cas, c'est un indice fort de troncature par l'API.
 */
export function endsWithPunctuationOrHashtag(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return true;
  
  // Se termine par ., !, ?, ou un hashtag (ex: #creative, #entrepreneur, #marketing_digital)
  // en acceptant les espaces ou sauts de ligne à la fin.
  return /[.!?]\s*$/.test(trimmed) || /#[a-zA-Z0-9_À-ÿ-]+\s*$/.test(trimmed);
}

/**
 * Tronque proprement le texte à la dernière phrase complète ou au dernier hashtag complet.
 * Évite de renvoyer un mot coupé ou une phrase inachevée en cas de troncature.
 */
export function truncateToLastCompleteSentence(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return "";

  // Recherche du dernier index d'une ponctuation de phrase (. ! ?)
  const lastPunc = Math.max(
    trimmed.lastIndexOf('.'),
    trimmed.lastIndexOf('!'),
    trimmed.lastIndexOf('?')
  );

  // Recherche du dernier index d'un hashtag complet
  const hashtagRegex = /#[a-zA-Z0-9_À-ÿ-]+/g;
  let lastHashtagEnd = -1;
  let match;
  while ((match = hashtagRegex.exec(trimmed)) !== null) {
    lastHashtagEnd = match.index + match[0].length;
  }

  // La coupure se fait après le caractère de ponctuation ou à la fin du hashtag
  const cutIndex = Math.max(lastPunc + 1, lastHashtagEnd);
  
  if (cutIndex > 0) {
    return trimmed.substring(0, cutIndex).trim();
  }

  return trimmed;
}
