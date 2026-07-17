#!/bin/bash
# scripts/dev-start.sh
#
# Arranca Mongo, backend y frontend, espera a que estén listos,
# y guarda tokens de los 3 roles de prueba en .tokens.env
# (en la raíz del repo) para cargarlos rápido en cualquier terminal.
#
# Uso:
#   ./scripts/dev-start.sh
#
# Luego, en cualquier terminal nueva que abras:
#   source .tokens.env

set -e

# Resuelve la raíz del repo sin importar desde dónde se ejecute el script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

BACKEND_DIR="$REPO_ROOT/backend"
FRONTEND_DIR="$REPO_ROOT/frontend"
LOG_DIR="$REPO_ROOT/.dev-logs"
TOKENS_FILE="$REPO_ROOT/.tokens.env"

mkdir -p "$LOG_DIR"

echo "=== 1. Levantando MongoDB (Docker) ==="
cd "$REPO_ROOT"
docker compose up -d

echo "=== 2. Esperando a que el backend esté disponible ==="
cd "$BACKEND_DIR"

# Si ya hay un backend corriendo en el puerto 3000, no lo dupliques
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health 2>/dev/null | grep -q "200"; then
  echo "Backend ya está corriendo."
else
  echo "Iniciando backend en segundo plano (log: $LOG_DIR/backend.log)..."
  nohup npm run dev > "$LOG_DIR/backend.log" 2>&1 &
  disown

  # Espera activa hasta 30 segundos a que /api/health responda 200
  for i in $(seq 1 30); do
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health 2>/dev/null | grep -q "200"; then
      echo "Backend listo."
      break
    fi
    sleep 1
  done
fi

STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health 2>/dev/null || echo "000")
if [ "$STATUS" != "200" ]; then
  echo "⚠️  El backend no respondió a tiempo. Revisa $LOG_DIR/backend.log"
  exit 1
fi

echo "=== 3. Iniciando frontend en segundo plano (log: $LOG_DIR/frontend.log) ==="
cd "$FRONTEND_DIR"

if pgrep -f "ng serve" > /dev/null; then
  echo "Frontend ya está corriendo."
else
  nohup ng serve --host 0.0.0.0 > "$LOG_DIR/frontend.log" 2>&1 &
  disown
  echo "Frontend arrancando (puede tardar unos segundos en compilar)."
fi

echo "=== 4. Login de los 3 roles de prueba y captura de tokens ==="

TOKEN_ADMIN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@odontosoft.com","password":"'"${SEED_ADMIN_PASSWORD:-Admin123!}"'"}' \
  | node -pe "JSON.parse(require('fs').readFileSync(0,'utf8')).token" 2>/dev/null || echo "")

TOKEN_ODONTO=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"odontologo@odontosoft.com","password":"'"${SEED_ODONTOLOGO_PASSWORD:-Odonto123!}"'"}' \
  | node -pe "JSON.parse(require('fs').readFileSync(0,'utf8')).token" 2>/dev/null || echo "")

TOKEN_RECEP=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"recepcion@odontosoft.com","password":"'"${SEED_RECEPCIONISTA_PASSWORD:-Recepcion123!}"'"}' \
  | node -pe "JSON.parse(require('fs').readFileSync(0,'utf8')).token" 2>/dev/null || echo "")

# ID de un paciente activo de prueba, útil en la mayoría de pruebas manuales
PACIENTE_ID=$(docker exec odontosoft-mongo mongosh odontosoft --quiet \
  --eval "print(db.pacientes.findOne({estado:'ACTIVO'}) ? db.pacientes.findOne({estado:'ACTIVO'})._id.toString() : '')" 2>/dev/null || echo "")

cat > "$TOKENS_FILE" << EOF
# Generado por scripts/dev-start.sh — no versionar (ver .gitignore)
export TOKEN_ADMIN="$TOKEN_ADMIN"
export TOKEN_ODONTO="$TOKEN_ODONTO"
export TOKEN_RECEP="$TOKEN_RECEP"
export PACIENTE_ID="$PACIENTE_ID"
EOF

echo ""
echo "=== Listo ==="
echo "Backend:  http://localhost:3000/api/health"
echo "Frontend: revisa la pestaña PUERTOS de VS Code (puerto 4200)"
echo ""

if [ -z "$TOKEN_ADMIN" ] || [ -z "$TOKEN_ODONTO" ] || [ -z "$TOKEN_RECEP" ]; then
  echo "⚠️  Alguno de los tokens quedó vacío (revisa si los usuarios de seed existen:"
  echo "    cd backend && node src/scripts/seedAdmin.js && node src/scripts/seedRoles.js)"
else
  echo "✅ Tokens de ADMIN, ODONTOLOGO y RECEPCIONISTA guardados en:"
  echo "   $TOKENS_FILE"
fi

echo ""
echo "En cualquier terminal, para usar los tokens:"
echo "   source $TOKENS_FILE"
echo "   echo \$TOKEN_ADMIN"