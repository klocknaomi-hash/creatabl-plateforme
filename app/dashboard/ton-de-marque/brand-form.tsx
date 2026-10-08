"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Check, CircleX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { saveBrandAction, type BrandInfo } from "./actions";

const TONES = [
  { id: "professional", title: "Professionnel", subtitle: "Sérieux, structuré, crédible" },
  { id: "inspiring", title: "Inspirant", subtitle: "Motivant, positif, humain" },
  { id: "direct", title: "Direct", subtitle: "Court, percutant, sans détour" },
  { id: "casual", title: "Décontracté", subtitle: "Naturel, accessible, sympathique" },
];
const GENDERS = [
  { id: "female", title: "Féminin" },
  { id: "male", title: "Masculin" },
  { id: "none", title: "Pas de préférence" },
];
const EMOJIS = [
  { id: "none", title: "Aucun" },
  { id: "moderate", title: "Modéré (1 à 4)" },
  { id: "lots", title: "Beaucoup (4 et plus)" },
];

type Style = { writingTone: string; genderAgreement: string; emojiPreference: string };

function Field({
  id, label, help, error, value, onChange, placeholder, type = "text",
}: {
  id: string; label: string; help?: string; error?: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  // Text Field du design system : libellé visible, aide en dessous, erreur explicite.
  return (
    <div className="cr-field">
      <label className="cr-label" htmlFor={id}>{label}</label>
      <input
        id={id}
        type={type}
        className="cr-input"
        value={value}
        placeholder={placeholder}
        aria-invalid={error ? true : undefined}
        aria-describedby={`${id}-help`}
        onChange={(e) => onChange(e.target.value)}
      />
      {error ? (
        <span id={`${id}-help`} className="cr-help cr-help--error"><CircleX size={16} aria-hidden="true" />{error}</span>
      ) : help ? (
        <span id={`${id}-help`} className="cr-help">{help}</span>
      ) : null}
    </div>
  );
}

function Choice({ legend, options, value, onChange }: { legend: string; options: { id: string; title: string; subtitle?: string }[]; value: string; onChange: (v: string) => void }) {
  return (
    <fieldset className="grid gap-2">
      <legend className="cr-label mb-2">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o.id}
            type="button"
            className="cr-net"
            aria-pressed={value === o.id}
            onClick={() => onChange(o.id)}
            title={o.subtitle}
          >
            {o.title}
            <span className="cr-tick"><Check size={16} aria-hidden="true" /></span>
          </button>
        ))}
      </div>
      {options.find((o) => o.id === value)?.subtitle && (
        <span className="cr-help">{options.find((o) => o.id === value)?.subtitle}</span>
      )}
    </fieldset>
  );
}

export function BrandForm({ initialBrand, initialStyle }: { initialBrand: BrandInfo; initialStyle: Style }) {
  const [brand, setBrand] = useState(initialBrand);
  const [style, setStyle] = useState(initialStyle);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof BrandInfo, string>>>({});

  const set = (k: keyof BrandInfo) => (v: string) => {
    setBrand((b) => ({ ...b, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  async function save() {
    setSaving(true);
    const res = await saveBrandAction({ brand, ...style });
    setSaving(false);
    if (res.success) {
      toast.success("Ton de marque enregistré");
    } else {
      if ("field" in res && res.field) setErrors({ [res.field]: res.error });
      toast.error(res.error ?? "Impossible d'enregistrer");
    }
  }

  return (
    <div className="grid gap-6">
      <section className="ap-panel" aria-labelledby="brand-info">
        <div className="ap-panel-head"><h2 id="brand-info">Informations de la marque</h2></div>
        <div className="ap-panel-body grid gap-5 sm:grid-cols-2">
          <Field id="brand-name" label="Nom de la marque" value={brand.brandName} onChange={set("brandName")} placeholder="Ex. Maison Lumen" help="Affiché dans vos rapports." />
          <Field id="brand-email" label="Adresse e-mail" type="email" value={brand.email} onChange={set("email")} placeholder="Ex. contact@maisonlumen.fr" error={errors.email} help="Pour les réponses et les rapports." />
          <Field id="brand-site" label="Lien du site" type="url" value={brand.website} onChange={set("website")} placeholder="Ex. https://maisonlumen.fr" error={errors.website} help="Utilisé dans vos publications si besoin." />
          <div className="cr-field sm:col-span-2">
            <label className="cr-label" htmlFor="brand-desc">
              Votre activité en quelques mots <small>{brand.description.length} / 500</small>
            </label>
            <textarea
              id="brand-desc"
              className="cr-textarea"
              rows={3}
              maxLength={500}
              value={brand.description}
              placeholder="Ex. Atelier de tissage lyonnais, pièces faites main pour la maison."
              onChange={(e) => set("description")(e.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="ap-panel" aria-labelledby="brand-style">
        <div className="ap-panel-head"><h2 id="brand-style">Style d&apos;écriture</h2></div>
        <div className="ap-panel-body grid gap-6">
          <Choice legend="Ton de vos posts" options={TONES} value={style.writingTone} onChange={(v) => setStyle((s) => ({ ...s, writingTone: v }))} />
          <Choice legend="Accord de genre" options={GENDERS} value={style.genderAgreement} onChange={(v) => setStyle((s) => ({ ...s, genderAgreement: v }))} />
          <Choice legend="Émojis par post" options={EMOJIS} value={style.emojiPreference} onChange={(v) => setStyle((s) => ({ ...s, emojiPreference: v }))} />
        </div>
      </section>

      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={() => { setBrand(initialBrand); setStyle(initialStyle); setErrors({}); }} disabled={saving}>
          Annuler
        </Button>
        <Button loading={saving} onClick={save} className="h-11 px-5 bg-[image:var(--gradient-cta)] hover:bg-[#7225E3] hover:bg-none">
          {saving ? "Enregistrement…" : "Enregistrer"}
        </Button>
      </div>
    </div>
  );
}
