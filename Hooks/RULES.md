# UNIGARDEN — Proje Kuralları

Bu dosya iki bölümden oluşur:
1. **GitHub Push Kuralları** — depoya ne yüklenir, ne yüklenmez
2. **Proje Uyumluluk Kuralları** — kod kalitesi ve mimari kısıtlamalar

---

## 1. GitHub Push Kuralları

### Kesinlikle Push Edilmeyecekler

| Dosya / Klasör | Neden |
|---|---|
| `.env` | Veritabanı yolu, secret key içerir |
| `.env.local` | Yerel ortam değişkenleri |
| `.env.production` | Canlı ortam gizli anahtarları |
| `*.db` / `dev.db` / `unigarden.db` | Gerçek kullanıcı verisi |
| `node_modules/` | npm install ile yeniden oluşturulur |
| `.next/` | Build çıktısı, her makinede farklı |
| `Hooks/config.sh` | Test credentials içerebilir |

### Zorunlu Kontroller (pre-push.sh tarafından otomatik yapılır)

1. `.env` dosyası commit'e dahil değilse push edilir
2. `npx tsc --noEmit` hatasız geçmeli
3. `npm run build` başarılı olmalı
4. Kod içinde hardcoded secret/password olmamalı
5. Sunucu çalışıyorsa API testleri geçmeli

### .gitignore'da Olması Zorunlular

```
.env
.env.local
.env.production
*.db
.next/
node_modules/
Hooks/config.sh
```

---

## 2. Proje Uyumluluk Kuralları

### Next.js 16 (Bu Proje Versiyonu)

- `params` asenkrondur — `await params` kullanılmalı
  ```ts
  // DOĞRU
  export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
  }
  // YANLIŞ — eski Next.js davranışı
  export async function GET(_: Request, { params }: { params: { id: string } }) {
    const { id } = params; // hata verir
  }
  ```
- Route handler'lar `app/api/` altında olmalı
- `"use client"` direktifi sadece client bileşenlerine, gereksiz kullanılmamalı

### Prisma + LibSQL

- Prisma client `lib/prisma.ts`'den import edilmeli, direkt `new PrismaClient()` kullanılmamalı
- Migration değişikliklerinde `prisma migrate dev` çalıştırılmalı
- `prisma.config.ts` dosyası değiştirilmeden önce yedeklenmeli

### Veritabanı

- Test verisi prodüksiyon DB'ye yazılmamalı
- Test script'leri (`api-test.sh`) kendi oluşturduğu kayıtları siler
- TC Kimlik numaraları gerçek olmamalı (test için: `99999999999`)

### TypeScript

- `any` tipi kullanılmamalı — `unknown` tercih edilmeli
- API response tipleri tanımlanmalı
- `eslint-disable` ve `@ts-ignore` gerekçe yorumu olmadan kullanılmamalı

### Bileşenler

- Sayfa bileşenleri `app/` altında, paylaşılan bileşenler `components/` altında
- Yeni UI bileşenleri mevcut Tailwind/emerald renk şemasına uymalı
- `lucide-react` icon kütüphanesi kullanılmalı (başka ikon kütüphanesi eklenmemeli)

### Güvenlik

- Kullanıcıdan gelen veriler doğrulanmalı (`zod` şeması kullanılmalı)
- SQL injection — Prisma ORM kullanıldığı sürece otomatik korunma sağlanır, ham sorgu yazılmamalı
- API endpoint'leri kimlik doğrulaması gerektiriyorsa middleware'de kontrol edilmeli

---

## 3. Hook Kullanım Kılavuzu

### Kurulum (tek seferlik)
```bash
bash Hooks/install.sh
```

### Günlük Kullanım

```bash
# Push öncesi manuel kontrol
bash Hooks/pre-push.sh

# Proje sağlık taraması
bash Hooks/health-check.sh

# Sürekli izleme (geliştirme sırasında)
bash Hooks/health-check.sh --watch

# API testleri (sunucu çalışırken)
bash Hooks/api-test.sh
```

### Test Verisi Yapılandırma

`Hooks/config.sh` dosyasını düzenle:
```bash
TEST_OGRENCI_TC="99999999999"    # Test TC kimlik
TEST_OGRENCI_TEL="5000000000"    # Test telefon
TEST_OGRENCI_EMAIL="test@unigarden.local"
```

Test sırasında bu verilerle geçici bir öğrenci oluşturulur ve test bitiminde otomatik silinir.
