#!/bin/bash
set -e

echo "=== Flash Motion — Deployment Script ==="
echo ""

# Check if .env exists
if [ ! -f ../.env ]; then
  echo "[!] No .env file found. Copying from .env.example..."
  cp ../.env.example ../.env
  echo "[!] PLEASE EDIT .env with your production values before continuing!"
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
if [ -z "$S3_SECRET_KEY" ] || [ "$S3_SECRET_KEY" = "minioadmin" ]; then
  echo "[WARN] S3_SECRET_KEY is using default MinIO credentials. Change for production."
fi
if [ "$ERRORS" -eq 1 ]; then
  echo ""
  echo "[!] Fix the errors above in ../.env before deploying."
  exit 1
fi

echo "[1/5] Starting infrastructure services..."
docker-compose -f docker-compose.prod.yml up -d postgres redis minio

echo "[2/5] Waiting for services to be healthy..."
docker-compose -f docker-compose.prod.yml exec -T postgres sh -c 'until pg_isready -U ${POSTGRES_USER:-flashmotion}; do sleep 1; done' 2>/dev/null || sleep 10

echo "[3/5] Building and starting application..."
docker-compose -f docker-compose.prod.yml up -d --build backend frontend worker

echo "[4/5] Running database migrations..."
docker-compose -f docker-compose.prod.yml exec -T backend npx prisma db push --skip-generate

echo "[5/5] Verifying services..."
sleep 3
docker-compose -f docker-compose.prod.yml ps

echo ""
echo "=== Deployment complete! ==="
echo "Frontend:      http://localhost:3000"
echo "Backend API:   http://localhost:4000"
echo "Health check:  http://localhost:4000/api/health"
echo "MinIO Console: http://localhost:9001"
echo ""
echo "To seed demo data:"
echo "  docker-compose -f docker-compose.prod.yml exec backend npx tsx src/seed.ts"
echo ""
echo "To view logs:"
echo "  docker-compose -f docker-compose.prod.yml logs -f"
