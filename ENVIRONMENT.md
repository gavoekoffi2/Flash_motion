# Flash Motion — Variables d'Environnement

## Variables Backend (VPS Docker)

| Variable | Obligatoire | Defaut | Description |
|----------|-------------|--------|-------------|
| `NODE_ENV` | Oui | `development` | `development` ou `production` |
| `PORT` | Non | `4000` | Port du serveur Express |
| `FRONTEND_URL` | Oui | `http://localhost:3000` | URL du frontend (CORS) |
| `APP_URL` | Non | valeur de FRONTEND_URL | URL publique de l'app |
| `DATABASE_URL` | Oui | - | Connection string PostgreSQL |
| `REDIS_URL` | Oui | `redis://localhost:6379` | Connection string Redis |
| `JWT_SECRET` | Oui | - | Secret JWT (min 32 chars en prod) |
| `JWT_EXPIRES_IN` | Non | `7d` | Duree de validite des tokens |
| `S3_ENDPOINT` | Oui | `http://localhost:9000` | Endpoint MinIO/S3 |
| `S3_ACCESS_KEY` | Oui | `minioadmin` | Access key S3 |
| `S3_SECRET_KEY` | Oui | `minioadmin` | Secret key S3 |
| `S3_BUCKET` | Non | `flash-motion` | Nom du bucket |
| `S3_REGION` | Non | `us-east-1` | Region S3 |
| `LLM_MODE` | Non | `auto` | `openrouter`, `ollama`, ou `auto` |
| `OPENROUTER_API_KEY` | Si LLM_MODE=openrouter | - | Cle API OpenRouter |
| `OPENROUTER_MODEL` | Non | `mistralai/mistral-7b-instruct` | Modele OpenRouter |
| `OLLAMA_URL` | Si LLM_MODE=ollama | `http://localhost:11434` | URL serveur Ollama |
| `OLLAMA_MODEL` | Non | `mistral` | Modele Ollama |
| `TTS_ENGINE` | Non | `none` | `none`, `elevenlabs`, ou `piper` |
| `ELEVENLABS_API_KEY` | Si TTS=elevenlabs | - | Cle API ElevenLabs |
| `PIPER_MODEL` | Si TTS=piper | `fr_FR-upmc-medium` | Modele Piper local |
| `SMTP_HOST` | Non | - | Serveur SMTP (ex: smtp.gmail.com) |
| `SMTP_PORT` | Non | `587` | Port SMTP |
| `SMTP_USER` | Non | - | Utilisateur SMTP |
| `SMTP_PASS` | Non | - | Mot de passe SMTP |
| `SMTP_FROM` | Non | `noreply@flashmotion.dev` | Adresse expediteur |
| `MAX_CONCURRENT_RENDERS` | Non | `1` | Rendus simultanes max |
| `RENDER_TIMEOUT_MS` | Non | `300000` | Timeout rendu (5 min) |
| `TEMP_DIR` | Non | `/tmp/flash-motion` | Dossier temporaire rendus |
| `MAX_FILE_SIZE_MB` | Non | `8` | Taille max upload (MB) |
| `MAX_ASSETS_PER_PROJECT` | Non | `20` | Assets max par projet |
| `RETENTION_DAYS` | Non | `30` | Jours de retention |

## Variables Frontend (Netlify)

| Variable | Obligatoire | Defaut | Description |
|----------|-------------|--------|-------------|
| `NEXT_PUBLIC_API_URL` | Oui | `http://localhost:4000/api` | URL de l'API backend |
| `BACKEND_URL` | Oui (Netlify) | - | URL backend pour proxy redirects |

## Configuration Netlify

Dans le dashboard Netlify > Site settings > Environment variables, ajouter :

```
NEXT_PUBLIC_API_URL = https://api.votre-domaine.com/api
BACKEND_URL = https://api.votre-domaine.com
```

## Configuration Docker (Production)

Les variables sont lues depuis le fichier `.env` a la racine du projet.
Voir `.env.example` pour un template complet.

```bash
cp .env.example .env
# Editer avec vos valeurs de production
nano .env
```

**Important en production :**
- `JWT_SECRET` : generer avec `openssl rand -base64 48`
- `S3_ACCESS_KEY` / `S3_SECRET_KEY` : changer les valeurs par defaut
- `NODE_ENV=production`
- `FRONTEND_URL` : URL Netlify (ex: `https://flashmotion.netlify.app`)
