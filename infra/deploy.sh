#!/bin/bash
set -e

COMPOSE="docker compose -f docker-compose.prod.yml"

echo "=== Flash Motion — Production Deployment ==="
echo "Architecture: Frontend on Netlify | Backend on this VPS"
echo ""

# Check if .env exists
if [ ! -f ../.env ]; then
  echo "[!] No .env file found. Copying from .env.example..."
  cp ../.env.example ../.env
  echo "[!] PLEASE EDIT ../.env with your production values before continuing!"
  exit 1
fi

# Source env
set -a
source ../.env
set +a

# Validate critical environment variables
ERRORS=0
if [ -z "$JWT_SECRET" ] || [ "$JWT_SECRET" = "change-me-in-production-use-openssl-rand-base64-48" ]; then
  echo "[ERROR] JWT_SECRET must be set to a strong secret. Run: openssl rand -base64 48"
  ERRORS=1
fi
if [ -z "$DB_PASSWORD" ] || [ "$DB_PASSWORD" = "change-me" ]; then
  echo "[ERROR] DB_PASSWORD must be changed from default."
  ERRORS=1
fi
if [ -z "$API_DOMAIN" ]; then
  echo "[ERROR] API_DOMAIN must be set (e.g. api.flashmotion.dev). Caddy needs it for HTTPS."
  ERRORS=1
fi
if [ -z "$S3_SECRET_KEY" ] || [ "$S3_SECRET_KEY" = "minioadmin" ]; then
  echo "[WARN]  S3_SECRET_KEY is using default MinIO credentials. Change for production."
fi
if [ "$ERRORS" -eq 1 ]; then
  echo ""
  echo "[!] Fix the errors above in ../.env before deploying."
  exit 1
fi

echo "[1/4] Starting infrastructure (postgres, redis, minio)..."
$COMPOSE up -d postgres redis minio

echo "[2/4] Waiting for services to be healthy..."
$COMPOSE exec -T postgres sh -c 'until pg_isready -U ${POSTGRES_USER:-flashmotion}; do sleep 1; done' 2>/dev/null || sleep 10

echo "[3/4] Building and starting backend + caddy + worker..."
$COMPOSE up -d --build backend caddy worker

echo "[4/4] Verifying services..."
sleep 5
$COMPOSE ps

echo ""
echo "=== Deployment complete! ==="
echo ""
echo "Backend API:   https://${API_DOMAIN}/api/health"
echo "MinIO Console: http://localhost:9001 (local only)"
echo ""
echo "Netlify frontend config:"
echo "  BACKEND_URL = https://${API_DOMAIN}"
echo "  NEXT_PUBLIC_API_URL = https://${API_DOMAIN}/api"
echo ""
echo "Useful commands:"
echo "  $COMPOSE logs -f              # View all logs"
echo "  $COMPOSE logs -f backend      # Backend logs only"
echo "  $COMPOSE exec backend npx tsx src/seed.ts  # Seed demo data"
echo "  $COMPOSE restart backend      # Restart backend"
