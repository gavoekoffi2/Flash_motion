import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/Toast";

export const metadata: Metadata = {
  title: "Flash Motion — Text to Motion Design Video",
  description: "Generate professional motion design videos from text scripts",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-dark-950 text-dark-50">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
