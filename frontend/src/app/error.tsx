"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center max-w-md">
        <h2 className="text-2xl font-semibold mb-2">Une erreur est survenue</h2>
        <p className="text-gray-400 mb-6 text-sm">{error.message || "Erreur inattendue"}</p>
        <button
          onClick={reset}
          className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
        >
          Réessayer
        </button>
      </div>
    </div>
  );
}
