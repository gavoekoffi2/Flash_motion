# Flash Motion — Text to Motion Design Video SaaS

Plateforme SaaS permettant de transformer un script texte en vidéo motion design professionnelle (MP4), avec support d'assets personnalisés (images produit, logo, audio).

## Architecture

```
flash-motion/
├── backend/          # Express API (Auth, Projects, Assets, LLM, Render Queue)
│   ├── prisma/       # Database schema (PostgreSQL)
│   └── src/
│       ├── config/   # DB, S3, Redis, env
│       ├── middleware/# Auth JWT, file upload
│       ├── routes/   # auth, projects, assets
│       ├── services/ # LLM (OpenRouter/Ollama), storage (S3), renderQueue (BullMQ)
│       └── utils/
├── frontend/         # Next.js 14 (App Router, Tailwind CSS)
│   └── src/
│       ├── app/      # Pages: login, register, dashboard, projects/[id], projects/new
│       ├── components/# AssetUploader, AssetManager, StoryboardEditor
│       ├── hooks/    # useAuth (Zustand)
│       └── lib/      # API client
├── workers/
│   └── remotion-worker/  # BullMQ worker + Remotion render engine
│       └── src/
│           ├── templates/    # HeroPromo template (React/Remotion)
│           ├── compositions/ # Remotion root + compositions
│           └── worker.ts     # Job consumer
├── infra/            # Docker configs + deployment
│   ├── docker-compose.dev.yml   # Dev: Postgres, Redis, MinIO
│   ├── docker-compose.prod.yml  # Prod: full stack
│   ├── Dockerfile.backend
│   ├── Dockerfile.frontend
│   ├── Dockerfile.worker
│   └── deploy.sh
└── demo/             # 3 demo projects (storyboard JSON)
```

## Quick Start (Développement local)

### Prérequis
- Node.js >= 18
- Docker + Docker Compose
- (Optionnel) Ollama pour LLM local

### 1. Cloner et configurer

```bash
git clone <repo-url> flash-motion
cd flash-motion
cp .env.example .env
# Éditer .env avec vos valeurs
```

### 2. Lancer l'infrastructure (PostgreSQL, Redis, MinIO)

```bash
docker-compose -f infra/docker-compose.dev.yml up -d
```

### 3. Installer les dépendances

```bash
# Backend
cd backend && npm install && npx prisma db push && cd ..

# Frontend
cd frontend && npm install && cd ..

# Worker
cd workers/remotion-worker && npm install && cd ../..
```

### 4. Seed (données de démo)

```bash
cd backend && npm run db:seed && cd ..
```

Compte démo : `demo@flashmotion.dev` / `password123`

### 5. Lancer les services

```bash
# Terminal 1 — Backend API
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm run dev

# Terminal 3 — Render Worker
cd workers/remotion-worker && npm run dev
```

- Frontend : http://localhost:3000
- Backend API : http://localhost:4000
- MinIO Console : http://localhost:9001

## Configuration LLM

### OpenRouter (recommandé pour production)

```env
LLM_MODE=openrouter
OPENROUTER_API_KEY=sk-or-...
OPENROUTER_MODEL=mistralai/mistral-7b-instruct
```

Modèles recommandés (coût-efficacité) :
- `mistralai/mistral-7b-instruct` — meilleur ratio perf/prix
- `meta-llama/llama-2-13b-chat` — alternative open-source
- `mistralai/mixtral-8x7b-instruct` — plus puissant

### Ollama (local, gratuit)

```bash
# Installer Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Télécharger un modèle
ollama pull mistral
```

```env
LLM_MODE=ollama
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=mistral
```

### Mode Auto (fallback)

```env
LLM_MODE=auto
OPENROUTER_API_KEY=sk-or-...  # Essaie OpenRouter d'abord
OLLAMA_URL=http://localhost:11434  # Fallback sur Ollama
```

## Storyboard JSON — Format

Le LLM génère un JSON structuré suivant ce schéma :

```json
{
  "project_title": "Promo Produit X",
  "aspect_ratio": "9:16",
  "scenes": [
    {
      "id": 1,
      "duration_s": 4,
      "type": "hero",
      "text": "Découvrez le produit X — révolutionnez votre quotidien.",
      "assets": [{"type":"image","id":"<asset_uuid>","placement":"center","scale":"cover"}],
      "animation": "fade_in_up",
      "audio_clip": null,
      "tts_instruction": "female_african_accent_short"
    }
  ],
  "brand": {"primary_color":"#FF6B35", "logo_id":"<asset_uuid>"},
  "caption_short": "Découvrez le Produit X ! -30% #promo"
}
```

### Types de scène
| Type | Description |
|------|-------------|
| `hero` | Image plein écran + headline + CTA |
| `carousel` | Slides produits multiples |
| `feature_list` | Pictos + texte court |
| `demo` | Screen + caption |
| `outro` | Logo + call to action final |

### Animations
`fade_in_up`, `slide_left`, `zoom_in`, `bounce`, `scale_up`, `fade_out`

## Ajouter un template Remotion

1. Créer le composant dans `workers/remotion-worker/src/templates/MonTemplate.tsx`
2. L'enregistrer dans `workers/remotion-worker/src/compositions/index.ts`
3. Ajouter la logique de sélection dans `worker.ts` → `getCompositionId()`

Exemple minimal :

```tsx
import { AbsoluteFill, useCurrentFrame } from "remotion";

export const MonTemplate = ({ scenes, brand, assetUrls }) => {
  // ... votre logique de rendu
  return <AbsoluteFill>...</AbsoluteFill>;
};
```

## MinIO (S3) — Configuration

### Accès console
- URL : http://localhost:9001
- Login : `minioadmin` / `minioadmin`

### Variables d'environnement
```env
S3_ENDPOINT=http://localhost:9000
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_BUCKET=flash-motion
```

Le bucket est créé automatiquement au démarrage du backend.

## Quotas & Limites

Configurables par plan (FREE / PRO / ENTERPRISE) dans le modèle `Quota` :

| Paramètre | FREE | PRO (défaut seed) |
|-----------|------|-----|
| LLM calls/jour | 20 | 50 |
| Renders/jour | 5 | 10 |
| Storage | 500 MB | 1 GB |
| Max file size | 8 MB | 8 MB |
| Max assets/projet | 20 | 20 |

## Déploiement VPS (Hostinger KVM2 — 8GB)

```bash
# Sur le VPS
git clone <repo> flash-motion
cd flash-motion
cp .env.example .env
# Éditer .env avec les valeurs production (JWT_SECRET, mots de passe, etc.)

cd infra
chmod +x deploy.sh
./deploy.sh
```

### Contraintes 8GB VPS
- `MAX_CONCURRENT_RENDERS=1` (un seul rendu simultané)
- Le worker Remotion nécessite Chromium — prévoir ~2GB pour le rendu
- Cleanup automatique des fichiers temporaires

## API Endpoints

### Auth
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Inscription |
| POST | `/api/auth/login` | Connexion |
| GET | `/api/auth/me` | Profil utilisateur |

### Projects
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/projects` | Liste des projets |
| POST | `/api/projects` | Créer un projet |
| GET | `/api/projects/:id` | Détails projet |
| PUT | `/api/projects/:id` | Modifier projet |
| DELETE | `/api/projects/:id` | Supprimer projet |
| POST | `/api/projects/:id/generate-storyboard` | Générer storyboard (LLM) |
| PUT | `/api/projects/:id/storyboard` | Modifier storyboard |
| POST | `/api/projects/:id/render` | Lancer rendu vidéo |
| GET | `/api/projects/:id/render/:jobId` | Status du rendu |

### Assets
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/projects/:id/assets` | Upload assets (multipart) |
| GET | `/api/projects/:id/assets` | Liste assets (avec URLs signées) |
| DELETE | `/api/projects/:id/assets/:assetId` | Supprimer asset |

## Stack Technique

- **Backend** : Express.js, Prisma ORM, PostgreSQL
- **Frontend** : Next.js 14, Tailwind CSS, Zustand
- **Render** : Remotion (React → video), BullMQ (Redis queue)
- **Storage** : MinIO (S3-compatible)
- **LLM** : OpenRouter (Mistral/Llama) + Ollama fallback
- **Auth** : JWT + bcrypt
- **Validation** : Zod
- **Image processing** : Sharp

## Licence

Propriétaire — Flash Motion
