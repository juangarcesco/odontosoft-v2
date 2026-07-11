#!/bin/bash

echo "=== 1. Login RECEPCIONISTA, ODONTOLOGO, ADMIN ==="
TOKEN_RECEP=$(curl -s -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d '{"email":"recepcion@odontosoft.com","password":"Recepcion123!"}' | node -pe "JSON.parse(require('fs').readFileSync(0,'utf8')).token")
TOKEN_ODONTO=$(curl -s -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d '{"email":"odontologo@odontosoft.com","password":"Odonto123!"}' | node -pe "JSON.parse(require('fs').readFileSync(0,'utf8')).token")
echo "Tokens obtenidos."

echo "=== 2. RECEPCIONISTA crea un paciente (debe dar 201) ==="
RESPUESTA=$(curl -s -w "\n%{http_code}" -X POST http://localhost:3000/api/pacientes -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN_RECEP" -d '{"nombre":"Laura","apellido":"Suárez","tipoDocumento":"CC","numeroDocumento":"5556667778","fechaNacimiento":"1995-02-14","sexo":"F","telefono":"3187778899"}')
echo "$RESPUESTA" | tail -1
PACIENTE_ID=$(echo "$RESPUESTA" | head -1 | node -pe "JSON.parse(require('fs').readFileSync(0,'utf8')).paciente._id")
echo "ID creado: $PACIENTE_ID"

echo "=== 3. ODONTOLOGO intenta crear paciente (debe dar 403) ==="
curl -s -o /dev/null -w "Status: %{http_code}\n" -X POST http://localhost:3000/api/pacientes -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN_ODONTO" -d '{"nombre":"Test","apellido":"Test","tipoDocumento":"CC","numeroDocumento":"0000000000","fechaNacimiento":"2000-01-01","sexo":"M","telefono":"3000000000"}'

echo "=== 4. Crear paciente duplicado (debe dar 409) ==="
curl -s -o /dev/null -w "Status: %{http_code}\n" -X POST http://localhost:3000/api/pacientes -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN_RECEP" -d '{"nombre":"Laura","apellido":"Suárez","tipoDocumento":"CC","numeroDocumento":"5556667778","fechaNacimiento":"1995-02-14","sexo":"F","telefono":"3187778899"}'

echo "=== 5. Listar pacientes (debe dar 200) ==="
curl -s -o /dev/null -w "Status: %{http_code}\n" "http://localhost:3000/api/pacientes?pagina=1&limite=10" -H "Authorization: Bearer $TOKEN_RECEP"

echo "=== 6. Buscar por nombre parcial 'lau' (debe dar 200 con resultados) ==="
curl -s "http://localhost:3000/api/pacientes/buscar?q=lau" -H "Authorization: Bearer $TOKEN_RECEP" | node -pe "JSON.parse(require('fs').readFileSync(0,'utf8')).pacientes.length + ' resultado(s) encontrado(s)'"

echo "=== 7. Ver detalle del paciente creado (debe dar 200) ==="
curl -s -o /dev/null -w "Status: %{http_code}\n" "http://localhost:3000/api/pacientes/$PACIENTE_ID" -H "Authorization: Bearer $TOKEN_RECEP"

echo "=== 8. Ver detalle con ID inexistente (debe dar 404) ==="
curl -s -o /dev/null -w "Status: %{http_code}\n" "http://localhost:3000/api/pacientes/000000000000000000000000" -H "Authorization: Bearer $TOKEN_RECEP"

echo "=== 9. Editar paciente (debe dar 200) ==="
curl -s -o /dev/null -w "Status: %{http_code}\n" -X PUT "http://localhost:3000/api/pacientes/$PACIENTE_ID" -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN_RECEP" -d '{"telefono":"3200001111"}'

echo "=== 10. ODONTOLOGO intenta editar (debe dar 403) ==="
curl -s -o /dev/null -w "Status: %{http_code}\n" -X PUT "http://localhost:3000/api/pacientes/$PACIENTE_ID" -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN_ODONTO" -d '{"telefono":"3000000000"}'

echo "=== 11. Desactivar paciente (debe dar 200) ==="
curl -s -o /dev/null -w "Status: %{http_code}\n" -X PATCH "http://localhost:3000/api/pacientes/$PACIENTE_ID/desactivar" -H "Authorization: Bearer $TOKEN_RECEP"

echo "=== 12. Verificar que ya no aparece en el listado activo ==="
curl -s "http://localhost:3000/api/pacientes?pagina=1&limite=50" -H "Authorization: Bearer $TOKEN_RECEP" | node -pe "JSON.parse(require('fs').readFileSync(0,'utf8')).pacientes.some(p => p._id === '$PACIENTE_ID') ? 'FALLO: sigue apareciendo' : 'OK: ya no aparece en el listado'"