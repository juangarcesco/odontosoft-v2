#!/bin/bash

echo "=== 0. Limpieza de datos de pruebas anteriores ==="
docker exec odontosoft-mongo mongosh odontosoft --quiet --eval "db.facturas.deleteMany({items: {\$elemMatch: {procedimiento: {\$regex: '^PRUEBA_E2E_RIPS'}}}}); db.archivorips.deleteMany({periodo: '2099-01'})" > /dev/null
echo "Limpieza completada."
echo ""

echo "=== 1. Login RECEPCIONISTA, ODONTOLOGO, ADMIN ==="
TOKEN_RECEP=$(curl -s -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d '{"email":"recepcion@odontosoft.com","password":"Recepcion123!"}' | node -pe "JSON.parse(require('fs').readFileSync(0,'utf8')).token")
TOKEN_ODONTO=$(curl -s -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d '{"email":"odontologo@odontosoft.com","password":"Odonto123!"}' | node -pe "JSON.parse(require('fs').readFileSync(0,'utf8')).token")
TOKEN_ADMIN=$(curl -s -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d '{"email":"admin@odontosoft.com","password":"Admin123!"}' | node -pe "JSON.parse(require('fs').readFileSync(0,'utf8')).token")
echo "Tokens obtenidos."

PACIENTE_ID=$(docker exec odontosoft-mongo mongosh odontosoft --quiet --eval "print(db.pacientes.findOne({estado:'ACTIVO'})._id.toString())")

echo "=== 2. Crear factura COMPLETA para el periodo de prueba futuro (debe dar 201) ==="
curl -s -o /dev/null -w "Status: %{http_code}\n" -X POST http://localhost:3000/api/facturas -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN_RECEP" -d "{\"pacienteId\":\"$PACIENTE_ID\",\"items\":[{\"procedimiento\":\"PRUEBA_E2E_RIPS - Completa\",\"valor\":40000,\"codigoCups\":\"230601\",\"diagnostico\":\"K021\"}]}"

echo "=== 3. RECEPCIONISTA valida el periodo actual (debe dar 200) ==="
PERIODO_ACTUAL=$(date +%Y-%m)
curl -s -o /dev/null -w "Status: %{http_code}\n" "http://localhost:3000/api/rips/validar?periodo=$PERIODO_ACTUAL" -H "Authorization: Bearer $TOKEN_RECEP"

echo "=== 4. ODONTOLOGO intenta validar (debe dar 403) ==="
curl -s -o /dev/null -w "Status: %{http_code}\n" "http://localhost:3000/api/rips/validar?periodo=$PERIODO_ACTUAL" -H "Authorization: Bearer $TOKEN_ODONTO"

echo "=== 5. Validar con formato de periodo inválido (debe dar 400) ==="
curl -s -o /dev/null -w "Status: %{http_code}\n" "http://localhost:3000/api/rips/validar?periodo=invalido" -H "Authorization: Bearer $TOKEN_RECEP"

echo "=== 6. Generar RIPS de un periodo vacío/futuro sin atenciones (debe dar 404) ==="
curl -s -o /dev/null -w "Status: %{http_code}\n" -X POST http://localhost:3000/api/rips/generar -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN_RECEP" -d '{"periodo":"2099-01"}'

echo "=== 7. ODONTOLOGO intenta generar (debe dar 403) ==="
curl -s -o /dev/null -w "Status: %{http_code}\n" -X POST http://localhost:3000/api/rips/generar -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN_ODONTO" -d "{\"periodo\":\"$PERIODO_ACTUAL\"}"

echo "=== 8. Completar todas las facturas del periodo actual con CUPS/diagnóstico ==="
docker exec odontosoft-mongo mongosh odontosoft --quiet --eval "
db.facturas.updateMany(
  { estado: {\$ne: 'ANULADA'}, 'items.codigoCups': {\$in: [null, '']} },
  { \$set: { 'items.\$[].codigoCups': '230601', 'items.\$[].diagnostico': 'K021 - Caries de la dentina' } }
)" > /dev/null
echo "Facturas completadas."

echo "=== 9. RECEPCIONISTA genera el RIPS del periodo actual (debe dar 200) ==="
RESPUESTA=$(curl -s -X POST http://localhost:3000/api/rips/generar -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN_RECEP" -d "{\"periodo\":\"$PERIODO_ACTUAL\"}")
echo "$RESPUESTA" | node -pe "const r=JSON.parse(require('fs').readFileSync(0,'utf8')); r.usuarios ? 'Usuarios en el RIPS: ' + r.usuarios.length : 'Error: ' + r.mensaje"

echo "=== 10. RECEPCIONISTA consulta historial (debe dar 200, con al menos 1 registro) ==="
curl -s http://localhost:3000/api/rips/historial -H "Authorization: Bearer $TOKEN_RECEP" | node -pe "'Archivos en historial: ' + JSON.parse(require('fs').readFileSync(0,'utf8')).archivos.length"

echo "=== 11. ADMIN consulta historial (lectura permitida, debe dar 200) ==="
curl -s -o /dev/null -w "Status: %{http_code}\n" http://localhost:3000/api/rips/historial -H "Authorization: Bearer $TOKEN_ADMIN"

echo "=== 12. ODONTOLOGO intenta consultar historial (debe dar 403) ==="
curl -s -o /dev/null -w "Status: %{http_code}\n" http://localhost:3000/api/rips/historial -H "Authorization: Bearer $TOKEN_ODONTO"