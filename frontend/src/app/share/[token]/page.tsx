"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

type SharedData = {
  project: { title: string; aspectRatio: string; template: string };
  video: { downloadUrl: string; finishedAt: string | null };
};

export default function SharePage() {
  const params = useParams();
  const token = params.token as string;
  const [data, setData] = useState<SharedData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!token) return;
    api.getSharedVideo(token)
      .then((d) => setData(d))
      .catch((err) => setError(err.message || "Lien invalide ou expire"))
      .finally(() => setLoading(false));
  }, [token]);

  function handleCopy() {
    if (typeof window !== "undefined") {
      navigator.clipboard?.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400">Chargement...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">&#128274;</div>
          <h1 className="text-2xl font-semibold mb-2">Lien invalide</h1>
          <p className="text-gray-400 mb-6">{error || "Ce lien de partage est invalide ou a expire."}</p>
          <Link href="/" className="text-brand-400 hover:text-brand-300 text-sm">
            Retour a l&apos;accueil
          </Link>
        </div>
      </div>
    );
  }

  const aspectClass = data.project.aspectRatio === "9:16" ? "max-w-sm" : data.project.aspectRatio === "1:1" ? "max-w-lg" : "max-w-3xl";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <Link href="/" className="text-brand-500 font-bold text-xl mb-8 hover:text-brand-400 transition-colors">
        Flash Motion
      </Link>

      <div className={`w-full ${aspectClass} space-y-4`}>
        <h1 className="text-xl font-semibold text-center">{data.project.title}</h1>
        <p className="text-xs text-gray-500 text-center">
          {data.project.template} &middot; {data.project.aspectRatio}
          {data.video.finishedAt && (
            <> &middot; {new Date(data.video.finishedAt).toLocaleDateString("fr-FR")}</>
          )}
        </p>

        <div className="bg-dark-900 rounded-xl overflow-hidden border border-dark-700">
          <video src={data.video.downloadUrl} controls autoPlay playsInline className="w-full" />
        </div>

        <div className="flex gap-3">
          <a
            href={data.video.downloadUrl}
            download
            className="flex-1 text-center bg-brand-600 hover:bg-brand-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Telecharger MP4
          </a>
          <button
            onClick={handleCopy}
            className="bg-dark-800 hover:bg-dark-700 text-gray-300 px-4 py-3 rounded-lg text-sm transition-colors"
          >
            {copied ? "Copie !" : "Copier lien"}
          </button>
        </div>

        <p className="text-center text-xs text-gray-600 pt-2">
          Cree avec{" "}
          <Link href="/" className="text-brand-400 hover:underline">
            Flash Motion
          </Link>{" "}
          — Transformez votre texte en video
        </p>
      </div>
    </div>
  );
}
