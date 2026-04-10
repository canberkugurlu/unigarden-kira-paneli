#!/usr/bin/env bash
# =============================================================
# UNIGARDEN - Pre-Push Git Hook
# Bu dosya .git/hooks/pre-push'a symlink ile bağlanır.
# git push çalıştırılmadan önce otomatik tetiklenir.
# =============================================================

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$(dirname "$SCRIPT_DIR")")"

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
BLUE='\033[0;34m'; BOLD='\033[1m'; NC='\033[0m'

ERRORS=0

log()  { echo -e "${BLUE}[pre-push]${NC} $*"; }
ok()   { echo -e "${GREEN}[pre-push]${NC} ✓ $*"; }
fail() { echo -e "${RED}[pre-push]${NC} ✗ $*"; ((ERRORS++)); }
warn() { echo -e "${YELLOW}[pre-push]${NC} ⚠ $*"; }

cd "$PROJECT_DIR"

echo ""
echo -e "${BOLD}══════════════════════════════════════════${NC}"
echo -e "${BOLD}   UNIGARDEN Pre-Push Kontrolleri${NC}"
echo -e "${BOLD}══════════════════════════════════════════${NC}"

# ── 1. .env push kontrolü ────────────────────────────────────
log ".env dosyasının push edilmediği kontrol ediliyor"
STAGED_ENV=$(git diff --cached --name-only 2>/dev/null | grep "^\.env" || true)
COMMITTED_ENV=$(git ls-files .env .env.local .env.production 2>/dev/null || true)
if [ -n "$STAGED_ENV" ] || [ -n "$COMMITTED_ENV" ]; then
  fail ".env veya gizli dosya commit'e dahil! Push iptal edildi."
  fail "Etkilenen dosyalar: $STAGED_ENV $COMMITTED_ENV"
  echo ""
  echo -e "${RED}GÜVENLİK: .env dosyası asla GitHub'a yüklenmemeli.${NC}"
  echo -e "Düzeltmek için: git rm --cached .env"
  exit 1
else
  ok ".env push edilmiyor"
fi

# ── 2. TypeScript kontrolü ───────────────────────────────────
log "TypeScript kontrol ediliyor"
TS_OUT=$(npx tsc --noEmit 2>&1)
if [ $? -eq 0 ]; then
  ok "TypeScript geçti"
else
  fail "TypeScript hataları var:"
  echo "$TS_OUT" | grep "error TS" | head -10
fi

# ── 3. Build kontrolü ────────────────────────────────────────
log "Production build deneniyor"
BUILD_OUT=$(npm run build 2>&1)
if [ $? -eq 0 ]; then
  ok "Build başarılı"
else
  fail "Build başarısız:"
  echo "$BUILD_OUT" | tail -20
fi

# ── 4. Kritik dosya kontrolü ─────────────────────────────────
log "Kritik dosyalar kontrol ediliyor"
CRITICAL=("prisma/schema.prisma" "lib/prisma.ts" "app/layout.tsx")
for f in "${CRITICAL[@]}"; do
  [ -f "$f" ] && ok "$f mevcut" || fail "$f SİLİNMİŞ"
done

# ── 5. Hardcoded secret kontrolü ─────────────────────────────
log "Hardcoded secret/anahtar taranıyor"
SECRET_HITS=$(grep -rn "NEXTAUTH_SECRET\s*=\s*\"[^\"]\|password\s*=\s*\"[^\"]\|api_key\s*=\s*\"[^\"" \
  app/ lib/ --include="*.ts" --include="*.tsx" 2>/dev/null | wc -l | tr -d ' ')
[ "$SECRET_HITS" -eq 0 ] && ok "Hardcoded secret yok" || fail "$SECRET_HITS adet hardcoded secret bulundu"

# ── 6. API testleri (sunucu çalışıyorsa) ─────────────────────
[ -f "$SCRIPT_DIR/config.sh" ] && source "$SCRIPT_DIR/config.sh" || BASE_URL=""
if [ -n "$BASE_URL" ] && curl -s -o /dev/null "$BASE_URL" 2>/dev/null; then
  log "Sunucu çalışıyor, API testleri başlatılıyor"
  if bash "$SCRIPT_DIR/api-test.sh"; then
    ok "API testleri geçti"
  else
    fail "API testleri başarısız"
  fi
else
  warn "Sunucu çalışmıyor, API testleri atlandı (npm run dev ile başlat)"
fi

# ── Sonuç ────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}══════════════════════════════════════════${NC}"
if [ "$ERRORS" -eq 0 ]; then
  echo -e "${GREEN}${BOLD}  Push onaylandı. ✓${NC}"
  echo -e "${BOLD}══════════════════════════════════════════${NC}"
  exit 0
else
  echo -e "${RED}${BOLD}  Push reddedildi — $ERRORS hata var. ✗${NC}"
  echo -e "${BOLD}══════════════════════════════════════════${NC}"
  echo ""
  exit 1
fi
