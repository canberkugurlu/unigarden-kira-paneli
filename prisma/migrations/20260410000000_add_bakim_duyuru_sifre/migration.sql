-- AlterTable: Add sifre to Ogrenci
ALTER TABLE "Ogrenci" ADD COLUMN "sifre" TEXT;

-- AlterTable: Add unique constraint on email (with workaround for existing data)
CREATE UNIQUE INDEX IF NOT EXISTS "Ogrenci_email_key" ON "Ogrenci"("email");

-- AlterTable: Add bakimTalepleri relation to Konut (no change needed, handled by new table)

-- CreateTable: BakimTalebi
CREATE TABLE "BakimTalebi" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "baslik" TEXT NOT NULL,
    "aciklama" TEXT NOT NULL,
    "durum" TEXT NOT NULL DEFAULT 'Bekliyor',
    "oncelik" TEXT NOT NULL DEFAULT 'Normal',
    "olusturmaTar" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tamamlanmaTar" DATETIME,
    "ogrenciId" TEXT NOT NULL,
    "konutId" TEXT NOT NULL,
    CONSTRAINT "BakimTalebi_ogrenciId_fkey" FOREIGN KEY ("ogrenciId") REFERENCES "Ogrenci" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "BakimTalebi_konutId_fkey" FOREIGN KEY ("konutId") REFERENCES "Konut" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable: Duyuru
CREATE TABLE "Duyuru" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "baslik" TEXT NOT NULL,
    "icerik" TEXT NOT NULL,
    "tarih" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "hedef" TEXT NOT NULL DEFAULT 'Tumu',
    "yayinda" BOOLEAN NOT NULL DEFAULT true
);
