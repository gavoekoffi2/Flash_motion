#!/bin/bash
set -e

# ═══════════════════════════════════════════════════════
# Flash Motion — Hostinger VPS Deployment
# Run from the project root: bash infra/deploy.sh
# ═══════════════════════════════════════════════════════

COMPOSE_FILE="infra/docker-compose.hostinger.yml"
COMPOSE="docker compose -f $COMPOSE_FILE"

echo "=== Flash Motion — VPS Deployment ==="
echo ""

# ── Load .env if it exists ──
if [ -f .env ]; then
  set -a; source .env; set +a
  echo "[OK] Loaded .env"
elif [ -f infra/.env ]; then
  set -a; source infra/.env; set +a
  echo "[OK] Loaded infra/.env"
else
  echo "[WARN] No .env file found. Using environment variables or defaults."
fi

# ── Validate critical secrets ──
ERRORS=0
if [ -z "$DB_PASSWORD" ]; then
  echo "[ERROR] DB_PASSWORD is required"
  ERRORS=1
fi
if [ -z "$JWT_SECRET" ]; then
  echo "[ERROR] JWT_SECRET is required (min 32 chars)"
  echo "  Generate one: openssl rand -base64 48"
  ERRORS=1
fi
if [ -z "$S3_SECRET_KEY" ]; then
  echo "[ERROR] S3_SECRET_KEY is required"
  ERRORS=1
fi
if [ "$ERRORS" -eq 1 ]; then
  echo ""
  echo "Create a .env file with these variables and re-run."
  exit 1
fi
echo "[OK] Environment variables validated"

# ── Ensure Traefik network exists ──
echo ""
echo "[1/5] Checking Docker network 'web'..."
if docker network inspect web >/dev/null 2>&1; then
  echo "[OK] Network 'web' exists"
else
  echo "[WARN] Network 'web' not found. Creating it..."
  docker network create web
  echo "[OK] Network 'web' created"
fi

# ── Pull or build images ──
echo ""
echo "[2/5] Pulling Docker images..."
BUILD_FLAG=""
if $COMPOSE pull backend worker 2>/dev/null; then
  echo "[OK] Using GHCR images"
else
  echo "[INFO] GHCR images not available — will build locally"
  BUILD_FLAG="--build"
fi

# ── Start infrastructure first ──
echo ""
echo "[3/5] Starting infrastructure (postgres, redis, minio)..."
$COMPOSE up -d postgres redis minio
echo "Waiting for infrastructure to be healthy..."
sleep 8

# ── Start backend + worker ──
echo ""
echo "[4/5] Starting backend and worker..."
$COMPOSE up -d $BUILD_FLAG backend worker

# ── Health check ──
echo ""
echo "[5/5] Waiting for backend health check..."
sleep 12

echo ""
echo "=== HEALTH CHECKS ==="
echo ""

# Direct test (bypasses Traefik)
echo "1. Direct backend test (localhost:4000):"
if curl -sf http://localhost:4000/api/health 2>/dev/null; then
  echo "   [OK] Backend is running!"
else
  echo "   [FAIL] Backend not responding"
  echo ""
  echo "   Container logs:"
  $COMPOSE logs --tail=20 backend
  echo ""
  echo "   Container status:"
  $COMPOSE ps backend
  exit 1
fi

# Traefik test
echo ""
API_DOMAIN="${API_DOMAIN:-api.finablasolution.cloud}"
echo "2. Traefik routing test (https://$API_DOMAIN):"
if curl -sf "https://$API_DOMAIN/api/health" 2>/dev/null; then
  echo "   [OK] Traefik routing works!"
else
  echo "   [WARN] Cannot reach via Traefik yet"
  echo "   Possible causes:"
  echo "   - DNS: run 'nslookup $API_DOMAIN' to verify"
  echo "   - TLS cert may take 1-2 min to provision"
  echo "   - Check Traefik: docker logs \$(docker ps -q -f name=traefik) --tail=20"
fi

echo ""
echo "=== CONTAINER STATUS ==="
$COMPOSE ps
echo ""
echo "=== DEPLOYMENT COMPLETE ==="
echo ""
echo "Backend API:  https://$API_DOMAIN/api/health"
echo "Frontend:     https://flashmotion.netlify.app"
echo ""
echo "Useful commands:"
echo "  $COMPOSE logs -f backend      # Watch backend logs"
echo "  $COMPOSE logs -f worker       # Watch worker logs"
echo "  $COMPOSE restart backend      # Restart backend"
echo "  curl http://localhost:4000/api/health  # Quick health check"
