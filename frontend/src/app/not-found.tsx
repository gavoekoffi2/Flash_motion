import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-600 mb-4">404</h1>
        <h2 className="text-xl font-medium mb-2">Page introuvable</h2>
        <p className="text-gray-400 mb-6">La page que vous cherchez n&apos;existe pas.</p>
        <Link href="/dashboard" className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors">
          Retour au dashboard
        </Link>
      </div>
    </div>
  );
}
