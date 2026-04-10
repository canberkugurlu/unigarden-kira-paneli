-- AlterTable: Add sifre to DaireSahibi
ALTER TABLE "DaireSahibi" ADD COLUMN "sifre" TEXT;

-- CreateTable: BakimTalebiYorum
CREATE TABLE "BakimTalebiYorum" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "icerik" TEXT NOT NULL,
    "yazarTip" TEXT NOT NULL,
    "yazarId" TEXT NOT NULL,
    "yazarAd" TEXT NOT NULL,
    "olusturmaTar" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "bakimTalebiId" TEXT NOT NULL,
    "daireSahibiId" TEXT,
    CONSTRAINT "BakimTalebiYorum_bakimTalebiId_fkey" FOREIGN KEY ("bakimTalebiId") REFERENCES "BakimTalebi" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BakimTalebiYorum_daireSahibiId_fkey" FOREIGN KEY ("daireSahibiId") REFERENCES "DaireSahibi" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable: Belge
CREATE TABLE "Belge" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ad" TEXT NOT NULL,
    "tip" TEXT NOT NULL DEFAULT 'Diger',
    "dosyaYolu" TEXT NOT NULL,
    "olusturmaTar" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "yukleyenTip" TEXT NOT NULL,
    "yukleyenId" TEXT NOT NULL,
    "konutId" TEXT NOT NULL,
    "daireSahibiId" TEXT,
    CONSTRAINT "Belge_konutId_fkey" FOREIGN KEY ("konutId") REFERENCES "Konut" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Belge_daireSahibiId_fkey" FOREIGN KEY ("daireSahibiId") REFERENCES "DaireSahibi" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable: KullaniciIzin
CREATE TABLE "KullaniciIzin" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "kullaniciTip" TEXT NOT NULL,
    "kullaniciId" TEXT NOT NULL,
    "izinler" TEXT NOT NULL,
    "guncelleTar" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "KullaniciIzin_kullaniciTip_kullaniciId_key" ON "KullaniciIzin"("kullaniciTip", "kullaniciId");
