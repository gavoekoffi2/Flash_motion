"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function Home() {
  const router = useRouter();
  const { user, loading, checkAuth } = useAuth();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    checkAuth().finally(() => setChecked(true));
  }, [checkAuth]);

  useEffect(() => {
    if (checked && user) {
      router.push("/dashboard");
    }
  }, [checked, user, router]);

  if (!checked || user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-dark-950">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-950 text-dark-50">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-950/80 backdrop-blur border-b border-dark-800">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-white font-bold text-sm">FM</div>
            <span className="font-bold text-lg tracking-tight">Flash Motion</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-dark-100 hover:text-white transition-colors px-4 py-2">
              Connexion
            </Link>
            <Link href="/register" className="text-sm bg-brand-500 hover:bg-brand-600 text-white font-medium px-4 py-2 rounded-lg transition-colors">
              Commencer gratuitement
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/20 text-brand-400 text-sm px-4 py-1.5 rounded-full mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
            Générez des vidéos professionnelles en quelques minutes
          </div>
          <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
            Transformez votre texte en{" "}
            <span className="text-brand-500">vidéo motion design</span>{" "}
            professionnelle
          </h1>
          <p className="text-xl text-dark-100 max-w-2xl mx-auto mb-10">
            Flash Motion utilise l&apos;IA pour générer automatiquement un storyboard et créer des vidéos animées à partir de votre script en quelques clics.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="bg-brand-500 hover:bg-brand-600 text-white font-semibold px-8 py-3.5 rounded-xl text-lg transition-colors">
              Créer ma première vidéo →
            </Link>
            <Link href="/login" className="border border-dark-700 hover:border-dark-600 text-dark-100 hover:text-white font-medium px-8 py-3.5 rounded-xl text-lg transition-colors">
              Se connecter
            </Link>
          </div>
        </div>
      </section>

      {/* Demo preview */}
      <section className="px-6 pb-24">
        <div className="max-w-5xl mx-auto">
          <div className="bg-dark-800 rounded-2xl border border-dark-700 overflow-hidden shadow-2xl">
            <div className="flex items-center gap-2 px-5 py-3 bg-dark-900 border-b border-dark-700">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
              <span className="ml-3 text-xs text-dark-100">Flash Motion — Dashboard</span>
            </div>
            <div className="grid grid-cols-3 gap-4 p-6">
              {[
                { title: "Lancement SaaS", status: "DONE", color: "green" },
                { title: "Promo E-commerce", status: "RENDERING", color: "yellow" },
                { title: "Témoignage Client", status: "STORYBOARD_READY", color: "blue" },
              ].map((p, i) => (
                <div key={i} className="bg-dark-900 rounded-xl p-4 border border-dark-700">
                  <div className="w-full aspect-video bg-gradient-to-br from-brand-500/20 to-dark-800 rounded-lg mb-3 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-brand-500/30 flex items-center justify-center">
                      <span className="text-brand-400 text-lg">▶</span>
                    </div>
                  </div>
                  <p className="text-sm font-medium truncate">{p.title}</p>
                  <span className={`text-xs mt-1 inline-block px-2 py-0.5 rounded-full ${
                    p.color === "green" ? "bg-green-500/10 text-green-400" :
                    p.color === "yellow" ? "bg-yellow-500/10 text-yellow-400" :
                    "bg-blue-500/10 text-blue-400"
                  }`}>{p.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 py-24 bg-dark-900/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Comment ça marche ?</h2>
            <p className="text-dark-100">Trois étapes simples pour votre vidéo professionnelle</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Écrivez votre script",
                desc: "Décrivez votre message, votre produit ou votre histoire en texte libre. Pas besoin de compétences vidéo.",
              },
              {
                step: "02",
                title: "L'IA génère le storyboard",
                desc: "Notre IA analyse votre script et crée automatiquement un storyboard structuré avec animations et transitions.",
              },
              {
                step: "03",
                title: "Téléchargez votre MP4",
                desc: "Lancez le rendu en un clic. Votre vidéo motion design professionnelle est prête en quelques minutes.",
              },
            ].map((item, i) => (
              <div key={i} className="relative">
                <div className="text-5xl font-black text-brand-500/20 mb-3">{item.step}</div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-dark-100 text-sm leading-relaxed">{item.desc}</p>
                {i < 2 && (
                  <div className="hidden md:block absolute top-8 right-0 translate-x-1/2 text-dark-700 text-2xl">→</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-24">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Tout ce qu&apos;il vous faut</h2>
            <p className="text-dark-100">Une suite complète d&apos;outils pour créer des vidéos impactantes</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: "✦",
                title: "Templates pro",
                desc: "HeroPromo, Testimonial, E-commerce, Educational, SaaS — des templates éprouvés pour chaque usage.",
              },
              {
                icon: "⚡",
                title: "Rendu rapide",
                desc: "Moteur Remotion haute performance. Votre vidéo MP4 en haute qualité en moins de 2 minutes.",
              },
              {
                icon: "◈",
                title: "Formats flexibles",
                desc: "9:16 (Reels/TikTok), 16:9 (YouTube), 1:1 (Instagram) — le bon format pour chaque plateforme.",
              },
              {
                icon: "◎",
                title: "Gestion d&apos;assets",
                desc: "Importez vos images, logos et médias. Intégrez-les directement dans vos scènes.",
              },
              {
                icon: "◇",
                title: "Storyboard IA",
                desc: "GPT-4o analyse votre script et génère un storyboard scène par scène, entièrement personnalisable.",
              },
              {
                icon: "◉",
                title: "Branding personnalisé",
                desc: "Définissez vos couleurs et votre logo. Chaque vidéo reflète votre identité de marque.",
              },
            ].map((f, i) => (
              <div key={i} className="bg-dark-800/50 border border-dark-700 rounded-xl p-6 hover:border-brand-500/40 transition-colors">
                <div className="text-brand-500 text-2xl mb-3">{f.icon}</div>
                <h3 className="font-semibold mb-2">{f.title}</h3>
                <p className="text-dark-100 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Templates showcase */}
      <section className="px-6 py-24 bg-dark-900/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">5 templates professionnels</h2>
            <p className="text-dark-100">Chaque template est optimisé pour un type de contenu spécifique</p>
          </div>
          <div className="flex flex-wrap gap-3 justify-center">
            {[
              { name: "HeroPromo", desc: "Lancement de produit" },
              { name: "Testimonial", desc: "Avis clients" },
              { name: "EcommerceShowcase", desc: "Catalogue produits" },
              { name: "Educational", desc: "Formation & tuto" },
              { name: "SaasLaunch", desc: "Lancement SaaS" },
            ].map((t, i) => (
              <div key={i} className="bg-dark-800 border border-dark-700 rounded-xl px-5 py-3 text-center hover:border-brand-500/50 transition-colors cursor-default">
                <div className="font-medium text-sm">{t.name}</div>
                <div className="text-xs text-dark-100 mt-0.5">{t.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-gradient-to-br from-brand-500/10 to-dark-800/50 border border-brand-500/20 rounded-2xl p-12">
            <h2 className="text-3xl font-bold mb-4">Prêt à créer votre première vidéo ?</h2>
            <p className="text-dark-100 mb-8">
              Rejoignez Flash Motion et commencez à générer des vidéos professionnelles dès aujourd&apos;hui.
            </p>
            <Link href="/register" className="inline-block bg-brand-500 hover:bg-brand-600 text-white font-semibold px-10 py-4 rounded-xl text-lg transition-colors">
              Créer mon compte gratuitement
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-dark-800 px-6 py-8">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-brand-500 flex items-center justify-center text-white font-bold text-xs">FM</div>
            <span className="font-medium text-sm">Flash Motion</span>
          </div>
          <p className="text-dark-100 text-sm">© 2026 Flash Motion. Tous droits réservés.</p>
          <div className="flex items-center gap-4 text-sm text-dark-100">
            <Link href="/login" className="hover:text-white transition-colors">Connexion</Link>
            <Link href="/register" className="hover:text-white transition-colors">Inscription</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
