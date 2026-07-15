#!/bin/bash

echo "=== 0. Limpieza de datos de pruebas anteriores ==="
docker exec odontosoft-mongo mongosh odontosoft --quiet --eval "db.historiaclinicas.deleteMany({})" > /dev/null
echo "Limpieza completada."
echo ""

echo "=== 1. Login RECEPCIONISTA, ODONTOLOGO, ADMIN ==="
TOKEN_RECEP=$(curl -s -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d '{"email":"recepcion@odontosoft.com","password":"Recepcion123!"}' | node -pe "JSON.parse(require('fs').readFileSync(0,'utf8')).token")
TOKEN_ODONTO=$(curl -s -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d '{"email":"odontologo@odontosoft.com","password":"Odonto123!"}' | node -pe "JSON.parse(require('fs').readFileSync(0,'utf8')).token")
TOKEN_ADMIN=$(curl -s -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d '{"email":"admin@odontosoft.com","password":"Admin123!"}' | node -pe "JSON.parse(require('fs').readFileSync(0,'utf8')).token")
echo "Tokens obtenidos."

PACIENTE_ID=$(docker exec odontosoft-mongo mongosh odontosoft --quiet --eval "print(db.pacientes.findOne({estado:'ACTIVO'})._id.toString())")
echo "Paciente: $PACIENTE_ID"

echo "=== 2. ODONTOLOGO crea historia clínica (debe dar 201) ==="
curl -s -o /dev/null -w "Status: %{http_code}\n" -X POST http://localhost:3000/api/historias-clinicas -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN_ODONTO" -d "{\"pacienteId\":\"$PACIENTE_ID\"}"

echo "=== 3. RECEPCIONISTA intenta crear historia (debe dar 403) ==="
curl -s -o /dev/null -w "Status: %{http_code}\n" -X POST http://localhost:3000/api/historias-clinicas -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN_RECEP" -d "{\"pacienteId\":\"$PACIENTE_ID\"}"

echo "=== 4. Duplicado (debe dar 409) ==="
curl -s -o /dev/null -w "Status: %{http_code}\n" -X POST http://localhost:3000/api/historias-clinicas -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN_ODONTO" -d "{\"pacienteId\":\"$PACIENTE_ID\"}"

echo "=== 5. ODONTOLOGO consulta historia (debe dar 200) ==="
curl -s -o /dev/null -w "Status: %{http_code}\n" "http://localhost:3000/api/historias-clinicas/paciente/$PACIENTE_ID" -H "Authorization: Bearer $TOKEN_ODONTO"

echo "=== 6. RECEPCIONISTA intenta consultar (debe dar 403) ==="
curl -s -o /dev/null -w "Status: %{http_code}\n" "http://localhost:3000/api/historias-clinicas/paciente/$PACIENTE_ID" -H "Authorization: Bearer $TOKEN_RECEP"

echo "=== 7. ODONTOLOGO actualiza diente 14 (debe dar 200) ==="
curl -s -o /dev/null -w "Status: %{http_code}\n" -X PATCH "http://localhost:3000/api/historias-clinicas/paciente/$PACIENTE_ID/odontograma/14" -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN_ODONTO" -d '{"estado":"CARIES"}'

echo "=== 8. ADMIN intenta actualizar odontograma (debe dar 403) ==="
curl -s -o /dev/null -w "Status: %{http_code}\n" -X PATCH "http://localhost:3000/api/historias-clinicas/paciente/$PACIENTE_ID/odontograma/14" -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN_ADMIN" -d '{"estado":"SANO"}'

echo "=== 9. ODONTOLOGO agrega evolución (debe dar 201) ==="
RESPUESTA=$(curl -s -X POST "http://localhost:3000/api/historias-clinicas/paciente/$PACIENTE_ID/evoluciones" -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN_ODONTO" -d '{"descripcion":"PRUEBA_E2E - Control de rutina","tratamientosRealizados":[{"diente":14,"procedimiento":"Obturación"}]}')
echo "$RESPUESTA" | node -pe "JSON.parse(require('fs').readFileSync(0,'utf8')).mensaje"
EVOLUCION_ID=$(echo "$RESPUESTA" | node -pe "const h=JSON.parse(require('fs').readFileSync(0,'utf8')).historia; h.evoluciones[h.evoluciones.length-1]._id")

echo "=== 10. ADMIN intenta agregar evolución (debe dar 403) ==="
curl -s -o /dev/null -w "Status: %{http_code}\n" -X POST "http://localhost:3000/api/historias-clinicas/paciente/$PACIENTE_ID/evoluciones" -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN_ADMIN" -d '{"descripcion":"No autorizado"}'

echo "=== 11. ODONTOLOGO actualiza antecedentes (debe dar 200) ==="
curl -s -o /dev/null -w "Status: %{http_code}\n" -X PATCH "http://localhost:3000/api/historias-clinicas/paciente/$PACIENTE_ID/antecedentes" -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN_ODONTO" -d '{"antecedentesMedicos":"PRUEBA_E2E - Ninguno relevante"}'

echo "=== 12. ADMIN desactiva evolución (debe dar 200) ==="
curl -s -o /dev/null -w "Status: %{http_code}\n" -X PATCH "http://localhost:3000/api/historias-clinicas/paciente/$PACIENTE_ID/evoluciones/$EVOLUCION_ID/desactivar" -H "Authorization: Bearer $TOKEN_ADMIN"

echo "=== 13. ODONTOLOGO intenta desactivar evolución (debe dar 403) ==="
curl -s -o /dev/null -w "Status: %{http_code}\n" -X PATCH "http://localhost:3000/api/historias-clinicas/paciente/$PACIENTE_ID/evoluciones/$EVOLUCION_ID/desactivar" -H "Authorization: Bearer $TOKEN_ODONTO"

echo "=== 14. Desactivar de nuevo, ya desactivada (debe dar 409) ==="
curl -s -o /dev/null -w "Status: %{http_code}\n" -X PATCH "http://localhost:3000/api/historias-clinicas/paciente/$PACIENTE_ID/evoluciones/$EVOLUCION_ID/desactivar" -H "Authorization: Bearer $TOKEN_ADMIN"

echo "=== 15. ODONTOLOGO sube adjunto (debe dar 201) ==="
node -e "const sharp=require('sharp'); sharp({create:{width:200,height:150,channels:3,background:{r:180,g:200,b:220}}}).jpeg().toFile('/tmp/prueba-e2e.jpg')" 2>/dev/null
sleep 1
curl -s -o /dev/null -w "Status: %{http_code}\n" -X POST "http://localhost:3000/api/historias-clinicas/paciente/$PACIENTE_ID/adjuntos" -H "Authorization: Bearer $TOKEN_ODONTO" -F "archivo=@/tmp/prueba-e2e.jpg" -F "tipo=FOTO"

echo "=== 16. RECEPCIONISTA intenta subir adjunto (debe dar 403) ==="
curl -s -o /dev/null -w "Status: %{http_code}\n" -X POST "http://localhost:3000/api/historias-clinicas/paciente/$PACIENTE_ID/adjuntos" -H "Authorization: Bearer $TOKEN_RECEP" -F "archivo=@/tmp/prueba-e2e.jpg"