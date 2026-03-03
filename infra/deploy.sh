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

echo "[1/4] Starting infrastructure services..."
docker-compose -f docker-compose.prod.yml up -d postgres redis minio

echo "[2/4] Waiting for services to be healthy..."
sleep 5

echo "[3/4] Building and starting application..."
docker-compose -f docker-compose.prod.yml up -d --build backend frontend worker

echo "[4/4] Running database migrations..."
docker-compose -f docker-compose.prod.yml exec backend npx prisma db push --skip-generate

echo ""
echo "=== Deployment complete! ==="
echo "Frontend: http://localhost:3000"
echo "Backend API: http://localhost:4000"
echo "MinIO Console: http://localhost:9001"
echo ""
echo "To seed demo data: docker-compose -f docker-compose.prod.yml exec backend npx tsx src/seed.ts"
