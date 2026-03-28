"use client";

import { useState } from "react";

export interface TemplateInfo {
  id: string;
  name: string;
  description: string;
  preview: string;
  tags: string[];
}

const TEMPLATES: TemplateInfo[] = [
  {
    id: "HeroPromo",
    name: "Hero Promo",
    description: "Vidéo promotionnelle avec titre accrocheur, fonctionnalités et appel à l'action.",
    preview: "linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)",
    tags: ["Marketing", "Produit", "Lancement"],
  },
  {
    id: "Testimonial",
    name: "Témoignage",
    description: "Mettez en valeur les avis clients avec citations, avatars et notes étoiles.",
    preview: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    tags: ["Social Proof", "Avis", "Client"],
  },
  {
    id: "EcommerceShowcase",
    name: "E-commerce",
    description: "Showcase produit avec grille carousel, prix et bouton d'achat.",
    preview: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    tags: ["E-commerce", "Produit", "Vente"],
  },
  {
    id: "Educational",
    name: "Éducatif",
    description: "Tutoriel pas à pas avec barre de progression et étapes numérotées.",
    preview: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    tags: ["Formation", "Tutoriel", "Étapes"],
  },
  {
    id: "SaasLaunch",
    name: "SaaS Launch",
    description: "Lancement de produit tech avec maquettes, features et call-to-action moderne.",
    preview: "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
    tags: ["SaaS", "Tech", "Startup"],
  },
  {
    id: "CinematicPromo",
    name: "✨ Cinematic Pro",
    description: "Motion design de qualité supérieure : particules flottantes, typographie cinétique, transitions fluides et effets de lueur.",
    preview: "linear-gradient(135deg, #6C63FF 0%, #3D37B5 50%, #C77DFF 100%)",
    tags: ["Premium", "Cinématique", "Motion Design"],
  },
];

interface Props {
  selected: string;
  onSelect: (templateId: string) => void;
}

export default function TemplateSelector({ selected, onSelect }: Props) {
  return (
    <div>
      <label className="block text-sm text-gray-400 mb-3">Template vidéo</label>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {TEMPLATES.map((tpl) => (
          <button
            key={tpl.id}
            type="button"
            onClick={() => onSelect(tpl.id)}
            className={`text-left rounded-xl border-2 overflow-hidden transition-all ${
              selected === tpl.id
                ? "border-brand-500 ring-2 ring-brand-500/30 scale-[1.02]"
                : "border-dark-700 hover:border-gray-500"
            }`}
          >
            <div
              className="h-24 w-full flex items-center justify-center text-white font-bold text-lg"
              style={{ background: tpl.preview }}
            >
              {tpl.name}
            </div>
            <div className="p-3 bg-dark-800">
              <p className="text-xs text-gray-400 mb-2 line-clamp-2">{tpl.description}</p>
              <div className="flex flex-wrap gap-1">
                {tpl.tags.map((tag) => (
                  <span key={tag} className="text-[10px] bg-dark-700 text-gray-400 px-1.5 py-0.5 rounded">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export { TEMPLATES };
