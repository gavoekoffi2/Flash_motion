# Flash Motion — Text to Motion Design Video SaaS

Plateforme SaaS permettant de transformer un script texte en vidéo motion design professionnelle (MP4), avec templates, assets personnalisés, TTS et export multi-format.

## Architecture

```
flash-motion/
├── backend/              # Express API (Auth, Projects, Assets, LLM, TTS, Email)
│   ├── prisma/           # Schema PostgreSQL (User, Project, Asset, RenderJob, Quota)
│   └── src/
│       ├── config/       # DB, S3, Redis, env
│       ├── middleware/    # Auth JWT, file upload (multer)
│       ├── routes/       # auth, projects, assets, admin
│       ├── services/     # LLM, storage, renderQueue, TTS, email, quota
│       └── index.ts      # Express app entry
├── frontend/             # Next.js 14 (App Router, Tailwind CSS)
│   └── src/
│       ├── app/          # Pages: login, register, dashboard, projects, settings
│       ├── components/   # TemplateSelector, AssetUploader, StoryboardEditor, Toast
│       ├── hooks/        # useAuth (Zustand)
│       └── lib/          # API client, types
├── workers/
│   └── remotion-worker/  # BullMQ worker + Remotion render engine
│       └── src/
│           ├── templates/    # 5 templates (HeroPromo, Testimonial, Ecommerce, Educational, SaasLaunch)
│           ├── compositions/ # Remotion root (15 compositions = 5 templates × 3 ratios)
│           └── worker.ts     # Job consumer
├── infra/                # Docker configs + deployment
│   ├── docker-compose.dev.yml
│   ├── docker-compose.prod.yml
│   ├── Dockerfile.backend / .frontend / .worker
│   └── deploy.sh
├── demo/                 # 3 demo projects (storyboard JSON)
├── netlify.toml          # Netlify deployment config
└── .env.example          # All environment variables
```

## Quick Start (Developpement local)

### Prerequis
- Node.js >= 18
- Docker + Docker Compose
- (Optionnel) Ollama pour LLM local

### 1. Cloner et configurer

```bash
git clone https://github.com/gavoekoffi2/Flash_motion.git
cd Flash_motion
cp .env.example .env
# Editer .env avec vos valeurs (JWT_SECRET, API keys, etc.)
```

### 2. Lancer l'infrastructure

```bash
docker-compose -f infra/docker-compose.dev.yml up -d
```

Cela lance : PostgreSQL (port 5432), Redis (port 6379), MinIO (port 9000/9001).

### 3. Installer les dependances

```bash
# Depuis la racine (workspaces)
npm install

# Initialiser la base de donnees
cd backend && npx prisma db push && cd ..
```

### 4. Seed (donnees de demo)

```bash
cd backend && npm run db:seed && cd ..
```

Compte demo : `demo@flashmotion.dev` / `password123`

### 5. Lancer les services

```bash
# Terminal 1 — Backend API (port 4000)
cd backend && npm run dev

# Terminal 2 — Frontend (port 3000)
cd frontend && npm run dev

# Terminal 3 — Render Worker
cd workers/remotion-worker && npm run dev
```

- Frontend : http://localhost:3000
- Backend API : http://localhost:4000/api
- MinIO Console : http://localhost:9001 (minioadmin/minioadmin)

## Configuration

### LLM

| Mode | Variable | Description |
|------|----------|-------------|
| OpenRouter | `LLM_MODE=openrouter` | Cloud, rapide, necessite API key |
| Ollama | `LLM_MODE=ollama` | Local, gratuit, necessite GPU/CPU |
| Auto | `LLM_MODE=auto` | Essaie OpenRouter puis fallback Ollama |

Modeles recommandes :
- `mistralai/mistral-7b-instruct` — meilleur ratio perf/prix
- `meta-llama/llama-2-13b-chat` — alternative open-source

### TTS (Text-to-Speech)

| Engine | Variable | Description |
|--------|----------|-------------|
| None | `TTS_ENGINE=none` | Pas de TTS (defaut) |
| ElevenLabs | `TTS_ENGINE=elevenlabs` | Cloud, haute qualite, necessite API key |
| Piper | `TTS_ENGINE=piper` | Local, gratuit, necessite binaire piper |

### Email (SMTP)

Pour activer les emails (bienvenue, reset password, notification de rendu) :

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=app-specific-password
SMTP_FROM=noreply@flashmotion.dev
```

## Templates disponibles

| Template | Usage | Description |
|----------|-------|-------------|
| HeroPromo | Marketing, lancement | Hero + features + CTA |
| Testimonial | Social proof | Avis clients, quotes, etoiles |
| EcommerceShowcase | E-commerce | Produits, prix, grille |
| Educational | Formation | Steps, progression, tutoriel |
| SaasLaunch | Tech, startup | Mockups, features, CTA |

Chaque template supporte 3 formats : **9:16** (Stories), **16:9** (YouTube), **1:1** (Instagram).

## API Endpoints

### Auth
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Inscription |
| POST | `/api/auth/login` | Connexion |
| GET | `/api/auth/me` | Profil + quotas |
| PUT | `/api/auth/profile` | Modifier profil |
| PUT | `/api/auth/password` | Changer mot de passe |
| POST | `/api/auth/forgot-password` | Demander reset |
| POST | `/api/auth/reset-password` | Reset avec token |

### Projects
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/projects` | Liste paginee |
| POST | `/api/projects` | Creer projet (+ template) |
| GET | `/api/projects/:id` | Details + assets + renders |
| PUT | `/api/projects/:id` | Modifier |
| DELETE | `/api/projects/:id` | Supprimer (+ cleanup S3) |
| POST | `/api/projects/:id/duplicate` | Dupliquer |
| POST | `/api/projects/:id/generate-storyboard` | Generer storyboard (LLM) |
| PUT | `/api/projects/:id/storyboard` | Modifier storyboard |
| POST | `/api/projects/:id/generate-tts` | Generer TTS scenes |
| POST | `/api/projects/:id/render` | Lancer rendu video |
| GET | `/api/projects/:id/render/:jobId` | Status du rendu |

### Assets
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/projects/:id/assets` | Upload (multipart, max 8MB) |
| GET | `/api/projects/:id/assets` | Liste avec URLs signees |
| DELETE | `/api/projects/:id/assets/:assetId` | Supprimer |

### Admin
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/stats` | Statistiques plateforme |
| GET | `/api/admin/users` | Liste utilisateurs |
| PUT | `/api/admin/users/:id/quota` | Modifier quotas |
| PUT | `/api/admin/users/:id/plan` | Modifier plan |

## Deploiement

### Frontend sur Netlify

1. Connecter le repo GitHub dans Netlify
2. Configurer :
   - **Build command** : `cd frontend && npm install && npm run build`
   - **Publish directory** : `frontend/.next`
   - **Node version** : 20
3. Ajouter les variables d'environnement (voir ENVIRONMENT.md)

### Backend + Worker sur VPS (Docker)

```bash
ssh user@your-vps
git clone <repo> flash-motion && cd flash-motion
cp .env.example .env
# Editer .env avec valeurs production
cd infra && chmod +x deploy.sh && ./deploy.sh
```

### Contraintes VPS 8GB
- `MAX_CONCURRENT_RENDERS=1` (un seul rendu simultane)
- Worker Remotion necessite Chromium (~2GB RAM pour le rendu)
- Cleanup automatique des fichiers temporaires

## Stack Technique

- **Backend** : Express.js, Prisma ORM, PostgreSQL, BullMQ
- **Frontend** : Next.js 14, Tailwind CSS, Zustand, react-dropzone
- **Render** : Remotion (React -> video), 5 templates, 15 compositions
- **Storage** : MinIO (S3-compatible), signed URLs
- **LLM** : OpenRouter (Mistral/Llama) + Ollama fallback
- **TTS** : ElevenLabs + Piper
- **Email** : Nodemailer (SMTP)
- **Auth** : JWT + bcrypt
- **Validation** : Zod (backend), TypeScript strict (frontend)

## Licence

Proprietaire — Flash Motion
