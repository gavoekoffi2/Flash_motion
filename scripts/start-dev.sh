#!/usr/bin/env bash
set -e

# Flash Motion — Development startup script
# Usage: bash scripts/start-dev.sh

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "=== Flash Motion — Starting dev environment ==="

# ── 1. PostgreSQL ──
echo "[1/5] Checking PostgreSQL..."
if pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
  echo "  ✓ PostgreSQL already running"
else
  echo "  Starting PostgreSQL..."
  sudo pg_ctlcluster 16 main start 2>/dev/null || sudo service postgresql start 2>/dev/null
  sleep 2
  if pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
    echo "  ✓ PostgreSQL started"
  else
    echo "  ✗ Failed to start PostgreSQL. Please start it manually."
    exit 1
  fi
fi

# ── 2. Redis ──
echo "[2/5] Checking Redis..."
if redis-cli ping > /dev/null 2>&1; then
  echo "  ✓ Redis already running"
else
  echo "  Starting Redis..."
  sudo redis-server --daemonize yes 2>/dev/null
  sleep 1
  if redis-cli ping > /dev/null 2>&1; then
    echo "  ✓ Redis started"
  else
    echo "  ✗ Failed to start Redis. Please start it manually."
    exit 1
  fi
fi

# ── 3. Create DB user/database if needed ──
echo "[3/5] Checking database..."
DB_EXISTS=$(sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='flashmotion'" 2>/dev/null || echo "")
if [ "$DB_EXISTS" = "1" ]; then
  echo "  ✓ Database 'flashmotion' exists"
else
  echo "  Creating database user and database..."
  sudo -u postgres psql -c "CREATE USER flashmotion WITH PASSWORD 'flashmotion' CREATEDB;" 2>/dev/null || true
  sudo -u postgres psql -c "CREATE DATABASE flashmotion OWNER flashmotion;" 2>/dev/null || true
  echo "  ✓ Database created"
fi

# ── 4. Backend setup ──
echo "[4/5] Setting up backend..."
cd "$ROOT/backend"
npm install --silent 2>/dev/null
npx prisma db push --skip-generate 2>/dev/null
echo "  ✓ Backend dependencies installed and database synced"

# ── 5. Frontend setup ──
echo "[5/5] Setting up frontend..."
cd "$ROOT/frontend"
npm install --silent 2>/dev/null
echo "  ✓ Frontend dependencies installed"

echo ""
echo "=== All services ready! ==="
echo ""
echo "To start the backend:   cd backend  && npm run dev"
echo "To start the frontend:  cd frontend && npm run dev"
echo ""
echo "Backend:  http://localhost:4000"
echo "Frontend: http://localhost:3000"
echo ""
echo "Note: S3/MinIO is optional — asset uploads require it."
echo "  To install MinIO: https://min.io/download"
