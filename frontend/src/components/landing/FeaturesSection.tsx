"use client";

import { useRef, useCallback } from "react";
import { motion } from "framer-motion";

const features = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a4 4 0 0 1 4 4c0 1.5-.8 2.8-2 3.5v1h3a5 5 0 0 1 5 5v1H2v-1a5 5 0 0 1 5-5h3v-1A4 4 0 0 1 12 2z" />
        <path d="M9 18v3M15 18v3" />
      </svg>
    ),
    title: "AI Storyboard Generation",
    description:
      "Write your script in plain text. Our AI analyzes your content and generates a complete storyboard with scenes, transitions, timing, and visual directions.",
    gradient: "from-brand-500 to-amber-500",
    glow: "brand-500",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" />
        <path d="M7 8l3 2-3 2" />
        <path d="M13 10h4" />
      </svg>
    ),
    title: "Professional Templates",
    description:
      "Choose from curated motion design templates: Hero Promo, Testimonial, E-commerce Showcase, Educational, SaaS Launch. Each optimized for engagement.",
    gradient: "from-purple-500 to-pink-500",
    glow: "purple-500",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
      </svg>
    ),
    title: "Smart Asset Management",
    description:
      "Upload logos, images, audio tracks, and fonts. Drag and drop them directly into your scenes. AI suggests optimal placements for each asset.",
    gradient: "from-cyan-500 to-blue-500",
    glow: "cyan-500",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
    title: "One-Click Render",
    description:
      "Hit render and get a professional motion design video in minutes. Export in 9:16, 16:9, or 1:1 — optimized for TikTok, YouTube, and Instagram.",
    gradient: "from-emerald-500 to-teal-500",
    glow: "emerald-500",
  },
];

function TiltCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 16;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -16;
    card.style.transform = `perspective(800px) rotateY(${x}deg) rotateX(${y}deg) scale(1.02)`;
  }, []);

  const handleMouseLeave = useCallback(() => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transform = "perspective(800px) rotateY(0deg) rotateX(0deg) scale(1)";
  }, []);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
      style={{ transition: "transform 0.2s ease-out", transformStyle: "preserve-3d" }}
    >
      {children}
    </div>
  );
}

export default function FeaturesSection() {
  return (
    <section id="features" className="relative py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-dark-950" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-brand-500/5 blur-[150px] rounded-full" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white/60 font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-400" />
            FEATURES
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight mb-6">
            Everything You Need to{" "}
            <span className="bg-gradient-to-r from-brand-400 to-amber-400 bg-clip-text text-transparent">
              Create
            </span>
          </h2>
          <p className="text-lg text-white/40 max-w-2xl mx-auto">
            A complete suite of tools to go from idea to professional motion design video.
            No complex software. No steep learning curve.
          </p>
        </motion.div>

        {/* Feature cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <TiltCard className="group relative h-full rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] p-8 cursor-default overflow-hidden">
                {/* Hover glow */}
                <div
                  className={`absolute -top-24 -right-24 w-48 h-48 rounded-full bg-${feature.glow}/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                />

                {/* Icon */}
                <div
                  className={`relative w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} p-[1px] mb-6`}
                >
                  <div className="w-full h-full rounded-xl bg-dark-950 flex items-center justify-center text-white/80">
                    {feature.icon}
                  </div>
                </div>

                {/* Content */}
                <h3 className="relative text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="relative text-white/40 leading-relaxed">{feature.description}</p>

                {/* Bottom gradient line */}
                <div
                  className={`absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-30 transition-opacity`}
                />
              </TiltCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
