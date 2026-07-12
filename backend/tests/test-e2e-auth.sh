echo "=== 1. Login ADMIN ==="
TOKEN_ADMIN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@odontosoft.com","password":"Admin123!"}' | node -pe "JSON.parse(require('fs').readFileSync(0,'utf8')).token")
echo "Token ADMIN obtenido: ${TOKEN_ADMIN:0:20}..."

echo "=== 2. Login ODONTOLOGO ==="
TOKEN_ODONTO=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"odontologo@odontosoft.com","password":"Odonto123!"}' | node -pe "JSON.parse(require('fs').readFileSync(0,'utf8')).token")
echo "Token ODONTOLOGO obtenido: ${TOKEN_ODONTO:0:20}..."

echo "=== 3. Login RECEPCIONISTA ==="
TOKEN_RECEP=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"recepcion@odontosoft.com","password":"Recepcion123!"}' | node -pe "JSON.parse(require('fs').readFileSync(0,'utf8')).token")
echo "Token RECEPCIONISTA obtenido: ${TOKEN_RECEP:0:20}..."

echo "=== 4. ADMIN accede a /solo-admin (debe dar 200) ==="
curl -s -o /dev/null -w "Status: %{http_code}\n" http://localhost:3000/api/auth/solo-admin \
  -H "Authorization: Bearer $TOKEN_ADMIN"

echo "=== 5. ODONTOLOGO intenta /solo-admin (debe dar 403) ==="
curl -s -o /dev/null -w "Status: %{http_code}\n" http://localhost:3000/api/auth/solo-admin \
  -H "Authorization: Bearer $TOKEN_ODONTO"

echo "=== 6. RECEPCIONISTA intenta /solo-admin (debe dar 403) ==="
curl -s -o /dev/null -w "Status: %{http_code}\n" http://localhost:3000/api/auth/solo-admin \
  -H "Authorization: Bearer $TOKEN_RECEP"

echo "=== 7. Los 3 roles pueden acceder a /perfil (deben dar 200) ==="
curl -s -o /dev/null -w "ADMIN perfil: %{http_code}\n" http://localhost:3000/api/auth/perfil -H "Authorization: Bearer $TOKEN_ADMIN"
curl -s -o /dev/null -w "ODONTOLOGO perfil: %{http_code}\n" http://localhost:3000/api/auth/perfil -H "Authorization: Bearer $TOKEN_ODONTO"
curl -s -o /dev/null -w "RECEPCIONISTA perfil: %{http_code}\n" http://localhost:3000/api/auth/perfil -H "Authorization: Bearer $TOKEN_RECEP"

echo "=== 8. Sin token (debe dar 401) ==="
curl -s -o /dev/null -w "Status: %{http_code}\n" http://localhost:3000/api/auth/perfil

echo "=== 9. Token inválido (debe dar 401) ==="
curl -s -o /dev/null -w "Status: %{http_code}\n" http://localhost:3000/api/auth/perfil -H "Authorization: Bearer token_falso"

echo "=== 10. Logout ADMIN y reintento con el mismo token (debe dar 401) ==="
curl -s -o /dev/null -w "Logout status: %{http_code}\n" -X POST http://localhost:3000/api/auth/logout -H "Authorization: Bearer $TOKEN_ADMIN"
curl -s -o /dev/null -w "Reintento tras logout: %{http_code}\n" http://localhost:3000/api/auth/perfil -H "Authorization: Bearer $TOKEN_ADMIN"

echo "=== 11. Rate limiting: 6 intentos fallidos (el 6to debe dar 429) ==="
for i in {1..6}; do
  curl -s -o /dev/null -w "Intento $i: %{http_code}\n" -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@odontosoft.com","password":"mala"}'
done