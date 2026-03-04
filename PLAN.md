# Flash Motion — Roadmap & Tickets

## Sprint 1 : MVP (FAIT)
- [x] Backend Express + Prisma + PostgreSQL
- [x] Auth JWT (register, login, me)
- [x] CRUD projets + storyboard JSON
- [x] Upload assets (images, logos, audio, fonts) via MinIO
- [x] Generation storyboard via LLM (OpenRouter + Ollama fallback)
- [x] Pipeline de rendu Remotion avec BullMQ
- [x] Template HeroPromo (5 types de scenes)
- [x] Frontend Next.js 14 (login, dashboard, projet, storyboard editor)
- [x] Docker Compose (dev + prod)
- [x] 3 projets demo

## Sprint 2 : Audit & Stabilisation (FAIT)
- [x] Correction 40+ bugs (UUID, validation, quota, S3 cleanup)
- [x] Validation Zod complete des storyboards
- [x] Pagination, transactions, rate limiting
- [x] Routes admin (stats, users, quotas)
- [x] Health check avec test DB
- [x] Security headers frontend

## Sprint 3 : Templates & UX Pro (FAIT)
- [x] 4 nouveaux templates (Testimonial, Ecommerce, Educational, SaasLaunch)
- [x] Template selector UI avec wizard 2 etapes
- [x] Service TTS (ElevenLabs + Piper)
- [x] Service Email (nodemailer)
- [x] Systeme de notifications toast
- [x] Page parametres (profil, mot de passe, quotas)
- [x] Pages forgot-password et reset-password
- [x] Duplication de projets
- [x] Storyboard editor avance (timeline, asset picker, ajout scenes)
- [x] Asset uploader avec previews
- [x] Video player preview dans onglet rendu
- [x] Configuration Netlify (netlify.toml)
- [x] Documentation complete (README, ENVIRONMENT, REPORT)

## Sprint 4 : Tests & Qualite (A FAIRE)
- [ ] Tests unitaires backend (Vitest + Supertest)
  - [ ] Tests auth routes
  - [ ] Tests projects CRUD
  - [ ] Tests storyboard validation
  - [ ] Tests asset upload/delete
  - [ ] Tests quota reset logic
- [ ] Tests E2E frontend (Playwright)
  - [ ] Flow complet : login -> creer projet -> generer storyboard -> render
  - [ ] Test upload assets
  - [ ] Test settings/profil
- [ ] CI/CD pipeline (GitHub Actions)
  - [ ] Lint + typecheck on PR
  - [ ] Tests on PR
  - [ ] Auto-deploy on merge to main

## Sprint 5 : Performance & Monitoring (A FAIRE)
- [ ] Logging structure (Winston/Pino)
- [ ] Error tracking (Sentry)
- [ ] APM (metriques de performance)
- [ ] Websocket pour statut rendu en temps reel
- [ ] Cache Redis pour sessions et storyboards
- [ ] CDN pour assets statiques
- [ ] Image optimization (sharp thumbnails)

## Sprint 6 : Fonctionnalites Avancees (A FAIRE)
- [ ] Partage de projets (share links publics)
- [ ] Export presets sociaux (Instagram, TikTok, YouTube, LinkedIn)
- [ ] Collaboration (multi-utilisateurs par projet)
- [ ] Historique de versions storyboard
- [ ] Templates marketplace (upload custom templates)
- [ ] API publique (webhook de rendu terminé)
- [ ] Internationalisation (i18n : FR, EN, ES)

## Sprint 7 : Monetisation (A FAIRE)
- [ ] Integration Stripe/Paddle
- [ ] Plans PRO et ENTERPRISE avec limites differentes
- [ ] Page pricing
- [ ] Portail client pour gerer l'abonnement
- [ ] Facturation et recus email
- [ ] Trial gratuit avec watermark

## Sprint 8 : Scale (A FAIRE)
- [ ] Horizontal scaling workers (multi-VPS)
- [ ] Queue prioritaire (PRO renders en premier)
- [ ] Auto-scaling basé sur la charge
- [ ] Migration vers S3 AWS / Cloudflare R2
- [ ] Backup PostgreSQL automatise (pg_dump cron)
- [ ] Load balancer backend
