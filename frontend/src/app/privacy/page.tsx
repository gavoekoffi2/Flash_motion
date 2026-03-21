import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-dark-700 bg-dark-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/" className="text-gray-400 hover:text-white">&larr; Accueil</Link>
          <h1 className="text-lg font-semibold">Politique de confidentialité</h1>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 py-8 prose prose-invert prose-sm">
        <h2>1. Données collectées</h2>
        <p>
          Nous collectons les informations suivantes : adresse email, nom (optionnel),
          contenu des projets (scripts, assets), et données d&apos;utilisation du service.
        </p>

        <h2>2. Utilisation des données</h2>
        <p>
          Vos données sont utilisées pour fournir et améliorer le service,
          gérer votre compte, et vous contacter si nécessaire.
        </p>

        <h2>3. Stockage et sécurité</h2>
        <p>
          Vos données sont stockées de manière sécurisée. Les mots de passe sont
          chiffrés et les communications sont protégées par HTTPS.
        </p>

        <h2>4. Partage des données</h2>
        <p>
          Nous ne vendons pas vos données personnelles. Nous pouvons partager
          des données avec des prestataires techniques nécessaires au fonctionnement
          du service (hébergement, stockage cloud).
        </p>

        <h2>5. Vos droits</h2>
        <p>
          Vous avez le droit d&apos;accéder à vos données, de les modifier, de les exporter
          et de demander leur suppression. Contactez-nous pour exercer ces droits.
        </p>

        <h2>6. Cookies</h2>
        <p>
          Nous utilisons un cookie d&apos;authentification (fm_token) nécessaire au fonctionnement
          du service. Aucun cookie de tracking tiers n&apos;est utilisé.
        </p>

        <p className="text-gray-500 text-xs mt-8">Dernière mise à jour : Mars 2026</p>
      </main>
    </div>
  );
}
