# Flash Motion — Release Notes

## v0.3.0 — Templates Pro, TTS, UX Améliorée, Netlify (4 Mars 2026)

### Nouvelles fonctionnalites

#### Templates Remotion (4 nouveaux)
- **Testimonial** : video temoignage client avec citations, avatars et notes etoiles
- **EcommerceShowcase** : showcase produit avec grille carousel, prix et CTA
- **Educational** : tutoriel pas a pas avec barre de progression et etapes numerotees
- **SaasLaunch** : lancement produit tech avec maquettes, features et animations perspective

#### Service TTS (Text-to-Speech)
- Support **ElevenLabs** (cloud, haute qualite, voix multilingues)
- Support **Piper** (local, gratuit, francais)
- Endpoint `POST /projects/:id/generate-tts` pour generer l'audio de chaque scene
- Les audio clips sont automatiquement stockes dans S3

#### Service Email
- Email de bienvenue a l'inscription
- Email de reset de mot de passe avec token
- Notification email quand un rendu est termine
- Support SMTP configurable (Gmail, SendGrid, etc.)

#### Frontend
- **Template Selector** : wizard 2 etapes avec preview visuel des 5 templates
- **Toast Notifications** : systeme global de notifications (success, error, info, warning)
- **Page Parametres** : modification profil, changement mot de passe, dashboard quotas
- **Pages Auth** : forgot-password et reset-password completes
- **Dashboard** : loading skeletons, boutons dupliquer/supprimer, labels de statut
- **Storyboard Editor** : timeline visuelle, ajout de scenes, asset picker, editeur couleur brand
- **Asset Uploader** : preview thumbnails avant upload, gestion batch
- **Render Tab** : barre de progression avec pourcentage, lecteur video integre
- **Script editable** : modification in-place du script depuis la page projet

#### Backend
- Endpoint duplication projet (`POST /projects/:id/duplicate`)
- Endpoint generation TTS (`POST /projects/:id/generate-tts`)
- Champ `template` dans le schema projet
- Routes auth etendues (profil, password, forgot/reset)
- Dependance `nodemailer` ajoutee

#### Deploiement
- **netlify.toml** a la racine du repo pour deploiement Netlify
- Plugin `@netlify/plugin-nextjs` configure
- Proxy API backend via redirects Netlify
- Headers de securite (CSP, XSS, HSTS)

---

## v0.2.0 — Audit Expert & Corrections (Session precedente)

### Corrections critiques
- Fix import UUID casse (`crypto.v4` n'existe pas)
- Remplacement `z.any()` par schema Zod complet pour storyboard
- Implementation logique de reset quotidien des quotas
- Cleanup S3 a la suppression de projets (plus d'orphelins)
- Fix tracking quota stockage (upload/delete)

### Ameliorations
- Pagination projets avec `page/limit/total`
- Transactions Prisma pour creation render jobs
- Rate limiting strict (15 login/15min, 10 register/h)
- Validation secrets production au demarrage
- Routes admin (stats, users, gestion quotas/plans)
- Health check avec test connexion DB
- Error boundary et page 404 frontend
- Security headers (X-Content-Type, X-Frame, XSS-Protection)
- Tous les 5 types de scenes renderer dans HeroPromo
- Fix Dockerfiles (build context, NEXT_PUBLIC args, prisma worker)
- Resource limits et volumes Docker prod

---

## v0.1.0 — MVP Initial (Session initiale)

### Fonctionnalites
- Backend Express.js avec Prisma/PostgreSQL
- Auth JWT (register, login, me)
- CRUD projets complet
- Upload assets via MinIO (images, logos, audio, fonts)
- Generation storyboard via LLM (OpenRouter + Ollama fallback)
- Pipeline de rendu Remotion avec BullMQ
- Template HeroPromo avec 5 types de scenes
- Frontend Next.js 14 (App Router, Tailwind CSS)
- Dashboard, creation projet, editeur storyboard
- Docker Compose dev et prod
- 3 projets demo avec seed
- 56 fichiers, ~4000 lignes de code

### Stack
Express.js | Next.js 14 | Prisma | PostgreSQL | Redis | MinIO | Remotion | BullMQ | Tailwind CSS | Zustand | Zod
