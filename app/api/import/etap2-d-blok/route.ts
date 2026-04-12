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
  { daireNo: "D-1A", oda: "Oda 1", ad: "Ruslan", soyad: "Chukov", telefon: "05058993275", tcKimlik: null, email: "ruslanchukov@gmail.com", kiraBedeli: 8500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "D-1B", oda: "Oda 1", ad: "Yusuf Efe", soyad: "Koçhan", telefon: "05319355114", tcKimlik: "29362273532", email: "yusufefekochan@hotmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "D-1B", oda: "Oda 2", ad: "Alper", soyad: "Hacioğlu", telefon: "05360658205", tcKimlik: "38299036820", email: "alperhcgl@outlook.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "D-2A", oda: "Oda 1", ad: "Yunus Emre", soyad: "İnan", telefon: "05511319621", tcKimlik: "13358608408", email: "emreinan4195@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "D-2A", oda: "Oda 2", ad: "Burak", soyad: "Çeti̇n", telefon: "05468644473", tcKimlik: "37267628258", email: "burakkcetn@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "D-2B", oda: "Oda 1", ad: "Serdar", soyad: "Yarsur", telefon: "05538630402", tcKimlik: "37009630648", email: "serdaryarsurcoa@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "D-2B", oda: "Oda 2", ad: "Ozan", soyad: "Yüksel", telefon: "05464831260", tcKimlik: "48505287076", email: "ozanyuksela@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "D-3A", oda: "Oda 1", ad: "Kubi̇lay", soyad: "Demi̇rci̇", telefon: "05358220228", tcKimlik: "25673050176", email: "dkubilay58@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "D-3A", oda: "Oda 2", ad: "Berkay", soyad: "Aydeni̇z", telefon: "05419345856", tcKimlik: "30328892926", email: "berkayaydeniz3@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "D-3B", oda: "Oda 1", ad: "Veli̇ Tunahan", soyad: "Topbaş", telefon: "05539736733", tcKimlik: "12250638018", email: "topikbas@icloud.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "D-3B", oda: "Oda 2", ad: "Mustafa Emre", soyad: "Alemdar", telefon: "05421976698", tcKimlik: "10224044490", email: "me.alemdar@hotmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "D-4A", oda: "Oda 1", ad: "Enes", soyad: "Öztürk", telefon: "05457649786", tcKimlik: "26401784776", email: "ozturkenes8@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "D-4A", oda: "Oda 2", ad: "Ahmet Nuri̇", soyad: "Demi̇r", telefon: "05447228028", tcKimlik: "10588686282", email: "ahmetnuridemir007@gmail.com", kiraBedeli: 8750, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "D-4B", oda: "Oda 1", ad: "Abdelbari̇", soyad: "Bendriouch", telefon: "05521796373", tcKimlik: null, email: "abdelbaribendriouch1@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "D-4B", oda: "Oda 2", ad: "Gorkam", soyad: "Guzbanov", telefon: "05316085862", tcKimlik: null, email: "azizligorkem17@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "D-5A", oda: "Oda 1", ad: "Ali̇ Aytunç", soyad: "Pehli̇vanoğlu", telefon: "05070923660", tcKimlik: "10030789356", email: "aliaytunc@hotmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "D-5A", oda: "Oda 2", ad: "Doruk", soyad: "Şeremet", telefon: "05530624625", tcKimlik: "23366266712", email: "dorukseremet@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "D-5B", oda: "Oda 1", ad: "Emi̇r", soyad: "Hati̇poğlu", telefon: "05511704162", tcKimlik: "20093918136", email: "emir190113@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "D-5B", oda: "Oda 2", ad: "İsmai̇l Anil", soyad: "Genç", telefon: "05422859219", tcKimlik: "11495015578", email: "ismailanilgenc06@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "D-6A", oda: "Oda 1", ad: "Mehmet Talha", soyad: "Turanlı", telefon: "05050528908", tcKimlik: "22940096912", email: "mehmettalha543@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "D-6A", oda: "Oda 2", ad: "Yağmur Ci̇han", soyad: "Atici", telefon: "05461497812", tcKimlik: "11768183690", email: "cihan.atici223@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "D-6B", oda: "Oda 1", ad: "Tarym", soyad: "Nuranbek", telefon: "05344617378", tcKimlik: null, email: "tarymnuranbek168@gmail.com", kiraBedeli: 8500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "D-6B", oda: "Oda 2", ad: "Nurbek", soyad: "Smagul", telefon: "07760010342", tcKimlik: null, email: "smagulnurbek798@gmail.com", kiraBedeli: 8500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "D-1C", oda: "Oda 1", ad: "Kerem", soyad: "Güleç", telefon: "05510426525", tcKimlik: "10864954456", email: "kerem478kerem@gmail.com", kiraBedeli: 8000, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "D-1C", oda: "Oda 2", ad: "Efe Cemal", soyad: "Yildiz", telefon: "05319227808", tcKimlik: "50881208248", email: "fatos34y@gmail.com", kiraBedeli: 8500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "D-1D", oda: "Oda 1", ad: "Ferhat", soyad: "Di̇lekli̇", telefon: "05368357712", tcKimlik: "33712093794", email: "fdilekli1311@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "D-1D", oda: "Oda 2", ad: "Hasan", soyad: "Aksay", telefon: "05433214267", tcKimlik: "20935496198", email: "haksay905@hotmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "D-2C", oda: "Oda 1", ad: "Ahmet Zahi̇d", soyad: "Ağrali", telefon: "05395175013", tcKimlik: "16754215652", email: "zahidagr0642@gmail.com", kiraBedeli: 9500, baslangic: "2026-02-01", bitis: "2026-08-01" },
  { daireNo: "D-2C", oda: "Oda 2", ad: "Samet", soyad: "Tatli", telefon: "05383956216", tcKimlik: "23956485080", email: "samettatli76@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "D-2D", oda: "Oda 1", ad: "Eralp", soyad: "Erdüzgün", telefon: "05550051537", tcKimlik: "19180673904", email: "aslanalp016@hotmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "D-2D", oda: "Oda 2", ad: "Mehmet Batuhan", soyad: "Çinar", telefon: "05416484606", tcKimlik: "18787300374", email: "mehmetbatu.fb@hotmail.com", kiraBedeli: 10000, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "D-3C", oda: "Oda 1", ad: "Ahmet Bahadir", soyad: "Cebeci̇", telefon: "05519571362", tcKimlik: "13163607030", email: "bahadircebeci621@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "D-3C", oda: "Oda 2", ad: "Ömer Faruk", soyad: "Akkaya", telefon: "05393879044", tcKimlik: "33955181678", email: null, kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "D-3D", oda: "Oda 1", ad: "Emi̇rhan Mustafa", soyad: "Ekşi̇", telefon: "05443302817", tcKimlik: "13184474406", email: "eskemirhan3@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "D-3D", oda: "Oda 2", ad: "Sai̇d Abou", soyad: "Allai̇l", telefon: "05316724490", tcKimlik: null, email: "saidaboallail@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "D-4C", oda: "Oda 1", ad: "Utku", soyad: "Sirtkaya", telefon: "05380681927", tcKimlik: "55123558600", email: "utkusirkayass@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "D-4C", oda: "Oda 2", ad: "Daulet", soyad: "Zhumashev", telefon: "07485632700", tcKimlik: null, email: "zhumashev203@gmail.com", kiraBedeli: 9500, baslangic: "2025-11-15", bitis: "2026-08-01" },
  { daireNo: "D-4D", oda: "Oda 1", ad: "Hüseyi̇n Bi̇lal", soyad: "Tüfekçi̇oğlu", telefon: "05365062153", tcKimlik: "10535946902", email: "huseyintufekcioglu53@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "D-4D", oda: "Oda 2", ad: "Enes", soyad: "Parladi", telefon: "05068109434", tcKimlik: "31687818428", email: "parladienes@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "D-5C", oda: "Oda 1", ad: "Umut Kaan", soyad: "Baş", telefon: "05308490652", tcKimlik: "15408019110", email: "umutk52bas@hotmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "D-5C", oda: "Oda 2", ad: "Mert", soyad: "Çeli̇k", telefon: "05071605228", tcKimlik: "48175933662", email: "mert818mert@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "D-5D", oda: "Oda 1", ad: "Oğuzcan", soyad: "Oğuz", telefon: "05309757024", tcKimlik: "48112176268", email: "oguzcaanoguz@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "D-5D", oda: "Oda 2", ad: "Süleyman", soyad: "Öztürk", telefon: "05432613262", tcKimlik: "21481147794", email: "ozturksuleyman910@gmail.com", kiraBedeli: 9500, baslangic: "2025-10-08", bitis: "2026-08-01" },
  { daireNo: "D-6C", oda: "Oda 1", ad: "Behram", soyad: "Çap", telefon: "05531964661", tcKimlik: "26794973726", email: "behramcap61@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "D-6C", oda: "Oda 2", ad: "Furkan", soyad: "Gökal", telefon: "05413618681", tcKimlik: "51646332246", email: "furkandokal56@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "D-6D", oda: "Oda 1", ad: "Necati̇", soyad: "Yurttaş", telefon: "05010531905", tcKimlik: "10142249328", email: "nyurttas6@gmail.com", kiraBedeli: 8500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "D-6D", oda: "Oda 2", ad: "Mustafa", soyad: "Şenel", telefon: "05350436590", tcKimlik: "26558010940", email: "senelmustafa69@gmail.com", kiraBedeli: 8500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "D-7A", oda: "Oda 1", ad: "Ahmet Can", soyad: "Ersoy", telefon: "05439565575", tcKimlik: "13729894812", email: "ahmetcanersoy5798@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "D-7A", oda: "Oda 2", ad: "Faruk Emre", soyad: "Ekşi̇oğlu", telefon: "05074746331", tcKimlik: "18782913470", email: "faruk.eksioglu@hotmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "D-7B", oda: "Oda 1", ad: "Mücahi̇t", soyad: "Gündüz", telefon: "05054664259", tcKimlik: "49213462236", email: "mucahitgndzz@gmail.com", kiraBedeli: 9500, baslangic: "2025-08-01", bitis: "2026-08-01" },
  { daireNo: "D-7B", oda: "Oda 2", ad: "Yildirim Arda", soyad: "Ülkeroğlu", telefon: "05319035061", tcKimlik: "12299507634", email: "ulkerogluarda@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "D-8A", oda: "Oda 1", ad: "Ayhan", soyad: "Babayev", telefon: "05077679754", tcKimlik: null, email: "ak33h4n@gmail.com", kiraBedeli: 9500, baslangic: "2025-10-01", bitis: "2026-08-01" },
  { daireNo: "D-8A", oda: "Oda 2", ad: "Ahmad", soyad: "Asgarzade", telefon: "05340770543", tcKimlik: null, email: "eszgerzade.ehmed@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "D-8B", oda: "Oda 1", ad: "Berk", soyad: "Özdemi̇rel", telefon: "05378213666", tcKimlik: "20695593762", email: "berkozdemirel12@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "D-8B", oda: "Oda 2", ad: "Sai̇t Emi̇rhan", soyad: "Şahi̇n", telefon: "05423081670", tcKimlik: "31006304298", email: "saitemirhan6005@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "D-9A", oda: "Oda 1", ad: "Ramazan", soyad: "Öztürk", telefon: "05538086886", tcKimlik: "10651571590", email: "ozturkramazan905@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "D-9A", oda: "Oda 2", ad: "Demi̇rhan", soyad: "Yilal", telefon: "05462761671", tcKimlik: "11477384678", email: "demirhanyilal0@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "D-9B", oda: "Oda 1", ad: "Yusuf", soyad: "Çakmak", telefon: "05321573463", tcKimlik: "53434640144", email: "yusufcakmakk6334@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "D-9B", oda: "Oda 2", ad: "Yusuf", soyad: "Sezgi̇n", telefon: "05511492373", tcKimlik: "40162563906", email: "yusufsezgin1908@hotmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "D-10A", oda: "Oda 1", ad: "Mehmet", soyad: "Erdoğan", telefon: "05550153324", tcKimlik: "12155744470", email: "mehmet1726erdogan@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "D-10A", oda: "Oda 2", ad: "Oğuz", soyad: "Akyol", telefon: "05511203737", tcKimlik: "12659494864", email: "oguzakyol171@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "D-10B", oda: "Oda 1", ad: "Batuhan", soyad: "Ünal", telefon: "05375400918", tcKimlik: "14933792154", email: "batuhanunal644@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "D-10B", oda: "Oda 2", ad: "Alperen", soyad: "Somuncuoğlu", telefon: "05050267061", tcKimlik: "49732254084", email: "alpisomun61@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "D-11A", oda: "Oda 1", ad: "Resul Kaan", soyad: "Bolat", telefon: "05319435328", tcKimlik: "53710111436", email: "resulkaanbolat@hotmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "D-11A", oda: "Oda 2", ad: "Alperen Batuhan", soyad: "Yalçin", telefon: "05300698333", tcKimlik: "40753484184", email: "alperenbatuhan894@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "D-11B", oda: "Oda 1", ad: "Murat", soyad: "Özmen", telefon: "05330264100", tcKimlik: "26795160590", email: "b1.ozmen@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "D-11B", oda: "Oda 2", ad: "Batu Demi̇r", soyad: "Narcan", telefon: "05382270909", tcKimlik: "10347158920", email: "batudemirnc@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "D-12A", oda: "Oda 1", ad: "Ergün", soyad: "Kolçak", telefon: "05415385902", tcKimlik: "22565714956", email: "ergunkolcak028@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "D-12A", oda: "Oda 2", ad: "Hasan", soyad: "Çakir", telefon: "05453539473", tcKimlik: "44767665218", email: "hasan.cakir0305@gmail.com", kiraBedeli: 9500, baslangic: "2025-10-01", bitis: "2026-08-01" },
  { daireNo: "D-12B", oda: "Oda 1", ad: "Furkan", soyad: "Şahin", telefon: "05343626275", tcKimlik: "42655452520", email: "furkansahin2012@hotmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "D-12B", oda: "Oda 2", ad: "Timuçin", soyad: "Mutlu", telefon: "05387226685", tcKimlik: "10571831590", email: "timucinmutlu05@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "D-13A", oda: "Oda 1", ad: "Ni̇hat", soyad: "Abbasov", telefon: "05376686399", tcKimlik: null, email: null, kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "D-13A", oda: "Oda 2", ad: "Mansur", soyad: "Samat", telefon: "07071914635", tcKimlik: null, email: "mansursamat2006@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "D-13B", oda: "Oda 1", ad: "Mertcan", soyad: "Maden", telefon: "05537911716", tcKimlik: "10942954408", email: "mertcanmaden05@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "D-13B", oda: "Oda 2", ad: "Kağan", soyad: "Güngör", telefon: "05537602601", tcKimlik: "11471103176", email: "gkaan9602@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "D-14A", oda: "Oda 1", ad: "Arda", soyad: "Gödelek", telefon: "05468151215", tcKimlik: "10414845388", email: "ardagodelek983@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "D-14A", oda: "Oda 2", ad: "Mustafa", soyad: "Saritaş", telefon: "05431779281", tcKimlik: "10271839292", email: "mustafasaritas596@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "D-14B", oda: "Oda 1", ad: "Amirbek", soyad: "Zholmurzayev", telefon: "07718439832", tcKimlik: null, email: "amirbekzolmurzaev@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "D-14B", oda: "Oda 2", ad: "Ömer", soyad: "-", telefon: "04508719522", tcKimlik: null, email: "huseyinliomer032@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "D-15A", oda: "Oda 1", ad: "Buğra Kaan", soyad: "Kaya", telefon: "05511011950", tcKimlik: "13006943714", email: "kaya.bugrakaan@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "D-15A", oda: "Oda 2", ad: "Hikmat", soyad: "Mammadzada", telefon: "05054389818", tcKimlik: null, email: "hikomzade123@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "D-15B", oda: "Oda 1", ad: "Sadem Ufuk", soyad: "Özgün", telefon: "05370126403", tcKimlik: "40846214278", email: "ufukozgun654@gmail.con", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "D-15B", oda: "Oda 2", ad: "Emre", soyad: "Çevi̇k", telefon: "05323593513", tcKimlik: "54547085648", email: "emrecevik3460@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "D-16A", oda: "Oda 1", ad: "Ayberk", soyad: "Sevgi̇", telefon: "05427750911", tcKimlik: "11776920980", email: "ayberklove@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "D-16A", oda: "Oda 2", ad: "Arda Kutay", soyad: "Karakuş", telefon: "05050060842", tcKimlik: "39814909148", email: "ardakutay2002@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "D-16B", oda: "Oda 1", ad: "Mustafa", soyad: "Topuzoğlu", telefon: "05054436678", tcKimlik: "14621682606", email: "mtopuzoglu2009@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "D-16B", oda: "Oda 2", ad: "Fati̇h Taha", soyad: "Ulaş", telefon: "05303418600", tcKimlik: "12428448586", email: "fatih.nweat@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "D-17A", oda: "Oda 1", ad: "Muhammet", soyad: "Özdemi̇r", telefon: "05453134934", tcKimlik: "52651633304", email: "mhmmtozdmrr4161@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "D-17A", oda: "Oda 2", ad: "Ahmet Emi̇r", soyad: "Saridede", telefon: "05511871661", tcKimlik: "23186141398", email: "aesaridede@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "D-17B", oda: "Oda 1", ad: "Ali̇ Emre Can", soyad: "Bozbek", telefon: "05447145832", tcKimlik: "29464180486", email: "a.emrebozbek@gmail.com", kiraBedeli: 10000, baslangic: "2026-02-01", bitis: "2026-08-01" },
  { daireNo: "D-17B", oda: "Oda 2", ad: "Orhan", soyad: "Akengi̇n", telefon: "05416045183", tcKimlik: "36982811570", email: "akenginorhan2001@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "D-18A", oda: "Oda 1", ad: "Metehan", soyad: "Gülşer", telefon: "05543841686", tcKimlik: "37288481900", email: "mthnglsr@gmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "D-18A", oda: "Oda 2", ad: "Yi̇ği̇t Alp", soyad: "Çakir", telefon: "05050071887", tcKimlik: "19636542006", email: "yigitalpcakir11@hotmail.com", kiraBedeli: 9500, baslangic: "2025-09-15", bitis: "2026-08-01" },
  { daireNo: "D-18B", oda: "Oda 1", ad: "Alper", soyad: "Ilica", telefon: "05455944294", tcKimlik: "16726756022", email: "alper161907@gmail.com", kiraBedeli: 0, baslangic: null, bitis: null },
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
