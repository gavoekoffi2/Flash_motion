"use client";

import { useRef, useState, useCallback } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";

function FloatingShape({
  className,
  delay = 0,
  duration = 6,
}: {
  className: string;
  delay?: number;
  duration?: number;
}) {
  return (
    <motion.div
      className={className}
      animate={{ y: [0, -25, 0], rotate: [0, 5, -5, 0] }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setMouse({
      x: ((e.clientX - rect.left) / rect.width - 0.5) * 2,
      y: ((e.clientY - rect.top) / rect.height - 0.5) * 2,
    });
  }, []);

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
    >
      {/* Animated gradient background */}
      <motion.div className="absolute inset-0" style={{ y: bgY }}>
        {/* Primary gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-dark-950 via-dark-950 to-dark-900" />

        {/* Gradient orbs */}
        <motion.div
          className="absolute top-1/4 -left-32 w-[600px] h-[600px] rounded-full bg-brand-500/10 blur-[120px]"
          style={{
            x: mouse.x * -30,
            y: mouse.y * -30,
          }}
        />
        <motion.div
          className="absolute bottom-1/4 -right-32 w-[500px] h-[500px] rounded-full bg-purple-500/8 blur-[100px]"
          style={{
            x: mouse.x * 20,
            y: mouse.y * 20,
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full bg-brand-500/5 blur-[150px]"
          style={{
            x: mouse.x * -15,
            y: mouse.y * -15,
          }}
        />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </motion.div>

      {/* Floating 3D shapes */}
      <div className="absolute inset-0 pointer-events-none">
        <FloatingShape
          className="absolute top-[15%] left-[10%] w-16 h-16 rounded-2xl border border-brand-500/20 bg-brand-500/5 backdrop-blur-sm"
          delay={0}
          duration={7}
        />
        <FloatingShape
          className="absolute top-[25%] right-[15%] w-12 h-12 rounded-full border border-purple-500/20 bg-purple-500/5 backdrop-blur-sm"
          delay={1}
          duration={5}
        />
        <FloatingShape
          className="absolute bottom-[30%] left-[20%] w-10 h-10 rounded-xl border border-cyan-500/20 bg-cyan-500/5 backdrop-blur-sm rotate-45"
          delay={2}
          duration={8}
        />
        <FloatingShape
          className="absolute bottom-[20%] right-[10%] w-14 h-14 rounded-2xl border border-brand-400/20 bg-brand-400/5 backdrop-blur-sm"
          delay={0.5}
          duration={6}
        />
        <FloatingShape
          className="absolute top-[60%] left-[5%] w-8 h-8 rounded-lg border border-amber-500/20 bg-amber-500/5 backdrop-blur-sm rotate-12"
          delay={3}
          duration={9}
        />
      </div>

      {/* Content */}
      <motion.div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 text-center" style={{ opacity }}>
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-sm text-white/70">Now in Public Beta — Create for Free</span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="text-5xl sm:text-6xl lg:text-8xl font-black tracking-tight leading-[0.95] mb-8"
        >
          <span className="text-white">Transform Your</span>
          <br />
          <span className="bg-gradient-to-r from-brand-400 via-brand-500 to-amber-400 bg-clip-text text-transparent">
            Ideas Into Video
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-lg sm:text-xl text-white/50 max-w-2xl mx-auto mb-12 leading-relaxed"
        >
          The AI-powered motion design platform built for African creators.
          Write your script, pick a template, and watch your vision come alive
          in stunning motion graphics — no design skills needed.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
        >
          <Link
            href="/register"
            className="group relative px-8 py-4 text-lg font-bold text-white rounded-2xl overflow-hidden shadow-2xl shadow-brand-500/25 hover:shadow-brand-500/40 transition-shadow"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-brand-500 to-brand-600" />
            <span className="absolute inset-0 bg-gradient-to-r from-brand-400 to-brand-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="relative flex items-center gap-2">
              Start Creating — It&apos;s Free
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </span>
          </Link>
          <a
            href="#showcase"
            className="group px-8 py-4 text-lg font-semibold text-white/70 hover:text-white rounded-2xl border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 backdrop-blur-sm transition-all flex items-center gap-2"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-brand-400">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            See It In Action
          </a>
        </motion.div>

        {/* 3D Platform Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 60, rotateX: 10 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 1, delay: 0.9, ease: "easeOut" }}
          className="relative max-w-5xl mx-auto"
          style={{ perspective: "1200px" }}
        >
          <motion.div
            className="relative rounded-2xl overflow-hidden border border-white/10 bg-dark-900/80 backdrop-blur-xl shadow-2xl shadow-black/50"
            style={{
              transform: `perspective(1200px) rotateY(${mouse.x * 5}deg) rotateX(${-mouse.y * 5}deg)`,
              transition: "transform 0.15s ease-out",
            }}
          >
            {/* Browser chrome */}
            <div className="flex items-center gap-2 px-4 py-3 bg-dark-950/50 border-b border-white/5">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <div className="w-3 h-3 rounded-full bg-green-500/60" />
              </div>
              <div className="flex-1 mx-4">
                <div className="bg-white/5 rounded-lg px-4 py-1.5 text-xs text-white/30 text-center">
                  app.flashmotion.io/projects/new
                </div>
              </div>
            </div>

            {/* Mockup content — Platform UI */}
            <div className="p-6 sm:p-8 space-y-6">
              {/* Header bar */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600" />
                  <div className="h-4 w-32 rounded bg-white/10" />
                </div>
                <div className="flex gap-2">
                  <div className="h-8 w-20 rounded-lg bg-white/5 border border-white/10" />
                  <div className="h-8 w-24 rounded-lg bg-gradient-to-r from-brand-500 to-brand-600" />
                </div>
              </div>

              {/* Two-column layout */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Script panel */}
                <div className="space-y-3 rounded-xl bg-white/[0.02] border border-white/5 p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-5 h-5 rounded bg-brand-500/20 flex items-center justify-center">
                      <div className="w-2.5 h-2.5 border-l-2 border-b-2 border-brand-400" />
                    </div>
                    <div className="h-3 w-16 rounded bg-white/15" />
                  </div>
                  {[90, 100, 75, 60, 95, 80].map((w, i) => (
                    <div
                      key={i}
                      className="h-2.5 rounded-full bg-white/[0.06]"
                      style={{ width: `${w}%` }}
                    />
                  ))}
                  <div className="mt-4 h-10 rounded-lg bg-gradient-to-r from-brand-500/20 to-brand-600/20 border border-brand-500/30 flex items-center justify-center">
                    <div className="h-2 w-32 rounded bg-brand-400/40" />
                  </div>
                </div>

                {/* Preview panel */}
                <div className="space-y-3 rounded-xl bg-white/[0.02] border border-white/5 p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-5 h-5 rounded bg-purple-500/20 flex items-center justify-center">
                      <div className="w-2.5 h-2.5 rounded-full border-2 border-purple-400" />
                    </div>
                    <div className="h-3 w-20 rounded bg-white/15" />
                  </div>
                  {/* Storyboard frames */}
                  <div className="grid grid-cols-3 gap-2">
                    {[...Array(6)].map((_, i) => (
                      <div
                        key={i}
                        className="aspect-video rounded-lg overflow-hidden"
                        style={{
                          background: `linear-gradient(${135 + i * 30}deg, ${
                            ["#f97316", "#a855f7", "#06b6d4", "#f43f5e", "#10b981", "#eab308"][i]
                          }15, ${
                            ["#f97316", "#a855f7", "#06b6d4", "#f43f5e", "#10b981", "#eab308"][i]
                          }05)`,
                          border: "1px solid rgba(255,255,255,0.05)",
                        }}
                      >
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="w-4 h-3 rounded-sm bg-white/10" />
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Timeline */}
                  <div className="mt-2 h-8 rounded-lg bg-white/[0.03] border border-white/5 flex items-center px-3 gap-1">
                    {[...Array(12)].map((_, i) => (
                      <div
                        key={i}
                        className="flex-1 h-3 rounded-sm"
                        style={{
                          background: i < 8
                            ? `rgba(249, 115, 22, ${0.15 + i * 0.05})`
                            : "rgba(255,255,255,0.03)",
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Glow effects */}
            <div className="absolute -top-px left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-brand-500/50 to-transparent" />
            <div className="absolute -bottom-px left-1/3 right-1/3 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
          </motion.div>

          {/* Floating badges around mockup */}
          <motion.div
            className="absolute -top-6 -right-4 sm:right-8 px-4 py-2 rounded-xl bg-dark-900/90 border border-white/10 backdrop-blur-xl shadow-xl"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-green-500/15 flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div>
                <div className="text-xs font-semibold text-white/80">Render Complete</div>
                <div className="text-[10px] text-white/40">1080p • 30s</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="absolute -bottom-4 -left-4 sm:left-12 px-4 py-2 rounded-xl bg-dark-900/90 border border-white/10 backdrop-blur-xl shadow-xl"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 5, delay: 1, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-500/15 flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2.5">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
              </div>
              <div>
                <div className="text-xs font-semibold text-white/80">AI Storyboard</div>
                <div className="text-[10px] text-white/40">6 scenes generated</div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
