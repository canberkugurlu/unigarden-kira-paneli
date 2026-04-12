-- Ev sahiplerinin daireleri alış/satış geçmişi
CREATE TABLE "DaireSahipligi" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "konutId" TEXT NOT NULL,
  "daireSahibiId" TEXT NOT NULL,
  "alisTarihi" DATETIME NOT NULL,
  "satisTarihi" DATETIME,
  "alisFiyati" REAL,
  "satisFiyati" REAL,
  "notlar" TEXT,
  "olusturmaTar" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "DaireSahipligi_konutId_fkey" FOREIGN KEY ("konutId") REFERENCES "Konut" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "DaireSahipligi_daireSahibiId_fkey" FOREIGN KEY ("daireSahibiId") REFERENCES "DaireSahibi" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "DaireSahipligi_konutId_idx" ON "DaireSahipligi"("konutId");
CREATE INDEX "DaireSahipligi_daireSahibiId_idx" ON "DaireSahipligi"("daireSahibiId");
CREATE INDEX "DaireSahipligi_alisTarihi_idx" ON "DaireSahipligi"("alisTarihi");
