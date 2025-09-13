\
# Elimina duplicados de create-checkout-session de forma segura (Windows)
$targets = @(
  "src/api/create-checkout-session.ts",
  "src/api/stripe/create-checkout-session.ts",
  "src/api/stripe/create-checkout-session.js",
  "src/pages/api/stripe/create-checkout-session.ts",
  "stripe/create-checkout-session.ts",
  "api/create-checkout-session/index.ts",
  "api/stripe/create-checkout-session.ts",
  "api/stripe/create-checkout-session.js"
)

foreach ($t in $targets) {
  if (Test-Path $t) {
    Write-Host "Removing $t"
    Remove-Item $t -Force
  }
}
Write-Host "Done. Quedan unificados en api/create-checkout-session.ts"
