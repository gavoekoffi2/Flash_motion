"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function CTASection() {
  return (
    <section className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 bg-dark-950" />

      {/* Background glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-brand-500/10 blur-[150px] rounded-full" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />

      <div className="relative max-w-4xl mx-auto px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
        >
          {/* Icon */}
          <motion.div
            className="inline-flex w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-500/20 to-brand-600/20 border border-brand-500/20 items-center justify-center mb-8"
            animate={{ scale: [1, 1.05, 1], rotate: [0, 2, -2, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" className="text-brand-400">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="currentColor" />
            </svg>
          </motion.div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight mb-6">
            Ready to Create Your
            <br />
            <span className="bg-gradient-to-r from-brand-400 via-brand-500 to-amber-400 bg-clip-text text-transparent">
              Next Masterpiece?
            </span>
          </h2>

          <p className="text-lg text-white/40 max-w-xl mx-auto mb-10">
            Join thousands of African creators already using Flash Motion
            to produce professional videos. Start free — no credit card required.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="group relative px-10 py-4 text-lg font-bold text-white rounded-2xl overflow-hidden shadow-2xl shadow-brand-500/25 hover:shadow-brand-500/40 transition-shadow"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-brand-500 to-brand-600 group-hover:from-brand-400 group-hover:to-brand-500 transition-all" />
              <span className="relative flex items-center gap-2">
                Start Creating Now
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </span>
            </Link>

            <div className="flex items-center gap-3 text-sm text-white/30">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Free forever plan available
            </div>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto"
          >
            {[
              { value: "10K+", label: "Videos Created" },
              { value: "2K+", label: "Active Creators" },
              { value: "15+", label: "Countries" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-2xl font-black text-white">{stat.value}</div>
                <div className="text-xs text-white/30">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
