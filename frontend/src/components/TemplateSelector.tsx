"use client";

import { useState } from "react";

const TEMPLATES = [
  {
    id: "LuxuryAd",
    name: "Luxury Ad",
    desc: "Publicité haut de gamme avec effets dorés, particules et animations premium.",
    gradient: "linear-gradient(135deg, #92400e, #d97706, #92400e)",
    tags: ["Luxe", "Premium", "Marque"],
    duration: "15s",
    format: "16:9",
    icon: "👑",
  },
  {
    id: "DynamicProduct",
    name: "Dynamic Product",
    desc: "Vidéo produit dynamique avec effets glitch, néon et transitions énergiques.",
    gradient: "linear-gradient(135deg, #0c4a6e, #06b6d4, #7c3aed)",
    tags: ["Produit", "Tech", "Moderne"],
    duration: "20s",
    format: "16:9",
    icon: "⚡",
  },
  {
    id: "SocialMediaBurst",
    name: "Social Media Burst",
    desc: "Contenu viral pour Reels et TikTok avec énergie maximale et effets pop.",
    gradient: "linear-gradient(135deg, #9d174d, #f43f5e, #7c3aed)",
    tags: ["Reels", "TikTok", "Viral"],
    duration: "15s",
    format: "9:16",
    icon: "🔥",
  },
  {
    id: "CinematicBrand",
    name: "Cinematic Brand",
    desc: "Identité de marque cinématographique avec letterbox, orbes et atmosphère premium.",
    gradient: "linear-gradient(135deg, #1e3a5f, #4a90e2, #1e3a5f)",
    tags: ["Marque", "Cinéma", "Haut de gamme"],
    duration: "25s",
    format: "16:9",
    icon: "🎬",
  },
  {
    id: "CinematicPromo",
    name: "Cinematic Promo",
    desc: "Motion design de niveau agence avec particules, morphing et transitions fluides.",
    gradient: "linear-gradient(135deg, #4c1d95, #8b5cf6, #06b6d4)",
    tags: ["Agence", "Pro", "Promo"],
    duration: "20s",
    format: "16:9",
    icon: "✨",
  },
  {
    id: "HeroPromo",
    name: "Hero Promo",
    desc: "Promotions percutantes avec animations fluides, CTA fort et visuels impactants.",
    gradient: "linear-gradient(135deg, #4c1d95, #7c3aed, #a855f7)",
    tags: ["Promo", "CTA", "Lancement"],
    duration: "20s",
    format: "16:9",
    icon: "🚀",
  },
  {
    id: "EcommerceShowcase",
    name: "E-commerce Showcase",
    desc: "Showcase produit avec carousel animé, prix et bouton d'achat dynamique.",
    gradient: "linear-gradient(135deg, #831843, #f093fb, #f5576c)",
    tags: ["Boutique", "Vente", "Produit"],
    duration: "20s",
    format: "16:9",
    icon: "🛍️",
  },
  {
    id: "Testimonial",
    name: "Testimonial",
    desc: "Avis clients avec photo, étoiles animées et citation percutante.",
    gradient: "linear-gradient(135deg, #1e1b4b, #667eea, #764ba2)",
    tags: ["Avis", "Social proof", "Confiance"],
    duration: "20s",
    format: "16:9",
    icon: "⭐",
  },
  {
    id: "SaasLaunch",
    name: "SaaS Launch",
    desc: "Lancement de produit tech avec maquettes animées, features et CTA fort.",
    gradient: "linear-gradient(135deg, #1e1b4b, #a18cd1, #fbc2eb)",
    tags: ["SaaS", "Startup", "Tech"],
    duration: "25s",
    format: "16:9",
    icon: "💻",
  },
  {
    id: "Educational",
    name: "Educational",
    desc: "Contenu pédagogique avec étapes animées, icônes et explications claires.",
    gradient: "linear-gradient(135deg, #0c4a6e, #4facfe, #00f2fe)",
    tags: ["Formation", "Tuto", "Éducation"],
    duration: "30s",
    format: "16:9",
    icon: "📚",
  },
];

interface TemplateSelectorProps {
  value?: string;
  onChange?: (id: string) => void;
  selected?: string;
  onSelect?: (id: string) => void;
}

export default function TemplateSelector({ value, onChange, selected, onSelect }: TemplateSelectorProps) {
  const activeValue = value ?? selected ?? "";
  const handleChange = onChange ?? onSelect ?? (() => {});
  const [hovered, setHovered] = useState<string | null>(null);
  const [filterTag, setFilterTag] = useState<string>("Tous");

  const allTags = ["Tous", "Luxe", "Produit", "Social", "Marque", "Promo", "SaaS", "Formation"];
  const filtered = filterTag === "Tous"
    ? TEMPLATES
    : TEMPLATES.filter(t => t.tags.some(tag => tag.toLowerCase().includes(filterTag.toLowerCase())));

  return (
    <div className="space-y-5">
      {/* Filtres par tag */}
      <div className="flex flex-wrap gap-2">
        {allTags.map(tag => (
          <button key={tag} onClick={() => setFilterTag(tag)}
            className="text-xs px-3 py-1.5 rounded-full border transition-all font-medium"
            style={{
              background: filterTag === tag ? "rgba(139,92,246,0.15)" : "transparent",
              borderColor: filterTag === tag ? "rgba(139,92,246,0.5)" : "rgba(255,255,255,0.08)",
              color: filterTag === tag ? "#a78bfa" : "#64748b",
            }}>
            {tag}
          </button>
        ))}
      </div>

      {/* Grille templates */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filtered.map(t => {
          const isSelected = activeValue === t.id;
          const isHovered = hovered === t.id;
          return (
            <button key={t.id}
              onMouseEnter={() => setHovered(t.id)}
              onMouseLeave={() => setHovered(null)}
              className="relative text-left rounded-2xl overflow-hidden transition-all duration-300 group"
              onClick={() => handleChange(t.id)}
              style={{
                border: isSelected
                  ? "2px solid rgba(139,92,246,0.8)"
                  : "2px solid rgba(255,255,255,0.06)",
                boxShadow: isSelected
                  ? "0 0 30px rgba(139,92,246,0.3)"
                  : isHovered ? "0 8px 30px rgba(0,0,0,0.4)" : "none",
                transform: isHovered && !isSelected ? "translateY(-2px)" : "none",
              }}>
              {/* Thumbnail */}
              <div className="h-24 relative overflow-hidden" style={{ background: t.gradient }}>
                {/* Effet brillance */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.12), transparent)" }} />
                {/* Icône centrale */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-3xl group-hover:scale-110 transition-transform duration-300">{t.icon}</div>
                </div>
                {/* Particules */}
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="absolute w-1 h-1 rounded-full bg-white/40"
                    style={{ left: `${20 + i * 30}%`, top: `${30 + i * 15}%`, animation: `float ${2+i}s ease-in-out infinite`, animationDelay: `${i*0.4}s` }} />
                ))}
                {/* Format badge */}
                <div className="absolute top-2 right-2 text-[9px] px-1.5 py-0.5 rounded bg-black/50 text-white/70 backdrop-blur-sm">
                  {t.format} · {t.duration}
                </div>
                {/* Selected check */}
                {isSelected && (
                  <div className="absolute top-2 left-2 w-5 h-5 rounded-full flex items-center justify-center text-[10px]"
                    style={{ background: "#8b5cf6", boxShadow: "0 0 10px rgba(139,92,246,0.8)" }}>
                    ✓
                  </div>
                )}
              </div>

              {/* Infos */}
              <div className="p-3" style={{ background: isSelected ? "rgba(139,92,246,0.08)" : "rgba(15,23,42,0.8)" }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-sm text-white">{t.name}</span>
                </div>
                <p className="text-[11px] text-dark-300 mb-2 line-clamp-2 leading-relaxed">{t.desc}</p>
                <div className="flex flex-wrap gap-1">
                  {t.tags.slice(0, 2).map(tag => (
                    <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded-full"
                      style={{ background: "rgba(139,92,246,0.1)", color: "#a78bfa", border: "1px solid rgba(139,92,246,0.2)" }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Template sélectionné */}
      {activeValue && (
        <div className="flex items-center gap-3 p-3 rounded-xl"
          style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.2)" }}>
          <span className="text-brand-400 text-sm">✓</span>
          <span className="text-sm text-dark-200">
            Template sélectionné : <strong className="text-white">{TEMPLATES.find(t => t.id === activeValue)?.name}</strong>
          </span>
        </div>
      )}
    </div>
  );
}
