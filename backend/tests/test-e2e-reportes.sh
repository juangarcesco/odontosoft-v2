#!/bin/bash

echo "=== 1. Login RECEPCIONISTA, ODONTOLOGO, ADMIN ==="
TOKEN_RECEP=$(curl -s -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d '{"email":"recepcion@odontosoft.com","password":"Recepcion123!"}' | node -pe "JSON.parse(require('fs').readFileSync(0,'utf8')).token")
TOKEN_ODONTO=$(curl -s -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d '{"email":"odontologo@odontosoft.com","password":"Odonto123!"}' | node -pe "JSON.parse(require('fs').readFileSync(0,'utf8')).token")
TOKEN_ADMIN=$(curl -s -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d '{"email":"admin@odontosoft.com","password":"Admin123!"}' | node -pe "JSON.parse(require('fs').readFileSync(0,'utf8')).token")
echo "Tokens obtenidos."

echo "=== 2. ADMIN accede a los 5 reportes (todos deben dar 200) ==="
for ruta in ingresos saldo-pendiente pacientes-nuevos tasa-asistencia tratamientos; do
  curl -s -o /dev/null -w "  $ruta: %{http_code}\n" "http://localhost:3000/api/reportes/$ruta" -H "Authorization: Bearer $TOKEN_ADMIN"
done

echo "=== 3. RECEPCIONISTA accede a reportes financieros/administrativos (200) y clínico (403) ==="
for ruta in ingresos saldo-pendiente pacientes-nuevos tasa-asistencia; do
  curl -s -o /dev/null -w "  $ruta: %{http_code}\n" "http://localhost:3000/api/reportes/$ruta" -H "Authorization: Bearer $TOKEN_RECEP"
done
curl -s -o /dev/null -w "  tratamientos (debe ser 403): %{http_code}\n" "http://localhost:3000/api/reportes/tratamientos" -H "Authorization: Bearer $TOKEN_RECEP"

echo "=== 4. ODONTOLOGO accede a reporte clínico (200) y financieros/administrativos (403) ==="
curl -s -o /dev/null -w "  tratamientos: %{http_code}\n" "http://localhost:3000/api/reportes/tratamientos" -H "Authorization: Bearer $TOKEN_ODONTO"
for ruta in ingresos saldo-pendiente pacientes-nuevos tasa-asistencia; do
  curl -s -o /dev/null -w "  $ruta (debe ser 403): %{http_code}\n" "http://localhost:3000/api/reportes/$ruta" -H "Authorization: Bearer $TOKEN_ODONTO"
done

echo "=== 5. Contenido del reporte de ingresos (verificar estructura) ==="
curl -s "http://localhost:3000/api/reportes/ingresos" -H "Authorization: Bearer $TOKEN_ADMIN" | node -pe "const r=JSON.parse(require('fs').readFileSync(0,'utf8')); 'Mes: ' + r.reporte.mes + ' / Ingresos: ' + r.reporte.totalIngresos"

echo "=== 6. Contenido del reporte de pacientes nuevos (debe ser array de 6 meses) ==="
curl -s "http://localhost:3000/api/reportes/pacientes-nuevos" -H "Authorization: Bearer $TOKEN_ADMIN" | node -pe "JSON.parse(require('fs').readFileSync(0,'utf8')).reporte.length + ' meses en la serie'"

echo "=== 7. Exportar a Excel (debe dar 200, archivo válido) ==="
curl -s -o /tmp/test-reporte.xlsx -w "Status: %{http_code}\n" "http://localhost:3000/api/reportes/ingresos/excel" -H "Authorization: Bearer $TOKEN_ADMIN"
file /tmp/test-reporte.xlsx

echo "=== 8. Exportar a PDF (debe dar 200, archivo válido) ==="
curl -s -o /tmp/test-reporte.pdf -w "Status: %{http_code}\n" "http://localhost:3000/api/reportes/tratamientos/pdf" -H "Authorization: Bearer $TOKEN_ADMIN"
file /tmp/test-reporte.pdf

echo "=== 9. Exportar tipo de reporte inválido (debe dar 400) ==="
curl -s -o /dev/null -w "Excel: %{http_code}\n" "http://localhost:3000/api/reportes/inexistente/excel" -H "Authorization: Bearer $TOKEN_ADMIN"
curl -s -o /dev/null -w "PDF: %{http_code}\n" "http://localhost:3000/api/reportes/inexistente/pdf" -H "Authorization: Bearer $TOKEN_ADMIN"

echo "=== 10. RECEPCIONISTA exporta reporte financiero a Excel (debe dar 200) ==="
curl -s -o /dev/null -w "Status: %{http_code}\n" "http://localhost:3000/api/reportes/ingresos/excel" -H "Authorization: Bearer $TOKEN_RECEP"