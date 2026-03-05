"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for trying out Flash Motion and creating your first videos.",
    features: [
      "5 renders per day",
      "500 MB storage",
      "3 templates",
      "720p export",
      "Watermark on videos",
      "Community support",
    ],
    cta: "Get Started Free",
    href: "/register",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$29",
    period: "/month",
    description: "For creators and businesses who need unlimited production power.",
    features: [
      "Unlimited renders",
      "5 GB storage",
      "All 5+ templates",
      "1080p export",
      "No watermark",
      "Priority AI processing",
      "Custom brand colors",
      "Priority email support",
    ],
    cta: "Start Pro Trial",
    href: "/register?plan=pro",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For teams and agencies with high-volume content production needs.",
    features: [
      "Everything in Pro",
      "Unlimited storage",
      "4K export",
      "Custom templates",
      "API access",
      "Team collaboration",
      "Dedicated account manager",
      "SLA guarantee",
    ],
    cta: "Contact Sales",
    href: "#",
    highlighted: false,
  },
];

export default function PricingSection() {
  return (
    <section id="pricing" className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 bg-dark-950" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-brand-500/5 blur-[200px] rounded-full" />

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
            PRICING
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight mb-6">
            Simple,{" "}
            <span className="bg-gradient-to-r from-brand-400 to-amber-400 bg-clip-text text-transparent">
              Transparent
            </span>{" "}
            Pricing
          </h2>
          <p className="text-lg text-white/40 max-w-2xl mx-auto">
            Start free, upgrade when you&apos;re ready. No hidden fees, no surprises.
          </p>
        </motion.div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`relative rounded-2xl p-8 ${
                plan.highlighted
                  ? "bg-gradient-to-b from-brand-500/10 to-brand-600/5 border-2 border-brand-500/30"
                  : "bg-white/[0.02] border border-white/[0.06]"
              }`}
            >
              {/* Popular badge */}
              {plan.highlighted && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1.5 rounded-full bg-gradient-to-r from-brand-500 to-brand-600 text-xs font-bold text-white shadow-lg shadow-brand-500/25">
                    Most Popular
                  </span>
                </div>
              )}

              {/* Plan info */}
              <div className="mb-8">
                <h3 className="text-lg font-bold text-white mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-3">
                  <span className="text-4xl font-black text-white">{plan.price}</span>
                  {plan.period && (
                    <span className="text-white/30 text-sm">{plan.period}</span>
                  )}
                </div>
                <p className="text-sm text-white/35">{plan.description}</p>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      className="mt-0.5 flex-shrink-0"
                      stroke={plan.highlighted ? "#f97316" : "#ffffff40"}
                      strokeWidth="2.5"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span className="text-sm text-white/50">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                href={plan.href}
                className={`block text-center py-3.5 rounded-xl font-semibold text-sm transition-all ${
                  plan.highlighted
                    ? "bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40"
                    : "bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
