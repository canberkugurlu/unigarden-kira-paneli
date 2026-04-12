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
  { daireNo: "E-1A", oda: "Oda 1", ad: "Yernur", soyad: "Sabi̇t", telefon: "00071501788", tcKimlik: null, email: "ernur.sabit.007@gmail.com", kiraBedeli: 8000, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "E-1A", oda: "Oda 2", ad: "Şi̇facan", soyad: "Şahi̇n", telefon: "05411681609", tcKimlik: "10020139826", email: "sifacan68sahin@gmail.com", kiraBedeli: 8500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "E-2A", oda: "Oda 1", ad: "Ami̇r", soyad: "Zhardem", telefon: "07002155170", tcKimlik: null, email: "amirzhardi@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "E-2A", oda: "Oda 2", ad: "Vagif", soyad: "Fagazzade", telefon: "05054466605", tcKimlik: "98209205678", email: "vaqif.ceferzade.99@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "E-2B", oda: "Oda 1", ad: "Umut", soyad: "Özgür", telefon: "05456318350", tcKimlik: "11335940916", email: "umutozgur7002@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "E-2B", oda: "Oda 2", ad: "Emi̇rhan", soyad: "Kasim", telefon: "05531345973", tcKimlik: "44221422012", email: "emirhn.kasm@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "E-3A", oda: "Oda 1", ad: "Ozan", soyad: "Aydoğan", telefon: "05424868014", tcKimlik: "58507038354", email: "ozanaydogan2004@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "E-3A", oda: "Oda 2", ad: "Sefa Süleyman", soyad: "Özgölet", telefon: "05525341469", tcKimlik: "15080399128", email: "sefasuleymanozgolet@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "E-3B", oda: "Oda 1", ad: "Ömer Faruk", soyad: "Moussa", telefon: "05355041361", tcKimlik: "99830826836", email: "omerfarukmusa912@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "E-3B", oda: "Oda 2", ad: "Kadi̇r", soyad: "Topçuoğlu", telefon: "05550282461", tcKimlik: "11664010762", email: "kadirtopcuoglu6191@gmail.com", kiraBedeli: 9000, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "E-4A", oda: "Oda 1", ad: "Bariş Tuna", soyad: "Malli", telefon: "05382266425", tcKimlik: "42580483330", email: "kenan.malli@hotmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "E-4A", oda: "Oda 2", ad: "Ramazan Aktuğ", soyad: "Çeti̇n", telefon: "05325452891", tcKimlik: "14963415092", email: "aktgctn@hotmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "E-4B", oda: "Oda 1", ad: "Di̇nçer", soyad: "Şahi̇n", telefon: "05315811087", tcKimlik: "10160845410", email: "dincersahin0113@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "E-4B", oda: "Oda 2", ad: "Ruhi̇ Ulaş", soyad: "Ünal", telefon: "05442638252", tcKimlik: "55903368986", email: "ulas.onal@ogr.sakarya.edu.tr", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "E-5A", oda: "Oda 1", ad: "Esi̇m Talha", soyad: "Şi̇nğar", telefon: "05308699715", tcKimlik: "10067216610", email: "singartalha@icloud.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "E-5A", oda: "Oda 2", ad: "Buğra", soyad: "Güzel", telefon: "05334069269", tcKimlik: "22040629690", email: "inter10354@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "E-5B", oda: "Oda 1", ad: "Sami", soyad: "Aliyev", telefon: "05540098292", tcKimlik: null, email: "samialiyev06@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "E-5B", oda: "Oda 2", ad: "Mahammad", soyad: "Suleymanli", telefon: "05355212954", tcKimlik: null, email: "mehemmed2003@hotmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "E-6A", oda: "Oda 1", ad: "Eren", soyad: "Evren", telefon: "05468693361", tcKimlik: "37240665362", email: "eerenevren33@gmail.com", kiraBedeli: 9500, baslangic: "2025-10-01", bitis: "2026-08-01" },
  { daireNo: "E-6A", oda: "Oda 2", ad: "Yusuf", soyad: "Çeti̇n", telefon: "05378237449", tcKimlik: "10784816230", email: "yc328653@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "E-6B", oda: "Oda 1", ad: "Dani̇la", soyad: "Akoyev", telefon: "05370566097", tcKimlik: null, email: null, kiraBedeli: 0, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "E-6B", oda: "Oda 2", ad: "Hasan", soyad: "Kaşikçi", telefon: "05345425719", tcKimlik: "39568094688", email: "hkuzoluk19@gmail.com", kiraBedeli: 8000, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "E-1C", oda: "Oda 1", ad: "Samat", soyad: "-", telefon: "07754368416", tcKimlik: null, email: "samatadambekov85@gmail.com", kiraBedeli: 7500, baslangic: "2026-02-01", bitis: "2026-08-01" },
  { daireNo: "E-1C", oda: "Oda 2", ad: "Huzeyfe Ahmet", soyad: "Karaot", telefon: "05350197186", tcKimlik: "52717158826", email: "1995wiesmann@gmail.com", kiraBedeli: 8500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "E-1D", oda: "Oda 1", ad: "Yasi̇n", soyad: "Parlakiliç", telefon: "05462201795", tcKimlik: "12521238688", email: "yasinparlakkilic41@gmail.com", kiraBedeli: 9500, baslangic: "2025-10-01", bitis: "2026-08-01" },
  { daireNo: "E-1D", oda: "Oda 2", ad: "Mi̇kai̇l", soyad: "Osmanov", telefon: "05348785954", tcKimlik: "99968538748", email: "shogyomogyo2001@gmail.com", kiraBedeli: 9500, baslangic: "2025-10-01", bitis: "2026-08-01" },
  { daireNo: "E-2C", oda: "Oda 1", ad: "Yunus Emre", soyad: "Turan", telefon: "05467861804", tcKimlik: "40021258844", email: "emrt0xcd@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "E-2C", oda: "Oda 2", ad: "Berkay Ali̇", soyad: "Ermi̇ş", telefon: "05436862783", tcKimlik: "35360370074", email: "berkayaliermis@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "E-2D", oda: "Oda 1", ad: "Ali̇ Hali̇t", soyad: "Örnek", telefon: "05458433409", tcKimlik: "25790328882", email: "alihalitornek@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "E-2D", oda: "Oda 2", ad: "Yunus Emre", soyad: "Düşkün", telefon: "05370489452", tcKimlik: "19850384222", email: "duskunyunusemre3@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "E-3D", oda: "Oda 1", ad: "Cem", soyad: "Güventürk", telefon: "05377920409", tcKimlik: "12128331270", email: "cemguventurk33@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "E-3D", oda: "Oda 2", ad: "Mert", soyad: "Yürekli̇", telefon: "05445778863", tcKimlik: "13016462250", email: "yureklimert89@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "E-4C", oda: "Oda 1", ad: "Mahammad", soyad: "Karimov", telefon: "05525686986", tcKimlik: null, email: "m.akerim2897@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "E-4C", oda: "Oda 2", ad: "Huseyn", soyad: "Hajiyev", telefon: "04777427770", tcKimlik: null, email: "huseynhaciyev033@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "E-4D", oda: "Oda 1", ad: "Orçun Berk", soyad: "Acar", telefon: "05519474943", tcKimlik: "20462220884", email: "orcunberkacar@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "E-4D", oda: "Oda 2", ad: "Celi̇l Kerem", soyad: "Tanik", telefon: "05396306751", tcKimlik: "11952065504", email: "celiltanik51@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "E-5C", oda: "Oda 1", ad: "Recep", soyad: "Paksoy", telefon: "05057420645", tcKimlik: "48607586756", email: "canavar.1453@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "E-5D", oda: "Oda 1", ad: "Tan", soyad: "Yörük", telefon: "05317074897", tcKimlik: "60118025418", email: "tanyoruk@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "E-5D", oda: "Oda 2", ad: "Emi̇r Altan", soyad: "Uludağ", telefon: "05071035508", tcKimlik: "10247913186", email: "emiruludag207@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "E-6C", oda: "Oda 1", ad: "Mete Tarik", soyad: "Yildirim", telefon: "05539012008", tcKimlik: "10618820860", email: "metetarikyil@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "E-6C", oda: "Oda 2", ad: "Berke Kaan", soyad: "Erdi̇n", telefon: "05456096631", tcKimlik: "11378666828", email: "berkekaanerdin123@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "E-6D", oda: "Oda 1", ad: "Efe", soyad: "Tunalı", telefon: "05558869859", tcKimlik: "12439154032", email: "efetunali2006@gmail.com", kiraBedeli: 8000, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "E-6D", oda: "Oda 2", ad: "Tural", soyad: "Abbasli", telefon: "05528358302", tcKimlik: null, email: "turalabbasli06@gmail.com", kiraBedeli: 8750, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "E-7A", oda: "Oda 1", ad: "Seli̇m", soyad: "Şen", telefon: "05433503255", tcKimlik: "10259834912", email: "seelimsenn@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "E-7A", oda: "Oda 2", ad: "Taylan", soyad: "Comba", telefon: "05425683484", tcKimlik: "25561117592", email: "taylancomba@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "E-7B", oda: "Oda 1", ad: "Mi̇raç", soyad: "Bozkir", telefon: "05510611552", tcKimlik: "41404523924", email: "bzkrmirac.3@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "E-7B", oda: "Oda 2", ad: "Meti̇n Hakan", soyad: "Yilmaz", telefon: "05398259363", tcKimlik: "30710497630", email: "metinhakan04@hotmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "E-8A", oda: "Oda 1", ad: "Yalçin", soyad: "Adigüzel", telefon: "05529259093", tcKimlik: "14123443002", email: "yalcinadiguzel3636@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "E-8A", oda: "Oda 2", ad: "Almi̇r", soyad: "Gali̇ev", telefon: "09083329234", tcKimlik: null, email: "almirgalievsagdiev@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "E-8B", oda: "Oda 1", ad: "Tuna", soyad: "Kilinç", telefon: "05359355452", tcKimlik: "13469458022", email: "tunakilinc2006@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "E-8B", oda: "Oda 2", ad: "Muhammed Hasan", soyad: "Gülen", telefon: "05511472515", tcKimlik: "55501064310", email: "me_hasan37341453@icloud.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "E-9A", oda: "Oda 1", ad: "Güney Poyraz", soyad: "Çalikuşu", telefon: "05537352659", tcKimlik: "10257206766", email: "guneypoyrazcalikusu@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "E-9A", oda: "Oda 2", ad: "Yakup", soyad: "Kalinli", telefon: "05541749406", tcKimlik: "51205091508", email: "yakup1996kalinli@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "E-9B", oda: "Oda 1", ad: "Muhammed", soyad: "Yildiran", telefon: "05397365895", tcKimlik: "12030117870", email: "myildiran964@gmail.com", kiraBedeli: 9000, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "E-9B", oda: "Oda 2", ad: "Oğuz", soyad: "Erdoğan", telefon: "05346901395", tcKimlik: "53632108446", email: "rte255.05@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "E-10A", oda: "Oda 1", ad: "Mustafa", soyad: "Eki̇z", telefon: "05511955959", tcKimlik: "10826694680", email: "ekizmustafa05@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "E-10A", oda: "Oda 2", ad: "Talha", soyad: "Arslan", telefon: "05050090205", tcKimlik: "18101293252", email: "arstalha55@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "E-10B", oda: "Oda 1", ad: "Kutay", soyad: "Gündüz", telefon: "05524813534", tcKimlik: "61306001894", email: "kutay-gun@hotmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "E-10B", oda: "Oda 2", ad: "Meli̇h", soyad: "Mut", telefon: "05377701626", tcKimlik: "11482931324", email: "melihmut4@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "E-11A", oda: "Oda 1", ad: "Efe Eren", soyad: "Kaya", telefon: "05051075358", tcKimlik: "13892453410", email: "efeerenkaya8@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "E-11A", oda: "Oda 2", ad: "Furkan", soyad: "Kiliç", telefon: "05417130754", tcKimlik: "22670150014", email: "furkanklc054@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "E-12A", oda: "Oda 1", ad: "Mehmet Emre", soyad: "Bardakçi", telefon: "05308415220", tcKimlik: "49411269040", email: "emrebe12b@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "E-12A", oda: "Oda 2", ad: "Meti̇n", soyad: "Korlu", telefon: "05419658517", tcKimlik: "32473962950", email: "metinkorlu@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "E-12B", oda: "Oda 1", ad: "Eren", soyad: "Sülün", telefon: "05551055155", tcKimlik: "17816308138", email: "slneren11@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-10-01" },
  { daireNo: "E-12B", oda: "Oda 2", ad: "Bahadir", soyad: "Gökçeoğlu", telefon: "05324103500", tcKimlik: "16555818526", email: "bahostark@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "E-13A", oda: "Oda 1", ad: "Ahmet Enes", soyad: "Eşer", telefon: "05399697869", tcKimlik: "13567876148", email: "aeneseserr@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "E-13A", oda: "Oda 2", ad: "Eren", soyad: "Çakir", telefon: "05386422055", tcKimlik: "52318793334", email: "erencakirrrr@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "E-13B", oda: "Oda 1", ad: "Kadi̇r", soyad: "Demi̇r", telefon: "05424056905", tcKimlik: "11843652448", email: "kadird4141@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "E-13B", oda: "Oda 2", ad: "Serhat", soyad: "Çeli̇k", telefon: "05053750736", tcKimlik: "10097710690", email: "serhatca1212@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "E-14A", oda: "Oda 1", ad: "Ati̇lla Cengi̇zhan", soyad: "Kaya", telefon: "05315823207", tcKimlik: "11168521016", email: "atillacengizhankay@gmail.com", kiraBedeli: 9500, baslangic: "2025-10-01", bitis: "2026-08-01" },
  { daireNo: "E-14A", oda: "Oda 2", ad: "Volkan", soyad: "Çakici", telefon: "05060218865", tcKimlik: "15560221956", email: "volkancakici05@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "E-14B", oda: "Oda 1", ad: "Yi̇ği̇t", soyad: "Erlat", telefon: "05527559235", tcKimlik: "42368051492", email: "yigiterlat11@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "E-14B", oda: "Oda 2", ad: "Murat", soyad: "Başer", telefon: "05379179858", tcKimlik: "22928134810", email: "basermurat34@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "E-15A", oda: "Oda 1", ad: "Yusuf Mert", soyad: "Kurban", telefon: "05380377108", tcKimlik: "56485033262", email: "mertkurban56@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "E-15A", oda: "Oda 2", ad: "Onur", soyad: "Bayram", telefon: "05334924794", tcKimlik: "48238440328", email: "onurbay2001@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "E-15B", oda: "Oda 1", ad: "Emirhan", soyad: "Demir", telefon: "05511047585", tcKimlik: "45337955876", email: "emirhandemir1367@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "E-15B", oda: "Oda 2", ad: "Ali̇ Eren", soyad: "Akbiyik", telefon: "05418522407", tcKimlik: "10744880608", email: "ptrqitwwrpu@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "E-16A", oda: "Oda 1", ad: "Serhan", soyad: "Hür", telefon: "05523207822", tcKimlik: "11272942042", email: "hurserhan112@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "E-16A", oda: "Oda 2", ad: "Deni̇z", soyad: "İnce", telefon: "05050082277", tcKimlik: "10535256940", email: "26denizince26@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "E-16B", oda: "Oda 1", ad: "Talha Yasi̇r", soyad: "Akil", telefon: "05357258163", tcKimlik: "40868186102", email: "akiltalhaa@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "E-16B", oda: "Oda 2", ad: "Mürsel Enes", soyad: "Güner", telefon: "05437842980", tcKimlik: "10207322232", email: "murselguner1095@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "E-17A", oda: "Oda 1", ad: "Abdülkadir", soyad: "Güzel", telefon: "05544937112", tcKimlik: "24130566052", email: "abdulkadirguzel0@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "E-17A", oda: "Oda 2", ad: "Can", soyad: "Bi̇lgi̇n", telefon: "05468756791", tcKimlik: "52093165326", email: "canblgn13@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "E-17B", oda: "Oda 1", ad: "Mert", soyad: "Aydin", telefon: "05070536585", tcKimlik: "34813112698", email: "myaydin2003@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "E-17B", oda: "Oda 2", ad: "Ata", soyad: "Asmatülü", telefon: "05531398947", tcKimlik: "17995572870", email: "asmatuluata@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "E-18A", oda: "Oda 1", ad: "Samet", soyad: "Aydin", telefon: "05386400374", tcKimlik: "46915973824", email: "samet861tr@outlook.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "E-18A", oda: "Oda 2", ad: "Güven", soyad: "Varol", telefon: "05510930662", tcKimlik: "10549755972", email: "gvarol0924@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "E-18B", oda: "Oda 1", ad: "Polat", soyad: "Elaldirsin", telefon: "05525417196", tcKimlik: "11858510672", email: "polatelaldi@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "E-18B", oda: "Oda 2", ad: "Meti̇ncan", soyad: "Altaş", telefon: "05351008920", tcKimlik: "55411206688", email: "canaltas1907@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
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
              sozlesmeNo: sozNo, konutId, ogrenciId: ogrenci.id,
              baslangicTarihi: new Date(row.baslangic), bitisTarihi: new Date(row.bitis),
              aylikKira: row.kiraBedeli, depozito: row.kiraBedeli,
              durum: "Aktif", oda: row.oda, kisiSayisi: 1,
            },
          });
          results.sozlesme++;
        } else { results.atlandı++; }
      }
    } catch (e: unknown) {
      results.hatalar.push(`${row.daireNo} - ${row.ad} ${row.soyad}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  const doluDaireNolar = [...new Set(KIRACLAR.map(r => r.daireNo))];
  await prisma.konut.updateMany({ where: { daireNo: { in: doluDaireNolar } }, data: { durum: "Dolu" } });
  return NextResponse.json({ ok: true, ...results, doluDaire: doluDaireNolar.length });
}
