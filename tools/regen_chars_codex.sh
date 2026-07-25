#!/usr/bin/env bash
# Regen Codex séquentiel — un perso à la fois (skill sommet-character).
# Usage: tools/regen_chars_codex.sh [key ...]
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
DATE=$(date +%Y-%m-%d)

if [[ $# -gt 0 ]]; then
  KEYS=("$@")
else
  KEYS=(gourou safran sultan volkoi cygne capitaine)
fi

anchor_for() {
  case "$1" in
    cygne) echo idle_face_0 ;;
    *) echo idle_0 ;;
  esac
}

python3 tools/gen_regen_codex_prompts.py "${KEYS[@]}"

for key in "${KEYS[@]}"; do
  ank="$(anchor_for "$key")"
  echo "======== REGEN $key (anchor=$ank) ========"
  mkdir -p "assets/$key/_bak_pre_codex_$DATE" "raw/$key"
  if [[ ! -f "assets/$key/_bak_pre_codex_$DATE/${ank}.png" ]]; then
    cp -a "assets/$key/"*.png "assets/$key/_bak_pre_codex_$DATE/" 2>/dev/null || true
  fi
  cp -a "assets/$key/$ank.png" "raw/$key/$ank.png"
  prompt="raw/$key/_regen_codex_prompt.md"
  log="raw/$key/_regen_codex_log.txt"
  echo ">>> starting codex exec for $key at $(date)" | tee -a "$log"
  codex exec \
    --dangerously-bypass-approvals-and-sandbox \
    --skip-git-repo-check \
    -C "$ROOT" \
    -i "$ROOT/assets/$key/$ank.png" \
    - \
    < "$prompt" \
    2>&1 | tee -a "$log"
  python3 - <<PY
import json
from pathlib import Path
p = Path("assets/$key/manifest.json")
m = json.loads(p.read_text())
m.setdefault("anims", {})
m["anims"]["idle"] = 2
m["anims"]["walk"] = 4
p.write_text(json.dumps(m, indent=2) + "\n")
print("manifest ok", m["anims"])
PY
  echo "======== DONE $key at $(date) ========"
done
echo "ALL DONE"
