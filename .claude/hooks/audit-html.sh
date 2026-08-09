#!/bin/bash
# Post-edit accessibility audit: corre axe-core contra el archivo .html editado
# si el servidor local (servidor.cjs, puerto 8765) ya está corriendo.
# Nunca bloquea el edit ni falla el hook, aunque axe encuentre violaciones
# o el servidor no esté levantado.

raw=$(node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{try{const j=JSON.parse(d);process.stdout.write((j.tool_input&&j.tool_input.file_path)||'')}catch(e){}})")
f="${raw##*[\\/]}"

case "$f" in
  *.html)
    if curl -s -o /dev/null -m 2 "http://localhost:8765/$f"; then
      echo "[axe] auditando $f (http://localhost:8765/$f)..."
      axe "http://localhost:8765/$f" --exit
    fi
    ;;
esac

true
