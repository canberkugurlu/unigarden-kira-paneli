-- CreateTable
CREATE TABLE "DaireSahibi" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ad" TEXT NOT NULL,
    "soyad" TEXT NOT NULL,
    "tcKimlik" TEXT NOT NULL,
    "telefon" TEXT NOT NULL,
    "email" TEXT,
    "notlar" TEXT,
    "olusturmaTar" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Konut" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "blok" TEXT NOT NULL,
    "katNo" INTEGER NOT NULL,
    "daireNo" TEXT NOT NULL,
    "tip" TEXT NOT NULL,
    "metrekare" REAL NOT NULL,
    "kiraBedeli" REAL NOT NULL,
    "durum" TEXT NOT NULL DEFAULT 'Bos',
    "ozellikler" TEXT,
    "etap" INTEGER NOT NULL DEFAULT 1,
    "daireSahibiId" TEXT,
    "olusturmaTar" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Konut_daireSahibiId_fkey" FOREIGN KEY ("daireSahibiId") REFERENCES "DaireSahibi" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Konut" ("blok", "daireNo", "durum", "id", "katNo", "kiraBedeli", "metrekare", "olusturmaTar", "ozellikler", "tip") SELECT "blok", "daireNo", "durum", "id", "katNo", "kiraBedeli", "metrekare", "olusturmaTar", "ozellikler", "tip" FROM "Konut";
DROP TABLE "Konut";
ALTER TABLE "new_Konut" RENAME TO "Konut";
CREATE UNIQUE INDEX "Konut_daireNo_key" ON "Konut"("daireNo");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "DaireSahibi_tcKimlik_key" ON "DaireSahibi"("tcKimlik");
