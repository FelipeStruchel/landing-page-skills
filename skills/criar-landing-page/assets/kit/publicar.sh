#!/usr/bin/env bash
# Wrapper: a lógica e os testes vivem em publicar.js.
# Uso: bash publicar.sh --root <dir> --dest <destino> --cliente <nome> [--executar] [--dry-run]
set -euo pipefail
exec node "$(dirname "$0")/publicar.js" "$@"
