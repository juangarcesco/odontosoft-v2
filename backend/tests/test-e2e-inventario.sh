#!/bin/bash

echo "=== 0. Limpieza de datos de pruebas anteriores ==="
docker exec odontosoft-mongo mongosh odontosoft --quiet --eval "db.materiales.deleteMany({nombre: {\$regex: '^PRUEBA_E2E'}})" > /dev/null
echo "Limpieza completada."
echo ""

echo "=== 1. Login RECEPCIONISTA, ODONTOLOGO, ADMIN ==="
TOKEN_RECEP=$(curl -s -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d '{"email":"recepcion@odontosoft.com","password":"Recepcion123!"}' | node -pe "JSON.parse(require('fs').readFileSync(0,'utf8')).token")
TOKEN_ODONTO=$(curl -s -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d '{"email":"odontologo@odontosoft.com","password":"Odonto123!"}' | node -pe "JSON.parse(require('fs').readFileSync(0,'utf8')).token")
TOKEN_ADMIN=$(curl -s -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d '{"email":"admin@odontosoft.com","password":"Admin123!"}' | node -pe "JSON.parse(require('fs').readFileSync(0,'utf8')).token")
echo "Tokens obtenidos."

echo "=== 2. RECEPCIONISTA crea material (debe dar 201) ==="
RESPUESTA=$(curl -s -X POST http://localhost:3000/api/materiales -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN_RECEP" -d '{"nombre":"PRUEBA_E2E - Guantes nitrilo","costoUnitario":35000,"stock":20,"stockMinimo":10,"proveedor":"Suministros SAS"}')
echo "$RESPUESTA" | node -pe "JSON.parse(require('fs').readFileSync(0,'utf8')).mensaje"
MATERIAL_ID=$(echo "$RESPUESTA" | node -pe "JSON.parse(require('fs').readFileSync(0,'utf8')).material._id")

echo "=== 3. ODONTOLOGO intenta crear material (debe dar 403) ==="
curl -s -o /dev/null -w "Status: %{http_code}\n" -X POST http://localhost:3000/api/materiales -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN_ODONTO" -d '{"nombre":"PRUEBA_E2E - No autorizado","costoUnitario":1000,"stock":1}'

echo "=== 4. ADMIN intenta crear material (debe dar 403) ==="
curl -s -o /dev/null -w "Status: %{http_code}\n" -X POST http://localhost:3000/api/materiales -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN_ADMIN" -d '{"nombre":"PRUEBA_E2E - No autorizado","costoUnitario":1000,"stock":1}'

echo "=== 5. Listar materiales, verificar stockBajo=false (debe dar 200) ==="
curl -s "http://localhost:3000/api/materiales" -H "Authorization: Bearer $TOKEN_RECEP" | node -pe "const r=JSON.parse(require('fs').readFileSync(0,'utf8')); const m=r.materiales.find(x=>x._id==='$MATERIAL_ID'); 'stockBajo: ' + m.stockBajo"

echo "=== 6. ADMIN puede listar (lectura permitida, debe dar 200) ==="
curl -s -o /dev/null -w "Status: %{http_code}\n" "http://localhost:3000/api/materiales" -H "Authorization: Bearer $TOKEN_ADMIN"

echo "=== 7. ODONTOLOGO no puede listar (debe dar 403) ==="
curl -s -o /dev/null -w "Status: %{http_code}\n" "http://localhost:3000/api/materiales" -H "Authorization: Bearer $TOKEN_ODONTO"

echo "=== 8. Registrar entrada de 15 unidades (debe dar 200, stock=35) ==="
curl -s -X PATCH "http://localhost:3000/api/materiales/$MATERIAL_ID/entrada" -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN_RECEP" -d '{"cantidad":15,"motivo":"PRUEBA_E2E - Reposición"}' | node -pe "'Stock: ' + JSON.parse(require('fs').readFileSync(0,'utf8')).material.stock"

echo "=== 9. Entrada con cantidad invalida (debe dar 400) ==="
curl -s -o /dev/null -w "Status: %{http_code}\n" -X PATCH "http://localhost:3000/api/materiales/$MATERIAL_ID/entrada" -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN_RECEP" -d '{"cantidad":0}'

echo "=== 10. Registrar salida de 25 unidades (debe dar 200, stock=10) ==="
curl -s -X PATCH "http://localhost:3000/api/materiales/$MATERIAL_ID/salida" -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN_RECEP" -d '{"cantidad":25,"motivo":"PRUEBA_E2E - Uso en consulta"}' | node -pe "'Stock: ' + JSON.parse(require('fs').readFileSync(0,'utf8')).material.stock"

echo "=== 11. Intentar salida mayor al stock disponible (debe dar 409, RN-06) ==="
curl -s -o /dev/null -w "Status: %{http_code}\n" -X PATCH "http://localhost:3000/api/materiales/$MATERIAL_ID/salida" -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN_RECEP" -d '{"cantidad":9999,"motivo":"PRUEBA_E2E - Exceso"}'

echo "=== 12. ADMIN intenta registrar salida (debe dar 403) ==="
curl -s -o /dev/null -w "Status: %{http_code}\n" -X PATCH "http://localhost:3000/api/materiales/$MATERIAL_ID/salida" -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN_ADMIN" -d '{"cantidad":1}'

echo "=== 13. Verificar stockBajo=true tras las salidas (stock=10, minimo=10) ==="
curl -s "http://localhost:3000/api/materiales" -H "Authorization: Bearer $TOKEN_RECEP" | node -pe "const r=JSON.parse(require('fs').readFileSync(0,'utf8')); const m=r.materiales.find(x=>x._id==='$MATERIAL_ID'); 'stockBajo: ' + m.stockBajo"

echo "=== 14. Editar material sin tocar el stock (debe dar 200, stock sigue en 10) ==="
curl -s -X PUT "http://localhost:3000/api/materiales/$MATERIAL_ID" -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN_RECEP" -d '{"costoUnitario":40000,"proveedor":"PRUEBA_E2E - Nuevo Proveedor"}' | node -pe "const r=JSON.parse(require('fs').readFileSync(0,'utf8')); 'Costo: ' + r.material.costoUnitario + ' / Stock: ' + r.material.stock"

echo "=== 15. ADMIN intenta editar (debe dar 403) ==="
curl -s -o /dev/null -w "Status: %{http_code}\n" -X PUT "http://localhost:3000/api/materiales/$MATERIAL_ID" -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN_ADMIN" -d '{"costoUnitario":1}'