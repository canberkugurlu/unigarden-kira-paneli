import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const SECRET = process.env.IMPORT_SECRET ?? "etap3-import-2025";

type Row = {
  daireNo: string; oda: string | null;
  ad: string; soyad: string; telefon: string;
  tcKimlik: string | null; email: string | null;
  kiraBedeli: number; baslangic: string | null; bitis: string | null;
};

const KIRACLAR: Row[] = [
  { daireNo: "C-1A", oda: "Oda 1", ad: "Talap", soyad: "Ai̇kuni̇m", telefon: "05513525402", tcKimlik: null, email: "aykunim.talap@gmail.ru", kiraBedeli: 15000, baslangic: "2025-12-17", bitis: "2026-07-17" },
  { daireNo: "C-1B", oda: "Oda 1", ad: "Esmanur", soyad: "Yildirim", telefon: "05526372082", tcKimlik: "11516849410", email: "yesmanur58@gmail.com", kiraBedeli: 10000, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "C-1B", oda: "Oda 2", ad: "Sudem", soyad: "Şen", telefon: "05455283476", tcKimlik: "13109423700", email: "sudemsen6@gmail.com", kiraBedeli: 10000, baslangic: "2025-10-01", bitis: "2026-08-01" },
  { daireNo: "C-2A", oda: "Oda 1", ad: "Gülşah", soyad: "Karagöz", telefon: "05365431567", tcKimlik: "15077680666", email: "glshkrgzg17@gmail.com", kiraBedeli: 10000, baslangic: "2025-12-15", bitis: "2026-08-01" },
  { daireNo: "C-2A", oda: "Oda 2", ad: "Süheda", soyad: "Aslan", telefon: "05378322836", tcKimlik: "12499911590", email: "suhedaaslan1905@gmail.com", kiraBedeli: 10000, baslangic: "2025-12-15", bitis: "2026-08-01" },
  { daireNo: "C-3A", oda: "Oda 1", ad: "Hi̇ranur", soyad: "Eren", telefon: "05538519281", tcKimlik: "10953099938", email: "hiranurerenn61@gmail.com", kiraBedeli: 10000, baslangic: "2026-01-01", bitis: "2026-08-01" },
  { daireNo: "C-3A", oda: "Oda 2", ad: "Sudenas", soyad: "Avci", telefon: "05467350133", tcKimlik: "12647258622", email: "sudenasavci58@gmail.com", kiraBedeli: 10000, baslangic: "2026-01-01", bitis: "2026-08-01" },
  { daireNo: "C-4A", oda: "Oda 1", ad: "Lamar", soyad: "Al-Quraan", telefon: "02594640051", tcKimlik: null, email: "lamar15112007@gmail.com", kiraBedeli: 10000, baslangic: "2025-11-15", bitis: "2026-08-01" },
  { daireNo: "C-4A", oda: "Oda 2", ad: "Eli̇f Ecren", soyad: "Sevi̇ndi̇k", telefon: "05313413454", tcKimlik: "10796531800", email: "eecrenns@gmail.com", kiraBedeli: 10000, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "C-4B", oda: "Oda 1", ad: "Rana Betül", soyad: "Şaştim", telefon: "05464388205", tcKimlik: "10253176230", email: "ranabetul044@gmail.com", kiraBedeli: 10000, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "C-4B", oda: "Oda 2", ad: "Fatma", soyad: "Bi̇li̇z", telefon: "05426697970", tcKimlik: "18008816608", email: "alacag698@gmail.com", kiraBedeli: 10000, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "C-5A", oda: "Oda 1", ad: "Rezan", soyad: "Mazi̇", telefon: "05518455140", tcKimlik: null, email: "ami558119@gmail.com", kiraBedeli: 10000, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "C-5A", oda: "Oda 2", ad: "Seher", soyad: "Şenol", telefon: "05521567339", tcKimlik: "32305237218", email: "sehersenol54@icloud.com", kiraBedeli: 10000, baslangic: "2025-10-01", bitis: "2026-08-01" },
  { daireNo: "C-5B", oda: "Oda 1", ad: "Razi̇ye", soyad: "Güven", telefon: "05079022996", tcKimlik: "10526256164", email: "graziye005@gmail.com", kiraBedeli: 10000, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "C-5B", oda: "Oda 2", ad: "Edanur", soyad: "Aslan", telefon: "05510996218", tcKimlik: "10935105824", email: "edanuraslan680@gmail.com", kiraBedeli: 10000, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "C-6A", oda: "Oda 1", ad: "Mi̇lana", soyad: "Gasanova", telefon: "05058455423", tcKimlik: null, email: "gasanovamilana106@gmail.com", kiraBedeli: 10000, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "C-6A", oda: "Oda 2", ad: "Aynaz", soyad: "Khodaei", telefon: "05010668203", tcKimlik: null, email: "maragheh2023@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "C-6B", oda: "Oda 1", ad: "Mohlaroyim", soyad: "Payzimatova", telefon: "05366253012", tcKimlik: null, email: "akbarovemir901@gmail.com", kiraBedeli: 7500, baslangic: "2025-12-15", bitis: "2026-08-01" },
  { daireNo: "C-6B", oda: "Oda 2", ad: "Mora Elvi̇na Mari̇e", soyad: "Helena", telefon: "05374854986", tcKimlik: null, email: "vinae0423@gmail.com", kiraBedeli: 7500, baslangic: "2025-12-15", bitis: "2026-08-01" },
  { daireNo: "C-1D", oda: "Oda 1", ad: "Ayşe Beyza", soyad: "Korman", telefon: "05525258310", tcKimlik: "16343369230", email: "aysekormann@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "C-1D", oda: "Oda 2", ad: "Yaren Eli̇i̇f", soyad: "Demi̇r", telefon: "05531466361", tcKimlik: "12053642632", email: "yarennelifdemir@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "C-2C", oda: "Oda 1", ad: "Şura Meryem", soyad: "Uyar", telefon: "05510159116", tcKimlik: "33877916150", email: "uyarsura0@gmail.com", kiraBedeli: 10000, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "C-2C", oda: "Oda 2", ad: "Bahar", soyad: "Şavk", telefon: "05312702900", tcKimlik: "33697790756", email: "bahar.savk34@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "C-2D", oda: "Oda 1", ad: "Tuana", soyad: "Mandan", telefon: "05539175961", tcKimlik: "11167678568", email: "tuanamandan@gmail.com", kiraBedeli: 10000, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "C-2D", oda: "Oda 2", ad: "Sudenaz", soyad: "Özyün", telefon: "05421874037", tcKimlik: "10319700348", email: "sudenazozyun@icloud.com", kiraBedeli: 10000, baslangic: "2025-11-01", bitis: "2026-08-01" },
  { daireNo: "C-3C", oda: "Oda 1", ad: "Nazar Sultan", soyad: "Kanbay", telefon: "05445278639", tcKimlik: "56029029126", email: "sultankanbay13@gmail.com", kiraBedeli: 8500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "C-3C", oda: "Oda 2", ad: "Ni̇sanur", soyad: "Teki̇n", telefon: "05419751612", tcKimlik: "16858510936", email: "nisanurtekin88@gmail.com", kiraBedeli: 10000, baslangic: "2025-10-01", bitis: "2026-08-01" },
  { daireNo: "C-3D", oda: "Oda 1", ad: "Sudenaz", soyad: "Yüksektepe", telefon: "05374979157", tcKimlik: "11945502894", email: "1suuddey@gmail.com", kiraBedeli: 10000, baslangic: "2025-10-01", bitis: "2026-08-01" },
  { daireNo: "C-3D", oda: "Oda 2", ad: "Tuna", soyad: "Şahi̇n", telefon: "05412851490", tcKimlik: "10763217096", email: "tunaasahnn@gmail.com", kiraBedeli: 10000, baslangic: "2026-02-01", bitis: "2026-08-01" },
  { daireNo: "C-4C", oda: "Oda 1", ad: "Reyhan", soyad: "Yücesan", telefon: "05510517335", tcKimlik: "11326630574", email: "reyhan07yucesan@gmail.com", kiraBedeli: 10000, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "C-4C", oda: "Oda 2", ad: "Eli̇f Ece", soyad: "Kisa", telefon: "05550477414", tcKimlik: "11852505568", email: "elifecekisa@gmail.com", kiraBedeli: 10000, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "C-4D", oda: "Oda 1", ad: "Angeli̇na", soyad: "Chernykh", telefon: "05050945409", tcKimlik: null, email: null, kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "C-4D", oda: "Oda 2", ad: "Kami̇le Gökçi̇n", soyad: "Susan", telefon: "05075371601", tcKimlik: "22991082520", email: "kamilegokcinsusan@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "C-5C", oda: "Oda 1", ad: "Zeynep", soyad: "Bulut", telefon: "05342465258", tcKimlik: "10316557266", email: "zeyneppbulut58@gmail.com", kiraBedeli: 10000, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "C-5C", oda: "Oda 2", ad: "Di̇lay Gülrü", soyad: "Özak", telefon: "05452338408", tcKimlik: "13466604774", email: "gulruzak1@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "C-5D", oda: "Oda 1", ad: "Zeynep Ceyli̇n", soyad: "Karaduman", telefon: "05445071708", tcKimlik: "10591793588", email: "zeynepceylin1@icloud.com", kiraBedeli: 10000, baslangic: "2025-10-01", bitis: "2026-08-01" },
  { daireNo: "C-5D", oda: "Oda 2", ad: "Guli̇ni̇so", soyad: "Ochi̇lova", telefon: "05528535407", tcKimlik: null, email: "nissa.o0707@gmail.com", kiraBedeli: 9500, baslangic: "2025-10-01", bitis: "2026-08-01" },
  { daireNo: "C-6C", oda: "Oda 1", ad: "Alara Aslihan", soyad: "Güldür", telefon: "05357435248", tcKimlik: "54076094364", email: "alaraaslihan@gmail.com", kiraBedeli: 10000, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "C-6C", oda: "Oda 2", ad: "Ecem", soyad: "Türkeli̇", telefon: "05396600625", tcKimlik: "10411181120", email: "ecemtrkl03@gmail.com", kiraBedeli: 10000, baslangic: "2025-10-01", bitis: "2026-08-01" },
  { daireNo: "C-6D", oda: "Oda 1", ad: "Nazlican", soyad: "Ünsal", telefon: "05061510950", tcKimlik: "34399648376", email: "nazlicanunsall@gmail.com", kiraBedeli: 8000, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "C-6D", oda: "Oda 2", ad: "Zeynep Hande", soyad: "Çolak", telefon: "05439605528", tcKimlik: "20138652568", email: "zeynephancecolak2002@gmail.com", kiraBedeli: 8000, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "C-7A", oda: "Oda 1", ad: "Betül", soyad: "Erem", telefon: "05303079450", tcKimlik: "27974112980", email: "betulerem788@gmail.com", kiraBedeli: 10000, baslangic: "2025-10-01", bitis: "2026-08-01" },
  { daireNo: "C-7A", oda: "Oda 2", ad: "Merve", soyad: "Gürcan", telefon: "05353703880", tcKimlik: "21955873594", email: "mervegurcan2626@gmail.com", kiraBedeli: 10000, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "C-7B", oda: "Oda 1", ad: "Muleyke Berra", soyad: "Balki", telefon: "05010897318", tcKimlik: "46531575242", email: "muleykebalki@gmail.com", kiraBedeli: 10000, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "C-7B", oda: "Oda 2", ad: "Hi̇lal Nur", soyad: "Batursoy", telefon: "05511239788", tcKimlik: "28042378802", email: "hilalnurbatursoy@gmail.com", kiraBedeli: 10000, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "C-8A", oda: "Oda 1", ad: "İkra", soyad: "Türkmen", telefon: "05434879344", tcKimlik: "34129530186", email: "turkmenikra1@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "C-8A", oda: "Oda 2", ad: "İpek", soyad: "Karakoç", telefon: "05421198088", tcKimlik: "25717488866", email: "ipekkarakoc01@gmail.com", kiraBedeli: 9500, baslangic: "2025-07-01", bitis: "2026-08-01" },
  { daireNo: "C-8B", oda: "Oda 1", ad: "Nurgül", soyad: "Aydi̇n", telefon: "05333277093", tcKimlik: null, email: "sabira.kurbandieva@gmail.com", kiraBedeli: 9500, baslangic: "2025-11-15", bitis: "2026-08-01" },
  { daireNo: "C-8B", oda: "Oda 2", ad: "Ayli̇n", soyad: "Agbulak", telefon: "09096565343", tcKimlik: null, email: "aylinagbulak@gmailcom", kiraBedeli: 9500, baslangic: "2025-11-15", bitis: "2026-08-01" },
  { daireNo: "C-9A", oda: "Oda 1", ad: "İrem", soyad: "Güner", telefon: "05443839585", tcKimlik: "13144853302", email: "gnr.irem.4@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "C-9A", oda: "Oda 2", ad: "Azra", soyad: "Akça", telefon: "05383621414", tcKimlik: "29773209380", email: "azraakca11@icloud.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "C-9B", oda: "Oda 1", ad: "Meli̇sa", soyad: "Umul", telefon: "05348560603", tcKimlik: "12353449764", email: "melisaumll@gmail.com", kiraBedeli: 12000, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "C-9B", oda: "Oda 2", ad: "Sila", soyad: "Şi̇şman", telefon: "05526018282", tcKimlik: "12233719222", email: "sila94637@gmail.com", kiraBedeli: 10000, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "C-10A", oda: "Oda 1", ad: "Ayşe Ni̇hal", soyad: "Bi̇lgi̇n", telefon: "05541964124", tcKimlik: "17110972042", email: "nihalblgn@icloud.com", kiraBedeli: 9000, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "C-10A", oda: "Oda 2", ad: "Azra Ecem", soyad: "İki̇z", telefon: "05332779795", tcKimlik: "12959472920", email: "azraecemekiz@gmail.com", kiraBedeli: 9500, baslangic: "2025-10-01", bitis: "2026-08-01" },
  { daireNo: "C-10B", oda: "Oda 1", ad: "Tuba", soyad: "Uslu", telefon: "05421209420", tcKimlik: "18404291436", email: "uslutuba07@gmail.com", kiraBedeli: 10000, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "C-10B", oda: "Oda 2", ad: "Beyzanur", soyad: "Özdemi̇r", telefon: "05457857932", tcKimlik: "15821333398", email: "beyzanur1739@gmail.com", kiraBedeli: 10000, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "C-11A", oda: "Oda 1", ad: "Defne", soyad: "Yilmaz", telefon: "05050923216", tcKimlik: "20803084106", email: "01defneyilmaz@gmail.com", kiraBedeli: 10000, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "C-11A", oda: "Oda 2", ad: "Nazlican", soyad: "Alver", telefon: "05456672181", tcKimlik: "12842766488", email: "nazlicanalverr@gmail.com", kiraBedeli: 10000, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "C-11B", oda: "Oda 1", ad: "Şevval", soyad: "Oda", telefon: "05411748523", tcKimlik: "12389071304", email: "ssevaloda@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "C-11B", oda: "Oda 2", ad: "Ceyda", soyad: "Bakacak", telefon: "05373003669", tcKimlik: "19412267260", email: "ceydabk15@gmail.com", kiraBedeli: 10000, baslangic: "2025-10-01", bitis: "2026-08-01" },
  { daireNo: "C-12A", oda: "Oda 1", ad: "Betül", soyad: "Köylü", telefon: "05531452712", tcKimlik: "10463195762", email: "betulkyl834@gmail.com", kiraBedeli: 10000, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "C-12A", oda: "Oda 2", ad: "Fatmanur", soyad: "Aktepe", telefon: "05050128725", tcKimlik: "22226312842", email: "fatmanuraktepe64@gmail.com", kiraBedeli: 10000, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "C-12B", oda: "Oda 1", ad: "Zeynep", soyad: "Kavlak", telefon: "05531567479", tcKimlik: "10142015824", email: "zeynep.kvlk61@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "C-12B", oda: "Oda 2", ad: "Ezgi̇ Nur", soyad: "Bavra", telefon: "05061335928", tcKimlik: "18016052890", email: "ezgibavra@icloud.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "C-13A", oda: "Oda 1", ad: "Meli̇s", soyad: "Şenyüz", telefon: "05378789900", tcKimlik: "35143443972", email: "yusufsenyuz@hotmail.com", kiraBedeli: 10000, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "C-13A", oda: "Oda 2", ad: "Zeynep", soyad: "Aktürk", telefon: "05418320903", tcKimlik: "36763499478", email: "zeynepxakturk@icloud.com", kiraBedeli: 10000, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "C-13B", oda: "Oda 1", ad: "Fatma Sena", soyad: "Yildirim", telefon: "05443626926", tcKimlik: "40132266486", email: "senayildirim66@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "C-13B", oda: "Oda 2", ad: "Eda", soyad: "Toptaş", telefon: "05413175103", tcKimlik: "25349069198", email: "eedatoptas@gmail.com", kiraBedeli: 10000, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "C-14A", oda: "Oda 1", ad: "Hi̇lal", soyad: "Ay", telefon: "05534957400", tcKimlik: "23669137344", email: "iclalhilalay@gmail.com", kiraBedeli: 9500, baslangic: "2025-10-01", bitis: "2026-08-01" },
  { daireNo: "C-14A", oda: "Oda 2", ad: "Nagi̇han Şevval", soyad: "İskenderoğlu", telefon: "05523041109", tcKimlik: "10083051288", email: "nsevvall02@gmail.com", kiraBedeli: 10000, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "C-14B", oda: "Oda 1", ad: "Nil Nehir", soyad: "Şeker", telefon: "05459508982", tcKimlik: "50665600176", email: "sekernil@icloud.com", kiraBedeli: 10000, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "C-14B", oda: "Oda 2", ad: "Sena", soyad: "Çalık", telefon: "05526161564", tcKimlik: "17248107910", email: "sen.calik61@gmail.com", kiraBedeli: 10000, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "C-15A", oda: "Oda 1", ad: "Di̇lara", soyad: "Duman", telefon: "05453711369", tcKimlik: "10435927056", email: "dumandilara30@gmail.com", kiraBedeli: 10000, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "C-15A", oda: "Oda 2", ad: "Tuba", soyad: "Tokbaş", telefon: "05303716948", tcKimlik: "11554257932", email: "tubatokbas44@gmail.com", kiraBedeli: 10000, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "C-15B", oda: "Oda 1", ad: "Beyza", soyad: "Sürücü", telefon: "05014864082", tcKimlik: "17473731126", email: "beyzanursurucu11@gmail.com", kiraBedeli: 10000, baslangic: "2025-12-02", bitis: "2026-08-01" },
  { daireNo: "C-16A", oda: "Oda 1", ad: "Işil Rabi̇a", soyad: "Ünvanli", telefon: "05510353745", tcKimlik: "40969496018", email: "isilunvanli@gmail.com", kiraBedeli: 10000, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "C-16A", oda: "Oda 2", ad: "Yağmur", soyad: "Danaci", telefon: "05457856975", tcKimlik: "12794757428", email: "danaciyagmur8@gmail.com", kiraBedeli: 10000, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "C-16B", oda: "Oda 1", ad: "Melda İrem", soyad: "Yüce", telefon: "05314373554", tcKimlik: "11766124930", email: "melda.yuce@yandex.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "C-16B", oda: "Oda 2", ad: "Merve Zeynep", soyad: "Bakir", telefon: "05334583604", tcKimlik: "26624156800", email: "merveezeynepp41@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "C-17A", oda: "Oda 1", ad: "Eli̇fnaz", soyad: "Ücel", telefon: "05524344954", tcKimlik: "11129326308", email: "eliffucl@gmail.com", kiraBedeli: 10000, baslangic: "2026-01-01", bitis: "2026-08-01" },
  { daireNo: "C-17A", oda: "Oda 2", ad: "Zehranur Kübra", soyad: "Atiş", telefon: "05523074305", tcKimlik: "35821710388", email: "zehranuratis76@gmail.com", kiraBedeli: 10000, baslangic: "2026-03-01", bitis: "2026-08-01" },
  { daireNo: "C-17B", oda: "Oda 1", ad: "Sedanur", soyad: "Tümoğlu", telefon: "05304470794", tcKimlik: "29713913780", email: "tumoglus@gmail.com", kiraBedeli: 10000, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "C-17B", oda: "Oda 2", ad: "Burcu", soyad: "Yildiz", telefon: "05523085136", tcKimlik: "10129942266", email: "by155391@gmail.com", kiraBedeli: 10000, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "C-18A", oda: "Oda 1", ad: "Hi̇lal", soyad: "Çi̇dem", telefon: "05385141337", tcKimlik: "32527656422", email: "hilalcidem898@gmail.com", kiraBedeli: 10000, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "C-18A", oda: "Oda 2", ad: "Semanur", soyad: "Şi̇ray", telefon: "05336350292", tcKimlik: "53659498728", email: "siraysema@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "C-18B", oda: "Oda 1", ad: "Meli̇sa", soyad: "Taştan", telefon: "05372515744", tcKimlik: "11273752794", email: "melisatastnn@gmail.com", kiraBedeli: 8000, baslangic: "2025-10-01", bitis: "2026-08-01" },
  { daireNo: "C-18B", oda: "Oda 2", ad: "Kübranur", soyad: "Çeli̇k", telefon: "05538251039", tcKimlik: "12920311616", email: "celik.cuberanur@gmail.com", kiraBedeli: 10000, baslangic: "2025-10-26", bitis: "2026-08-01" },
];

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-import-secret");
  if (secret !== SECRET) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const results = { ogrenci: 0, sozlesme: 0, atlandı: 0, hatalar: [] as string[] };

  const konutlar = await prisma.konut.findMany({ where: { etap: 2 }, select: { id: true, daireNo: true } });
  const konutMap = new Map(konutlar.map(k => [k.daireNo, k.id]));

  const sozSeq = new Map<string, number>();

  for (const row of KIRACLAR) {
    const konutId = konutMap.get(row.daireNo);
    if (!konutId) {
      results.hatalar.push(`Daire bulunamadı: ${row.daireNo}`);
      continue;
    }
    try {
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

  const doluDaireNolar = [...new Set(KIRACLAR.map(r => r.daireNo))];
  await prisma.konut.updateMany({
    where: { daireNo: { in: doluDaireNolar } },
    data: { durum: "Dolu" },
  });

  return NextResponse.json({ ok: true, ...results, doluDaire: doluDaireNolar.length });
}
