-- Make tcKimlik and email nullable on Ogrenci (for CSV import without complete data)
-- SQLite requires table recreation to change column nullability

CREATE TABLE "new_Ogrenci" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ad" TEXT NOT NULL,
    "soyad" TEXT NOT NULL,
    "tcKimlik" TEXT,
    "ogrenciNo" TEXT,
    "universite" TEXT,
    "bolum" TEXT,
    "telefon" TEXT NOT NULL,
    "email" TEXT,
    "acilKisi" TEXT,
    "acilTelefon" TEXT,
    "notlar" TEXT,
    "sifre" TEXT,
    "cinsiyet" TEXT,
    "kimlikBelgesi" TEXT,
    "ogrenciBelgesi" TEXT,
    "olusturmaTar" DATETIME NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

INSERT INTO "new_Ogrenci" SELECT * FROM "Ogrenci";
DROP TABLE "Ogrenci";
ALTER TABLE "new_Ogrenci" RENAME TO "Ogrenci";
CREATE UNIQUE INDEX "Ogrenci_tcKimlik_key" ON "Ogrenci"("tcKimlik");
CREATE UNIQUE INDEX "Ogrenci_email_key" ON "Ogrenci"("email");
