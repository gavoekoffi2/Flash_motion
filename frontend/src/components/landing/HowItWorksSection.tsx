"use client";

import { motion } from "framer-motion";

const steps = [
  {
    number: "01",
    title: "Write Your Script",
    description:
      "Type or paste your script — a product pitch, a testimonial, a lesson, anything. Flash Motion understands context and creates the right visual story.",
    visual: (
      <div className="space-y-2">
        {[
          { w: "95%", text: "Introducing our new app that helps" },
          { w: "88%", text: "African entrepreneurs manage their" },
          { w: "92%", text: "business finances effortlessly..." },
          { w: "70%", text: "Start your journey today." },
        ].map((line, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 + i * 0.15 }}
            className="flex items-center gap-3"
          >
            <div className="w-1 h-4 rounded-full bg-brand-400/50" />
            <div className="text-sm text-white/30 font-mono">{line.text}</div>
          </motion.div>
        ))}
        <motion.div
          className="mt-4 w-2 h-5 bg-brand-400 rounded-sm"
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      </div>
    ),
  },
  {
    number: "02",
    title: "AI Builds Your Storyboard",
    description:
      "Our AI engine breaks your script into scenes, selects animations, sets timing, and suggests asset placements. Review and customize every detail.",
    visual: (
      <div className="grid grid-cols-3 gap-2">
        {[
          { color: "#f97316", label: "Intro" },
          { color: "#a855f7", label: "Problem" },
          { color: "#06b6d4", label: "Solution" },
          { color: "#10b981", label: "Features" },
          { color: "#f43f5e", label: "Social" },
          { color: "#eab308", label: "CTA" },
        ].map((scene, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 + i * 0.1 }}
            className="aspect-video rounded-lg border border-white/10 flex flex-col items-center justify-center gap-1"
            style={{ background: `${scene.color}08` }}
          >
            <div
              className="w-6 h-4 rounded-sm"
              style={{ background: `${scene.color}30` }}
            />
            <span className="text-[9px] text-white/30 font-medium">{scene.label}</span>
          </motion.div>
        ))}
      </div>
    ),
  },
  {
    number: "03",
    title: "Render & Share",
    description:
      "One click renders your video in broadcast quality. Download it or share directly to social media. Your content is ready to go viral.",
    visual: (
      <div className="flex flex-col items-center gap-4">
        <motion.div
          className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-500/20 to-brand-600/20 border border-brand-500/20 flex items-center justify-center"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="1.5">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
        </motion.div>
        <div className="flex gap-2">
          {["TikTok", "YouTube", "Instagram"].map((p, i) => (
            <motion.div
              key={p}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 + i * 0.15 }}
              className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-white/40 font-medium"
            >
              {p}
            </motion.div>
          ))}
        </div>
      </div>
    ),
  },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-dark-950 via-dark-900 to-dark-950" />

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
            HOW IT WORKS
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight mb-6">
            Three Steps to{" "}
            <span className="bg-gradient-to-r from-brand-400 to-amber-400 bg-clip-text text-transparent">
              Magic
            </span>
          </h2>
          <p className="text-lg text-white/40 max-w-2xl mx-auto">
            From idea to publish-ready video in minutes, not days.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="space-y-8 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className="relative group"
            >
              {/* Connector line (desktop) */}
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-[calc(100%_-_16px)] w-[calc(100%_-_56px)] h-px">
                  <div className="w-full h-full bg-gradient-to-r from-white/10 to-white/5" />
                  <motion.div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-brand-500/50 to-brand-500/0"
                    initial={{ width: "0%" }}
                    whileInView={{ width: "100%" }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.5 + i * 0.3 }}
                  />
                </div>
              )}

              <div className="relative rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] p-8 transition-colors overflow-hidden">
                {/* Step number */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500/20 to-brand-600/20 border border-brand-500/20 flex items-center justify-center">
                      <span className="text-lg font-black text-brand-400">{step.number}</span>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white">{step.title}</h3>
                </div>

                {/* Description */}
                <p className="text-white/40 leading-relaxed mb-8">{step.description}</p>

                {/* Visual */}
                <div className="rounded-xl bg-dark-950/50 border border-white/5 p-5 min-h-[140px] flex items-center justify-center">
                  {step.visual}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
