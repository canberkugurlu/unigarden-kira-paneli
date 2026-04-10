#!/usr/bin/env bash
# =============================================================
# UNIGARDEN - API Entegrasyon Testleri
# Kullanım: ./Hooks/api-test.sh
#
# - config.sh'taki verilerle geçici test kullanıcısı oluşturur
# - Tüm CRUD endpoint'lerini test eder
# - Test kullanıcısını sonunda siler
# =============================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/config.sh"

# Renkler
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'

PASS=0; FAIL=0; SKIP=0
TEST_OGRENCI_ID=""
SERVER_STARTED=0

# ── Yardımcılar ──────────────────────────────────────────────
log()  { echo -e "${BLUE}[TEST]${NC} $*"; }
ok()   { echo -e "${GREEN}[PASS]${NC} $*"; ((PASS++)); }
fail() { echo -e "${RED}[FAIL]${NC} $*"; ((FAIL++)); }
warn() { echo -e "${YELLOW}[SKIP]${NC} $*"; ((SKIP++)); }

assert_status() {
  local label="$1" expected="$2" actual="$3"
  if [ "$actual" -eq "$expected" ]; then
    ok "$label (HTTP $actual)"
  else
    fail "$label — beklenen HTTP $expected, alınan: $actual"
  fi
}

assert_contains() {
  local label="$1" needle="$2" haystack="$3"
  if echo "$haystack" | grep -q "$needle"; then
    ok "$label"
  else
    fail "$label — '$needle' bulunamadı"
  fi
}

# ── Sunucu kontrolü ──────────────────────────────────────────
ensure_server() {
  if curl -s -o /dev/null -w "" "$BASE_URL" 2>/dev/null; then
    return 0
  fi
  warn "Sunucu çalışmıyor, geçici olarak başlatılıyor..."
  (cd "$(dirname "$SCRIPT_DIR")" && npm run dev &>/tmp/unigarden-test-server.log) &
  SERVER_PID=$!
  SERVER_STARTED=1
  local i=0
  while [ $i -lt 20 ]; do
    sleep 1
    if curl -s -o /dev/null "$BASE_URL" 2>/dev/null; then
      log "Sunucu hazır."
      return 0
    fi
    ((i++))
  done
  fail "Sunucu 20 saniyede başlamadı"
  exit 1
}

# ── Temizlik ─────────────────────────────────────────────────
cleanup() {
  if [ -n "$TEST_OGRENCI_ID" ]; then
    log "Test öğrencisi siliniyor: $TEST_OGRENCI_ID"
    local status
    status=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE \
      "$BASE_URL/api/ogrenciler/$TEST_OGRENCI_ID")
    if [ "$status" -eq 200 ]; then
      ok "Test öğrencisi silindi"
    else
      fail "Test öğrencisi SİLİNEMEDİ (HTTP $status) — manuel silinmeli: TC=$TEST_OGRENCI_TC"
    fi
  fi
  if [ "$SERVER_STARTED" -eq 1 ]; then
    kill "$SERVER_PID" 2>/dev/null || true
    log "Geçici sunucu kapatıldı"
  fi
}
trap cleanup EXIT

# ── TESTLER ──────────────────────────────────────────────────
echo ""
echo "══════════════════════════════════════════"
echo "   UNIGARDEN API Testleri"
echo "══════════════════════════════════════════"

ensure_server

# 1. İstatistikler
log "İstatistik endpoint testi"
RESP=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/istatistikler")
BODY=$(echo "$RESP" | head -1)
STATUS=$(echo "$RESP" | tail -1)
assert_status "GET /api/istatistikler" 200 "$STATUS"
assert_contains "toplamKonut alanı" "toplamKonut" "$BODY"

# 2. Konutlar listesi
log "Konut listesi testi"
RESP=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/konutlar")
BODY=$(echo "$RESP" | head -1)
STATUS=$(echo "$RESP" | tail -1)
assert_status "GET /api/konutlar" 200 "$STATUS"

# 3. Öğrenci oluştur (test kullanıcısı)
log "Test öğrencisi oluşturuluyor"
CREATE_RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/ogrenciler" \
  -H "Content-Type: application/json" \
  -d "{
    \"ad\": \"$TEST_OGRENCI_AD\",
    \"soyad\": \"$TEST_OGRENCI_SOYAD\",
    \"tcKimlik\": \"$TEST_OGRENCI_TC\",
    \"ogrenciNo\": \"$TEST_OGRENCI_NO\",
    \"telefon\": \"$TEST_OGRENCI_TEL\",
    \"email\": \"$TEST_OGRENCI_EMAIL\"
  }")
CREATE_BODY=$(echo "$CREATE_RESP" | head -1)
CREATE_STATUS=$(echo "$CREATE_RESP" | tail -1)
assert_status "POST /api/ogrenciler" 201 "$CREATE_STATUS"

TEST_OGRENCI_ID=$(echo "$CREATE_BODY" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
if [ -z "$TEST_OGRENCI_ID" ]; then
  fail "Test öğrencisi ID alınamadı — testler durduruluyor"
  exit 1
fi
log "Test öğrencisi ID: $TEST_OGRENCI_ID"

# 4. Öğrenci getir
log "Öğrenci getirme testi"
RESP=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/ogrenciler/$TEST_OGRENCI_ID")
BODY=$(echo "$RESP" | head -1)
STATUS=$(echo "$RESP" | tail -1)
assert_status "GET /api/ogrenciler/:id" 200 "$STATUS"
assert_contains "TC kimlik doğru" "$TEST_OGRENCI_TC" "$BODY"

# 5. Öğrenci güncelle
log "Öğrenci güncelleme testi"
RESP=$(curl -s -w "\n%{http_code}" -X PUT "$BASE_URL/api/ogrenciler/$TEST_OGRENCI_ID" \
  -H "Content-Type: application/json" \
  -d "{\"notlar\": \"otomatik-test\"}")
STATUS=$(echo "$RESP" | tail -1)
assert_status "PUT /api/ogrenciler/:id" 200 "$STATUS"

# 6. 404 testi
log "404 testi"
RESP=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/ogrenciler/varolmayan-id-xyz")
STATUS=$(echo "$RESP" | tail -1)
assert_status "GET /api/ogrenciler/varolmayan-id (404)" 404 "$STATUS"

# 7. Tedarikçiler
log "Tedarikçi listesi testi"
RESP=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/tedarikciler")
STATUS=$(echo "$RESP" | tail -1)
assert_status "GET /api/tedarikciler" 200 "$STATUS"

# 8. Giderler
log "Gider listesi testi"
RESP=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/giderler")
STATUS=$(echo "$RESP" | tail -1)
assert_status "GET /api/giderler" 200 "$STATUS"

# 9. Ödemeler
log "Ödeme listesi testi"
RESP=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/odemeler")
STATUS=$(echo "$RESP" | tail -1)
assert_status "GET /api/odemeler" 200 "$STATUS"

# 10. Sözleşmeler
log "Sözleşme listesi testi"
RESP=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/sozlesmeler")
STATUS=$(echo "$RESP" | tail -1)
assert_status "GET /api/sozlesmeler" 200 "$STATUS"

# ── Özet ─────────────────────────────────────────────────────
echo ""
echo "══════════════════════════════════════════"
echo -e "  Sonuç: ${GREEN}$PASS geçti${NC} | ${RED}$FAIL başarısız${NC} | ${YELLOW}$SKIP atlandı${NC}"
echo "══════════════════════════════════════════"
echo ""

[ "$FAIL" -eq 0 ]
