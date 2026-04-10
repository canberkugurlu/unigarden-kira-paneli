-- AlterTable: Add cinsiyet, kimlikBelgesi, ogrenciBelgesi to Ogrenci
ALTER TABLE "Ogrenci" ADD COLUMN "cinsiyet" TEXT;
ALTER TABLE "Ogrenci" ADD COLUMN "kimlikBelgesi" TEXT;
ALTER TABLE "Ogrenci" ADD COLUMN "ogrenciBelgesi" TEXT;
