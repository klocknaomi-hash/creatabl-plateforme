"use client";

import React from "react";
import { NETWORKS } from "@/components/ds/NetworkLogo";

// Logos des réseaux : mêmes tracés officiels (Simple Icons) que le site et que
// NetworkLogo. Ils prennent la couleur du texte (currentColor) : la couleur de
// marque, le blanc sur fond sombre ou violet, ou le gris d'un compte déconnecté.
type IconProps = { className?: string };

function glyph(name: keyof typeof NETWORKS) {
  const Icon = ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false" className={className}>
      <path d={NETWORKS[name].path} />
    </svg>
  );
  Icon.displayName = `${NETWORKS[name].label}Icon`;
  return Icon;
}

export const InstagramIcon = glyph("instagram");
export const LinkedinIcon = glyph("linkedin");
export const FacebookIcon = glyph("facebook");
export const TwitterIcon = glyph("x");
export const YoutubeIcon = glyph("youtube");
export const TiktokIcon = glyph("tiktok");
export const PinterestIcon = glyph("pinterest");

export function CanvaIcon({ size, className }: { size?: number; className?: string }) {
  const s = size || 24;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" aria-hidden="true" focusable="false" className={className}>
      <path fill={NETWORKS.canva.color} d={NETWORKS.canva.path} />
    </svg>
  );
}
