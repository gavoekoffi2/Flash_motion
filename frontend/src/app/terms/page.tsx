import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-dark-700 bg-dark-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/" className="text-gray-400 hover:text-white">&larr; Accueil</Link>
          <h1 className="text-lg font-semibold">Conditions d&apos;utilisation</h1>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 py-8 prose prose-invert prose-sm">
        <h2>1. Acceptation des conditions</h2>
        <p>
          En utilisant Flash Motion, vous acceptez les présentes conditions d&apos;utilisation.
          Si vous n&apos;acceptez pas ces conditions, veuillez ne pas utiliser le service.
        </p>

        <h2>2. Description du service</h2>
        <p>
          Flash Motion est une plateforme SaaS de création de vidéos motion design assistée par intelligence artificielle.
          Le service permet de transformer un script textuel en vidéo animée.
        </p>

        <h2>3. Comptes utilisateur</h2>
        <p>
          Vous êtes responsable de la sécurité de votre compte et de votre mot de passe.
          Vous devez nous informer immédiatement de toute utilisation non autorisée.
        </p>

        <h2>4. Utilisation acceptable</h2>
        <p>
          Vous vous engagez à ne pas utiliser le service pour créer du contenu illégal,
          offensant, ou portant atteinte aux droits de tiers.
        </p>

        <h2>5. Propriété intellectuelle</h2>
        <p>
          Les vidéos que vous créez vous appartiennent. Flash Motion conserve les droits
          sur sa technologie, son interface et ses algorithmes.
        </p>

        <h2>6. Limitation de responsabilité</h2>
        <p>
          Le service est fourni &quot;tel quel&quot;. Flash Motion ne garantit pas un fonctionnement
          ininterrompu et ne sera pas responsable des dommages indirects.
        </p>

        <h2>7. Modification des conditions</h2>
        <p>
          Nous nous réservons le droit de modifier ces conditions à tout moment.
          Les utilisateurs seront notifiés des changements importants.
        </p>

        <p className="text-gray-500 text-xs mt-8">Dernière mise à jour : Mars 2026</p>
      </main>
    </div>
  );
}
