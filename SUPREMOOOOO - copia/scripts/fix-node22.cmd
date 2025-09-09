@echo off
REM Forzar versiones compatibles con Node 22 (Vite + esbuild)
echo === LIMPIANDO DEPENDENCIAS ===
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del /f /q package-lock.json
if exist pnpm-lock.yaml del /f /q pnpm-lock.yaml
if exist yarn.lock del /f /q yarn.lock

echo === INSTALANDO VITE / ESBUILD COMPATIBLES ===
npm install --save-dev vite@^5.4.10 esbuild@^0.21.5 @vitejs/plugin-react@^4.3.1

echo === APLICANDO OVERRIDES (npm) ===
REM npm usa "overrides" en package.json. Si no lo tienes, añade manualmente:
echo {
echo   "overrides": { "esbuild": "^0.21.5" }
echo } > NUL

echo === INSTALANDO DEPENDENCIAS ===
npm install

echo === VERSIONES ===
npm run versions || echo (Si falla, ignora este paso)
echo Listo.
