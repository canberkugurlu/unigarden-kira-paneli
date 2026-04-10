#!/usr/bin/env bash
# =============================================================
# UNIGARDEN - Proje Sağlık Kontrolü
# Kullanım:
#   ./Hooks/health-check.sh          # Tek seferlik kontrol
#   ./Hooks/health-check.sh --watch  # Sürekli izleme (30sn)
# =============================================================

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
WATCH_MODE=0
INTERVAL=30

[ "${1:-}" = "--watch" ] && WATCH_MODE=1

# Renkler
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
BLUE='\033[0;34m'; BOLD='\033[1m'; NC='\033[0m'

PASS=0; FAIL=0; WARN=0

ok()   { echo -e "  ${GREEN}✓${NC} $*"; ((PASS++)); }
fail() { echo -e "  ${RED}✗${NC} $*"; ((FAIL++)); }
warn() { echo -e "  ${YELLOW}⚠${NC} $*"; ((WARN++)); }
section() { echo -e "\n${BOLD}${BLUE}▶ $*${NC}"; }

run_checks() {
  PASS=0; FAIL=0; WARN=0
  cd "$PROJECT_DIR"

  echo ""
  echo "══════════════════════════════════════════"
  echo -e "  ${BOLD}UNIGARDEN Sağlık Kontrolü${NC}  $(date '+%H:%M:%S')"
  echo "══════════════════════════════════════════"

  # ── 1. Ortam Değişkenleri ─────────────────────────────────
  section "Ortam Değişkenleri"
  if [ -f ".env" ]; then
    ok ".env dosyası mevcut"
    grep -q "^DATABASE_URL=" .env && ok "DATABASE_URL tanımlı" || fail "DATABASE_URL eksik"
    grep -q "^NEXTAUTH_SECRET=" .env && ok "NEXTAUTH_SECRET tanımlı" || warn "NEXTAUTH_SECRET eksik"
  else
    fail ".env dosyası bulunamadı"
  fi

  if grep -q "^\.env" .gitignore 2>/dev/null; then
    ok ".env gitignore'da"
  else
    fail ".env gitignore'a eklenmemiş — GÜVENLİK RİSKİ"
  fi

  # ── 2. Veritabanı ─────────────────────────────────────────
  section "Veritabanı"
  DB_PATH=$(grep "^DATABASE_URL=" .env 2>/dev/null | sed 's/DATABASE_URL="file://' | tr -d '"')
  if [ -f "$DB_PATH" ]; then
    DB_SIZE=$(du -h "$DB_PATH" | cut -f1)
    ok "Veritabanı mevcut ($DB_SIZE)"
  else
    fail "Veritabanı dosyası bulunamadı: $DB_PATH"
  fi

  if [ -d "prisma/migrations" ] && [ "$(ls prisma/migrations | wc -l)" -gt 0 ]; then
    ok "Prisma migration'ları mevcut"
  else
    warn "Prisma migration klasörü boş veya yok"
  fi

  # ── 3. TypeScript ─────────────────────────────────────────
  section "TypeScript"
  TS_OUT=$(npx tsc --noEmit 2>&1)
  if [ $? -eq 0 ]; then
    ok "TypeScript tip kontrolü geçti"
  else
    ERROR_COUNT=$(echo "$TS_OUT" | grep -c "error TS" || true)
    fail "TypeScript hataları: $ERROR_COUNT adet"
    echo "$TS_OUT" | grep "error TS" | head -5 | while read -r line; do
      echo -e "    ${RED}→${NC} $line"
    done
  fi

  # ── 4. Bağımlılıklar ──────────────────────────────────────
  section "Bağımlılıklar"
  if [ -d "node_modules" ]; then
    ok "node_modules mevcut"
  else
    fail "node_modules yok — 'npm install' çalıştır"
  fi

  # package.json ile package-lock.json eşleşmesi
  PKG_HASH=$(md5 -q package.json 2>/dev/null || md5sum package.json 2>/dev/null | cut -d' ' -f1)
  LOCK_PKG_HASH=$(grep -m1 '"version"' package-lock.json 2>/dev/null | md5 -q 2>/dev/null || echo "")
  if [ -f "package-lock.json" ]; then
    ok "package-lock.json mevcut"
  else
    warn "package-lock.json eksik"
  fi

  # ── 5. Kritik Dosyalar ────────────────────────────────────
  section "Kritik Dosyalar"
  CRITICAL_FILES=("prisma/schema.prisma" "lib/prisma.ts" "app/layout.tsx" "app/page.tsx")
  for f in "${CRITICAL_FILES[@]}"; do
    [ -f "$f" ] && ok "$f mevcut" || fail "$f EKSIK"
  done

  # ── 6. API Route Bütünlüğü ────────────────────────────────
  section "API Route Bütünlüğü"
  API_ROUTES=("app/api/konutlar/route.ts" "app/api/ogrenciler/route.ts"
              "app/api/sozlesmeler/route.ts" "app/api/tedarikciler/route.ts"
              "app/api/giderler/route.ts" "app/api/odemeler/route.ts"
              "app/api/istatistikler/route.ts")
  for r in "${API_ROUTES[@]}"; do
    [ -f "$r" ] && ok "$r" || fail "$r EKSIK"
  done

  # ── 7. Güvenlik Taraması ──────────────────────────────────
  section "Güvenlik Taraması"

  # console.log bırakılmış mı?
  CL_COUNT=$(grep -r "console\.log" app/ lib/ --include="*.ts" --include="*.tsx" 2>/dev/null | wc -l | tr -d ' ')
  [ "$CL_COUNT" -eq 0 ] && ok "console.log yok" || warn "$CL_COUNT adet console.log bırakılmış"

  # TODO/FIXME işaretleri
  TODO_COUNT=$(grep -r "TODO\|FIXME\|HACK\|XXX" app/ lib/ --include="*.ts" --include="*.tsx" 2>/dev/null | wc -l | tr -d ' ')
  [ "$TODO_COUNT" -eq 0 ] && ok "Bekleyen TODO/FIXME yok" || warn "$TODO_COUNT adet TODO/FIXME işareti"

  # Gizli anahtar kod içinde mi?
  SECRET_IN_CODE=$(grep -r "NEXTAUTH_SECRET\s*=\s*\"" app/ lib/ --include="*.ts" --include="*.tsx" 2>/dev/null | wc -l | tr -d ' ')
  [ "$SECRET_IN_CODE" -eq 0 ] && ok "Hardcoded secret yok" || fail "Kod içinde hardcoded secret var"

  # ── Özet ──────────────────────────────────────────────────
  echo ""
  echo "══════════════════════════════════════════"
  echo -e "  ${GREEN}✓ $PASS başarılı${NC}  ${RED}✗ $FAIL başarısız${NC}  ${YELLOW}⚠ $WARN uyarı${NC}"
  echo "══════════════════════════════════════════"
  echo ""

  return $FAIL
}

# ── Çalıştır ─────────────────────────────────────────────────
if [ "$WATCH_MODE" -eq 1 ]; then
  echo -e "${BOLD}İzleme modu aktif (${INTERVAL}s aralıkla). Çıkmak için Ctrl+C${NC}"
  while true; do
    run_checks || true
    echo -e "${YELLOW}→ $INTERVAL saniye sonra tekrar kontrol edilecek...${NC}"
    sleep "$INTERVAL"
  done
else
  run_checks
  exit $?
fi
