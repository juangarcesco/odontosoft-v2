#!/bin/bash

echo "=== 0. Limpieza de datos de pruebas anteriores ==="
docker exec odontosoft-mongo mongosh odontosoft --quiet --eval "db.facturas.deleteMany({})" > /dev/null
echo "Limpieza completada."
echo ""

echo "=== 1. Login RECEPCIONISTA, ODONTOLOGO, ADMIN ==="
TOKEN_RECEP=$(curl -s -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d '{"email":"recepcion@odontosoft.com","password":"Recepcion123!"}' | node -pe "JSON.parse(require('fs').readFileSync(0,'utf8')).token")
TOKEN_ODONTO=$(curl -s -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d '{"email":"odontologo@odontosoft.com","password":"Odonto123!"}' | node -pe "JSON.parse(require('fs').readFileSync(0,'utf8')).token")
TOKEN_ADMIN=$(curl -s -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d '{"email":"admin@odontosoft.com","password":"Admin123!"}' | node -pe "JSON.parse(require('fs').readFileSync(0,'utf8')).token")
echo "Tokens obtenidos."

PACIENTE_ID=$(docker exec odontosoft-mongo mongosh odontosoft --quiet --eval "print(db.pacientes.findOne({estado:'ACTIVO'})._id.toString())")
echo "Paciente: $PACIENTE_ID"

echo "=== 2. RECEPCIONISTA consulta tratamientos facturables (debe dar 200) ==="
curl -s -o /dev/null -w "Status: %{http_code}\n" "http://localhost:3000/api/facturas/tratamientos-facturables/$PACIENTE_ID" -H "Authorization: Bearer $TOKEN_RECEP"

echo "=== 3. ODONTOLOGO intenta consultar tratamientos facturables (debe dar 403) ==="
curl -s -o /dev/null -w "Status: %{http_code}\n" "http://localhost:3000/api/facturas/tratamientos-facturables/$PACIENTE_ID" -H "Authorization: Bearer $TOKEN_ODONTO"

echo "=== 4. RECEPCIONISTA crea factura (debe dar 201) ==="
RESPUESTA=$(curl -s -X POST http://localhost:3000/api/facturas -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN_RECEP" -d "{\"pacienteId\":\"$PACIENTE_ID\",\"items\":[{\"procedimiento\":\"PRUEBA_E2E - Limpieza dental\",\"valor\":60000}]}")
echo "$RESPUESTA" | node -pe "JSON.parse(require('fs').readFileSync(0,'utf8')).mensaje"
FACTURA_ID=$(echo "$RESPUESTA" | node -pe "JSON.parse(require('fs').readFileSync(0,'utf8')).factura._id")

echo "=== 5. ODONTOLOGO intenta crear factura (debe dar 403) ==="
curl -s -o /dev/null -w "Status: %{http_code}\n" -X POST http://localhost:3000/api/facturas -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN_ODONTO" -d "{\"pacienteId\":\"$PACIENTE_ID\",\"items\":[{\"procedimiento\":\"No autorizado\",\"valor\":1000}]}"

echo "=== 6. Crear factura sin items (debe dar 400) ==="
curl -s -o /dev/null -w "Status: %{http_code}\n" -X POST http://localhost:3000/api/facturas -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN_RECEP" -d "{\"pacienteId\":\"$PACIENTE_ID\",\"items\":[]}"

echo "=== 7. Registrar abono parcial de 20000 (debe dar 200, saldo=40000) ==="
curl -s -X PATCH "http://localhost:3000/api/facturas/$FACTURA_ID/pagar" -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN_RECEP" -d '{"monto":20000,"metodoPago":"EFECTIVO"}' | node -pe "const r=JSON.parse(require('fs').readFileSync(0,'utf8')); 'Saldo: ' + r.factura.saldoPendiente + ' / Estado: ' + r.factura.estado"

echo "=== 8. Intentar pagar monto mayor al saldo (debe dar 400) ==="
curl -s -o /dev/null -w "Status: %{http_code}\n" -X PATCH "http://localhost:3000/api/facturas/$FACTURA_ID/pagar" -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN_RECEP" -d '{"monto":99999999,"metodoPago":"EFECTIVO"}'

echo "=== 9. Registrar abono del saldo restante (debe dar 200, saldo=0, estado=PAGADA) ==="
curl -s -X PATCH "http://localhost:3000/api/facturas/$FACTURA_ID/pagar" -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN_RECEP" -d '{"monto":40000,"metodoPago":"TRANSFERENCIA"}' | node -pe "const r=JSON.parse(require('fs').readFileSync(0,'utf8')); 'Saldo: ' + r.factura.saldoPendiente + ' / Estado: ' + r.factura.estado"

echo "=== 10. Descargar PDF de la factura (debe dar 200) ==="
curl -s -o /tmp/factura-e2e.pdf -w "Status: %{http_code}\n" "http://localhost:3000/api/facturas/$FACTURA_ID/pdf" -H "Authorization: Bearer $TOKEN_RECEP"
file /tmp/factura-e2e.pdf

echo "=== 11. Historial de facturas por paciente (debe dar 200) ==="
curl -s -o /dev/null -w "Status: %{http_code}\n" "http://localhost:3000/api/facturas/paciente/$PACIENTE_ID" -H "Authorization: Bearer $TOKEN_RECEP"

echo "=== 12. ADMIN consulta historial (lectura permitida, debe dar 200) ==="
curl -s -o /dev/null -w "Status: %{http_code}\n" "http://localhost:3000/api/facturas/paciente/$PACIENTE_ID" -H "Authorization: Bearer $TOKEN_ADMIN"

echo "=== 13. Crear segunda factura para probar anulación (debe dar 201) ==="
RESPUESTA2=$(curl -s -X POST http://localhost:3000/api/facturas -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN_RECEP" -d "{\"pacienteId\":\"$PACIENTE_ID\",\"items\":[{\"procedimiento\":\"PRUEBA_E2E - Control\",\"valor\":30000}]}")
FACTURA_ID_2=$(echo "$RESPUESTA2" | node -pe "JSON.parse(require('fs').readFileSync(0,'utf8')).factura._id")
echo "Segunda factura: $FACTURA_ID_2"

echo "=== 14. Anular sin motivo (debe dar 400) ==="
curl -s -o /dev/null -w "Status: %{http_code}\n" -X PATCH "http://localhost:3000/api/facturas/$FACTURA_ID_2/anular" -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN_RECEP" -d '{}'

echo "=== 15. Anular con motivo (debe dar 200) ==="
curl -s -o /dev/null -w "Status: %{http_code}\n" -X PATCH "http://localhost:3000/api/facturas/$FACTURA_ID_2/anular" -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN_RECEP" -d '{"motivo":"PRUEBA_E2E - Anulacion de prueba"}'

echo "=== 16. Anular de nuevo, ya anulada (debe dar 409) ==="
curl -s -o /dev/null -w "Status: %{http_code}\n" -X PATCH "http://localhost:3000/api/facturas/$FACTURA_ID_2/anular" -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN_RECEP" -d '{"motivo":"Otro intento"}'

echo "=== 17. Pagar sobre factura anulada (debe dar 409) ==="
curl -s -o /dev/null -w "Status: %{http_code}\n" -X PATCH "http://localhost:3000/api/facturas/$FACTURA_ID_2/pagar" -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN_RECEP" -d '{"monto":5000,"metodoPago":"EFECTIVO"}'