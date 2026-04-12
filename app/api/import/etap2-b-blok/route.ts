import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const SECRET = process.env.IMPORT_SECRET ?? "etap3-import-2025";

type Row = {
  blok: string; daireNo: string; oda: string | null;
  ad: string; soyad: string; telefon: string;
  tcKimlik: string | null; email: string | null;
  kiraBedeli: number; baslangic: string | null; bitis: string | null;
};

const KIRACLAR: Row[] = [
  { blok: "B", daireNo: "B-1A", oda: "Oda 1", ad: "Havi̇n", soyad: "NAYİR", telefon: "05352213412", tcKimlik: "12656492320", email: "1havinnayir@gmail.com", kiraBedeli: 8750, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "B", daireNo: "B-1A", oda: "Oda 2", ad: "Zehra", soyad: "KİLCİOĞLU", telefon: "05537723663", tcKimlik: "47794517116", email: "zehrakilcioglu07@gmai̇l.com", kiraBedeli: 8750, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "B", daireNo: "B-1B", oda: "Oda 1", ad: "Nazli̇", soyad: "MİRZADOUST", telefon: "05521731250", tcKimlik: "98944044068", email: "nazli.mn@yahoo.com", kiraBedeli: 11000, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "B", daireNo: "B-1B", oda: "Oda 2", ad: "Zeinebou", soyad: "-", telefon: "05365616508", tcKimlik: null, email: "zeynebmly@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "B", daireNo: "B-2A", oda: "Oda 1", ad: "Yesi̇m", soyad: "ARSLAN", telefon: "05342880513", tcKimlik: "17741313726", email: "yesiimaarslan@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "B", daireNo: "B-2A", oda: "Oda 2", ad: "Tuğba", soyad: "BEYOĞLU", telefon: "05524335513", tcKimlik: "10237887916", email: "tugbabeyoglu.123@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "B", daireNo: "B-2B", oda: "Oda 1", ad: "Merve", soyad: "ALDAĞ", telefon: "05438235804", tcKimlik: "55660058960", email: "mervealdag5@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "B", daireNo: "B-2B", oda: "Oda 2", ad: "Odi̇l", soyad: "TANIK", telefon: "05066595245", tcKimlik: "10106585264", email: "odiltanik1@gmail.com", kiraBedeli: 10000, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "B", daireNo: "B-3A", oda: "Oda 1", ad: "Ece", soyad: "NİĞDELİOĞLU", telefon: "05384681857", tcKimlik: "10040273456", email: "ecenigdelioglu26@gmail.com", kiraBedeli: 10000, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "B", daireNo: "B-3A", oda: "Oda 2", ad: "Irmak Meli̇ke", soyad: "ŞAHİN", telefon: "05367291424", tcKimlik: "10070213408", email: "irmakmelikesahin@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "B", daireNo: "B-3B", oda: "Oda 1", ad: "Nagi̇han", soyad: "DEMİRÜRS", telefon: "05433134828", tcKimlik: "43561524370", email: "nagihandemirors37@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "B", daireNo: "B-3B", oda: "Oda 2", ad: "Neşe Azra", soyad: "EKİNCİ", telefon: "05467839988", tcKimlik: "22613143608", email: "neseazraekinci@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "B", daireNo: "B-4A", oda: "Oda 1", ad: "Yağmur", soyad: "ÖZKARANLIK", telefon: "05432101626", tcKimlik: "10627959896", email: "yagmurozkaranlık@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "B", daireNo: "B-4A", oda: "Oda 2", ad: "Tuğba Fatma", soyad: "GÜNDOĞDU", telefon: "05431002241", tcKimlik: "41014681106", email: "tubafatmagndgdu@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "B", daireNo: "B-4B", oda: "Oda 1", ad: "Dariga", soyad: "MYRZABEK", telefon: "77017570897", tcKimlik: null, email: "ussenova80@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "B", daireNo: "B-4B", oda: "Oda 2", ad: "Ladan", soyad: "GHAYOURİ", telefon: "05528542496", tcKimlik: null, email: "ghayouri.ladan@gmail.com", kiraBedeli: 10000, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "B", daireNo: "B-5A", oda: "Oda 1", ad: "Zeynep Sila", soyad: "KARA", telefon: "05305647248", tcKimlik: "30817356946", email: "karazeynepsila@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "B", daireNo: "B-5A", oda: "Oda 2", ad: "Nazlican", soyad: "PEHLİVAN", telefon: "05377640592", tcKimlik: "20219622824", email: "nzlcn.phlvn@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "B", daireNo: "B-5B", oda: "Oda 1", ad: "Eylül", soyad: "KESKİN", telefon: "05511959953", tcKimlik: "11636659074", email: "eylulkeskim.9@gmail.com", kiraBedeli: 10000, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "B", daireNo: "B-5B", oda: "Oda 2", ad: "Kevser", soyad: "GÜRGÜLÜ", telefon: "05422764755", tcKimlik: "20930348188", email: "kevsergorgulu32@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "B", daireNo: "B-6A", oda: "Oda 1", ad: "Deni̇z Fi̇del", soyad: "KORKMAZ", telefon: "05425798609", tcKimlik: "10949939194", email: "denizfidelkorkmazl@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "B", daireNo: "B-6A", oda: "Oda 2", ad: "Sena Nur", soyad: "ŞEN", telefon: "05393194060", tcKimlik: "19043062050", email: "senanursen28@gmail.com", kiraBedeli: 10000, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "B", daireNo: "B-6B", oda: "Oda 1", ad: "Sümeyye", soyad: "HALICI", telefon: "05461161696", tcKimlik: "11542936696", email: "smyyhlc12@gmail.com", kiraBedeli: 16500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "B", daireNo: "B-1C", oda: "Oda 1", ad: "Tuğba", soyad: "DEMİRCİ", telefon: "05384129311", tcKimlik: "10051920288", email: "tugbadmrc17@outlook.com", kiraBedeli: 16500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "B", daireNo: "B-1D", oda: "Oda 1", ad: "Si̇nem", soyad: "YAZICI", telefon: "05061068595", tcKimlik: "41672099244", email: "sineemyzc@gmail.com", kiraBedeli: 10000, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "B", daireNo: "B-1D", oda: "Oda 2", ad: "Yasemi̇n", soyad: "KARDUZ", telefon: "05357852498", tcKimlik: "10977171160", email: "ykarduz9@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "B", daireNo: "B-2C", oda: "Oda 1", ad: "Asli Fatma", soyad: "BÜLBÜL", telefon: "05372668752", tcKimlik: "48490361904", email: "aslifatmabulbul@gmail.com", kiraBedeli: 11000, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "B", daireNo: "B-2C", oda: "Oda 2", ad: "Bi̇llur", soyad: "KÜK", telefon: "05380534839", tcKimlik: "47836455406", email: "billurkok1@icloud.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "B", daireNo: "B-2D", oda: "Oda 1", ad: "Meli̇ke", soyad: "HATİPOĞLU", telefon: "05365662512", tcKimlik: "37264071460", email: "melikehatipoglu2022@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "B", daireNo: "B-2D", oda: "Oda 2", ad: "Sude", soyad: "ÜİNİ", telefon: "05365829688", tcKimlik: "37099077002", email: "sudecni88@gmail.com", kiraBedeli: 10000, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "B", daireNo: "B-3C", oda: "Oda 1", ad: "Rabi̇a", soyad: "ERDEMİR", telefon: "05415497017", tcKimlik: "17849276958", email: "demirerrabiaa@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "B", daireNo: "B-3C", oda: "Oda 2", ad: "Kübra", soyad: "AKILKAYA", telefon: "05522361145", tcKimlik: "11156546076", email: "akilkayakubra@gmail.com", kiraBedeli: 10000, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "B", daireNo: "B-3D", oda: "Oda 1", ad: "Tuana Şevval", soyad: "ŞAFAK", telefon: "05469792416", tcKimlik: "10160471954", email: "tuanasafak62@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "B", daireNo: "B-3D", oda: "Oda 2", ad: "Meli̇sa Avzel", soyad: "AKDOĞAN", telefon: "05433404703", tcKimlik: "12119818506", email: "akdoganavzel@gmail.com", kiraBedeli: 10000, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "B", daireNo: "B-4C", oda: "Oda 1", ad: "İlayda Ni̇sa", soyad: "ÖZKÖK", telefon: "05434307404", tcKimlik: "10528968010", email: "e.akbulut16@hotmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "B", daireNo: "B-4C", oda: "Oda 2", ad: "Eylül", soyad: "AKBULUT", telefon: "05078906653", tcKimlik: null, email: null, kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "B", daireNo: "B-4D", oda: "Oda 1", ad: "Gamze", soyad: "ÖZBEK", telefon: "05467282208", tcKimlik: "12152856190", email: "gamze.51ozbek@gmail.com", kiraBedeli: 11000, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "B", daireNo: "B-4D", oda: "Oda 2", ad: "Ni̇l Ebral", soyad: "CORUH", telefon: "05303717901", tcKimlik: null, email: null, kiraBedeli: 11000, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "B", daireNo: "B-5C", oda: "Oda 1", ad: "Begüm", soyad: "ARSLAN", telefon: "05078869408", tcKimlik: "18154995080", email: null, kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "B", daireNo: "B-5C", oda: "Oda 2", ad: "Ecem", soyad: "YURTAŞ", telefon: "05550046258", tcKimlik: "55516698128", email: "2006.ecem.2009@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "B", daireNo: "B-5D", oda: "Oda 1", ad: "Ayüa", soyad: "AKGÜN", telefon: "05413368334", tcKimlik: "10511546812", email: "aycaakgunaa@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "B", daireNo: "B-5D", oda: "Oda 2", ad: "Yasemi̇n", soyad: "EGE", telefon: "05063648694", tcKimlik: "16799342900", email: null, kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "B", daireNo: "B-6C", oda: "Oda 1", ad: "Akasya", soyad: "KIZILCA", telefon: "05057764990", tcKimlik: "12407770592", email: "kizilcaakasya99@gmail.com", kiraBedeli: 10000, baslangic: "2025-10-01", bitis: "2026-08-01" },
  { blok: "B", daireNo: "B-6C", oda: "Oda 2", ad: "Ni̇sanur", soyad: "BARIŞ", telefon: "05513412110", tcKimlik: "10061713672", email: "nisaburus95@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "B", daireNo: "B-6D", oda: "Oda 1", ad: "Gi̇zem", soyad: "FIRAT", telefon: "05309782102", tcKimlik: "53221139882", email: "zgizem.zgf@gmail.com", kiraBedeli: 16000, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "B", daireNo: "B-7A", oda: "Oda 1", ad: "Eslem", soyad: "TÜM", telefon: "05535909616", tcKimlik: "18001727994", email: "eslemtm@icloud.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "B", daireNo: "B-7A", oda: "Oda 2", ad: "Rana", soyad: "ÖZER", telefon: "05060973654", tcKimlik: "18629146276", email: "ozerrana40@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "B", daireNo: "B-7B", oda: "Oda 1", ad: "Aslinur", soyad: "MERCAN", telefon: "05467813755", tcKimlik: "10145603684", email: "mercanasli8@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "B", daireNo: "B-7B", oda: "Oda 2", ad: "Eli̇f", soyad: "SAVAŞ", telefon: "05331360819", tcKimlik: "23840104462", email: "elifsavas03@hotmail.com", kiraBedeli: 10000, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "B", daireNo: "B-8A", oda: "Oda 1", ad: "Şeyma", soyad: "AYNACI", telefon: "05468778952", tcKimlik: "40600562744", email: "aynaciseyma@gmail.com", kiraBedeli: 10000, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "B", daireNo: "B-8A", oda: "Oda 2", ad: "Peli̇n Irmak", soyad: "BAKIRCI", telefon: "05522586922", tcKimlik: "12044497708", email: "pelinirmakbakirci@gmail.com", kiraBedeli: 10000, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "B", daireNo: "B-8B", oda: "Oda 1", ad: "Şazi̇ye Şeyme", soyad: "ARSLANTAŞ", telefon: "05010390420", tcKimlik: "20903206002", email: "saziseyars@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "B", daireNo: "B-8B", oda: "Oda 2", ad: "Esra Sultan", soyad: "AĞILÖNÜ", telefon: "05456139915", tcKimlik: "23659075120", email: "esrasultanagln26@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "B", daireNo: "B-9A", oda: "Oda 1", ad: "Tuana Özüm", soyad: "ÖNCÜ", telefon: "05439122366", tcKimlik: "10901369212", email: "tuanaoncu17@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "B", daireNo: "B-9A", oda: "Oda 2", ad: "Sude Nas", soyad: "ALAKUŞ", telefon: "05519409910", tcKimlik: "26816003400", email: "sudenasalakus@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "B", daireNo: "B-9B", oda: "Oda 1", ad: "Eli̇f Azra", soyad: "ANDIÇ", telefon: "05526962460", tcKimlik: "17006337276", email: "elifazrandic@gmail.com", kiraBedeli: 10000, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "B", daireNo: "B-9B", oda: "Oda 2", ad: "Zehra", soyad: "ATA", telefon: "05050668868", tcKimlik: "11416239816", email: "zehraata22@gmail.com", kiraBedeli: 10000, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "B", daireNo: "B-10A", oda: "Oda 1", ad: "Eylül", soyad: "ÖZCAN", telefon: "05384869732", tcKimlik: "19142267158", email: "ozcaneylul825@gmail.com", kiraBedeli: 10000, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "B", daireNo: "B-10A", oda: "Oda 2", ad: "Tuba", soyad: "ERDEM", telefon: "05528271411", tcKimlik: "10566104968", email: "tubardem67@gmail.com", kiraBedeli: 10000, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "B", daireNo: "B-10B", oda: "Oda 1", ad: "Sila", soyad: "ÇELİK", telefon: "05398416624", tcKimlik: "27695123500", email: "silacelik00@icloud.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "B", daireNo: "B-10B", oda: "Oda 2", ad: "Ezgi̇", soyad: "MEŞECİ", telefon: "05388520309", tcKimlik: "33160143270", email: "ezgimeseci1481@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "B", daireNo: "B-11A", oda: "Oda 1", ad: "Ecri̇n Di̇lara", soyad: "TAŞKIN", telefon: "05533430809", tcKimlik: "19754238874", email: "ceren.tnc.08@gmail.com", kiraBedeli: 10000, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "B", daireNo: "B-11A", oda: "Oda 2", ad: "Ceren", soyad: "TUNÇ", telefon: "05365520825", tcKimlik: null, email: null, kiraBedeli: 10000, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "B", daireNo: "B-11B", oda: "Oda 1", ad: "Mi̇ray", soyad: "KIRTAŞ", telefon: "05461481402", tcKimlik: "48913388464", email: "diana.miray@icloud.com", kiraBedeli: 10000, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "B", daireNo: "B-11B", oda: "Oda 2", ad: "Beyza", soyad: "ÜRMEZ", telefon: "05369673103", tcKimlik: "11660516466", email: "beyza.olmez@icloud.com", kiraBedeli: 10000, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "B", daireNo: "B-12A", oda: "Oda 1", ad: "Ceren", soyad: "ŞAHİN", telefon: "05426060581", tcKimlik: "10413190212", email: "cerensahin181@icloud.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "B", daireNo: "B-12A", oda: "Oda 2", ad: "Meli̇sa", soyad: "ÇELEBİ", telefon: "05541389732", tcKimlik: "53365600378", email: "melisacelebi01@outlook.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "B", daireNo: "B-12B", oda: "Oda 1", ad: "Merve", soyad: "SARITAŞ", telefon: "05352410811", tcKimlik: "12106898320", email: "mervee.srts@gmail.com", kiraBedeli: 10000, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "B", daireNo: "B-12B", oda: "Oda 2", ad: "Gamzenur", soyad: "GÜRBÜZ", telefon: "05522551599", tcKimlik: "21545179150", email: "gurbuzgamzenur624@gmail.com", kiraBedeli: 10000, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "B", daireNo: "B-13A", oda: "Oda 1", ad: "Erva Medi̇ne", soyad: "KILIÇ", telefon: "05308299306", tcKimlik: "11015419046", email: "ervakilic543@gmail.com", kiraBedeli: 10000, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "B", daireNo: "B-13A", oda: "Oda 2", ad: "Rana", soyad: "ÇAĞLAR", telefon: "05326591676", tcKimlik: "10360950150", email: "caglarrana07@gmail.com", kiraBedeli: 10000, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "B", daireNo: "B-13B", oda: "Oda 1", ad: "Zelal Buse", soyad: "SEMANLI", telefon: "05370471589", tcKimlik: "12953694380", email: "zzelalsamanli@icloud.com", kiraBedeli: 10000, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "B", daireNo: "B-13B", oda: "Oda 2", ad: "Betül", soyad: "ŞIŞMAN", telefon: "05400014153", tcKimlik: "10994680300", email: "betulsisman162@gmail.com", kiraBedeli: 10000, baslangic: "2026-03-05", bitis: "2026-08-01" },
  { blok: "B", daireNo: "B-14A", oda: "Oda 1", ad: "İrem Naz", soyad: "KARAKİŞLAK", telefon: "05461363736", tcKimlik: "30520949428", email: "karakislakirem@gmail.com", kiraBedeli: 10000, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "B", daireNo: "B-14A", oda: "Oda 2", ad: "Eylül", soyad: "DAYIOĞLU", telefon: "05348574181", tcKimlik: "10925362480", email: "eyluldayioglu@gmail.com", kiraBedeli: 10000, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "B", daireNo: "B-14B", oda: "Oda 1", ad: "Ecesu", soyad: "AÇIKGÖZ", telefon: "05014772139", tcKimlik: "47824516164", email: "ece7217@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "B", daireNo: "B-14B", oda: "Oda 2", ad: "Sermi̇l", soyad: "DOĞANAY", telefon: "05459503642", tcKimlik: "42445499438", email: "doganaysermilg@gmail.com", kiraBedeli: 10000, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "B", daireNo: "B-15A", oda: "Oda 1", ad: "Ayşenaz", soyad: "ÖZKURT", telefon: "05414782134", tcKimlik: "47674326920", email: "ozkurtaysenaz@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "B", daireNo: "B-15A", oda: "Oda 2", ad: "Fatma", soyad: "ERDOĞAN", telefon: "05079085684", tcKimlik: "46027381876", email: "fatma_700@outlook.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "B", daireNo: "B-15B", oda: "Oda 1", ad: "Leila", soyad: "MOUSSALLATI", telefon: "05536568191", tcKimlik: null, email: null, kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "B", daireNo: "B-15B", oda: "Oda 2", ad: "Sami̇ra", soyad: "BUDENOVA", telefon: "05411319927", tcKimlik: null, email: "samirabudenova@gmail.com", kiraBedeli: 10000, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "B", daireNo: "B-16A", oda: "Oda 1", ad: "Ni̇danur", soyad: "UZUNSELVİ", telefon: "05357490575", tcKimlik: "12241826332", email: "nidanuruzunselvi@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "B", daireNo: "B-16A", oda: "Oda 2", ad: "Hati̇ce Kübranur", soyad: "DİNÜ", telefon: "05434152027", tcKimlik: "13232426654", email: "kubrand2@gmail.com", kiraBedeli: 10000, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "B", daireNo: "B-16B", oda: "Oda 1", ad: "Rabi̇a", soyad: "BAĞ", telefon: "05451751880", tcKimlik: "16363007006", email: "rabiabag20@icloud.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "B", daireNo: "B-16B", oda: "Oda 2", ad: "Zeynep", soyad: "YAZICI", telefon: "05439522375", tcKimlik: "45469878708", email: "zeynepyzcyazici@gmail.com", kiraBedeli: 10000, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "B", daireNo: "B-17A", oda: "Oda 1", ad: "Yaren", soyad: "GÜLLÜ", telefon: "05356080240", tcKimlik: "36181095474", email: "yareng2002@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "B", daireNo: "B-17A", oda: "Oda 2", ad: "Eli̇f Esma", soyad: "TİMUR", telefon: "05071558829", tcKimlik: "36775690238", email: "elifestimur@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "B", daireNo: "B-17B", oda: "Oda 1", ad: "Azra Ecren", soyad: "AKKANAT", telefon: "05394840426", tcKimlik: "10595697226", email: "azraecrenakkanat@gmail.com", kiraBedeli: 11000, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "B", daireNo: "B-17B", oda: "Oda 2", ad: "Ayşe Büşra", soyad: "AKKAYA", telefon: "05358612016", tcKimlik: "18131299644", email: "busra.akkay@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "B", daireNo: "B-18A", oda: "Oda 1", ad: "Asli Di̇lay", soyad: "ORMAN", telefon: "05415125205", tcKimlik: "33067199288", email: "asliormnn@gmail.com", kiraBedeli: 10000, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "B", daireNo: "B-18A", oda: "Oda 2", ad: "Esma", soyad: "KOLAY", telefon: "05523045316", tcKimlik: "11218956812", email: "eesmakolay@gmail.com", kiraBedeli: 10000, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "B", daireNo: "B-18B", oda: "Oda 1", ad: "Ceren", soyad: "VURAL", telefon: "05414143571", tcKimlik: "52807544522", email: "cerenvural219@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "B", daireNo: "B-18B", oda: "Oda 2", ad: "Yaren", soyad: "KESİM", telefon: "05308654788", tcKimlik: "13149080444", email: "yarenkesim0708@gmail.com", kiraBedeli: 10000, baslangic: "2025-10-01", bitis: "2026-08-01" },
];

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-import-secret");
  if (secret !== SECRET) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const results = { ogrenci: 0, sozlesme: 0, atlandı: 0, hatalar: [] as string[] };

  // Konut haritası: daireNo → konut
  const konutlar = await prisma.konut.findMany({ where: { etap: 2 }, select: { id: true, daireNo: true } });
  const konutMap = new Map(konutlar.map(k => [k.daireNo, k.id]));

  // SozlesmeNo sayacı: daireNo → index
  const sozSeq = new Map<string, number>();

  for (const row of KIRACLAR) {
    const konutId = konutMap.get(row.daireNo);
    if (!konutId) {
      results.hatalar.push(`Daire bulunamadı: ${row.daireNo}`);
      continue;
    }

    try {
      // Ogrenci upsert
      let ogrenci;
      if (row.tcKimlik) {
        ogrenci = await prisma.ogrenci.upsert({
          where: { tcKimlik: row.tcKimlik },
          create: { ad: row.ad, soyad: row.soyad, tcKimlik: row.tcKimlik, telefon: row.telefon, email: row.email },
          update: { ad: row.ad, soyad: row.soyad, telefon: row.telefon, ...(row.email ? { email: row.email } : {}) },
        });
      } else if (row.email) {
        ogrenci = await prisma.ogrenci.upsert({
          where: { email: row.email },
          create: { ad: row.ad, soyad: row.soyad, telefon: row.telefon, email: row.email },
          update: { ad: row.ad, soyad: row.soyad, telefon: row.telefon },
        });
      } else {
        ogrenci = await prisma.ogrenci.create({
          data: { ad: row.ad, soyad: row.soyad, telefon: row.telefon },
        });
      }
      results.ogrenci++;

      // Sozlesme oluştur (her kiracı ayrı)
      if (row.kiraBedeli > 0 && row.baslangic && row.bitis) {
        const seq = (sozSeq.get(row.daireNo) ?? 0) + 1;
        sozSeq.set(row.daireNo, seq);
        const daireKey = row.daireNo.replace(/[^A-Z0-9]/gi, '');
        const sozNo = `ET2-${daireKey}-${seq}`;

        const mevcut = await prisma.sozlesme.findUnique({ where: { sozlesmeNo: sozNo } });
        if (!mevcut) {
          await prisma.sozlesme.create({
            data: {
              sozlesmeNo: sozNo,
              konutId,
              ogrenciId: ogrenci.id,
              baslangicTarihi: new Date(row.baslangic),
              bitisTarihi: new Date(row.bitis),
              aylikKira: row.kiraBedeli,
              depozito: row.kiraBedeli,
              durum: "Aktif",
              oda: row.oda,
              kisiSayisi: 1,
            },
          });
          results.sozlesme++;
        } else {
          results.atlandı++;
        }
      }
    } catch (e: unknown) {
      results.hatalar.push(`${row.daireNo} - ${row.ad} ${row.soyad}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  // Kiracısı olan daireleri "Dolu" yap
  const doluDaireNolar = [...new Set(KIRACLAR.map(r => r.daireNo))];
  await prisma.konut.updateMany({
    where: { daireNo: { in: doluDaireNolar } },
    data: { durum: "Dolu" },
  });

  return NextResponse.json({ ok: true, ...results, doluDaire: doluDaireNolar.length });
}
