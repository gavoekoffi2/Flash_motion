"use client";

import { motion } from "framer-motion";

const testimonials = [
  {
    name: "Amara Diallo",
    role: "CEO, Teknik Labs — Dakar",
    quote:
      "Flash Motion changed how we produce content. What used to take our design team 3 days now happens in 15 minutes. Our social media engagement went up 340%.",
    gradient: "from-brand-400 to-amber-400",
    initials: "AD",
  },
  {
    name: "Kwame Asante",
    role: "Content Creator — Accra",
    quote:
      "As a solo creator, I couldn't afford a motion designer. Flash Motion gives me studio-quality videos for every product I promote. My clients are amazed.",
    gradient: "from-purple-400 to-pink-400",
    initials: "KA",
  },
  {
    name: "Fatou Ndiaye",
    role: "Marketing Director, Afri-Pay — Lagos",
    quote:
      "We launched our fintech app with Flash Motion videos. The AI storyboard feature understood our brand perfectly. 50 videos in one week — impossible before.",
    gradient: "from-cyan-400 to-blue-400",
    initials: "FN",
  },
  {
    name: "Tendai Moyo",
    role: "E-commerce Founder — Harare",
    quote:
      "I upload my product photos, write a quick script, and Flash Motion creates scroll-stopping videos. My Shopify conversion rate doubled in the first month.",
    gradient: "from-emerald-400 to-teal-400",
    initials: "TM",
  },
  {
    name: "Ife Okafor",
    role: "EdTech Startup — Nairobi",
    quote:
      "Our educational content reaches millions across Africa. Flash Motion lets us produce professional explainer videos in 4 languages without a video team.",
    gradient: "from-rose-400 to-orange-400",
    initials: "IO",
  },
  {
    name: "Binta Touré",
    role: "Brand Strategist — Abidjan",
    quote:
      "The templates are gorgeous and the AI really understands storytelling. I've recommended Flash Motion to every startup I consult for. It's a game-changer.",
    gradient: "from-violet-400 to-indigo-400",
    initials: "BT",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-dark-950 via-dark-900 to-dark-950" />

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
            TESTIMONIALS
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight mb-6">
            Loved by{" "}
            <span className="bg-gradient-to-r from-brand-400 to-amber-400 bg-clip-text text-transparent">
              Creators
            </span>{" "}
            Across Africa
          </h2>
          <p className="text-lg text-white/40 max-w-2xl mx-auto">
            Entrepreneurs, content creators, and marketing teams trust Flash Motion
            to produce their most important videos.
          </p>
        </motion.div>

        {/* Testimonial grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="group relative rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] p-6 transition-all hover:bg-white/[0.04]"
            >
              {/* Quote */}
              <div className="mb-6">
                <svg width="24" height="24" viewBox="0 0 24 24" className="text-brand-500/30 mb-3">
                  <path
                    fill="currentColor"
                    d="M9.983 3v7.391c0 5.704-3.731 9.57-8.983 10.609l-.995-2.151c2.432-.917 3.995-3.638 3.995-5.849h-4v-10h9.983zm14.017 0v7.391c0 5.704-3.748 9.571-9 10.609l-.996-2.151c2.433-.917 3.996-3.638 3.996-5.849h-3.983v-10h9.983z"
                  />
                </svg>
                <p className="text-white/50 leading-relaxed text-sm">{t.quote}</p>
              </div>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.gradient} flex items-center justify-center text-white text-xs font-bold shadow-lg`}
                >
                  {t.initials}
                </div>
                <div>
                  <div className="text-sm font-semibold text-white/80">{t.name}</div>
                  <div className="text-xs text-white/35">{t.role}</div>
                </div>
              </div>

              {/* Stars */}
              <div className="absolute top-6 right-6 flex gap-0.5">
                {[...Array(5)].map((_, j) => (
                  <svg key={j} width="12" height="12" viewBox="0 0 24 24" fill="#f97316" className="opacity-40">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
