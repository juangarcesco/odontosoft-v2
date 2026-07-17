#!/bin/bash

echo "=== 0. Limpieza de datos de pruebas anteriores ==="
docker exec odontosoft-mongo mongosh odontosoft --quiet --eval "db.recordatorios.deleteMany({}); db.citas.deleteMany({motivo: {\$regex: '^PRUEBA_E2E_RECORDATORIO'}})" > /dev/null
echo "Limpieza completada."
echo ""

echo "=== 1. Login RECEPCIONISTA, ODONTOLOGO, ADMIN ==="
TOKEN_RECEP=$(curl -s -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d '{"email":"recepcion@odontosoft.com","password":"Recepcion123!"}' | node -pe "JSON.parse(require('fs').readFileSync(0,'utf8')).token")
TOKEN_ODONTO=$(curl -s -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d '{"email":"odontologo@odontosoft.com","password":"Odonto123!"}' | node -pe "JSON.parse(require('fs').readFileSync(0,'utf8')).token")
TOKEN_ADMIN=$(curl -s -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d '{"email":"admin@odontosoft.com","password":"Admin123!"}' | node -pe "JSON.parse(require('fs').readFileSync(0,'utf8')).token")
echo "Tokens obtenidos."

PACIENTE_ID=$(docker exec odontosoft-mongo mongosh odontosoft --quiet --eval "print(db.pacientes.findOne({estado:'ACTIVO'})._id.toString())")
ODONTOLOGO_ID=$(docker exec odontosoft-mongo mongosh odontosoft --quiet --eval "print(db.usuarios.findOne({rol:'ODONTOLOGO'})._id.toString())")
FECHA_PRUEBA=$(date -d "+20 hours" +%Y-%m-%d)
HORA_PRUEBA=$(date -d "+20 hours" +%H:%M)

echo "=== 2. Crear cita elegible para recordatorio (debe dar 201) ==="
curl -s -o /dev/null -w "Status: %{http_code}\n" -X POST http://localhost:3000/api/citas -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN_RECEP" -d "{\"paciente\":\"$PACIENTE_ID\",\"odontologo\":\"$ODONTOLOGO_ID\",\"fecha\":\"$FECHA_PRUEBA\",\"hora\":\"$HORA_PRUEBA\",\"duracion\":30,\"motivo\":\"PRUEBA_E2E_RECORDATORIO\"}"

echo "=== 3. RECEPCIONISTA obtiene configuración de plantilla (debe dar 200) ==="
curl -s -o /dev/null -w "Status: %{http_code}\n" http://localhost:3000/api/recordatorios/configuracion -H "Authorization: Bearer $TOKEN_RECEP"

echo "=== 4. ODONTOLOGO intenta obtener configuración (debe dar 403) ==="
curl -s -o /dev/null -w "Status: %{http_code}\n" http://localhost:3000/api/recordatorios/configuracion -H "Authorization: Bearer $TOKEN_ODONTO"

echo "=== 5. RECEPCIONISTA actualiza plantilla (debe dar 200) ==="
curl -s -o /dev/null -w "Status: %{http_code}\n" -X PUT http://localhost:3000/api/recordatorios/configuracion -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN_RECEP" -d '{"plantilla":"PRUEBA_E2E - Hola {nombrePaciente}, cita el {fecha} a las {hora}."}'

echo "=== 6. Actualizar con plantilla vacia (debe dar 400) ==="
curl -s -o /dev/null -w "Status: %{http_code}\n" -X PUT http://localhost:3000/api/recordatorios/configuracion -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN_RECEP" -d '{"plantilla":""}'

echo "=== 7. ADMIN intenta actualizar plantilla (debe dar 403) ==="
curl -s -o /dev/null -w "Status: %{http_code}\n" -X PUT http://localhost:3000/api/recordatorios/configuracion -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN_ADMIN" -d '{"plantilla":"No autorizado"}'

echo "=== 8. RECEPCIONISTA ejecuta envío de recordatorios (debe dar 200) ==="
RESPUESTA=$(curl -s -X POST http://localhost:3000/api/recordatorios/ejecutar -H "Authorization: Bearer $TOKEN_RECEP")
echo "$RESPUESTA" | node -pe "const r=JSON.parse(require('fs').readFileSync(0,'utf8')); 'Resultados: ' + r.resultados.length + ' (' + r.resultados.map(x=>x.canal+':'+(x.estado||'omitido')).join(', ') + ')'"

echo "=== 9. ODONTOLOGO intenta ejecutar envío (debe dar 403) ==="
curl -s -o /dev/null -w "Status: %{http_code}\n" -X POST http://localhost:3000/api/recordatorios/ejecutar -H "Authorization: Bearer $TOKEN_ODONTO"

echo "=== 10. Ejecutar de nuevo, debe omitir por duplicado (verifica 'omitido') ==="
curl -s -X POST http://localhost:3000/api/recordatorios/ejecutar -H "Authorization: Bearer $TOKEN_RECEP" | node -pe "const r=JSON.parse(require('fs').readFileSync(0,'utf8')); const todosOmitidos = r.resultados.every(x=>x.omitido); 'Todos omitidos: ' + todosOmitidos"

echo "=== 11. RECEPCIONISTA consulta historial (debe dar 200) ==="
curl -s -o /dev/null -w "Status: %{http_code}\n" http://localhost:3000/api/recordatorios -H "Authorization: Bearer $TOKEN_RECEP"

echo "=== 12. ADMIN consulta historial (lectura permitida, debe dar 200) ==="
curl -s -o /dev/null -w "Status: %{http_code}\n" http://localhost:3000/api/recordatorios -H "Authorization: Bearer $TOKEN_ADMIN"

echo "=== 13. ODONTOLOGO intenta consultar historial (debe dar 403) ==="
curl -s -o /dev/null -w "Status: %{http_code}\n" http://localhost:3000/api/recordatorios -H "Authorization: Bearer $TOKEN_ODONTO"