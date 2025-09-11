#!/usr/bin/env python3
import re, sys
from pathlib import Path

root = Path(__file__).resolve().parent
target = root / "src" / "components" / "ui" / "breadcrumb.tsx"

if not target.exists():
    print("[error] No se encontró:", target)
    sys.exit(1)

content = target.read_text(encoding="utf-8", errors="ignore")

# El bloque añadido por el patch empezaba con este comentario
marker = "// --- Compatibility shims (Fix Pack 1) ---"

if marker not in content:
    print("[=] breadcrumb.tsx no contiene el bloque de shims (nada que limpiar)")
    sys.exit(0)

# Eliminar desde el marker hasta el final del archivo
cleaned = content.split(marker, 1)[0].rstrip() + "\n"

# Seguridad extra: si quedaron funciones sueltas, intenta quitar export function BreadcrumbList/Page
cleaned = re.sub(r"\nexport\s+function\s+BreadcrumbList[\s\S]*?\n\}\s*\n", "\n", cleaned, flags=re.MULTILINE)
cleaned = re.sub(r"\nexport\s+function\s+BreadcrumbPage[\s\S]*?\n\}\s*\n", "\n", cleaned, flags=re.MULTILINE)

if cleaned == content:
    print("[=] No se realizaron cambios")
else:
    target.write_text(cleaned, encoding="utf-8")
    print("[ok] Limpiado bloque de shims en:", target)
