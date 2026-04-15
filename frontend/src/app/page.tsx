"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

// ── Composant Particules flottantes ──
function FloatingParticles() {
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 15 + 8,
    delay: Math.random() * 10,
    color: i % 3 === 0 ? "#8b5cf6" : i % 3 === 1 ? "#06b6d4" : "#f43f5e",
    opacity: Math.random() * 0.5 + 0.2,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: p.color,
            opacity: p.opacity,
            boxShadow: `0 0 ${p.size * 4}px ${p.color}`,
            animation: `float ${p.duration}s ease-in-out infinite`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

// ── Orbe lumineux animé ──
function GlowOrb({ x, y, size, color, delay = 0 }: { x: string; y: string; size: number; color: string; delay?: number }) {
  return (
    <div
      className="absolute rounded-full pointer-events-none"
      style={{
        left: x,
        top: y,
        width: size,
        height: size,
        background: `radial-gradient(circle, ${color}30 0%, ${color}10 40%, transparent 70%)`,
        filter: `blur(${size * 0.3}px)`,
        animation: `pulse-glow ${4 + delay}s ease-in-out infinite`,
        animationDelay: `${delay}s`,
        transform: "translate(-50%, -50%)",
      }}
    />
  );
}

// ── Composant Motion Preview (animation de démonstration) ──
function MotionPreview() {
  const [activeScene, setActiveScene] = useState(0);
  const scenes = [
    { label: "Hero", color: "#8b5cf6", text: "Votre Marque", sub: "Motion Design Pro" },
    { label: "Produit", color: "#06b6d4", text: "Nouveau Produit", sub: "Découvrez l'innovation" },
    { label: "Pub", color: "#f43f5e", text: "Offre Limitée", sub: "-50% aujourd'hui" },
    { label: "Brand", color: "#f59e0b", text: "Notre Vision", sub: "L'excellence redéfinie" },
  ];

  useEffect(() => {
    const t = setInterval(() => setActiveScene(s => (s + 1) % scenes.length), 2500);
    return () => clearInterval(t);
  }, []);

  const s = scenes[activeScene];

  return (
    <div className="relative w-full aspect-[9/16] max-w-[220px] mx-auto rounded-2xl overflow-hidden"
      style={{ boxShadow: `0 0 60px ${s.color}40, 0 20px 60px rgba(0,0,0,0.6)` }}>
      {/* Fond animé */}
      <div className="absolute inset-0 transition-all duration-700"
        style={{ background: `radial-gradient(ellipse at 50% 30%, ${s.color}40, #030712 70%)` }} />
      {/* Particules internes */}
      {[...Array(6)].map((_, i) => (
        <div key={i} className="absolute rounded-full"
          style={{
            width: 4 + i * 2,
            height: 4 + i * 2,
            background: s.color,
            left: `${15 + i * 14}%`,
            top: `${20 + (i % 3) * 20}%`,
            opacity: 0.6,
            boxShadow: `0 0 10px ${s.color}`,
            animation: `float ${3 + i}s ease-in-out infinite`,
            animationDelay: `${i * 0.4}s`,
          }} />
      ))}
      {/* Lignes de scan */}
      <div className="absolute inset-x-0 top-[35%] h-px opacity-40"
        style={{ background: `linear-gradient(90deg, transparent, ${s.color}, transparent)` }} />
      <div className="absolute inset-x-0 top-[65%] h-px opacity-20"
        style={{ background: `linear-gradient(90deg, transparent, ${s.color}, transparent)` }} />
      {/* Contenu */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-lg"
          style={{ background: `linear-gradient(135deg, ${s.color}80, ${s.color}40)`, border: `1px solid ${s.color}60` }}>
          FM
        </div>
        <div className="text-center">
          <div className="text-white font-black text-xl leading-tight" key={activeScene}
            style={{ textShadow: `0 0 20px ${s.color}` }}>
            {s.text}
          </div>
          <div className="text-xs mt-1 opacity-70" style={{ color: s.color }}>{s.sub}</div>
        </div>
        {/* Barre de progression */}
        <div className="w-full h-1 rounded-full bg-white/10 mt-2 overflow-hidden">
          <div className="h-full rounded-full transition-all duration-2500"
            style={{ width: "100%", background: s.color, animation: "shimmer 2.5s linear infinite" }} />
        </div>
      </div>
      {/* Label scène */}
      <div className="absolute top-3 right-3 text-[10px] px-2 py-0.5 rounded-full font-medium"
        style={{ background: `${s.color}20`, border: `1px solid ${s.color}40`, color: s.color }}>
        {s.label}
      </div>
    </div>
  );
}

// ── Compteur animé ──
function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        let start = 0;
        const step = target / 60;
        const timer = setInterval(() => {
          start += step;
          if (start >= target) { setCount(target); clearInterval(timer); }
          else setCount(Math.floor(start));
        }, 16);
        observer.disconnect();
      }
    });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

// ── Template Card pour la showcase ──
function TemplateCard({ name, desc, gradient, tags, delay }: {
  name: string; desc: string; gradient: string; tags: string[]; delay: number;
}) {
  return (
    <div className="glass-card rounded-2xl overflow-hidden group cursor-pointer"
      style={{ animationDelay: `${delay}ms` }}>
      <div className="h-28 relative overflow-hidden" style={{ background: gradient }}>
        {/* Effet de brillance au hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.15), transparent)" }} />
        {/* Mini animation */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center
            group-hover:scale-110 transition-transform duration-300">
            <span className="text-white text-lg">▶</span>
          </div>
        </div>
        {/* Particules */}
        {[...Array(3)].map((_, i) => (
          <div key={i} className="absolute w-1.5 h-1.5 rounded-full bg-white/40"
            style={{
              left: `${20 + i * 30}%`,
              top: `${30 + i * 15}%`,
              animation: `float ${2 + i}s ease-in-out infinite`,
              animationDelay: `${i * 0.5}s`,
            }} />
        ))}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-sm text-white mb-1">{name}</h3>
        <p className="text-xs text-dark-300 mb-3 line-clamp-2">{desc}</p>
        <div className="flex flex-wrap gap-1">
          {tags.map(t => (
            <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-300 border border-brand-500/20">
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Page principale ──
export default function Home() {
  const router = useRouter();
  const { user, loading, checkAuth } = useAuth();
  const [checked, setChecked] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    checkAuth().finally(() => setChecked(true));
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [checkAuth]);

  useEffect(() => {
    if (checked && user) router.push("/dashboard");
  }, [checked, user, router]);

  if (!checked || user) {
    return (
      <div className="flex items-center justify-center min-h-screen mesh-bg">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-2 border-brand-500/30 border-t-brand-500 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-4 rounded-full bg-brand-500 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  const templates = [
    { name: "Luxury Ad", desc: "Publicités haut de gamme avec effets dorés et animations premium.", gradient: "linear-gradient(135deg, #92400e, #d97706, #92400e)", tags: ["Luxe", "Premium"] },
    { name: "Dynamic Product", desc: "Vidéos produit dynamiques avec effets glitch et néon.", gradient: "linear-gradient(135deg, #0c4a6e, #06b6d4, #7c3aed)", tags: ["Produit", "Tech"] },
    { name: "Social Burst", desc: "Contenu viral pour Reels et TikTok avec énergie maximale.", gradient: "linear-gradient(135deg, #9d174d, #f43f5e, #7c3aed)", tags: ["Social", "Viral"] },
    { name: "Cinematic Brand", desc: "Identité de marque cinématographique avec letterbox et orbes.", gradient: "linear-gradient(135deg, #1e3a5f, #4a90e2, #1e3a5f)", tags: ["Marque", "Cinéma"] },
    { name: "Hero Promo", desc: "Promotions percutantes avec animations fluides et CTA fort.", gradient: "linear-gradient(135deg, #4c1d95, #8b5cf6, #06b6d4)", tags: ["Promo", "CTA"] },
    { name: "Cinematic Pro", desc: "Motion design de niveau agence avec particules et transitions.", gradient: "linear-gradient(135deg, #6C63FF, #3D37B5, #C77DFF)", tags: ["Agence", "Pro"] },
    { name: "E-commerce", desc: "Showcase produit avec carousel et bouton d'achat animé.", gradient: "linear-gradient(135deg, #831843, #f093fb, #f5576c)", tags: ["Boutique", "Vente"] },
    { name: "SaaS Launch", desc: "Lancement de produit tech avec maquettes et features animées.", gradient: "linear-gradient(135deg, #1e1b4b, #a18cd1, #fbc2eb)", tags: ["SaaS", "Startup"] },
  ];

  const steps = [
    {
      num: "01",
      icon: "✍️",
      title: "Écrivez votre script",
      desc: "Décrivez votre message, produit ou histoire en texte libre. L'IA comprend votre intention.",
      color: "#8b5cf6",
    },
    {
      num: "02",
      icon: "🤖",
      title: "L'IA génère le storyboard",
      desc: "Gemma 4 analyse votre script et crée un storyboard structuré avec animations et transitions.",
      color: "#06b6d4",
    },
    {
      num: "03",
      icon: "🎬",
      title: "Téléchargez votre MP4",
      desc: "Remotion génère votre vidéo motion design professionnelle en haute qualité en quelques minutes.",
      color: "#f43f5e",
    },
  ];

  const features = [
    { icon: "⚡", title: "Rendu ultra-rapide", desc: "Moteur Remotion 30fps. Vidéo MP4 en moins de 2 minutes.", color: "#f59e0b" },
    { icon: "🎨", title: "10 templates pro", desc: "Luxury, Cinematic, Social Burst, SaaS — pour chaque usage.", color: "#8b5cf6" },
    { icon: "📐", title: "Multi-format", desc: "9:16 Reels, 16:9 YouTube, 1:1 Instagram — en un clic.", color: "#06b6d4" },
    { icon: "🧠", title: "IA Gemma 4", desc: "LLM local gratuit pour des storyboards créatifs et percutants.", color: "#4ade80" },
    { icon: "🎙️", title: "Voix off automatique", desc: "Edge TTS génère une narration professionnelle pour chaque scène.", color: "#f43f5e" },
    { icon: "🏷️", title: "Branding complet", desc: "Logo, couleurs, typographie — votre identité dans chaque vidéo.", color: "#c084fc" },
  ];

  return (
    <div className="min-h-screen mesh-bg text-white overflow-x-hidden">
      <FloatingParticles />

      {/* ── Navigation ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrollY > 20 ? "glass-strong border-b border-brand-500/10" : "bg-transparent"
      }`}>
        <div className="container-xl px-6 flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm text-white"
                style={{ background: "linear-gradient(135deg, #8b5cf6, #06b6d4)", boxShadow: "0 0 20px rgba(139,92,246,0.5)" }}>
                FM
              </div>
              <div className="absolute -inset-1 rounded-xl opacity-30 blur-sm"
                style={{ background: "linear-gradient(135deg, #8b5cf6, #06b6d4)" }} />
            </div>
            <span className="font-black text-lg tracking-tight">
              Flash<span className="gradient-text">Motion</span>
            </span>
          </div>
          {/* Actions */}
          <div className="flex items-center gap-2">
            <Link href="/login" className="btn-ghost text-sm">Connexion</Link>
            <Link href="/register" className="btn-primary text-sm py-2 px-5">
              Commencer gratuitement →
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <section className="relative min-h-screen flex items-center justify-center pt-16 pb-24 px-6 overflow-hidden">
        {/* Orbes de fond */}
        <GlowOrb x="20%" y="30%" size={600} color="#8b5cf6" delay={0} />
        <GlowOrb x="80%" y="60%" size={500} color="#06b6d4" delay={2} />
        <GlowOrb x="50%" y="80%" size={400} color="#f43f5e" delay={4} />

        {/* Grille de fond */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "linear-gradient(rgba(139,92,246,1) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }} />

        <div className="container-xl relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Texte */}
            <div className="text-center lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 badge badge-brand mb-8 animate-slide-up">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
                Propulsé par Gemma 4 · Remotion 30fps
                <span className="w-1.5 h-1.5 rounded-full bg-accent-400 animate-pulse" />
              </div>

              {/* Titre */}
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-[1.05] mb-6 animate-slide-up delay-100">
                Transformez votre{" "}
                <span className="gradient-text text-glow-brand">texte</span>
                {" "}en vidéo{" "}
                <span className="relative inline-block">
                  <span className="gradient-text-rose">motion design</span>
                  <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none">
                    <path d="M2 8 Q75 2 150 8 Q225 14 298 8" stroke="#f43f5e" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.6"/>
                  </svg>
                </span>
                {" "}pro
              </h1>

              {/* Sous-titre */}
              <p className="text-lg text-dark-300 max-w-xl mx-auto lg:mx-0 mb-10 leading-relaxed animate-slide-up delay-200">
                Flash Motion utilise l'IA pour générer automatiquement un storyboard et créer des vidéos animées
                <strong className="text-white"> de niveau agence</strong> à partir de votre script en quelques clics.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12 animate-slide-up delay-300">
                <Link href="/register" className="btn-primary text-base py-3.5 px-8">
                  🚀 Créer ma première vidéo
                </Link>
                <Link href="/login" className="btn-secondary text-base py-3.5 px-8">
                  Se connecter
                </Link>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-8 justify-center lg:justify-start animate-slide-up delay-400">
                {[
                  { value: 10, suffix: "+", label: "Templates pro" },
                  { value: 3, suffix: " formats", label: "9:16 · 16:9 · 1:1" },
                  { value: 30, suffix: "fps", label: "Qualité cinéma" },
                ].map((s, i) => (
                  <div key={i} className="text-center lg:text-left">
                    <div className="text-2xl font-black gradient-text">
                      <AnimatedCounter target={s.value} suffix={s.suffix} />
                    </div>
                    <div className="text-xs text-dark-400 mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Preview vidéo animée */}
            <div className="relative flex items-center justify-center animate-scale-in delay-200">
              {/* Cercles orbitaux */}
              <div className="absolute w-80 h-80 rounded-full border border-brand-500/10 animate-spin-slow" />
              <div className="absolute w-60 h-60 rounded-full border border-accent-500/10 animate-spin-reverse" />

              {/* Points orbitaux */}
              <div className="absolute w-80 h-80" style={{ animation: "orbit 20s linear infinite" }}>
                <div className="w-3 h-3 rounded-full bg-brand-500 shadow-glow-sm" />
              </div>
              <div className="absolute w-60 h-60" style={{ animation: "orbit-reverse 15s linear infinite" }}>
                <div className="w-2 h-2 rounded-full bg-accent-400" style={{ boxShadow: "0 0 10px #06b6d4" }} />
              </div>

              {/* Preview centrale */}
              <div className="relative z-10 animate-float">
                <MotionPreview />
              </div>

              {/* Cards flottantes */}
              <div className="absolute -left-4 top-1/4 glass-card rounded-xl p-3 animate-float-slow"
                style={{ animationDelay: "1s" }}>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-green-500/20 flex items-center justify-center text-green-400 text-xs">✓</div>
                  <div>
                    <div className="text-xs font-semibold text-white">Rendu terminé</div>
                    <div className="text-[10px] text-dark-400">Luxury Ad · 14s</div>
                  </div>
                </div>
              </div>

              <div className="absolute -right-4 bottom-1/4 glass-card rounded-xl p-3 animate-float-fast"
                style={{ animationDelay: "2s" }}>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-brand-500/20 flex items-center justify-center text-brand-400 text-xs">🤖</div>
                  <div>
                    <div className="text-xs font-semibold text-white">Gemma 4</div>
                    <div className="text-[10px] text-dark-400">Storyboard généré</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40 animate-bounce-subtle">
          <span className="text-xs text-dark-400 tracking-widest uppercase">Découvrir</span>
          <div className="w-5 h-8 rounded-full border border-dark-500 flex items-start justify-center pt-1.5">
            <div className="w-1 h-2 rounded-full bg-dark-400 animate-bounce" />
          </div>
        </div>
      </section>

      {/* ── Divider ── */}
      <div className="divider-gradient" />

      {/* ── Comment ça marche ── */}
      <section className="section px-6 relative overflow-hidden">
        <GlowOrb x="90%" y="50%" size={400} color="#8b5cf6" delay={1} />
        <div className="container-lg relative z-10">
          <div className="text-center mb-16">
            <div className="badge badge-brand mb-4 mx-auto w-fit">Processus</div>
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              De l'idée à la vidéo en{" "}
              <span className="gradient-text">3 étapes</span>
            </h2>
            <p className="text-dark-300 text-lg max-w-xl mx-auto">
              Pas besoin de compétences vidéo. Flash Motion fait tout le travail pour vous.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Ligne de connexion */}
            <div className="hidden md:block absolute top-14 left-1/6 right-1/6 h-px"
              style={{ background: "linear-gradient(90deg, transparent, rgba(139,92,246,0.4), rgba(6,182,212,0.4), transparent)" }} />

            {steps.map((step, i) => (
              <div key={i} className="glass-card rounded-2xl p-8 text-center relative group">
                {/* Numéro */}
                <div className="text-6xl font-black mb-4 opacity-10 group-hover:opacity-20 transition-opacity"
                  style={{ color: step.color }}>
                  {step.num}
                </div>
                {/* Icône */}
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-5 -mt-10"
                  style={{ background: `${step.color}15`, border: `1px solid ${step.color}30`, boxShadow: `0 0 20px ${step.color}20` }}>
                  {step.icon}
                </div>
                <h3 className="text-lg font-bold mb-3 text-white">{step.title}</h3>
                <p className="text-dark-300 text-sm leading-relaxed">{step.desc}</p>
                {/* Indicateur de connexion */}
                {i < 2 && (
                  <div className="hidden md:flex absolute -right-4 top-14 z-10 w-8 h-8 rounded-full items-center justify-center"
                    style={{ background: `${step.color}20`, border: `1px solid ${step.color}40` }}>
                    <span style={{ color: step.color }}>→</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Templates showcase ── */}
      <section className="section px-6 relative overflow-hidden" style={{ background: "rgba(8,13,26,0.5)" }}>
        <GlowOrb x="10%" y="50%" size={500} color="#06b6d4" delay={2} />
        <div className="container-xl relative z-10">
          <div className="text-center mb-16">
            <div className="badge badge-brand mb-4 mx-auto w-fit">Templates</div>
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              <span className="gradient-text">10 templates</span> professionnels
            </h2>
            <p className="text-dark-300 text-lg max-w-xl mx-auto">
              Chaque template est conçu par des experts en motion design pour un rendu de niveau agence.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {templates.map((t, i) => (
              <TemplateCard key={i} {...t} delay={i * 50} />
            ))}
          </div>

          <div className="text-center mt-10">
            <Link href="/register" className="btn-secondary">
              Voir tous les templates →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="section px-6 relative overflow-hidden">
        <GlowOrb x="50%" y="50%" size={600} color="#8b5cf6" delay={0} />
        <div className="container-lg relative z-10">
          <div className="text-center mb-16">
            <div className="badge badge-brand mb-4 mx-auto w-fit">Fonctionnalités</div>
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Tout ce qu'il vous faut pour créer{" "}
              <span className="gradient-text">des vidéos pro</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <div key={i} className="glass-card rounded-2xl p-6 group">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4"
                  style={{ background: `${f.color}15`, border: `1px solid ${f.color}25` }}>
                  {f.icon}
                </div>
                <h3 className="font-bold text-white mb-2">{f.title}</h3>
                <p className="text-dark-300 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Final ── */}
      <section className="section-sm px-6 relative overflow-hidden">
        <div className="container-md relative z-10">
          <div className="relative rounded-3xl overflow-hidden p-12 text-center"
            style={{
              background: "linear-gradient(135deg, rgba(139,92,246,0.15), rgba(6,182,212,0.08))",
              border: "1px solid rgba(139,92,246,0.25)",
              boxShadow: "0 0 80px rgba(139,92,246,0.15)",
            }}>
            {/* Orbes internes */}
            <div className="absolute -top-20 -left-20 w-60 h-60 rounded-full opacity-20 blur-3xl"
              style={{ background: "#8b5cf6" }} />
            <div className="absolute -bottom-20 -right-20 w-60 h-60 rounded-full opacity-20 blur-3xl"
              style={{ background: "#06b6d4" }} />

            <div className="relative z-10">
              <div className="text-5xl mb-6">🎬</div>
              <h2 className="text-3xl md:text-4xl font-black mb-4">
                Prêt à créer votre première{" "}
                <span className="gradient-text">vidéo pro</span> ?
              </h2>
              <p className="text-dark-300 text-lg mb-8 max-w-md mx-auto">
                Rejoignez Flash Motion et générez des vidéos de motion design professionnelles dès aujourd'hui.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/register" className="btn-primary text-base py-4 px-10">
                  🚀 Créer mon compte gratuitement
                </Link>
                <Link href="/login" className="btn-ghost text-base py-4 px-8">
                  Déjà un compte ? Connexion
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-dark-700/50 px-6 py-10">
        <div className="container-xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs text-white"
                style={{ background: "linear-gradient(135deg, #8b5cf6, #06b6d4)" }}>
                FM
              </div>
              <span className="font-bold">Flash<span className="gradient-text">Motion</span></span>
            </div>
            <p className="text-dark-400 text-sm">© 2026 Flash Motion. Tous droits réservés.</p>
            <div className="flex items-center gap-6 text-sm text-dark-400">
              <Link href="/login" className="hover:text-white transition-colors">Connexion</Link>
              <Link href="/register" className="hover:text-white transition-colors">Inscription</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
