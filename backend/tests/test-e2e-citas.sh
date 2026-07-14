#!/bin/bash

echo "=== 0. Limpieza de datos de pruebas anteriores ==="
docker exec odontosoft-mongo mongosh odontosoft --quiet --eval "db.citas.deleteMany({motivo: {\$regex: '^PRUEBA_E2E'}})" > /dev/null
echo "Limpieza completada."
echo ""

echo "=== 1. Login RECEPCIONISTA, ODONTOLOGO, ADMIN ==="
TOKEN_RECEP=$(curl -s -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d '{"email":"recepcion@odontosoft.com","password":"Recepcion123!"}' | node -pe "JSON.parse(require('fs').readFileSync(0,'utf8')).token")
TOKEN_ODONTO=$(curl -s -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d '{"email":"odontologo@odontosoft.com","password":"Odonto123!"}' | node -pe "JSON.parse(require('fs').readFileSync(0,'utf8')).token")
TOKEN_ADMIN=$(curl -s -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d '{"email":"admin@odontosoft.com","password":"Admin123!"}' | node -pe "JSON.parse(require('fs').readFileSync(0,'utf8')).token")
echo "Tokens obtenidos."

echo "=== 2. Obtener IDs de paciente activo y odontologo ==="
PACIENTE_ID=$(docker exec odontosoft-mongo mongosh odontosoft --quiet --eval "print(db.pacientes.findOne({estado:'ACTIVO'})._id.toString())")
ODONTOLOGO_ID=$(docker exec odontosoft-mongo mongosh odontosoft --quiet --eval "print(db.usuarios.findOne({rol:'ODONTOLOGO'})._id.toString())")
echo "Paciente: $PACIENTE_ID / Odontologo: $ODONTOLOGO_ID"

echo "=== 3. RECEPCIONISTA crea cita (debe dar 201) ==="
RESPUESTA=$(curl -s -X POST http://localhost:3000/api/citas -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN_RECEP" -d "{\"paciente\":\"$PACIENTE_ID\",\"odontologo\":\"$ODONTOLOGO_ID\",\"fecha\":\"2026-08-01\",\"hora\":\"09:00\",\"duracion\":30,\"motivo\":\"PRUEBA_E2E - Control\"}")
echo "$RESPUESTA" | node -pe "JSON.parse(require('fs').readFileSync(0,'utf8')).mensaje"
CITA_ID=$(echo "$RESPUESTA" | node -pe "JSON.parse(require('fs').readFileSync(0,'utf8')).cita._id")

echo "=== 4. ODONTOLOGO intenta crear cita (debe dar 403) ==="
curl -s -o /dev/null -w "Status: %{http_code}\n" -X POST http://localhost:3000/api/citas -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN_ODONTO" -d "{\"paciente\":\"$PACIENTE_ID\",\"odontologo\":\"$ODONTOLOGO_ID\",\"fecha\":\"2026-08-01\",\"hora\":\"10:00\",\"duracion\":30,\"motivo\":\"PRUEBA_E2E\"}"

echo "=== 5. Crear cita con conflicto de horario (debe dar 409) ==="
curl -s -o /dev/null -w "Status: %{http_code}\n" -X POST http://localhost:3000/api/citas -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN_RECEP" -d "{\"paciente\":\"$PACIENTE_ID\",\"odontologo\":\"$ODONTOLOGO_ID\",\"fecha\":\"2026-08-01\",\"hora\":\"09:15\",\"duracion\":30,\"motivo\":\"PRUEBA_E2E - Conflicto\"}"

echo "=== 6. Listar citas por rango (debe dar 200) ==="
curl -s -o /dev/null -w "Status: %{http_code}\n" "http://localhost:3000/api/citas?desde=2026-08-01&hasta=2026-08-01" -H "Authorization: Bearer $TOKEN_RECEP"

echo "=== 7. ODONTOLOGO cambia estado a CONFIRMADA (debe dar 200) ==="
curl -s -o /dev/null -w "Status: %{http_code}\n" -X PATCH "http://localhost:3000/api/citas/$CITA_ID/estado" -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN_ODONTO" -d '{"estado":"CONFIRMADA"}'

echo "=== 8. ADMIN intenta cambiar estado (debe dar 403) ==="
curl -s -o /dev/null -w "Status: %{http_code}\n" -X PATCH "http://localhost:3000/api/citas/$CITA_ID/estado" -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN_ADMIN" -d '{"estado":"CONFIRMADA"}'

echo "=== 9. RECEPCIONISTA edita motivo de la cita (debe dar 200) ==="
curl -s -o /dev/null -w "Status: %{http_code}\n" -X PUT "http://localhost:3000/api/citas/$CITA_ID" -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN_RECEP" -d '{"motivo":"PRUEBA_E2E - Motivo editado"}'

echo "=== 10. ODONTOLOGO intenta editar (debe dar 403) ==="
curl -s -o /dev/null -w "Status: %{http_code}\n" -X PUT "http://localhost:3000/api/citas/$CITA_ID" -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN_ODONTO" -d '{"motivo":"No autorizado"}'

echo "=== 11. RECEPCIONISTA cancela la cita (debe dar 200) ==="
curl -s -o /dev/null -w "Status: %{http_code}\n" -X PATCH "http://localhost:3000/api/citas/$CITA_ID/cancelar" -H "Authorization: Bearer $TOKEN_RECEP"

echo "=== 12. Crear cita nueva en el horario liberado (debe dar 201) ==="
curl -s -o /dev/null -w "Status: %{http_code}\n" -X POST http://localhost:3000/api/citas -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN_RECEP" -d "{\"paciente\":\"$PACIENTE_ID\",\"odontologo\":\"$ODONTOLOGO_ID\",\"fecha\":\"2026-08-01\",\"hora\":\"09:00\",\"duracion\":30,\"motivo\":\"PRUEBA_E2E - Reemplazo\"}"

echo "=== 13. Endpoint citas de hoy responde (debe dar 200) ==="
curl -s -o /dev/null -w "Status: %{http_code}\n" "http://localhost:3000/api/citas/hoy" -H "Authorization: Bearer $TOKEN_RECEP"