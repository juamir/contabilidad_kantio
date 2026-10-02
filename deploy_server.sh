#!/usr/bin/env bash
set -e

echo "[1/6] Preparando red Dokploy..."
sudo docker network inspect dokploy-network >/dev/null 2>&1 || sudo docker network create dokploy-network

echo "[2/6] Construyendo imagen de Backend (FastAPI + OCR)..."
sudo docker build -t kantio-conta-backend:latest /home/ubuntu/kantio_contabilidad/contaback

echo "[3/6] Desplegando contenedor kantio-conta-api..."
sudo docker stop kantio-conta-api 2>/dev/null || true
sudo docker rm kantio-conta-api 2>/dev/null || true
sudo docker run -d \
  --name kantio-conta-api \
  --restart always \
  --network dokploy-network \
  -p 8002:8000 \
  -e ENVIRONMENT=production \
  -e DATABASE_URL="postgresql+asyncpg://kantio_admin:KantioPostgres2026Master!@kantio-postgres:5432/kantio_contabilidad" \
  -e DATABASE_URL_SYNC="postgresql://kantio_admin:KantioPostgres2026Master!@kantio-postgres:5432/kantio_contabilidad" \
  -e KANTIO_CORE_URL="http://kantio-core-api:8000" \
  -e SECRET_KEY="kantio_conta_prod_secret_key_2026_super_secure" \
  -e PORT=8000 \
  kantio-conta-backend:latest

echo "[4/6] Construyendo imagen de Frontend (React + Berry + PWA)..."
sudo docker build -t kantio-conta-frontend:latest /home/ubuntu/kantio_contabilidad/contafront

echo "[5/6] Desplegando contenedor kantio-conta-web..."
sudo docker stop kantio-conta-web 2>/dev/null || true
sudo docker rm kantio-conta-web 2>/dev/null || true
sudo docker run -d \
  --name kantio-conta-web \
  --restart always \
  --network dokploy-network \
  -p 8082:80 \
  kantio-conta-frontend:latest

echo "[6/6] Configurando routing dinamico Traefik..."
sudo cp /home/ubuntu/kantio_contabilidad/kantio-contabilidad.traefik.yml /etc/dokploy/traefik/dynamic/kantio-contabilidad.yml

echo "Esperando arranque de servicios..."
sleep 6

echo "Verificando API:"
curl -s http://localhost:8002/health || true
echo ""
echo "Verificando Web:"
curl -I -s http://localhost:8082 || true
echo ""
echo "=== DESPLIEGUE EN PRODUCCION EXITOSO ==="
