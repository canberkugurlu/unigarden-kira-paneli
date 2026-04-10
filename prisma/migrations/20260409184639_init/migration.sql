-- CreateTable
CREATE TABLE "Konut" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "blok" TEXT NOT NULL,
    "katNo" INTEGER NOT NULL,
    "daireNo" TEXT NOT NULL,
    "tip" TEXT NOT NULL,
    "metrekare" REAL NOT NULL,
    "kiraBedeli" REAL NOT NULL,
    "durum" TEXT NOT NULL DEFAULT 'Bos',
    "ozellikler" TEXT,
    "olusturmaTar" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Ogrenci" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ad" TEXT NOT NULL,
    "soyad" TEXT NOT NULL,
    "tcKimlik" TEXT NOT NULL,
    "ogrenciNo" TEXT,
    "universite" TEXT,
    "bolum" TEXT,
    "telefon" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "acilKisi" TEXT,
    "acilTelefon" TEXT,
    "notlar" TEXT,
    "olusturmaTar" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Sozlesme" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sozlesmeNo" TEXT NOT NULL,
    "konutId" TEXT NOT NULL,
    "ogrenciId" TEXT NOT NULL,
    "baslangicTarihi" DATETIME NOT NULL,
    "bitisTarihi" DATETIME NOT NULL,
    "aylikKira" REAL NOT NULL,
    "depozito" REAL NOT NULL,
    "kiraOdemGunu" INTEGER NOT NULL DEFAULT 1,
    "ozelSartlar" TEXT,
    "durum" TEXT NOT NULL DEFAULT 'Aktif',
    "imzaTarihi" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "olusturmaTar" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Sozlesme_konutId_fkey" FOREIGN KEY ("konutId") REFERENCES "Konut" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Sozlesme_ogrenciId_fkey" FOREIGN KEY ("ogrenciId") REFERENCES "Ogrenci" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Odeme" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sozlesmeId" TEXT NOT NULL,
    "tutar" REAL NOT NULL,
    "tip" TEXT NOT NULL,
    "odenmeTarihi" DATETIME NOT NULL,
    "aciklama" TEXT,
    "olusturmaTar" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Odeme_sozlesmeId_fkey" FOREIGN KEY ("sozlesmeId") REFERENCES "Sozlesme" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Tedarikci" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ad" TEXT NOT NULL,
    "telefon" TEXT NOT NULL,
    "email" TEXT,
    "kategori" TEXT NOT NULL,
    "notlar" TEXT,
    "olusturmaTar" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Gider" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "baslik" TEXT NOT NULL,
    "tutar" REAL NOT NULL,
    "kategori" TEXT NOT NULL,
    "tarih" DATETIME NOT NULL,
    "aciklama" TEXT,
    "olusturmaTar" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "Konut_daireNo_key" ON "Konut"("daireNo");

-- CreateIndex
CREATE UNIQUE INDEX "Ogrenci_tcKimlik_key" ON "Ogrenci"("tcKimlik");

-- CreateIndex
CREATE UNIQUE INDEX "Sozlesme_sozlesmeNo_key" ON "Sozlesme"("sozlesmeNo");
