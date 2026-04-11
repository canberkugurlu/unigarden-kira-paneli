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
  { blok: "A1", daireNo: "A1-1A", oda: "Banyo Yan\u0131", ad: "Melek Naz", soyad: "ERG\u00dcL", telefon: "05308767057", tcKimlik: "10700989116", email: "meleknazergul1905@gmail.com", kiraBedeli: 11000, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "A1", daireNo: "A1-1A", oda: "Salon Yan\u0131", ad: "Sude", soyad: "KARAKOLCU", telefon: "05413156708", tcKimlik: "10534978096", email: "syydekarakolcu@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "A1", daireNo: "A1-1B", oda: "Banyo Yan\u0131", ad: "Cemre", soyad: "BILALO\u011eLU", telefon: "05314870761", tcKimlik: "11915909296", email: "bilaloglucemre347@gmail.com", kiraBedeli: 11000, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "A1", daireNo: "A1-1B", oda: "Salon Yan\u0131", ad: "Ela", soyad: "\u015eENG\u00dcLEN\u00dc", telefon: "05541991118", tcKimlik: "10477900086", email: "sengulencela@gmail.com", kiraBedeli: 11000, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "A1", daireNo: "A1-2A", oda: "Banyo Yan\u0131", ad: "Si\u0307mge", soyad: "S\u00dcNNET\u00dc\u0130", telefon: "05396780088", tcKimlik: "31900132492", email: "nesi864@gmail.com", kiraBedeli: 16500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "A1", daireNo: "A1-2B", oda: "Banyo Yan\u0131", ad: "\u015eevval", soyad: "TELL\u0130O\u011eLU", telefon: "05446100752", tcKimlik: "10424642632", email: "tellioglusevval2@gmaiil.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "A1", daireNo: "A1-2B", oda: "Salon Yan\u0131", ad: "Ni\u0307lay", soyad: "SOYT\u00dcRK", telefon: "05466312212", tcKimlik: "10064654354", email: null, kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "A1", daireNo: "A1-1C", oda: "Salon Yan\u0131", ad: "Ya\u011fmur", soyad: "BA\u015eER", telefon: "05465431511", tcKimlik: "10988961170", email: "ybaser994@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "A1", daireNo: "A1-1C", oda: "Banyo Yan\u0131", ad: "Y\u00fcsra", soyad: "AYDIN", telefon: "05454516083", tcKimlik: "10135965112", email: "yusraaydn26@gmail.com", kiraBedeli: 10000, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "A1", daireNo: "A1-1D", oda: "Banyo Yan\u0131", ad: "Esma Zehra", soyad: "KUZEY", telefon: "05447132622", tcKimlik: "12497488384", email: "zhrakuzey@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "A1", daireNo: "A1-1D", oda: "Salon Yan\u0131", ad: "Merve", soyad: "KARA\u00c7AY", telefon: "05370362797", tcKimlik: "24350092768", email: "merve.karacay@icloud.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "A1", daireNo: "A1-2C", oda: "Salon Yan\u0131", ad: "\u015eule", soyad: "YILMAZ", telefon: "05342641172", tcKimlik: "53710747970", email: "suleylmaz145@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "A1", daireNo: "A1-2C", oda: "Banyo Yan\u0131", ad: "Di\u0307lara", soyad: "TUN\u00c7", telefon: "05433717405", tcKimlik: "33595776296", email: "dilaratnc18@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "A1", daireNo: "A1-2D", oda: "Banyo Yan\u0131", ad: "Duru", soyad: "D\u0130RANCI", telefon: "05386438334", tcKimlik: "25426475454", email: "durudiranci@icloud.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "A1", daireNo: "A1-2D", oda: "Salon Yan\u0131", ad: "Selen", soyad: "RAV\u0130KALI", telefon: "05531694500", tcKimlik: "15044632612", email: "ravikaliselen@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "A1", daireNo: "A1-3A", oda: "Salon Yan\u0131", ad: "Ecenaz", soyad: "G\u00dcVEN", telefon: "05349343541", tcKimlik: "52918281422", email: "ecenzim@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "A1", daireNo: "A1-3A", oda: "Banyo Yan\u0131", ad: "Merve", soyad: "AYDIN", telefon: "05437350970", tcKimlik: "44029577716", email: "merveaydnn0@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "A1", daireNo: "A1-3B", oda: "Salon Yan\u0131", ad: "Meli\u0307ke", soyad: "KALABALIK", telefon: "05385042539", tcKimlik: null, email: null, kiraBedeli: 0, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "A1", daireNo: "A1-3B", oda: "Banyo Yan\u0131", ad: "\u00d6znur", soyad: "METE", telefon: "05061482190", tcKimlik: "11314924296", email: "oznur271202@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "A1", daireNo: "A1-4A", oda: "Banyo Yan\u0131", ad: "Ravza", soyad: "VATANSEVER", telefon: "05426062003", tcKimlik: "30904297756", email: "vatanseverravza@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "A1", daireNo: "A1-4A", oda: "Salon Yan\u0131", ad: "Asli Sena", soyad: "KAYIK\u00c7I", telefon: "05524430301", tcKimlik: "16616845614", email: "aslsenakayikci@gmail.com", kiraBedeli: 10000, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "A1", daireNo: "A1-4B", oda: "Salon Yan\u0131", ad: "Z\u00fchrenur", soyad: "KESK\u0130N", telefon: "05306357415", tcKimlik: "11357770720", email: "zuhrekeskin8@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "A1", daireNo: "A1-4B", oda: "Banyo Yan\u0131", ad: "Hati\u0307ce", soyad: "AYDIN", telefon: "05522275254", tcKimlik: "10081956134", email: null, kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "A1", daireNo: "A1-5A", oda: "Salon Yan\u0131", ad: "K\u00fcbra", soyad: "GELEGEN", telefon: "05315533168", tcKimlik: "29938734016", email: "kubragelegen11@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "A1", daireNo: "A1-5A", oda: "Banyo Yan\u0131", ad: "Zeynep", soyad: "BEBEK", telefon: "05078328828", tcKimlik: "20542628784", email: "zeynoss62@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "A1", daireNo: "A1-5B", oda: "Banyo Yan\u0131", ad: "Beri\u0307l", soyad: "AKKA\u015e", telefon: "05382998023", tcKimlik: "10034112068", email: "berilefe2018@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "A1", daireNo: "A1-5B", oda: "Salon Yan\u0131", ad: "Zeynep Serra", soyad: "KOCAG\u00d6Z", telefon: "05308665794", tcKimlik: "33470208232", email: "zynpserra@outlook.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "A1", daireNo: "A1-6A", oda: "Banyo Yan\u0131", ad: "\u0130rem", soyad: "OKTAY", telefon: "05418055299", tcKimlik: "29812208046", email: "iremoktay1306@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "A1", daireNo: "A1-6A", oda: "Salon Yan\u0131", ad: "Ay\u015fe", soyad: "TAY", telefon: "05318732751", tcKimlik: "10411458970", email: "tayayse959@gmail.com", kiraBedeli: 10000, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "A1", daireNo: "A1-6B", oda: null, ad: "Bal\u00fci\u0307\u00e7ek", soyad: "G\u00d6ZALAN", telefon: "05316365661", tcKimlik: "10113044778", email: "balcicekgozalan@gmail.com", kiraBedeli: 19000, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "A2", daireNo: "A2-1A", oda: "Banyo Yan\u0131", ad: "Yasemi\u0307n", soyad: "YILMAZ", telefon: "05454122636", tcKimlik: "11674849628", email: "yasemiiny14@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "A2", daireNo: "A2-1A", oda: "Salon Yan\u0131", ad: "Ebrar", soyad: "MADEN", telefon: "05050520102", tcKimlik: "21641575450", email: "madenebrar@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "A2", daireNo: "A2-1B", oda: "Salon Yan\u0131", ad: "Senag\u00fcl", soyad: "GEN\u00c7", telefon: "05333171602", tcKimlik: "27160991948", email: "senagulgenc23@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "A2", daireNo: "A2-1B", oda: "Banyo Yan\u0131", ad: "\u015eeyma", soyad: "BATMAZ", telefon: "05387306524", tcKimlik: "24751999680", email: "seymaabatmaz@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "A2", daireNo: "A2-2A", oda: "Banyo Yan\u0131", ad: "Nevanur", soyad: "KOLAY", telefon: "05309491091", tcKimlik: "53311327342", email: "nevanur123@gmail.com", kiraBedeli: 16500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "A2", daireNo: "A2-2B", oda: "Salon Yan\u0131", ad: "G\u00f6k\u00e7e", soyad: "AKY\u00dcZ", telefon: "05417273959", tcKimlik: "55978165848", email: "gokceakyz951@gmail.com", kiraBedeli: 12000, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "A2", daireNo: "A2-2B", oda: "Banyo Yan\u0131", ad: "Zeynep", soyad: "\u00d6ZHAN", telefon: "05516397991", tcKimlik: null, email: "zeynepozhan111@gmail.com", kiraBedeli: 11000, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "A2", daireNo: "A2-1C", oda: "Banyo Yan\u0131", ad: "Ayli\u0307n", soyad: "AL\u0130ZADE", telefon: "05461992205", tcKimlik: null, email: "aysunaylin2006@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "A2", daireNo: "A2-1C", oda: "Salon Yan\u0131", ad: "Asli", soyad: "BULUT", telefon: "05516511613", tcKimlik: "31903752628", email: "aslibulut271@gmail.com", kiraBedeli: 10000, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "A2", daireNo: "A2-1D", oda: "Salon Yan\u0131", ad: "Sevde", soyad: "EL\u0130BAL", telefon: "05011740307", tcKimlik: "11839634960", email: "eliblsevde@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "A2", daireNo: "A2-1D", oda: "Salon Yan\u0131", ad: "\u00dcz\u00fcm Naz", soyad: "G\u00d6K\u00c7EO\u011eLU", telefon: "05527364846", tcKimlik: "10538318492", email: "senelgulsah84@gmail.com", kiraBedeli: 10000, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "A2", daireNo: "A2-2C", oda: "Banyo Yan\u0131", ad: "\u00c7a\u011fla", soyad: "KILI\u00c7", telefon: "05051020822", tcKimlik: "30386013868", email: "maisybourret@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "A2", daireNo: "A2-2C", oda: "Salon Yan\u0131", ad: "\u015euranur", soyad: "DER\u0130N", telefon: "05418664505", tcKimlik: "28676505100", email: "derinsuranur@gmail.com", kiraBedeli: 10000, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "A2", daireNo: "A2-2D", oda: "Salon Yan\u0131", ad: "Derya", soyad: "\u00dcNAL", telefon: "05386403142", tcKimlik: "10067476618", email: "unldrya@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "A2", daireNo: "A2-2D", oda: "Banyo Yan\u0131", ad: "Ay\u015fe Beg\u00fcmsu", soyad: "YAZICILAR", telefon: "05464917008", tcKimlik: "38779757306", email: "suyazclar@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "A2", daireNo: "A2-3A", oda: "Banyo Yan\u0131", ad: "\u00c7a\u011fla", soyad: "KABAL", telefon: "05312333789", tcKimlik: "29078076144", email: "cagla.kabal@icloud.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "A2", daireNo: "A2-3A", oda: "Salon Yan\u0131", ad: "Ilgin", soyad: "\u015eENSES", telefon: "05414689905", tcKimlik: "10121632950", email: "ilginsnss@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "A2", daireNo: "A2-3B", oda: "Salon Yan\u0131", ad: "Sila", soyad: "G\u00d6KBURUN", telefon: "05346930803", tcKimlik: "43084128628", email: "silagkbrnn@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "A2", daireNo: "A2-3B", oda: "Banyo Yan\u0131", ad: "\u0130rem Naz", soyad: "KARABA\u011e", telefon: "05428125436", tcKimlik: "59263069910", email: "irimnazz@gmail.com", kiraBedeli: 10000, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "A2", daireNo: "A2-4A", oda: "Salon Yan\u0131", ad: "Zehra", soyad: "AYTEK\u0130N", telefon: "05331510864", tcKimlik: "19580393020", email: "zehra.aytekin@icloud.com", kiraBedeli: 10000, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "A2", daireNo: "A2-4A", oda: "Banyo Yan\u0131", ad: "Ceren", soyad: "\u00d6ZAYDIN", telefon: "05616188358", tcKimlik: "41591077330", email: "cerenozaydin45@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "A2", daireNo: "A2-4B", oda: "Salon Yan\u0131", ad: "Ceren", soyad: "ORTAH\u0130SAR", telefon: "05541875561", tcKimlik: "10232983200", email: "ortahisarceren@gmail.com", kiraBedeli: 10000, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "A2", daireNo: "A2-4B", oda: "Banyo Yan\u0131", ad: "Buse", soyad: "\u015eEN", telefon: "05350205929", tcKimlik: "31903337986", email: "busesen215@gmail.com", kiraBedeli: 10000, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "A2", daireNo: "A2-5A", oda: "Salon Yan\u0131", ad: "Hi\u0307lal", soyad: "DUMAN", telefon: "05324967164", tcKimlik: "11092959152", email: "dmn.hilal2005@gmail.com", kiraBedeli: 11000, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "A2", daireNo: "A2-5A", oda: "Banyo Yan\u0131", ad: "Zeynepnaz", soyad: "\u015eENYUVA", telefon: "05444431308", tcKimlik: "11129520652", email: "zeynepnazsenyuva24@gmail.com", kiraBedeli: 11000, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "A2", daireNo: "A2-5B", oda: "Banyo Yan\u0131", ad: "Tu\u011fba Nur", soyad: "BAY", telefon: "05312837526", tcKimlik: "35488120988", email: "tuggba.bay@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "A2", daireNo: "A2-5B", oda: "Salon Yan\u0131", ad: "Ni\u0307sa Nur", soyad: "G\u00dcREL", telefon: "05413946147", tcKimlik: "31102631052", email: "nisanur.gurel28@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "A2", daireNo: "A2-6A", oda: "Salon Yan\u0131", ad: "Ayli\u0307n", soyad: "GOZELOVA", telefon: "05345403221", tcKimlik: "99801771226", email: "aylingezaloca@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "A2", daireNo: "A2-6A", oda: "Banyo Yan\u0131", ad: "\u0130nci\u0307su", soyad: "KESK\u0130N", telefon: "05368180545", tcKimlik: "24793159684", email: "incisu258@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "A2", daireNo: "A2-6B", oda: "Salon Yan\u0131", ad: "Eli\u0307f Meri\u0307\u00fc", soyad: "KAYNAR", telefon: "05063535006", tcKimlik: "10178771732", email: "merickaynar049@gmail.com", kiraBedeli: 10000, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "A2", daireNo: "A2-6B", oda: "Banyo Yan\u0131", ad: "Su Eda", soyad: "AKBUGAN", telefon: "05537041603", tcKimlik: "36502548788", email: "suedaakbugan@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "A3", daireNo: "A3-1A", oda: "Banyo Yan\u0131", ad: "Aybi\u0307ke", soyad: "DO\u011eAN", telefon: "05529330137", tcKimlik: "13387305224", email: "aybikedogan.01@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "A3", daireNo: "A3-1A", oda: "Banyo Yan\u0131", ad: "Buse Nur", soyad: "BAKIR", telefon: "05466918083", tcKimlik: "17096335756", email: "buse.bakr7@gmail.com", kiraBedeli: 9000, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "A3", daireNo: "A3-1B", oda: "Banyo Yan\u0131", ad: "Zeynep", soyad: "BAYRAKTAR", telefon: "05448625013", tcKimlik: "25328704102", email: "zynpbyrktr3464@gmail.com", kiraBedeli: 9500, baslangic: "2025-12-15", bitis: "2026-08-01" },
  { blok: "A3", daireNo: "A3-1B", oda: "Salon Yan\u0131", ad: "Meli\u0307na", soyad: "GHOL\u0130POUR", telefon: "05303440056", tcKimlik: "98230208204", email: "gholipormelina@gmail.com", kiraBedeli: 10000, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "A3", daireNo: "A3-2A", oda: "Banyo Yan\u0131", ad: "Ay\u015fe Di\u0307lara", soyad: "ASLAN", telefon: "05303440056", tcKimlik: "14294947606", email: "aslansalih7156@hotmail.com", kiraBedeli: 16000, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "A3", daireNo: "A3-2B", oda: "Salon Yan\u0131", ad: "Zehra", soyad: "\u00d6ZYER", telefon: "05415085470", tcKimlik: "10854123374", email: "f.zehraozyer@gmail.com", kiraBedeli: 10000, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "A3", daireNo: "A3-2B", oda: "Banyo Yan\u0131", ad: "Nurcan", soyad: "ERTEK\u0130N", telefon: "05530987724", tcKimlik: "19676892468", email: "nurcan.ertekin@ogr.sakarya.edu.tr", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "A3", daireNo: "A3-1C", oda: "Banyo Yan\u0131", ad: "Tu\u011fba", soyad: "DEM\u0130ROK", telefon: "05061605235", tcKimlik: "37108807330", email: "tdemrok@gmail.com", kiraBedeli: 10000, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "A3", daireNo: "A3-1C", oda: "Banyo Yan\u0131", ad: "Erva Aycan", soyad: "KARSLI", telefon: "05345475025", tcKimlik: "57103150316", email: "erva.karsli@icloud.com", kiraBedeli: 10000, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "A3", daireNo: "A3-1D", oda: "Banyo Yan\u0131", ad: "\u015e\u00fckran", soyad: "KIZILCA", telefon: "05541645759", tcKimlik: "10616830038", email: "sukrankzlc@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "A3", daireNo: "A3-1D", oda: "Banyo Yan\u0131", ad: "\u00dcmm\u00fchan", soyad: "TIRMIKCI", telefon: "05436555759", tcKimlik: "13898720738", email: "ummuhantirmikci93@gmail.com", kiraBedeli: 10000, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "A3", daireNo: "A3-2C", oda: "Salon Yan\u0131", ad: "Aleyna", soyad: "ERSARI", telefon: "05359283107", tcKimlik: "13889436686", email: "aleynaersari498@gmail.com", kiraBedeli: 10000, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "A3", daireNo: "A3-2C", oda: "Banyo Yan\u0131", ad: "Eli\u0307f Su", soyad: "BOZDU\u011eAN", telefon: "05550963940", tcKimlik: "20021378766", email: "elif.bozdugan448@gmail.com", kiraBedeli: 10000, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "A3", daireNo: "A3-2D", oda: "Banyo Yan\u0131", ad: "Ceyda Nur", soyad: "\u00d6Z\u00dcAM", telefon: "05344564596", tcKimlik: "10150979798", email: "cey.cey16@hotmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "A3", daireNo: "A3-2D", oda: "Salon Yan\u0131", ad: "Ay\u015fe Nur", soyad: "G\u00dcK", telefon: "05528827932", tcKimlik: "10303439070", email: "sureyyagok2@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "A3", daireNo: "A3-3A", oda: "Salon Yan\u0131", ad: "G\u00fcl", soyad: "DE\u011eERL\u0130", telefon: "05384367058", tcKimlik: "15101542526", email: "guleyluldegerli@gmail.com", kiraBedeli: 10000, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "A3", daireNo: "A3-3A", oda: "Banyo Yan\u0131", ad: "Meli\u0307sa", soyad: "AKAYDIN", telefon: "05359617725", tcKimlik: "11453194086", email: "akaydinnmelisa04@gmail.com", kiraBedeli: 10000, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "A3", daireNo: "A3-3B", oda: "Banyo Yan\u0131", ad: "Hayr\u00fcnni\u0307sa", soyad: "AYHAN", telefon: "05050060224", tcKimlik: "37429053812", email: "nisaayhannn@gmail.com", kiraBedeli: 10000, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "A3", daireNo: "A3-3B", oda: "Salon Yan\u0131", ad: "Burcu", soyad: "KOCA", telefon: "05385272509", tcKimlik: "27482253014", email: "burcukoca4141.bkb@gmail.com", kiraBedeli: 10000, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "A3", daireNo: "A3-4A", oda: "Salon Yan\u0131", ad: "Ceren Ece", soyad: "\u00d6ZT\u00dcRK", telefon: "05071226191", tcKimlik: "10229710192", email: "cereneceoztrk@icloud.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "A3", daireNo: "A3-4A", oda: "Banyo Yan\u0131", ad: "Sena", soyad: "CEFA", telefon: "05307126687", tcKimlik: "10198859912", email: "senacefa650@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "A3", daireNo: "A3-4B", oda: "Salon Yan\u0131", ad: "Ebru", soyad: "ERG\u00dcN", telefon: "05339276446", tcKimlik: "25805287456", email: "ergunebru904@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "A3", daireNo: "A3-4B", oda: "Banyo Yan\u0131", ad: "Alanur", soyad: "OK", telefon: "05413360916", tcKimlik: "13841435986", email: "alanurervaok@icloud.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "A3", daireNo: "A3-5A", oda: "Salon Yan\u0131", ad: "Di\u0307lanur", soyad: "KIZMAZ", telefon: "05426051054", tcKimlik: "52213564312", email: "dilanurkizmaz@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "A3", daireNo: "A3-5A", oda: "Salon Yan\u0131", ad: "Ni\u0307sanur", soyad: "\u0130NEG\u00dcL", telefon: "05546880846", tcKimlik: "46183185400", email: "nisanurinegol@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "A3", daireNo: "A3-5B", oda: "Banyo Yan\u0131", ad: "Beyza", soyad: "FIRAT", telefon: "05305002657", tcKimlik: "31297853918", email: "beyza.firat3@ogr.sakarya.edu.tr", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "A3", daireNo: "A3-5B", oda: null, ad: "G\u00f6k\u00e7e", soyad: "KAYALAK", telefon: "05416179094", tcKimlik: null, email: null, kiraBedeli: 0, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "A3", daireNo: "A3-6A", oda: "Banyo Yan\u0131", ad: "\u015eevval", soyad: "TOROMAN", telefon: "05356932163", tcKimlik: "33043780042", email: "sevvaltoroman05@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "A3", daireNo: "A3-6A", oda: "Salon Yan\u0131", ad: "Cerensu", soyad: "\u00c7A\u011eUN", telefon: "05385297863", tcKimlik: "12447100830", email: "caguncenersu@gmail.com", kiraBedeli: 10000, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "A3", daireNo: "A3-6B", oda: "Banyo Yan\u0131", ad: "\u0130layda", soyad: "EKE", telefon: "05053688919", tcKimlik: "13418598144", email: "ekeilayda6@gmail.com", kiraBedeli: 11000, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { blok: "A3", daireNo: "A3-6B", oda: "Banyo Yan\u0131", ad: "B\u00fc\u015fra", soyad: "ERDO\u011eAN", telefon: "05544144451", tcKimlik: "15980445680", email: "busraerdogan1400@gmail.com", kiraBedeli: 11000, baslangic: "2025-09-15", bitis: "2026-08-01" },
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
