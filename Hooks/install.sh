#!/usr/bin/env bash
# =============================================================
# UNIGARDEN - Git Hook Kurulum Scripti
# Kullanım: bash Hooks/install.sh
# =============================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
GIT_HOOKS_DIR="$PROJECT_DIR/.git/hooks"

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'

echo ""
echo "UNIGARDEN Git Hook Kurulumu"
echo "═══════════════════════════"

# Çalıştırma izinleri ver
chmod +x "$SCRIPT_DIR/pre-push.sh"
chmod +x "$SCRIPT_DIR/health-check.sh"
chmod +x "$SCRIPT_DIR/api-test.sh"
chmod +x "$SCRIPT_DIR/config.sh"
echo -e "${GREEN}✓${NC} Script izinleri ayarlandı"

# pre-push hook
PRE_PUSH_HOOK="$GIT_HOOKS_DIR/pre-push"
if [ -f "$PRE_PUSH_HOOK" ] && [ ! -L "$PRE_PUSH_HOOK" ]; then
  echo -e "${YELLOW}⚠${NC} Mevcut pre-push hook yedekleniyor: pre-push.bak"
  mv "$PRE_PUSH_HOOK" "$PRE_PUSH_HOOK.bak"
fi

ln -sf "$SCRIPT_DIR/pre-push.sh" "$PRE_PUSH_HOOK"
echo -e "${GREEN}✓${NC} pre-push hook kuruldu → $PRE_PUSH_HOOK"

# config.sh gitignore kontrolü
if ! grep -q "Hooks/config.sh" "$PROJECT_DIR/.gitignore" 2>/dev/null; then
  echo "" >> "$PROJECT_DIR/.gitignore"
  echo "# Hook konfigürasyonu (gizli test verisi içerebilir)" >> "$PROJECT_DIR/.gitignore"
  echo "Hooks/config.sh" >> "$PROJECT_DIR/.gitignore"
  echo -e "${GREEN}✓${NC} Hooks/config.sh gitignore'a eklendi"
fi

echo ""
echo "Kurulum tamamlandı!"
echo ""
echo "Kullanım:"
echo "  git push               → pre-push.sh otomatik tetiklenir"
echo "  bash Hooks/health-check.sh          → Tek seferlik kontrol"
echo "  bash Hooks/health-check.sh --watch  → Sürekli izleme"
echo "  bash Hooks/api-test.sh              → API testleri"
echo ""
echo -e "${YELLOW}NOT:${NC} Hooks/config.sh dosyasını düzenleyerek test verilerini gir."
echo ""
