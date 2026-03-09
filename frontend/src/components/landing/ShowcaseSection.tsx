"use client";

import { useRef, useState, useCallback } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";

const showcaseItems = [
  {
    label: "Hero Promo",
    description: "Bold product launches with dynamic motion graphics",
    color: "#f97316",
    scenes: ["Logo Reveal", "Key Feature", "Pricing", "CTA"],
  },
  {
    label: "Testimonial",
    description: "Customer stories that build trust and convert",
    color: "#a855f7",
    scenes: ["Client Quote", "Stats", "Before/After", "Rating"],
  },
  {
    label: "E-commerce",
    description: "Product showcases that drive sales",
    color: "#06b6d4",
    scenes: ["Product Hero", "Features Grid", "Offer", "Buy Now"],
  },
  {
    label: "Educational",
    description: "Engaging lessons and explainer content",
    color: "#10b981",
    scenes: ["Hook", "Problem", "Explanation", "Takeaway"],
  },
  {
    label: "SaaS Launch",
    description: "App demos and feature announcements",
    color: "#f43f5e",
    scenes: ["Teaser", "UI Demo", "Integration", "Sign Up"],
  },
];

export default function ShowcaseSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const showcaseRotateY = useTransform(mouseX, v => v * 4);
  const showcaseRotateX = useTransform(mouseY, v => v * -4);

  const active = showcaseItems[activeIndex];

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set(((e.clientX - rect.left) / rect.width - 0.5) * 2);
    mouseY.set(((e.clientY - rect.top) / rect.height - 0.5) * 2);
  }, [mouseX, mouseY]);

  return (
    <section id="showcase" className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 bg-dark-950" />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[200px] transition-colors duration-700"
        style={{ background: `${active.color}08` }}
      />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white/60 font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-400" />
            TEMPLATES
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight mb-6">
            Built for{" "}
            <span className="bg-gradient-to-r from-brand-400 to-amber-400 bg-clip-text text-transparent">
              Every Story
            </span>
          </h2>
          <p className="text-lg text-white/40 max-w-2xl mx-auto">
            Professional templates designed for the content that matters. Each one
            crafted for maximum impact on social media.
          </p>
        </motion.div>

        {/* Template selector */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {showcaseItems.map((item, i) => (
            <button
              key={item.label}
              onClick={() => setActiveIndex(i)}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                i === activeIndex
                  ? "bg-white/10 text-white border border-white/20"
                  : "bg-white/[0.02] text-white/40 border border-white/5 hover:bg-white/5 hover:text-white/60"
              }`}
            >
              <span className="flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: item.color }}
                />
                {item.label}
              </span>
            </button>
          ))}
        </div>

        {/* Interactive 3D showcase */}
        <motion.div
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => { mouseX.set(0); mouseY.set(0); }}
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="relative rounded-2xl border border-white/10 bg-dark-900/50 backdrop-blur-xl overflow-hidden shadow-2xl"
            style={{
              perspective: 1000,
              rotateY: showcaseRotateY,
              rotateX: showcaseRotateX,
            }}
          >
            {/* Top bar */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ background: active.color }}
                />
                <span className="text-sm font-semibold text-white/70">{active.label}</span>
              </div>
              <span className="text-xs text-white/30">{active.description}</span>
            </div>

            {/* Mockup content */}
            <div className="p-6 sm:p-8">
              {/* Scene strip */}
              <div className="grid grid-cols-4 gap-3 mb-6">
                {active.scenes.map((scene, i) => (
                  <motion.div
                    key={`${activeIndex}-${i}`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="aspect-video rounded-xl border border-white/10 flex flex-col items-center justify-center gap-2 group/scene hover:border-white/20 transition-colors cursor-default"
                    style={{ background: `${active.color}06` }}
                  >
                    {/* Animated content indicator */}
                    <motion.div
                      className="w-8 h-6 rounded"
                      style={{ background: `${active.color}20` }}
                      animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.5, 1, 0.5],
                      }}
                      transition={{
                        duration: 2,
                        delay: i * 0.3,
                        repeat: Infinity,
                      }}
                    />
                    <span className="text-[10px] text-white/30 font-medium">
                      {scene}
                    </span>
                  </motion.div>
                ))}
              </div>

              {/* Timeline */}
              <div className="rounded-xl bg-dark-950/50 border border-white/5 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="opacity-30">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <span className="text-xs text-white/30">Timeline</span>
                  <span className="text-xs text-white/20 ml-auto">00:00 — 00:30</span>
                </div>
                <div className="flex gap-1 h-10">
                  {active.scenes.map((scene, i) => (
                    <motion.div
                      key={`${activeIndex}-timeline-${i}`}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ delay: 0.3 + i * 0.15, duration: 0.4 }}
                      className="flex-1 rounded-lg flex items-center justify-center origin-left"
                      style={{
                        background: `${active.color}${15 + i * 5}`,
                        border: `1px solid ${active.color}20`,
                      }}
                    >
                      <span className="text-[9px] text-white/25 font-medium truncate px-1">
                        {scene}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Glow */}
            <div
              className="absolute -top-px left-1/4 right-1/4 h-px transition-colors duration-700"
              style={{ background: `linear-gradient(90deg, transparent, ${active.color}40, transparent)` }}
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
