import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const SECRET = process.env.IMPORT_SECRET ?? "etap3-import-2025";

type TenantRow = {
  ad: string; soyad: string; telefon: string;
  tcKimlik: string | null; email: string | null;
  kiraBedeli: number | null; baslangiç: string | null; bitis: string | null;
};
type DaireRow = { no: string; tip: string; daire_sahibi: string | null };

const DAIRELER: DaireRow[] = [
  {
    "no": "1",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "2",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "3",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "4",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "5",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "6",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "7",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "8",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "9",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "10",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "11",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "12",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "13",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "14",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "15",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "16",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "17",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "18",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "19",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "20",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "21",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "22",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "23",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "24",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "25",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "26",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "27",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "28",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "29",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "30",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "31",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "32",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "33",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "34",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "35",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "36",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "37",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "38",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "39",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "40",
    "tip": "Loft",
    "daire_sahibi": null
  },
  {
    "no": "41",
    "tip": "Loft",
    "daire_sahibi": null
  },
  {
    "no": "42",
    "tip": "Loft",
    "daire_sahibi": null
  },
  {
    "no": "43",
    "tip": "Loft",
    "daire_sahibi": null
  },
  {
    "no": "44",
    "tip": "Loft",
    "daire_sahibi": null
  },
  {
    "no": "45",
    "tip": "Loft",
    "daire_sahibi": null
  },
  {
    "no": "46",
    "tip": "Loft",
    "daire_sahibi": null
  },
  {
    "no": "47",
    "tip": "Loft",
    "daire_sahibi": null
  },
  {
    "no": "48",
    "tip": "1+0",
    "daire_sahibi": "KAMİL ÇİÇEK"
  },
  {
    "no": "49",
    "tip": "1+0",
    "daire_sahibi": "KAMİL ÇİÇEK"
  },
  {
    "no": "50",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "51",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "52",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "53",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "54",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "55",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "56",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "57",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "58",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "59",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "60",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "61",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "62",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "63",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "64",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "65",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "66",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "67",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "68",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "69",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "70",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "71",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "72",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "73",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "74",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "75",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "76",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "77",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "78",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "79",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "80",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "81",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "82",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "83",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "84",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "85",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "86",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "87",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "88",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "89",
    "tip": "1+0",
    "daire_sahibi": "BEKİR DAĞ"
  },
  {
    "no": "90",
    "tip": "1+0",
    "daire_sahibi": "BEKİR DAĞ"
  },
  {
    "no": "91",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "92",
    "tip": "1+0",
    "daire_sahibi": "FATİH ATABAY"
  },
  {
    "no": "93",
    "tip": "1+0",
    "daire_sahibi": "BAHADIR ÖZKAN"
  },
  {
    "no": "94",
    "tip": "1+0",
    "daire_sahibi": "GÖKMEN ÖETİN"
  },
  {
    "no": "95",
    "tip": "1+0",
    "daire_sahibi": "BELGİN ÖZBAKAN"
  },
  {
    "no": "96",
    "tip": "1+0",
    "daire_sahibi": "TUNCAY ÜLKEN"
  },
  {
    "no": "97",
    "tip": "1+0",
    "daire_sahibi": "TUNCAY ÜLKEN"
  },
  {
    "no": "98",
    "tip": "1+0",
    "daire_sahibi": "TUNCAY ÜLKEN"
  },
  {
    "no": "99",
    "tip": "1+0",
    "daire_sahibi": "FURKAN SABAN"
  },
  {
    "no": "100",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "101",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "102",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "103",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "104",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "105",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "106",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "107",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "108",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "109",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "110",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "111",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "112",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "113",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "114",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "115",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "116",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "117",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "118",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "119",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "120",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "121",
    "tip": "1+0",
    "daire_sahibi": "KAMİL ÇİÇEK"
  },
  {
    "no": "122",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "123",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "124",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "125",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "126",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "127",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "128",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "129",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "130",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "131",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "132",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "133",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "134",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "135",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "136",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "137",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "138",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "139",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "140",
    "tip": "1+0",
    "daire_sahibi": "BEKİR DAĞ"
  },
  {
    "no": "141",
    "tip": "1+0",
    "daire_sahibi": "BEKİR DAĞ"
  },
  {
    "no": "142",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "143",
    "tip": "1+0",
    "daire_sahibi": "FATİH ATABAY"
  },
  {
    "no": "144",
    "tip": "Loft",
    "daire_sahibi": null
  },
  {
    "no": "145",
    "tip": "Loft",
    "daire_sahibi": null
  },
  {
    "no": "146",
    "tip": "Loft",
    "daire_sahibi": null
  },
  {
    "no": "147",
    "tip": "Loft",
    "daire_sahibi": null
  },
  {
    "no": "148",
    "tip": "Loft",
    "daire_sahibi": null
  },
  {
    "no": "149",
    "tip": "Loft",
    "daire_sahibi": null
  },
  {
    "no": "150",
    "tip": "Loft",
    "daire_sahibi": null
  },
  {
    "no": "151",
    "tip": "Loft",
    "daire_sahibi": null
  },
  {
    "no": "152",
    "tip": "Loft",
    "daire_sahibi": null
  },
  {
    "no": "153",
    "tip": "Loft",
    "daire_sahibi": null
  },
  {
    "no": "154",
    "tip": "Loft",
    "daire_sahibi": null
  },
  {
    "no": "155",
    "tip": "Loft",
    "daire_sahibi": null
  },
  {
    "no": "156",
    "tip": "Loft",
    "daire_sahibi": null
  },
  {
    "no": "157",
    "tip": "Loft",
    "daire_sahibi": null
  },
  {
    "no": "158",
    "tip": "Loft",
    "daire_sahibi": null
  },
  {
    "no": "159",
    "tip": "Loft",
    "daire_sahibi": null
  },
  {
    "no": "160",
    "tip": "Loft",
    "daire_sahibi": null
  },
  {
    "no": "161",
    "tip": "Loft",
    "daire_sahibi": "FURKAN SABAN"
  },
  {
    "no": "162",
    "tip": "Loft",
    "daire_sahibi": "ŞEYMA ŞIŞKO"
  },
  {
    "no": "163",
    "tip": "Loft",
    "daire_sahibi": "SEVIM BICAKCI"
  },
  {
    "no": "164",
    "tip": "Loft",
    "daire_sahibi": "ELMAS NISA GÜNDAY"
  },
  {
    "no": "165",
    "tip": "Loft",
    "daire_sahibi": "ECE NAZIRE KIRLANGICOĞLU"
  },
  {
    "no": "166",
    "tip": "1+0",
    "daire_sahibi": "ERCAN GENÇ"
  },
  {
    "no": "167",
    "tip": "1+0",
    "daire_sahibi": "BELGİN ÖZBAKAN"
  },
  {
    "no": "168",
    "tip": "1+0",
    "daire_sahibi": "ALİ CAN"
  },
  {
    "no": "169",
    "tip": "1+0",
    "daire_sahibi": "ZİYAATTİN KARACAN"
  },
  {
    "no": "170",
    "tip": "1+0",
    "daire_sahibi": "ZİYAATTİN KARACAN"
  },
  {
    "no": "171",
    "tip": "1+0",
    "daire_sahibi": "ZİYA AYGÖR"
  },
  {
    "no": "172",
    "tip": "1+0",
    "daire_sahibi": "SERDAL DEMİR"
  },
  {
    "no": "173",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "174",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "175",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "176",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "177",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "178",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "179",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "180",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "181",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "182",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "183",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "184",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "185",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "186",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "187",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "188",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "189",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "190",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "191",
    "tip": "1+0",
    "daire_sahibi": "OSMAN FATİH ÖELEN"
  },
  {
    "no": "192",
    "tip": "1+0",
    "daire_sahibi": "NURSEMİN HANEDAR"
  },
  {
    "no": "193",
    "tip": "1+0",
    "daire_sahibi": "ŞENER BOZAN"
  },
  {
    "no": "194",
    "tip": "1+0",
    "daire_sahibi": "PERIHAN BALABAN"
  },
  {
    "no": "195",
    "tip": "Loft",
    "daire_sahibi": "ERDEM YILMAZ"
  },
  {
    "no": "196",
    "tip": "Loft",
    "daire_sahibi": "YUNUS ÜRESİN"
  },
  {
    "no": "197",
    "tip": "Loft",
    "daire_sahibi": "EZGI GÖL"
  },
  {
    "no": "198",
    "tip": "Loft",
    "daire_sahibi": "GÜLCAN GÖL"
  },
  {
    "no": "199",
    "tip": "Loft",
    "daire_sahibi": "EROL YILMAZ"
  },
  {
    "no": "200",
    "tip": "Loft",
    "daire_sahibi": "ERKAN UYANIK"
  },
  {
    "no": "201",
    "tip": "Loft",
    "daire_sahibi": "MUSTAFA GÖZCAN"
  },
  {
    "no": "202",
    "tip": "1+0",
    "daire_sahibi": "YUNUS EMRE GÖZCÖ"
  },
  {
    "no": "203",
    "tip": "1+0",
    "daire_sahibi": "ÖZLEM HÜNDÜR"
  },
  {
    "no": "204",
    "tip": "1+0",
    "daire_sahibi": "YILDIRIM YIGIT BOZCA"
  },
  {
    "no": "205",
    "tip": "1+0",
    "daire_sahibi": "CIGDEM AKAR"
  },
  {
    "no": "206",
    "tip": "1+0",
    "daire_sahibi": "SERDAR INCE"
  },
  {
    "no": "207",
    "tip": "1+0",
    "daire_sahibi": "YUKSEL ATMACA"
  },
  {
    "no": "208",
    "tip": "1+0",
    "daire_sahibi": "DENIZ KOCAOGLU"
  },
  {
    "no": "209",
    "tip": "1+0",
    "daire_sahibi": "SEHER KARA"
  },
  {
    "no": "210",
    "tip": "1+0",
    "daire_sahibi": "AYSE GOKCE"
  },
  {
    "no": "211",
    "tip": "1+0",
    "daire_sahibi": "NARGÜL KAYA"
  },
  {
    "no": "212",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "213",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "214",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "215",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "216",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "217",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "218",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "219",
    "tip": "1+0",
    "daire_sahibi": null
  },
  {
    "no": "220",
    "tip": "Loft",
    "daire_sahibi": "ERKAN UYANIK"
  },
  {
    "no": "221",
    "tip": "Loft",
    "daire_sahibi": "MUSTAFA CELIK"
  },
  {
    "no": "222",
    "tip": "Loft",
    "daire_sahibi": "GÜLÜZAR KÖSECİ"
  },
  {
    "no": "223",
    "tip": "Loft",
    "daire_sahibi": "TASIN CALDAŞTAN"
  },
  {
    "no": "224",
    "tip": "Loft",
    "daire_sahibi": "NECMIYE KILIC"
  },
  {
    "no": "225",
    "tip": "Loft",
    "daire_sahibi": "ŞABAN GULALI"
  },
  {
    "no": "226",
    "tip": "Loft",
    "daire_sahibi": "KORAY PEKEY"
  },
  {
    "no": "227",
    "tip": "Loft",
    "daire_sahibi": "NERMIN AKAR"
  },
  {
    "no": "228",
    "tip": "Loft",
    "daire_sahibi": "YUSUF YURTCU"
  },
  {
    "no": "229",
    "tip": "Loft",
    "daire_sahibi": "CIGDEM GOGGER"
  },
  {
    "no": "230",
    "tip": "Loft",
    "daire_sahibi": "BELGİN ÖZBAKAN"
  },
  {
    "no": "231",
    "tip": "Loft",
    "daire_sahibi": "SANIYE TEMEL"
  },
  {
    "no": "232",
    "tip": "Loft",
    "daire_sahibi": "AGAH CANKAYA"
  },
  {
    "no": "233",
    "tip": "Loft",
    "daire_sahibi": "SERDAL DEMİR"
  },
  {
    "no": "234",
    "tip": "Loft",
    "daire_sahibi": "NIHAN CINGIZ"
  },
  {
    "no": "235",
    "tip": "Loft",
    "daire_sahibi": "MUSTAFA KURT"
  },
  {
    "no": "236",
    "tip": "Loft",
    "daire_sahibi": "YAGMUR KARAKISLAK"
  },
  {
    "no": "237",
    "tip": "Loft",
    "daire_sahibi": "KURSAT KARAKISLAK"
  },
  {
    "no": "238",
    "tip": "Loft",
    "daire_sahibi": "AYGUL SAYGI"
  },
  {
    "no": "239",
    "tip": "Loft",
    "daire_sahibi": "AYSENUR UNAL"
  },
  {
    "no": "240",
    "tip": "Loft",
    "daire_sahibi": "HULYA VURUCU"
  },
  {
    "no": "241",
    "tip": "Loft",
    "daire_sahibi": "ISRAFIL GOKBURUN"
  }
];
const KIRACILAR: Record<string, TenantRow[]> = {
  "1": [
    {
      "ad": "YUSUF",
      "soyad": "KEREM TAŞKIN",
      "telefon": "05332930498",
      "tcKimlik": "32905822258",
      "email": "y.keremtaskinn@gmail.com",
      "basRaw": "01.09.2025",
      "bitRaw": "01.09.2026",
      "kiraBedeli": 10400.0,
      "baslangiç": "2025-09-01",
      "bitis": "2026-09-01"
    }
  ],
  "2": [
    {
      "ad": "ALPEREN",
      "soyad": "KARA",
      "telefon": "05468674989",
      "tcKimlik": "21181285086",
      "email": "alperenkara055@gmail.com",
      "basRaw": "05.02.2026",
      "bitRaw": "05.07.2026",
      "kiraBedeli": 14000.0,
      "baslangiç": "2026-02-05",
      "bitis": "2026-07-05"
    }
  ],
  "4": [
    {
      "ad": "TAHA",
      "soyad": "EFE ERMAN",
      "telefon": "05495497241",
      "tcKimlik": "12482639364",
      "email": "tahaefeerman518@gmail.com",
      "basRaw": "10.09.2025",
      "bitRaw": "10.09.2026",
      "kiraBedeli": 16000.0,
      "baslangiç": "2025-09-10",
      "bitis": "2026-09-10"
    }
  ],
  "5": [
    {
      "ad": "YAREN",
      "soyad": "KALE",
      "telefon": "05452865720",
      "tcKimlik": "65011336746",
      "email": "yaren74kale74@gmail.com",
      "basRaw": "01.08.2025",
      "bitRaw": "01.08.2026",
      "kiraBedeli": 17300.0,
      "baslangiç": "2025-08-01",
      "bitis": "2026-08-01"
    },
    {
      "ad": "DİLAN",
      "soyad": "AYRANCI",
      "telefon": "05452599463",
      "tcKimlik": "12902654212",
      "email": "ayrancidilan69@gmail.com",
      "basRaw": "",
      "bitRaw": "",
      "kiraBedeli": null,
      "baslangiç": null,
      "bitis": null
    }
  ],
  "6": [
    {
      "ad": "EKREM",
      "soyad": "SERT",
      "telefon": "05426208494",
      "tcKimlik": "35170979146",
      "email": "ekrem45_sert@hotmail.com",
      "basRaw": "01.09.2025",
      "bitRaw": "01.09.2026",
      "kiraBedeli": 10300.0,
      "baslangiç": "2025-09-01",
      "bitis": "2026-09-01"
    }
  ],
  "7": [
    {
      "ad": "EMRE",
      "soyad": "ASLAN",
      "telefon": "05457317886",
      "tcKimlik": "22196250816",
      "email": null,
      "basRaw": "20.09.2025",
      "bitRaw": "20.08.2026",
      "kiraBedeli": 15900.0,
      "baslangiç": "2025-09-20",
      "bitis": "2026-08-20"
    }
  ],
  "8": [
    {
      "ad": "SUDE",
      "soyad": "YAĞMUR SOLMAZ",
      "telefon": "05320549616",
      "tcKimlik": "17351472516",
      "email": "sudeyagmursolmaz559@gmail.com",
      "basRaw": "03.12.2025",
      "bitRaw": "03.09.2026",
      "kiraBedeli": 13000.0,
      "baslangiç": "2025-12-03",
      "bitis": "2026-09-03"
    }
  ],
  "9": [
    {
      "ad": "MIKAIL",
      "soyad": "TIMURZIEV",
      "telefon": "789287950710",
      "tcKimlik": "761469071",
      "email": null,
      "basRaw": "25.11.2025",
      "bitRaw": "25.06.2026",
      "kiraBedeli": 13500.0,
      "baslangiç": "2025-11-25",
      "bitis": "2026-06-25"
    },
    {
      "ad": "ISLAM",
      "soyad": "BOGATYREV",
      "telefon": "89881262114",
      "tcKimlik": "761438700",
      "email": "bogatyrev7979@gmail.com",
      "basRaw": "",
      "bitRaw": "",
      "kiraBedeli": null,
      "baslangiç": null,
      "bitis": null
    }
  ],
  "11": [
    {
      "ad": "JASURKHAN",
      "soyad": "HUSEYNLI",
      "telefon": "05011570327",
      "tcKimlik": "99876618914",
      "email": "huseynovcesur05@gmail.com",
      "basRaw": "08.01.2026",
      "bitRaw": "08.07.2026",
      "kiraBedeli": 13000.0,
      "baslangiç": "2026-01-08",
      "bitis": "2026-07-08"
    }
  ],
  "12": [
    {
      "ad": "ORÖUN",
      "soyad": "AYGÖN",
      "telefon": "05300693318",
      "tcKimlik": "38830019350",
      "email": "oorco2004@gmail.com",
      "basRaw": "25.11.2025",
      "bitRaw": "25.06.2026",
      "kiraBedeli": 13500.0,
      "baslangiç": "2025-11-25",
      "bitis": "2026-06-25"
    }
  ],
  "13": [
    {
      "ad": "ERALP",
      "soyad": "ÇELEBİ",
      "telefon": "05061240468",
      "tcKimlik": "15761357386",
      "email": "eralp.celebipersonal@gmail.com",
      "basRaw": "01.08.2025",
      "bitRaw": "01.08.2026",
      "kiraBedeli": 14000.0,
      "baslangiç": "2025-08-01",
      "bitis": "2026-08-01"
    }
  ],
  "14": [
    {
      "ad": "HALİL",
      "soyad": "İBRAHİM TOPRAK",
      "telefon": "05334734514",
      "tcKimlik": "44546047846",
      "email": "haliltoprak980@gmail.com",
      "basRaw": "11.11.2025",
      "bitRaw": "11.07.2026",
      "kiraBedeli": 13000.0,
      "baslangiç": "2025-11-11",
      "bitis": "2026-07-11"
    }
  ],
  "15": [
    {
      "ad": "NURDAULET",
      "soyad": "SĞILĞU",
      "telefon": "77074876575",
      "tcKimlik": null,
      "email": "lesxdik@gmail.com",
      "basRaw": "08.11.2025",
      "bitRaw": "08.07.2026",
      "kiraBedeli": 13000.0,
      "baslangiç": "2025-11-08",
      "bitis": "2026-07-08"
    }
  ],
  "16": [
    {
      "ad": "MOHAMMAD",
      "soyad": "AZHAR PEERZADA",
      "telefon": "05053169223",
      "tcKimlik": null,
      "email": "pzazhar1023@gmail.com",
      "basRaw": "03.11.2025",
      "bitRaw": "03.09.2026",
      "kiraBedeli": 13000.0,
      "baslangiç": "2025-11-03",
      "bitis": "2026-09-03"
    }
  ],
  "17": [
    {
      "ad": "İLKAY",
      "soyad": "KANTÖRK",
      "telefon": "05346815701",
      "tcKimlik": "15521665898",
      "email": "ilkay.kanturk987@gmail.com",
      "basRaw": "01.09.2025",
      "bitRaw": "01.09.2026",
      "kiraBedeli": 14600.0,
      "baslangiç": "2025-09-01",
      "bitis": "2026-09-01"
    }
  ],
  "18": [
    {
      "ad": "EFE",
      "soyad": "MISIROGLU",
      "telefon": "05077978259",
      "tcKimlik": "39340501410",
      "email": "efemisirogullari1903@gmail.com",
      "basRaw": "01.09.2025",
      "bitRaw": "01.09.2026",
      "kiraBedeli": 13900.0,
      "baslangiç": "2025-09-01",
      "bitis": "2026-09-01"
    }
  ],
  "19": [
    {
      "ad": "ABDULSAMED",
      "soyad": "ŞAHİN",
      "telefon": "05388742054",
      "tcKimlik": "39092143180",
      "email": "bayramco@gmail.com",
      "basRaw": "16.09.2025",
      "bitRaw": "16.09.2026",
      "kiraBedeli": 15000.0,
      "baslangiç": "2025-09-16",
      "bitis": "2026-09-16"
    }
  ],
  "20": [
    {
      "ad": "SELİNAY",
      "soyad": "ŞANLIOGLU",
      "telefon": "05421155409",
      "tcKimlik": "10228773808",
      "email": "ssanligu@gmail.com",
      "basRaw": "20.06.2025",
      "bitRaw": "20.06.2026",
      "kiraBedeli": 16500.0,
      "baslangiç": "2025-06-20",
      "bitis": "2026-06-20"
    }
  ],
  "21": [
    {
      "ad": "ECE",
      "soyad": "CEREN SAĞLAM",
      "telefon": "05538622506",
      "tcKimlik": "11926850990",
      "email": "ececrn06@outlook.com",
      "basRaw": "09.12.2025",
      "bitRaw": "09.07.2026",
      "kiraBedeli": 14000.0,
      "baslangiç": "2025-12-09",
      "bitis": "2026-07-09"
    }
  ],
  "22": [
    {
      "ad": "KARDELEN",
      "soyad": "DUMAN",
      "telefon": "05457339565",
      "tcKimlik": "12629624956",
      "email": "kardelenduman166@gmail.com",
      "basRaw": "01.08.2025",
      "bitRaw": "01.08.2026",
      "kiraBedeli": 17500.0,
      "baslangiç": "2025-08-01",
      "bitis": "2026-08-01"
    }
  ],
  "23": [
    {
      "ad": "SERRA",
      "soyad": "ÇELİK",
      "telefon": "05313516393",
      "tcKimlik": "21208571512",
      "email": "serracelik2012@gmail.com",
      "basRaw": "01.09.2025",
      "bitRaw": "01.09.2026",
      "kiraBedeli": 11075.0,
      "baslangiç": "2025-09-01",
      "bitis": "2026-09-01"
    }
  ],
  "24": [
    {
      "ad": "SERZHAN",
      "soyad": "PETROV",
      "telefon": "05527830356",
      "tcKimlik": null,
      "email": "petrovserjan777@gmail.com",
      "basRaw": "12.11.2025",
      "bitRaw": "12.08.2026",
      "kiraBedeli": 13500.0,
      "baslangiç": "2025-11-12",
      "bitis": "2026-08-12"
    }
  ],
  "25": [
    {
      "ad": "MERTCAN",
      "soyad": "KÖSEOGLU",
      "telefon": "05062660909",
      "tcKimlik": "18698660420",
      "email": "mertcankoseoglu@outlook.com",
      "basRaw": "01.09.2025",
      "bitRaw": "01.09.2026",
      "kiraBedeli": 13900.0,
      "baslangiç": "2025-09-01",
      "bitis": "2026-09-01"
    }
  ],
  "26": [
    {
      "ad": "MUHAMMET",
      "soyad": "MERT TUR",
      "telefon": "05524643385",
      "tcKimlik": "40423519468",
      "email": "m.merttu@hotmail.com",
      "basRaw": "12.11.2025",
      "bitRaw": "12.06.2026",
      "kiraBedeli": 13500.0,
      "baslangiç": "2025-11-12",
      "bitis": "2026-06-12"
    }
  ],
  "27": [
    {
      "ad": "AHMET",
      "soyad": "BİLİŞİK",
      "telefon": "05531039410",
      "tcKimlik": "13126975992",
      "email": "ahmet.b.l.s.k12@gmail.com",
      "basRaw": "05.11.2025",
      "bitRaw": "05.08.2026",
      "kiraBedeli": 13500.0,
      "baslangiç": "2025-11-05",
      "bitis": "2026-08-05"
    }
  ],
  "28": [
    {
      "ad": "ESLEM",
      "soyad": "ÇAĞLAK",
      "telefon": "05523420282",
      "tcKimlik": "12338500800",
      "email": "eslemcaglak06@gmail.com",
      "basRaw": "08.11.2025",
      "bitRaw": "08.07.2026",
      "kiraBedeli": 13500.0,
      "baslangiç": "2025-11-08",
      "bitis": "2026-07-08"
    }
  ],
  "29": [
    {
      "ad": "BERKAY",
      "soyad": "ÖEKMEZ",
      "telefon": "05530953407",
      "tcKimlik": "25691004366",
      "email": "berkaycekmez10@gmail.com",
      "basRaw": "28.11.2025",
      "bitRaw": "28.06.2026",
      "kiraBedeli": 13500.0,
      "baslangiç": "2025-11-28",
      "bitis": "2026-06-28"
    }
  ],
  "30": [
    {
      "ad": "İSMAİL",
      "soyad": "BERK KARA",
      "telefon": "05412975321",
      "tcKimlik": "4988731446",
      "email": "iberkkara5461@gmail.com",
      "basRaw": "01.09.2025",
      "bitRaw": "01.09.2026",
      "kiraBedeli": 13900.0,
      "baslangiç": "2025-09-01",
      "bitis": "2026-09-01"
    }
  ],
  "31": [
    {
      "ad": "ENES",
      "soyad": "GEM",
      "telefon": "05415718482",
      "tcKimlik": "10257117048",
      "email": "enesgem4@gmail.com",
      "basRaw": "23.10.2025",
      "bitRaw": "23.09.2026",
      "kiraBedeli": 15200.0,
      "baslangiç": "2025-10-23",
      "bitis": "2026-09-23"
    }
  ],
  "32": [
    {
      "ad": "ZEYNEP",
      "soyad": "YILMAZ",
      "telefon": "055168423644",
      "tcKimlik": "13247925654",
      "email": "zeyil8320@gmail.com",
      "basRaw": "28.11.2025",
      "bitRaw": "28.07.2026",
      "kiraBedeli": 13500.0,
      "baslangiç": "2025-11-28",
      "bitis": "2026-07-28"
    },
    {
      "ad": "MELEK",
      "soyad": "YILMAZ",
      "telefon": "05510772228",
      "tcKimlik": "13247925890",
      "email": "melek112005@gmail.com",
      "basRaw": "",
      "bitRaw": "",
      "kiraBedeli": null,
      "baslangiç": null,
      "bitis": null
    }
  ],
  "33": [
    {
      "ad": "ENES",
      "soyad": "ERTÖRK",
      "telefon": "05446085225",
      "tcKimlik": "12353514554",
      "email": "eneserturk508@gmail.com",
      "basRaw": "01.12.2025",
      "bitRaw": "01.09.2026",
      "kiraBedeli": 13500.0,
      "baslangiç": "2025-12-01",
      "bitis": "2026-09-01"
    }
  ],
  "34": [
    {
      "ad": "YUSUF",
      "soyad": "ARSLAN",
      "telefon": "05442625429",
      "tcKimlik": "22249596144",
      "email": "yusoxarslan@gmail.com",
      "basRaw": "01.09.2025",
      "bitRaw": "01.09.2026",
      "kiraBedeli": 11100.0,
      "baslangiç": "2025-09-01",
      "bitis": "2026-09-01"
    }
  ],
  "35": [
    {
      "ad": "HEMATULLAH",
      "soyad": "NIAZY",
      "telefon": "05455800510",
      "tcKimlik": null,
      "email": "hematullahniazy@gmail.com",
      "basRaw": "05.12.2025",
      "bitRaw": "05.07.2026",
      "kiraBedeli": 13000.0,
      "baslangiç": "2025-12-05",
      "bitis": "2026-07-05"
    },
    {
      "ad": "SAADULLAH",
      "soyad": "SHINWAR",
      "telefon": "05454133244",
      "tcKimlik": null,
      "email": "saadullahshinwari23@gmail.com",
      "basRaw": "",
      "bitRaw": "",
      "kiraBedeli": null,
      "baslangiç": null,
      "bitis": null
    }
  ],
  "36": [
    {
      "ad": "AHMET",
      "soyad": "KOBAK",
      "telefon": "05456024136",
      "tcKimlik": "11593944152",
      "email": "akobak76@gmail.com",
      "basRaw": "02.09.2025",
      "bitRaw": "02.09.2026",
      "kiraBedeli": 16000.0,
      "baslangiç": "2025-09-02",
      "bitis": "2026-09-02"
    }
  ],
  "37": [
    {
      "ad": "UTKU",
      "soyad": "ATMACA",
      "telefon": "05421532758",
      "tcKimlik": "17530083748",
      "email": "utkuatmaca1357642@gmail.com",
      "basRaw": "08.04.2025",
      "bitRaw": "31.08.2026",
      "kiraBedeli": 15300.0,
      "baslangiç": "2025-04-08",
      "bitis": "2026-08-31"
    }
  ],
  "41": [
    {
      "ad": "FIRAT",
      "soyad": "BOZKURT",
      "telefon": "05315648375",
      "tcKimlik": "25181669716",
      "email": "crespo_emre@hotmail.com",
      "basRaw": "01.10.2025",
      "bitRaw": "01.09.2026",
      "kiraBedeli": 15500.0,
      "baslangiç": "2025-10-01",
      "bitis": "2026-09-01"
    },
    {
      "ad": "EMRAH",
      "soyad": "KAYAKLI",
      "telefon": "05347323556",
      "tcKimlik": "34642528004",
      "email": "emrahkayakli99@gmail.com",
      "basRaw": "",
      "bitRaw": "",
      "kiraBedeli": null,
      "baslangiç": null,
      "bitis": null
    }
  ],
  "42": [
    {
      "ad": "HİLMİ",
      "soyad": "ZAKİR GÖVEN",
      "telefon": "05313766690",
      "tcKimlik": "61120435080",
      "email": "zakirgvn68@icloud.com",
      "basRaw": "30.08.2025",
      "bitRaw": "30.08.2026",
      "kiraBedeli": 20500.0,
      "baslangiç": "2025-08-30",
      "bitis": "2026-08-30"
    }
  ],
  "43": [
    {
      "ad": "TARANA",
      "soyad": "",
      "telefon": "05319463153",
      "tcKimlik": null,
      "email": "pashayevatarana2@gmail.com",
      "basRaw": "05.01.2026",
      "bitRaw": "05.07.2026",
      "kiraBedeli": 16000.0,
      "baslangiç": "2026-01-05",
      "bitis": "2026-07-05"
    },
    {
      "ad": "DİLEK",
      "soyad": "BAYRAMBAŞ",
      "telefon": "05355240861",
      "tcKimlik": "12912117936",
      "email": "dilekbayrambas6152@icloud.com",
      "basRaw": "",
      "bitRaw": "",
      "kiraBedeli": null,
      "baslangiç": null,
      "bitis": null
    }
  ],
  "44": [
    {
      "ad": "LEYLA",
      "soyad": "YEŞİLYURT",
      "telefon": "05461031161",
      "tcKimlik": "62899309466",
      "email": "lalayeshilyurt@gmail.com",
      "basRaw": "01.06.2025",
      "bitRaw": "01.06.2026",
      "kiraBedeli": 13814.0,
      "baslangiç": "2025-06-01",
      "bitis": "2026-06-01"
    },
    {
      "ad": "KEZBAN",
      "soyad": "ECENUR ATICI",
      "telefon": "05520792934",
      "tcKimlik": "11765187264",
      "email": "aticiecenur02@gmail.com",
      "basRaw": "",
      "bitRaw": "",
      "kiraBedeli": null,
      "baslangiç": null,
      "bitis": null
    }
  ],
  "50": [
    {
      "ad": "BERFİN",
      "soyad": "YILMAZ",
      "telefon": "05461757178",
      "tcKimlik": "70219080636",
      "email": "berrfiinoo@icloud.com",
      "basRaw": "11.04.2026",
      "bitRaw": "11.07",
      "kiraBedeli": 16000.0,
      "baslangiç": "2026-04-11",
      "bitis": null
    }
  ],
  "51": [
    {
      "ad": "TOLGANAY",
      "soyad": "ZHYLKY",
      "telefon": "77088151945",
      "tcKimlik": null,
      "email": "zhatabai@gmail.com",
      "basRaw": "YURT",
      "bitRaw": "YURT",
      "kiraBedeli": 8000.0,
      "baslangiç": null,
      "bitis": null
    },
    {
      "ad": "KASYMOVA",
      "soyad": "SABRINA",
      "telefon": "77022716377",
      "tcKimlik": null,
      "email": "sabrinakasymora156@gmail.com",
      "basRaw": "YURT",
      "bitRaw": "YURT",
      "kiraBedeli": null,
      "baslangiç": null,
      "bitis": null
    },
    {
      "ad": "KARATAYEVA",
      "soyad": "AIYM",
      "telefon": "77015412274",
      "tcKimlik": null,
      "email": "aiymkarataeva14@gmail.com",
      "basRaw": "YURT",
      "bitRaw": "YURT",
      "kiraBedeli": null,
      "baslangiç": null,
      "bitis": null
    }
  ],
  "52": [
    {
      "ad": "ZEYNEP",
      "soyad": "TANIKULU",
      "telefon": "05384213907",
      "tcKimlik": "25510428052",
      "email": "zeynep.tanrikulu@ogr.sakarya.edu.tr",
      "basRaw": "03.09.2025",
      "bitRaw": "03.09.2026",
      "kiraBedeli": 16600.0,
      "baslangiç": "2025-09-03",
      "bitis": "2026-09-03"
    }
  ],
  "53": [
    {
      "ad": "GONCA",
      "soyad": "AKPOLAT",
      "telefon": "05334160928",
      "tcKimlik": "10904682370",
      "email": "akpolatgonca@gmail.com",
      "basRaw": "28.08.2025",
      "bitRaw": "28.08.2026",
      "kiraBedeli": 15200.0,
      "baslangiç": "2025-08-28",
      "bitis": "2026-08-28"
    }
  ],
  "54": [
    {
      "ad": "ŞEVVAL",
      "soyad": "KÜÇÜK",
      "telefon": "05530456125",
      "tcKimlik": "66262094904",
      "email": "sevvalkckk@icloud.com",
      "basRaw": "01.09.2025",
      "bitRaw": "01.09.2026",
      "kiraBedeli": 17500.0,
      "baslangiç": "2025-09-01",
      "bitis": "2026-09-01"
    }
  ],
  "55": [
    {
      "ad": "ALPEREN",
      "soyad": "CAMCI",
      "telefon": "05419051722",
      "tcKimlik": "15161120476",
      "email": "alperencamci67@gmail.com",
      "basRaw": "20.07.2025",
      "bitRaw": "20.07.2026",
      "kiraBedeli": 17500.0,
      "baslangiç": "2025-07-20",
      "bitis": "2026-07-20"
    }
  ],
  "56": [
    {
      "ad": "İCLAL",
      "soyad": "ERBALTA",
      "telefon": "05537306568",
      "tcKimlik": "66151313512",
      "email": "iclalerbalta1@gmail.com",
      "basRaw": "01.09.2025",
      "bitRaw": "01.09.2026",
      "kiraBedeli": 11420.0,
      "baslangiç": "2025-09-01",
      "bitis": "2026-09-01"
    }
  ],
  "57": [
    {
      "ad": "CEMİLE",
      "soyad": "SÜMEYYE KAVRAK",
      "telefon": "05377606842",
      "tcKimlik": "57136199832",
      "email": "sumkav1801@gmail.com",
      "basRaw": "06.11.2025",
      "bitRaw": "06.07.2026",
      "kiraBedeli": 13500.0,
      "baslangiç": "2025-11-06",
      "bitis": "2026-07-06"
    }
  ],
  "58": [
    {
      "ad": "YİĞİT",
      "soyad": "BAYRAKTAR",
      "telefon": "05071720870",
      "tcKimlik": "12149649286",
      "email": "bayraktaryigit07@gmail.com",
      "basRaw": "04.09.2025",
      "bitRaw": "04.09.2026",
      "kiraBedeli": 17500.0,
      "baslangiç": "2025-09-04",
      "bitis": "2026-09-04"
    }
  ],
  "59": [
    {
      "ad": "LEILA",
      "soyad": "ABEDIFARD",
      "telefon": "05359882095",
      "tcKimlik": null,
      "email": "leyla.abedifard1@gmail.com",
      "basRaw": "12.09.2025",
      "bitRaw": "12.09.2026",
      "kiraBedeli": 17500.0,
      "baslangiç": "2025-09-12",
      "bitis": "2026-09-12"
    }
  ],
  "60": [
    {
      "ad": "MAIDE",
      "soyad": "AFŞAR",
      "telefon": "05541900374",
      "tcKimlik": "11555720466",
      "email": "sudeaf43@gmail.com",
      "basRaw": "08.09.2025",
      "bitRaw": "08.09.2026",
      "kiraBedeli": 17500.0,
      "baslangiç": "2025-09-08",
      "bitis": "2026-09-08"
    }
  ],
  "61": [
    {
      "ad": "SILA",
      "soyad": "BALCI",
      "telefon": "05393346278",
      "tcKimlik": "40753366442",
      "email": "sbsilabalci@gmail.com",
      "basRaw": "01.09.2025",
      "bitRaw": "01.09.2026",
      "kiraBedeli": 13000.0,
      "baslangiç": "2025-09-01",
      "bitis": "2026-09-01"
    }
  ],
  "62": [
    {
      "ad": "MEHMET",
      "soyad": "DEMIR KALABALIK",
      "telefon": "05331915515",
      "tcKimlik": "17666272895",
      "email": "demirkalabalik@hotmail.com",
      "basRaw": "01.09.2025",
      "bitRaw": "01.09.2026",
      "kiraBedeli": 9300.0,
      "baslangiç": "2025-09-01",
      "bitis": "2026-09-01"
    }
  ],
  "63": [
    {
      "ad": "TUANNA",
      "soyad": "YILDIRIM",
      "telefon": "05538402103",
      "tcKimlik": "133728852298",
      "email": "tuannayildirim16@hotmail.com",
      "basRaw": "01.09.2025",
      "bitRaw": "01.09.2026",
      "kiraBedeli": 18000.0,
      "baslangiç": "2025-09-01",
      "bitis": "2026-09-01"
    }
  ],
  "64": [
    {
      "ad": "YİĞİT",
      "soyad": "YILMAZ İLHAN",
      "telefon": "05445711500",
      "tcKimlik": "28462965552",
      "email": "yigityilmazilhan3@gmail.com",
      "basRaw": "01.09.2025",
      "bitRaw": "01.09.2026",
      "kiraBedeli": 18000.0,
      "baslangiç": "2025-09-01",
      "bitis": "2026-09-01"
    }
  ],
  "65": [
    {
      "ad": "EMİRCAN",
      "soyad": "ÜNCÜ",
      "telefon": "05530064558",
      "tcKimlik": "42919538540",
      "email": "emir-emir@hotmail.com",
      "basRaw": "01.09.2025",
      "bitRaw": "01.09.2026",
      "kiraBedeli": 12260.0,
      "baslangiç": "2025-09-01",
      "bitis": "2026-09-01"
    }
  ],
  "66": [
    {
      "ad": "ERAY",
      "soyad": "UFUK ERBAŞ",
      "telefon": "05514470596",
      "tcKimlik": "44470564396",
      "email": "erayufukofficial@gmail.com",
      "basRaw": "01.09.2025",
      "bitRaw": "01.09.2026",
      "kiraBedeli": 16750.0,
      "baslangiç": "2025-09-01",
      "bitis": "2026-09-01"
    }
  ],
  "67": [
    {
      "ad": "METEHAN",
      "soyad": "SOY",
      "telefon": "5539764577",
      "tcKimlik": "51046338954",
      "email": "metehansoy2005@hotmail.com",
      "basRaw": "07.07.2025",
      "bitRaw": "07.07.2026",
      "kiraBedeli": 17500.0,
      "baslangiç": "2025-07-07",
      "bitis": "2026-07-07"
    }
  ],
  "68": [
    {
      "ad": "MELTEM",
      "soyad": "ÖILDIROGLU",
      "telefon": "05550563537",
      "tcKimlik": "13673532730",
      "email": "cildir.meltem0911@gmail.com",
      "basRaw": "06.09.2025",
      "bitRaw": "06.09.2026",
      "kiraBedeli": 16600.0,
      "baslangiç": "2025-09-06",
      "bitis": "2026-09-06"
    }
  ],
  "69": [
    {
      "ad": "ANTON",
      "soyad": "SINITSYN",
      "telefon": "05379366135",
      "tcKimlik": "98650153962",
      "email": "toni.sinitsyn.06@gmail.com",
      "basRaw": "21.11.2025",
      "bitRaw": "21.07.2026",
      "kiraBedeli": 13500.0,
      "baslangiç": "2025-11-21",
      "bitis": "2026-07-21"
    }
  ],
  "70": [
    {
      "ad": "ÖMER",
      "soyad": "FARUK KESKİN",
      "telefon": "05519870990",
      "tcKimlik": "20593893728",
      "email": "omerfarukkeskin145@gmail.com",
      "basRaw": "01.09.2025",
      "bitRaw": "01.09.2026",
      "kiraBedeli": 10040.0,
      "baslangiç": "2025-09-01",
      "bitis": "2026-09-01"
    }
  ],
  "71": [
    {
      "ad": "AISSATOU",
      "soyad": "KA",
      "telefon": "05528934347",
      "tcKimlik": null,
      "email": "aissatouka13@icloud.com",
      "basRaw": "13.11.2025",
      "bitRaw": "13.07.2026",
      "kiraBedeli": 13500.0,
      "baslangiç": "2025-11-13",
      "bitis": "2026-07-13"
    },
    {
      "ad": "KEITA",
      "soyad": "BINTOU",
      "telefon": "22374540618",
      "tcKimlik": null,
      "email": "bk2968173@gmail.com",
      "basRaw": "",
      "bitRaw": "",
      "kiraBedeli": null,
      "baslangiç": null,
      "bitis": null
    }
  ],
  "72": [
    {
      "ad": "MUHAMMED",
      "soyad": "EMİR CIGA",
      "telefon": "05415317810",
      "tcKimlik": "11540832532",
      "email": "emirciga47@gmail.com",
      "basRaw": "27.09.2025",
      "bitRaw": "27.09.2026",
      "kiraBedeli": 16000.0,
      "baslangiç": "2025-09-27",
      "bitis": "2026-09-27"
    }
  ],
  "73": [
    {
      "ad": "FAWAD",
      "soyad": "DILAWAR",
      "telefon": "05539512693",
      "tcKimlik": null,
      "email": "fawaddilawar24@gmail.com",
      "basRaw": "01.09.2025",
      "bitRaw": "01.09.2026",
      "kiraBedeli": 13900.0,
      "baslangiç": "2025-09-01",
      "bitis": "2026-09-01"
    },
    {
      "ad": "FAWAD",
      "soyad": "DILAWAR",
      "telefon": "05539512693",
      "tcKimlik": null,
      "email": "alisajaddilawar@gmail.com",
      "basRaw": "",
      "bitRaw": "",
      "kiraBedeli": null,
      "baslangiç": null,
      "bitis": null
    }
  ],
  "74": [
    {
      "ad": "YUSUF",
      "soyad": "KEREM CABUL",
      "telefon": "05382910702",
      "tcKimlik": "62929016814",
      "email": "yusuf.kerem.2001@hotmail.co",
      "basRaw": "31.07.2025",
      "bitRaw": "31.07.2026",
      "kiraBedeli": 16000.0,
      "baslangiç": "2025-07-31",
      "bitis": "2026-07-31"
    }
  ],
  "75": [
    {
      "ad": "ÇAĞATAY",
      "soyad": "TÜTÜNCÜ",
      "telefon": "05442517946",
      "tcKimlik": "54934687400",
      "email": "cagatay.tutuncu7710@gmail.com",
      "basRaw": "01.09.2025",
      "bitRaw": "01.09.2026",
      "kiraBedeli": 13900.0,
      "baslangiç": "2025-09-01",
      "bitis": "2026-09-01"
    }
  ],
  "76": [
    {
      "ad": "FATİH",
      "soyad": "FURKAN UZUNGÖNÖL",
      "telefon": "05447794325",
      "tcKimlik": "31507067166",
      "email": "furkan_uzungonul@icloud.com",
      "basRaw": "01.09.2025",
      "bitRaw": "01.09.2026",
      "kiraBedeli": 13900.0,
      "baslangiç": "2025-09-01",
      "bitis": "2026-09-01"
    }
  ],
  "77": [
    {
      "ad": "ERAY",
      "soyad": "DEGIRMENCI",
      "telefon": "05456465497",
      "tcKimlik": "28102235946",
      "email": "eray3987@gmail.com",
      "basRaw": "01.09.2025",
      "bitRaw": "02.09.2025",
      "kiraBedeli": 13900.0,
      "baslangiç": "2025-09-01",
      "bitis": "2025-09-02"
    }
  ],
  "78": [
    {
      "ad": "IBROKHIMJON",
      "soyad": "ABDUJALILOV",
      "telefon": "05343590253",
      "tcKimlik": null,
      "email": "abdujalilovibrohimjon2006@gmail.com",
      "basRaw": "03.11.2025",
      "bitRaw": "03.07.2026",
      "kiraBedeli": 13000.0,
      "baslangiç": "2025-11-03",
      "bitis": "2026-07-03"
    }
  ],
  "79": [
    {
      "ad": "SARBASSOVA",
      "soyad": "SAMIRA",
      "telefon": "7787473654065",
      "tcKimlik": null,
      "email": "samirasarbasova7@mail.ru",
      "basRaw": "19.11.2025",
      "bitRaw": "19.07.2026",
      "kiraBedeli": 13500.0,
      "baslangiç": "2025-11-19",
      "bitis": "2026-07-19"
    },
    {
      "ad": "ANELYA",
      "soyad": "SARZHAN",
      "telefon": "77027588955",
      "tcKimlik": null,
      "email": "anelyasarzhan@gmail.com",
      "basRaw": "",
      "bitRaw": "",
      "kiraBedeli": null,
      "baslangiç": null,
      "bitis": null
    }
  ],
  "80": [
    {
      "ad": "ALPEREN",
      "soyad": "EROL",
      "telefon": "05301265499",
      "tcKimlik": "65941104088",
      "email": "alperenerol.ae@gmail.com",
      "basRaw": "01.09.2025",
      "bitRaw": "01.09.2025",
      "kiraBedeli": 13900.0,
      "baslangiç": "2025-09-01",
      "bitis": "2025-09-01"
    }
  ],
  "81": [
    {
      "ad": "MEHMET",
      "soyad": "SELİM DERE",
      "telefon": "05076772949",
      "tcKimlik": "18524243414",
      "email": "dereselim1583@gmail.com",
      "basRaw": "01.09.2025",
      "bitRaw": "01.09.2025",
      "kiraBedeli": 10040.0,
      "baslangiç": "2025-09-01",
      "bitis": "2025-09-01"
    }
  ],
  "82": [
    {
      "ad": "EFEKAN",
      "soyad": "OCAK",
      "telefon": "05445046489",
      "tcKimlik": "10489956552",
      "email": "efeocak79@gmail.com",
      "basRaw": "29.09.2025",
      "bitRaw": "29.09.2026",
      "kiraBedeli": 15000.0,
      "baslangiç": "2025-09-29",
      "bitis": "2026-09-29"
    }
  ],
  "83": [
    {
      "ad": "ŞERİFCAN",
      "soyad": "DÖNERTAŞ",
      "telefon": "05352749107",
      "tcKimlik": "18944295406",
      "email": "serifcandonertas2003@gmail.com",
      "basRaw": "01.09.2025",
      "bitRaw": "01.09.2026",
      "kiraBedeli": 13900.0,
      "baslangiç": "2025-09-01",
      "bitis": "2026-09-01"
    }
  ],
  "84": [
    {
      "ad": "MEHMET",
      "soyad": "TAHA BEKTAŞ",
      "telefon": "05537185861",
      "tcKimlik": "29947913464",
      "email": "mehmettalha.bektas@gmail.com",
      "basRaw": "01.09.2025",
      "bitRaw": "01.09.2026",
      "kiraBedeli": 13900.0,
      "baslangiç": "2025-09-01",
      "bitis": "2026-09-01"
    }
  ],
  "85": [
    {
      "ad": "ERKIN",
      "soyad": "CHAQMAQ",
      "telefon": "93785415070",
      "tcKimlik": null,
      "email": "erkinchaqmaq2007@gmail.com",
      "basRaw": "11.11.2025",
      "bitRaw": "11.07.2026",
      "kiraBedeli": 13000.0,
      "baslangiç": "2025-11-11",
      "bitis": "2026-07-11"
    },
    {
      "ad": "SUBHAN",
      "soyad": "ALLAH ARIFI",
      "telefon": "93707131963",
      "tcKimlik": null,
      "email": "subhanarefi21@gmail.com",
      "basRaw": "",
      "bitRaw": "",
      "kiraBedeli": null,
      "baslangiç": null,
      "bitis": null
    }
  ],
  "86": [
    {
      "ad": "ÖMER",
      "soyad": "KAMER",
      "telefon": "05377285112",
      "tcKimlik": "31192169114",
      "email": "omerkamer17@gmail.com",
      "basRaw": "16.11.2025",
      "bitRaw": "16.08.2026",
      "kiraBedeli": 13000.0,
      "baslangiç": "2025-11-16",
      "bitis": "2026-08-16"
    }
  ],
  "87": [
    {
      "ad": "ENSAR",
      "soyad": "BOZKURT",
      "telefon": "05537898618",
      "tcKimlik": "13025610154",
      "email": "ensar.41.b@gmail.com",
      "basRaw": "14.11.2025",
      "bitRaw": "14.07.2026",
      "kiraBedeli": 13000.0,
      "baslangiç": "2025-11-14",
      "bitis": "2026-07-14"
    }
  ],
  "88": [
    {
      "ad": "DESTAN",
      "soyad": "ÖZAY",
      "telefon": "05432276012",
      "tcKimlik": "22810111646",
      "email": "destann_12@icloud.com",
      "basRaw": "19.08.2025",
      "bitRaw": "19.08.2026",
      "kiraBedeli": 16600.0,
      "baslangiç": "2025-08-19",
      "bitis": "2026-08-19"
    }
  ],
  "89": [
    {
      "ad": "MURAT",
      "soyad": "YILDIZ",
      "telefon": "05468178064",
      "tcKimlik": "53617472746",
      "email": "muraty078@gmail.com",
      "basRaw": "01.09.2025",
      "bitRaw": "01.09.2026",
      "kiraBedeli": 13190.0,
      "baslangiç": "2025-09-01",
      "bitis": "2026-09-01"
    }
  ],
  "90": [
    {
      "ad": "ABDULRAHMAN",
      "soyad": "ALSHAYEB",
      "telefon": "05362092150",
      "tcKimlik": null,
      "email": "ar.shayeb@gmail.com",
      "basRaw": "13.11.2025",
      "bitRaw": "13.07.2026",
      "kiraBedeli": 13500.0,
      "baslangiç": "2025-11-13",
      "bitis": "2026-07-13"
    },
    {
      "ad": "AMMAR",
      "soyad": "ALHALABI",
      "telefon": "05528518010",
      "tcKimlik": null,
      "email": "ammaralhalabi13@gmail.com",
      "basRaw": "",
      "bitRaw": "",
      "kiraBedeli": null,
      "baslangiç": null,
      "bitis": null
    }
  ],
  "91": [
    {
      "ad": "EMİR",
      "soyad": "ALİ KAYGUSUZ",
      "telefon": "05394644034",
      "tcKimlik": "13108891944",
      "email": "Emiralikaygusuz81@gmail.com",
      "basRaw": "29.10.2025",
      "bitRaw": "29.08.2026",
      "kiraBedeli": 13000.0,
      "baslangiç": "2025-10-29",
      "bitis": "2026-08-29"
    }
  ],
  "92": [
    {
      "ad": "ENES",
      "soyad": "COSKUN",
      "telefon": "05464715493",
      "tcKimlik": "14417765094",
      "email": "enescsnn@gmail.com",
      "basRaw": "03.11.2025",
      "bitRaw": "03.07.2026",
      "kiraBedeli": 13000.0,
      "baslangiç": "2025-11-03",
      "bitis": "2026-07-03"
    }
  ],
  "93": [
    {
      "ad": "MUSTAFA",
      "soyad": "ABANOZ",
      "telefon": "05050311461",
      "tcKimlik": "14537561248",
      "email": "mustafaabanoz66@gmail.com",
      "basRaw": "15.11.2025",
      "bitRaw": "15.07.2026",
      "kiraBedeli": 13500.0,
      "baslangiç": "2025-11-15",
      "bitis": "2026-07-15"
    }
  ],
  "94": [
    {
      "ad": "MUHAMMET",
      "soyad": "UMUT UYGUR",
      "telefon": "05519461916",
      "tcKimlik": "10627962520",
      "email": "umutuygur94@gmail.com",
      "basRaw": "14.09.2025",
      "bitRaw": "14.09.2026",
      "kiraBedeli": 16000.0,
      "baslangiç": "2025-09-14",
      "bitis": "2026-09-14"
    }
  ],
  "95": [
    {
      "ad": "AHMET",
      "soyad": "KUMRU",
      "telefon": "05466518020",
      "tcKimlik": "12361916616",
      "email": "ahmetkumru2020@gmail.com",
      "basRaw": "01.09.2025",
      "bitRaw": "01.09.2026",
      "kiraBedeli": 17000.0,
      "baslangiç": "2025-09-01",
      "bitis": "2026-09-01"
    }
  ],
  "96": [
    {
      "ad": "ERVA",
      "soyad": "ADIYAMAN",
      "telefon": "05437493129",
      "tcKimlik": "34489897080",
      "email": "ervaadiyaman@gmail.com",
      "basRaw": "16.09.2025",
      "bitRaw": "16.09.2026",
      "kiraBedeli": 13780.0,
      "baslangiç": "2025-09-16",
      "bitis": "2026-09-16"
    }
  ],
  "97": [
    {
      "ad": "BARIŞ",
      "soyad": "TUTUS",
      "telefon": "05342449675",
      "tcKimlik": "34207591696",
      "email": "tutusbrs@gmail.com",
      "basRaw": "10.07.2025",
      "bitRaw": "10.07.2026",
      "kiraBedeli": 14770.0,
      "baslangiç": "2025-07-10",
      "bitis": "2026-07-10"
    }
  ],
  "98": [
    {
      "ad": "MAHMUD",
      "soyad": "CHAZLI",
      "telefon": "05300902590",
      "tcKimlik": "34601417950",
      "email": "mahmudch12@gmail.com",
      "basRaw": "15.09.2025",
      "bitRaw": "15.09.2026",
      "kiraBedeli": 16000.0,
      "baslangiç": "2025-09-15",
      "bitis": "2026-09-15"
    }
  ],
  "99": [
    {
      "ad": "EBRU",
      "soyad": "TOMBAS",
      "telefon": "05511769586",
      "tcKimlik": "10037454240",
      "email": "ebrutombaas@gmail.com",
      "basRaw": "01.09.2025",
      "bitRaw": "01.09.2026",
      "kiraBedeli": 17500.0,
      "baslangiç": "2025-09-01",
      "bitis": "2026-09-01"
    }
  ],
  "100": [
    {
      "ad": "ŞEVVAL",
      "soyad": "ESGI",
      "telefon": "05448541411",
      "tcKimlik": "34972032998",
      "email": "sevvalesgi@icloud.com",
      "basRaw": "10.02.2025",
      "bitRaw": "10.09.2026",
      "kiraBedeli": 16600.0,
      "baslangiç": "2025-02-10",
      "bitis": "2026-09-10"
    }
  ],
  "101": [
    {
      "ad": "İREM",
      "soyad": "MERVE KARTAL",
      "telefon": "05013696907",
      "tcKimlik": "99919503016",
      "email": "iremmervekartal172@gmail.com",
      "basRaw": "02.08.2025",
      "bitRaw": "02.08.2026",
      "kiraBedeli": 18000.0,
      "baslangiç": "2025-08-02",
      "bitis": "2026-08-02"
    }
  ],
  "102": [
    {
      "ad": "HAYRUNISA",
      "soyad": "ÖDEMIS",
      "telefon": "05465809599",
      "tcKimlik": "15356389976",
      "email": "hhayrunisa.odemis@gmail.com",
      "basRaw": "01.09.2025",
      "bitRaw": "01.09.2026",
      "kiraBedeli": 18000.0,
      "baslangiç": "2025-09-01",
      "bitis": "2026-09-01"
    }
  ],
  "103": [
    {
      "ad": "FURKAN",
      "soyad": "TURHAN",
      "telefon": "05394899693",
      "tcKimlik": "10214269612",
      "email": "turhanfurkan169@gmail.com",
      "basRaw": "01.09.2025",
      "bitRaw": "01.09.2026",
      "kiraBedeli": 18000.0,
      "baslangiç": "2025-09-01",
      "bitis": "2026-09-01"
    }
  ],
  "104": [
    {
      "ad": "HİDAYET",
      "soyad": "AYDIN",
      "telefon": "05406451616",
      "tcKimlik": "22045539628",
      "email": "hidayetaydn@hotmail.com",
      "basRaw": "01.09.2025",
      "bitRaw": "01.09.2026",
      "kiraBedeli": 11550.0,
      "baslangiç": "2025-09-01",
      "bitis": "2026-09-01"
    }
  ],
  "105": [
    {
      "ad": "GÖKÇE",
      "soyad": "AKKAYA",
      "telefon": "05539738606",
      "tcKimlik": "13658444218",
      "email": "akkayagokce2@gmail.com",
      "basRaw": "03.09.2025",
      "bitRaw": "03.09.2026",
      "kiraBedeli": 18000.0,
      "baslangiç": "2025-09-03",
      "bitis": "2026-09-03"
    }
  ],
  "106": [
    {
      "ad": "SUDE",
      "soyad": "NUR VATANSEVER",
      "telefon": "05469309208",
      "tcKimlik": "32836211534",
      "email": "sudenurvatansever6@gmail.com",
      "basRaw": "08.06.2025",
      "bitRaw": "08.06.2026",
      "kiraBedeli": 17500.0,
      "baslangiç": "2025-06-08",
      "bitis": "2026-06-08"
    }
  ],
  "107": [
    {
      "ad": "TUANA",
      "soyad": "ÖZKAN",
      "telefon": "05331503034",
      "tcKimlik": "32446814552",
      "email": "ozkan.tuana@icloud.com",
      "basRaw": "01.08.2025",
      "bitRaw": "01.08.2026",
      "kiraBedeli": 14000.0,
      "baslangiç": "2025-08-01",
      "bitis": "2026-08-01"
    }
  ],
  "108": [
    {
      "ad": "ŞULE",
      "soyad": "ÇAKIR",
      "telefon": "05465903716",
      "tcKimlik": "54235503300",
      "email": "sulecakir45@gmail.com",
      "basRaw": "01.08.2025",
      "bitRaw": "01.08.2026",
      "kiraBedeli": 13900.0,
      "baslangiç": "2025-08-01",
      "bitis": "2026-08-01"
    }
  ],
  "109": [
    {
      "ad": "LAMİA",
      "soyad": "GENÇ",
      "telefon": "05527288612",
      "tcKimlik": "28214231126",
      "email": "lamia_genc@icloud.com",
      "basRaw": "01.08.2025",
      "bitRaw": "01.08.2026",
      "kiraBedeli": 11520.0,
      "baslangiç": "2025-08-01",
      "bitis": "2026-08-01"
    }
  ],
  "110": [
    {
      "ad": "YAREN",
      "soyad": "GÖÖ",
      "telefon": "05061383975",
      "tcKimlik": "10972962152",
      "email": "yarennguc@gmail.com",
      "basRaw": "16.08.2025",
      "bitRaw": "16.08.2026",
      "kiraBedeli": 12500.0,
      "baslangiç": "2025-08-16",
      "bitis": "2026-08-16"
    }
  ],
  "111": [
    {
      "ad": "BEYZA",
      "soyad": "AKSU",
      "telefon": "05434759550",
      "tcKimlik": "17888017426",
      "email": "aaksubbeyaz@gmail.com",
      "basRaw": "16.08.2025",
      "bitRaw": "16.08.2026",
      "kiraBedeli": 13190.0,
      "baslangiç": "2025-08-16",
      "bitis": "2026-08-16"
    }
  ],
  "112": [
    {
      "ad": "YUSUF",
      "soyad": "KARADURAN",
      "telefon": "05385959414",
      "tcKimlik": "27982380616",
      "email": "yusufkaraduran@hotmail.com",
      "basRaw": "01.09.2025",
      "bitRaw": "01.09.2026",
      "kiraBedeli": 11780.0,
      "baslangiç": "2025-09-01",
      "bitis": "2026-09-01"
    }
  ],
  "113": [
    {
      "ad": "BURAK",
      "soyad": "KILICARSLAN",
      "telefon": "05011036767",
      "tcKimlik": "11052096194",
      "email": "burak_kilicarslan@outlook.com",
      "basRaw": "26.08.2025",
      "bitRaw": "26.08.2026",
      "kiraBedeli": 18000.0,
      "baslangiç": "2025-08-26",
      "bitis": "2026-08-26"
    }
  ],
  "114": [
    {
      "ad": "RAHMI",
      "soyad": "DENIZ KALKAVAN",
      "telefon": "05544937069",
      "tcKimlik": "34567901432",
      "email": "kalkavan02@gmail.com",
      "basRaw": "01.09.2025",
      "bitRaw": "01.09.2026",
      "kiraBedeli": 11780.0,
      "baslangiç": "2025-09-01",
      "bitis": "2026-09-01"
    }
  ],
  "115": [
    {
      "ad": "NISA",
      "soyad": "ZEHRA YAZICI",
      "telefon": "05469416188",
      "tcKimlik": "10517696634",
      "email": "nisayazici438@gmail.com",
      "basRaw": "30.10.2025",
      "bitRaw": "30.06.2026",
      "kiraBedeli": 13500.0,
      "baslangiç": "2025-10-30",
      "bitis": "2026-06-30"
    }
  ],
  "116": [
    {
      "ad": "OSMAN",
      "soyad": "KORKMAZ",
      "telefon": "05303936340",
      "tcKimlik": "37678387942",
      "email": "krkosmn@gmail.com",
      "basRaw": "04.11.2025",
      "bitRaw": "04.09.2026",
      "kiraBedeli": 13500.0,
      "baslangiç": "2025-11-04",
      "bitis": "2026-09-04"
    }
  ],
  "117": [
    {
      "ad": "SAMI",
      "soyad": "DOGAN",
      "telefon": "05331616518",
      "tcKimlik": "16043367314",
      "email": "sd.samidogan@gmail.com",
      "basRaw": "01.09.2025",
      "bitRaw": "01.09.2026",
      "kiraBedeli": 12485.0,
      "baslangiç": "2025-09-01",
      "bitis": "2026-09-01"
    },
    {
      "ad": "KAAN",
      "soyad": "YILMAZ",
      "telefon": "05325433391",
      "tcKimlik": "24958154110",
      "email": "yilm0zkaan@gmail.com",
      "basRaw": "",
      "bitRaw": "",
      "kiraBedeli": null,
      "baslangiç": null,
      "bitis": null
    }
  ],
  "118": [
    {
      "ad": "KADIR",
      "soyad": "YÖKSEL",
      "telefon": "05534372177",
      "tcKimlik": "17941265184",
      "email": "kadir.yuksel941@gmail.com",
      "basRaw": "01.09.2025",
      "bitRaw": "01.09.2026",
      "kiraBedeli": 11910.0,
      "baslangiç": "2025-09-01",
      "bitis": "2026-09-01"
    }
  ],
  "119": [
    {
      "ad": "EYÖP",
      "soyad": "KARTAL",
      "telefon": "05075709177",
      "tcKimlik": "16969420322",
      "email": "keyup05@gmail.com",
      "basRaw": "15.09.2025",
      "bitRaw": "15.09.2026",
      "kiraBedeli": 16000.0,
      "baslangiç": "2025-09-15",
      "bitis": "2026-09-15"
    }
  ],
  "120": [
    {
      "ad": "MEKHRAVZO",
      "soyad": "BAKHRONBEKOVA",
      "telefon": "05012072484",
      "tcKimlik": null,
      "email": "bahronbekova@mail.ru",
      "basRaw": "01.09.2025",
      "bitRaw": "01.09.2026",
      "kiraBedeli": 12260.0,
      "baslangiç": "2025-09-01",
      "bitis": "2026-09-01"
    }
  ],
  "121": [
    {
      "ad": "GÖKAY",
      "soyad": "YİĞİT YANIKLAR",
      "telefon": "05380425535",
      "tcKimlik": "22520153134",
      "email": "yigit.gky2@gmail.com",
      "basRaw": "01.10.2025",
      "bitRaw": "01.10.2026",
      "kiraBedeli": 11700.0,
      "baslangiç": "2025-10-01",
      "bitis": "2026-10-01"
    }
  ],
  "122": [
    {
      "ad": "MUSTAFA",
      "soyad": "ULAS GÖLLÖ",
      "telefon": "05368464544",
      "tcKimlik": "21397324562",
      "email": "ulasgollu1309@outlook.com",
      "basRaw": "24.09.2025",
      "bitRaw": "24.09.2026",
      "kiraBedeli": 16000.0,
      "baslangiç": "2025-09-24",
      "bitis": "2026-09-24"
    }
  ],
  "123": [
    {
      "ad": "DOGA",
      "soyad": "CAN ALTAY",
      "telefon": "05350635863",
      "tcKimlik": "23729139264",
      "email": "doga2002_can@hotmail.com",
      "basRaw": "15.08.2025",
      "bitRaw": "15.08.2026",
      "kiraBedeli": 13896.0,
      "baslangiç": "2025-08-15",
      "bitis": "2026-08-15"
    }
  ],
  "124": [
    {
      "ad": "YUNUS",
      "soyad": "EMRE ISLAMOGLU",
      "telefon": "05317147643",
      "tcKimlik": "40540922950",
      "email": "yunusemreslamoglu@gmail.com",
      "basRaw": "03.11.2025",
      "bitRaw": "03.07.2026",
      "kiraBedeli": 13500.0,
      "baslangiç": "2025-11-03",
      "bitis": "2026-07-03"
    }
  ],
  "125": [
    {
      "ad": "YUNUS",
      "soyad": "AKMAN",
      "telefon": "05318853268",
      "tcKimlik": "10510963634",
      "email": "akmanyunus1903@gmail.com",
      "basRaw": "25.09.2025",
      "bitRaw": "25.09.2026",
      "kiraBedeli": 16000.0,
      "baslangiç": "2025-09-25",
      "bitis": "2026-09-25"
    }
  ],
  "126": [
    {
      "ad": "HAYRUNISA",
      "soyad": "SÖME",
      "telefon": "05546388005",
      "tcKimlik": "16684771730",
      "email": "hayrunisa.176@gmail.com",
      "basRaw": "28.09.2025",
      "bitRaw": "28.09.2026",
      "kiraBedeli": 15100.0,
      "baslangiç": "2025-09-28",
      "bitis": "2026-09-28"
    }
  ],
  "127": [
    {
      "ad": "GÖKTUG",
      "soyad": "YÜCEER",
      "telefon": "05315626140",
      "tcKimlik": "100227348016",
      "email": "goktug858@gmail.com",
      "basRaw": "03.07.2025",
      "bitRaw": "03.07.2026",
      "kiraBedeli": 18500.0,
      "baslangiç": "2025-07-03",
      "bitis": "2026-07-03"
    }
  ],
  "128": [
    {
      "ad": "ONUR",
      "soyad": "CANSEVER",
      "telefon": "05558953955",
      "tcKimlik": "48781278836",
      "email": "onurcansever39@gmail.com",
      "basRaw": "20.09.2025",
      "bitRaw": "20.08.2026",
      "kiraBedeli": 16000.0,
      "baslangiç": "2025-09-20",
      "bitis": "2026-08-20"
    }
  ],
  "129": [
    {
      "ad": "DAMLA",
      "soyad": "ÖETİN",
      "telefon": "05434516169",
      "tcKimlik": "15808825502",
      "email": "damlacetinn17@gmail.com",
      "basRaw": "01.09.2025",
      "bitRaw": "01.09.2026",
      "kiraBedeli": 11780.0,
      "baslangiç": "2025-09-01",
      "bitis": "2026-09-01"
    }
  ],
  "130": [
    {
      "ad": "ARDA",
      "soyad": "ARPACI",
      "telefon": "05519583376",
      "tcKimlik": "42595494574",
      "email": "ardaios99@icloud.com",
      "basRaw": "16.09.2025",
      "bitRaw": "16.09.2026",
      "kiraBedeli": 15000.0,
      "baslangiç": "2025-09-16",
      "bitis": "2026-09-16"
    }
  ],
  "131": [
    {
      "ad": "Alikhan",
      "soyad": "Kereyev",
      "telefon": "05377224405",
      "tcKimlik": "99094452710",
      "email": "alikhan200905@gmail.com",
      "basRaw": "25.02.2025",
      "bitRaw": "25.08.2026",
      "kiraBedeli": 16000.0,
      "baslangiç": "2025-02-25",
      "bitis": "2026-08-25"
    },
    {
      "ad": "KORKEM",
      "soyad": "ALIBAYEVA",
      "telefon": "05072387252",
      "tcKimlik": "99694392652",
      "email": "alibaevamk@gmail.com",
      "basRaw": "",
      "bitRaw": "",
      "kiraBedeli": null,
      "baslangiç": null,
      "bitis": null
    }
  ],
  "132": [
    {
      "ad": "ZILAN",
      "soyad": "KARAKOYUN",
      "telefon": "05317370285",
      "tcKimlik": "29260765276",
      "email": "zilankrkyn1@icloud.com",
      "basRaw": "08.09.2025",
      "bitRaw": "08.09.2026",
      "kiraBedeli": 17000.0,
      "baslangiç": "2025-09-08",
      "bitis": "2026-09-08"
    }
  ],
  "133": [
    {
      "ad": "YAVUZ",
      "soyad": "ENES TOKLUOGLU",
      "telefon": "05314742305",
      "tcKimlik": "10265657192",
      "email": "yavuzenes1905@gmail.com",
      "basRaw": "07.02.2025",
      "bitRaw": "07.08.2026",
      "kiraBedeli": 13900.0,
      "baslangiç": "2025-02-07",
      "bitis": "2026-08-07"
    }
  ],
  "134": [
    {
      "ad": "BERRAK",
      "soyad": "URAS",
      "telefon": "05343958955",
      "tcKimlik": "12134822632",
      "email": "berrak07uras@gmail.com",
      "basRaw": "26.09.2025",
      "bitRaw": "26.09.2025",
      "kiraBedeli": 16000.0,
      "baslangiç": "2025-09-26",
      "bitis": "2025-09-26"
    },
    {
      "ad": "BERKE",
      "soyad": "URAS",
      "telefon": "05439424551",
      "tcKimlik": "51166521434",
      "email": "berkeuras@gmail.com",
      "basRaw": "",
      "bitRaw": "",
      "kiraBedeli": null,
      "baslangiç": null,
      "bitis": null
    }
  ],
  "135": [
    {
      "ad": "ELIF",
      "soyad": "IREM ÖETİN",
      "telefon": "05318932106",
      "tcKimlik": "10800177420",
      "email": "elif.irem264@hotmail.com",
      "basRaw": "16.09.2025",
      "bitRaw": "16.09.2025",
      "kiraBedeli": 16000.0,
      "baslangiç": "2025-09-16",
      "bitis": "2025-09-16"
    }
  ],
  "136": [
    {
      "ad": "MUSTAFA",
      "soyad": "KORKUT BULUT",
      "telefon": "05432510809",
      "tcKimlik": "10445554570",
      "email": "Korkut.bulut@ogr.sakarya.edu.tr",
      "basRaw": "14.08.2025",
      "bitRaw": "14.08.2025",
      "kiraBedeli": 18000.0,
      "baslangiç": "2025-08-14",
      "bitis": "2025-08-14"
    }
  ],
  "137": [
    {
      "ad": "MEHMET",
      "soyad": "YIGIT MARZ",
      "telefon": "05348854485",
      "tcKimlik": "11902931354",
      "email": "yigit-61_marz@hotmail.com",
      "basRaw": "14.09.2025",
      "bitRaw": "14.09.2025",
      "kiraBedeli": 16000.0,
      "baslangiç": "2025-09-14",
      "bitis": "2025-09-14"
    }
  ],
  "138": [
    {
      "ad": "TUGRA",
      "soyad": "YAVUZ",
      "telefon": "05061264543",
      "tcKimlik": "24856918340",
      "email": "tugrayavuz258@gmail.com",
      "basRaw": "11.06.2025",
      "bitRaw": "11.06.2025",
      "kiraBedeli": 18000.0,
      "baslangiç": "2025-06-11",
      "bitis": "2025-06-11"
    }
  ],
  "139": [
    {
      "ad": "İBRAHİM",
      "soyad": "ÖZÜM",
      "telefon": "05346587336",
      "tcKimlik": "46027959754",
      "email": "ibrahimuzuum@gmail.com",
      "basRaw": "05.03.2025",
      "bitRaw": "05.09.2026",
      "kiraBedeli": 16720.0,
      "baslangiç": "2025-03-05",
      "bitis": "2026-09-05"
    }
  ],
  "140": [
    {
      "ad": "EREN",
      "soyad": "GÖLEÖ",
      "telefon": "05523799589",
      "tcKimlik": "10471930072",
      "email": "erenxl2006@gmail.com",
      "basRaw": "06.10.2025",
      "bitRaw": "06.10.2025",
      "kiraBedeli": 17750.0,
      "baslangiç": "2025-10-06",
      "bitis": "2025-10-06"
    }
  ],
  "141": [
    {
      "ad": "BENSU",
      "soyad": "AK",
      "telefon": "05541116080",
      "tcKimlik": "10333704506",
      "email": "Bensu_ak07@icloud.com",
      "basRaw": "04.11.2025",
      "bitRaw": "04.09.2025",
      "kiraBedeli": 13000.0,
      "baslangiç": "2025-11-04",
      "bitis": "2025-09-04"
    }
  ],
  "142": [
    {
      "ad": "NAZIM",
      "soyad": "EREN SATIROGLU",
      "telefon": "05387701674",
      "tcKimlik": "50149068980",
      "email": "nazimsatiroglu@gmail.com",
      "basRaw": "04.09.2025",
      "bitRaw": "04.09.2025",
      "kiraBedeli": 17000.0,
      "baslangiç": "2025-09-04",
      "bitis": "2025-09-04"
    }
  ],
  "143": [
    {
      "ad": "YUNUS",
      "soyad": "ORCUN POLAT",
      "telefon": "05384172708",
      "tcKimlik": "10205901064",
      "email": "Polatyunus4916@gmail.com",
      "basRaw": "13.10.2025",
      "bitRaw": "13.10.2025",
      "kiraBedeli": 17000.0,
      "baslangiç": "2025-10-13",
      "bitis": "2025-10-13"
    }
  ],
  "144": [
    {
      "ad": "DİLARA",
      "soyad": "ERDAGI",
      "telefon": "05379658241",
      "tcKimlik": "40270618536",
      "email": "dilaraerdagi2001@gmail.com",
      "basRaw": "20.05.2025",
      "bitRaw": "20.05.2026",
      "kiraBedeli": 17440.0,
      "baslangiç": "2025-05-20",
      "bitis": "2026-05-20"
    }
  ],
  "145": [
    {
      "ad": "FERHAT",
      "soyad": "DAŞTAN",
      "telefon": "05454956778",
      "tcKimlik": "11369666592",
      "email": "ferhatdastan29@gmail.com",
      "basRaw": "01.09.2025",
      "bitRaw": "01.09.2025",
      "kiraBedeli": 15650.0,
      "baslangiç": "2025-09-01",
      "bitis": "2025-09-01"
    },
    {
      "ad": "NAZIM",
      "soyad": "EFE ÖZCAN",
      "telefon": "05443854339",
      "tcKimlik": "11150800938",
      "email": "nazimefeozcan1@gmail.com",
      "basRaw": "",
      "bitRaw": "",
      "kiraBedeli": null,
      "baslangiç": null,
      "bitis": null
    }
  ],
  "146": [
    {
      "ad": "CIGDEM",
      "soyad": "YILDIZ",
      "telefon": "05362339355",
      "tcKimlik": "14234892676",
      "email": "cigdemyildiz5992@hotmail.co",
      "basRaw": "01.09.2025",
      "bitRaw": "01.09.2025",
      "kiraBedeli": 22000.0,
      "baslangiç": "2025-09-01",
      "bitis": "2025-09-01"
    },
    {
      "ad": "ZEYNEP",
      "soyad": "YILMAZ",
      "telefon": "05453950438",
      "tcKimlik": "43306462110",
      "email": "zeykar51714@gmail.com",
      "basRaw": "",
      "bitRaw": "",
      "kiraBedeli": null,
      "baslangiç": null,
      "bitis": null
    }
  ],
  "147": [
    {
      "ad": "UFUK",
      "soyad": "DUHAN SEDEF",
      "telefon": "05386574168",
      "tcKimlik": "10301700912",
      "email": "Duhansedef@gmail.com",
      "basRaw": "10.11.2025",
      "bitRaw": "10.07.2026",
      "kiraBedeli": 16500.0,
      "baslangiç": "2025-11-10",
      "bitis": "2026-07-10"
    }
  ],
  "148": [
    {
      "ad": "BERRA",
      "soyad": "NUR KARA",
      "telefon": "05330520067",
      "tcKimlik": "11223093854",
      "email": "berranurkara239@gmail.com",
      "basRaw": "30.08.2025",
      "bitRaw": "30.08.2025",
      "kiraBedeli": 21000.0,
      "baslangiç": "2025-08-30",
      "bitis": "2025-08-30"
    }
  ],
  "149": [
    {
      "ad": "ENES",
      "soyad": "DEMIR",
      "telefon": "05340225015",
      "tcKimlik": "32743218404",
      "email": "demireneso1963@gmail.com",
      "basRaw": "18.11.2025",
      "bitRaw": "18.09.2026",
      "kiraBedeli": 16000.0,
      "baslangiç": "2025-11-18",
      "bitis": "2026-09-18"
    }
  ],
  "150": [
    {
      "ad": "ATA",
      "soyad": "BERK KÜÇÜK",
      "telefon": "05452771602",
      "tcKimlik": "64171044232",
      "email": "Ataberkface@gmail.com",
      "basRaw": "01.09.2025",
      "bitRaw": "01.09.2025",
      "kiraBedeli": 21000.0,
      "baslangiç": "2025-09-01",
      "bitis": "2025-09-01"
    }
  ],
  "151": [
    {
      "ad": "MUHAMMED",
      "soyad": "VATANSEVER",
      "telefon": "05465518707",
      "tcKimlik": "13111891252",
      "email": "muhammedvtnsr@gmail.com",
      "basRaw": "28.09.2025",
      "bitRaw": "28.08.2026",
      "kiraBedeli": 20000.0,
      "baslangiç": "2025-09-28",
      "bitis": "2026-08-28"
    },
    {
      "ad": "ARDA",
      "soyad": "BEKIROGLU",
      "telefon": "05377339013",
      "tcKimlik": "13180889716",
      "email": "ardabekioglu09@gmail.com",
      "basRaw": "",
      "bitRaw": "",
      "kiraBedeli": null,
      "baslangiç": null,
      "bitis": null
    }
  ],
  "152": [
    {
      "ad": "ENISE",
      "soyad": "ÖZTURNA",
      "telefon": "05395939043",
      "tcKimlik": "10528719902",
      "email": "Ozturnaenise@gmail.com",
      "basRaw": "01.09.2025",
      "bitRaw": "01.09.2025",
      "kiraBedeli": 11225.0,
      "baslangiç": "2025-09-01",
      "bitis": "2025-09-01"
    },
    {
      "ad": "BERRA",
      "soyad": "ZEYNEP TASDEMIR",
      "telefon": "05442412513",
      "tcKimlik": "11480664460",
      "email": "berrazeyneptasdemir@gmail.com",
      "basRaw": "",
      "bitRaw": "",
      "kiraBedeli": null,
      "baslangiç": null,
      "bitis": null
    }
  ],
  "153": [
    {
      "ad": "BATUHAN",
      "soyad": "TUNCOL",
      "telefon": "05325432272",
      "tcKimlik": "41878486770",
      "email": "batuhantunckol@windowslive.com",
      "basRaw": "01.09.2025",
      "bitRaw": "01.09.2025",
      "kiraBedeli": 22000.0,
      "baslangiç": "2025-09-01",
      "bitis": "2025-09-01"
    }
  ],
  "154": [
    {
      "ad": "SÜMEYYE",
      "soyad": "NUR ATEŞ",
      "telefon": "05380144093",
      "tcKimlik": "51490166394",
      "email": "smy.nr23@gmail.com",
      "basRaw": "",
      "bitRaw": "",
      "kiraBedeli": 11520.0,
      "baslangiç": null,
      "bitis": null
    },
    {
      "ad": "BUSE",
      "soyad": "ILAYDA USLU",
      "telefon": "05300497893",
      "tcKimlik": "18803284992",
      "email": "buseilaydauslu@gmail.com",
      "basRaw": "01.08.2025",
      "bitRaw": "01.08.2025",
      "kiraBedeli": null,
      "baslangiç": null,
      "bitis": null
    }
  ],
  "155": [
    {
      "ad": "SEYYIDE",
      "soyad": "MERYEM AKKIRMAN",
      "telefon": "05372995130",
      "tcKimlik": "10360832104",
      "email": "seyyidemeryemakkirman@gmail.com",
      "basRaw": "01.09.2025",
      "bitRaw": "01.09.2025",
      "kiraBedeli": 22000.0,
      "baslangiç": "2025-09-01",
      "bitis": "2025-09-01"
    }
  ],
  "156": [
    {
      "ad": "BORA",
      "soyad": "SARITAS",
      "telefon": "05300517748",
      "tcKimlik": "18031082148",
      "email": "borasaritas3@gmail.com",
      "basRaw": "",
      "bitRaw": "",
      "kiraBedeli": 20850.0,
      "baslangiç": null,
      "bitis": null
    },
    {
      "ad": "DENIZ",
      "soyad": "SARITAS",
      "telefon": "05357361870",
      "tcKimlik": "18154077700",
      "email": "deenizsaritas@gmail.com",
      "basRaw": "25.08.2025",
      "bitRaw": "25.08.2025",
      "kiraBedeli": null,
      "baslangiç": null,
      "bitis": null
    }
  ],
  "157": [
    {
      "ad": "ÖZGE",
      "soyad": "ARIN",
      "telefon": "05331339286",
      "tcKimlik": "16792682102",
      "email": "ozgearinn790@gmail.com",
      "basRaw": "07.04.2025",
      "bitRaw": "07.09.2026",
      "kiraBedeli": 17000.0,
      "baslangiç": "2025-04-07",
      "bitis": "2026-09-07"
    }
  ],
  "158": [
    {
      "ad": "MUHAMMED",
      "soyad": "EMIN",
      "telefon": "05309086760",
      "tcKimlik": "11090504088",
      "email": "m.eminer2002@icloud.com",
      "basRaw": "30.08.2025",
      "bitRaw": "30.08.2026",
      "kiraBedeli": 22000.0,
      "baslangiç": "2025-08-30",
      "bitis": "2026-08-30"
    }
  ],
  "159": [
    {
      "ad": "SELIN",
      "soyad": "KORKMAZ",
      "telefon": "05459528060",
      "tcKimlik": "10466698482",
      "email": "Selxrd@gmail.com",
      "basRaw": "01.08.2025",
      "bitRaw": "01.08.2025",
      "kiraBedeli": 20400.0,
      "baslangiç": "2025-08-01",
      "bitis": "2025-08-01"
    }
  ],
  "160": [
    {
      "ad": "ATAKAN",
      "soyad": "KARAKOC",
      "telefon": "05348859063",
      "tcKimlik": "64081047224",
      "email": "atakan.karakoc.59@gmail.com",
      "basRaw": "01.09.2025",
      "bitRaw": "01.09.2025",
      "kiraBedeli": 17440.0,
      "baslangiç": "2025-09-01",
      "bitis": "2025-09-01"
    }
  ],
  "161": [
    {
      "ad": "NEHIR",
      "soyad": "ÖZAL",
      "telefon": "05384472124",
      "tcKimlik": "12080652734",
      "email": "ozalnehir@gmail.com",
      "basRaw": "01.09.2025",
      "bitRaw": "01.09.2025",
      "kiraBedeli": 21000.0,
      "baslangiç": "2025-09-01",
      "bitis": "2025-09-01"
    }
  ],
  "162": [
    {
      "ad": "BERRU",
      "soyad": "AVCI KALIYOR",
      "telefon": "05323330708",
      "tcKimlik": "DAIRESAHIBI",
      "email": null,
      "basRaw": "",
      "bitRaw": "",
      "kiraBedeli": null,
      "baslangiç": null,
      "bitis": null
    }
  ],
  "163": [
    {
      "ad": "YAŞAR",
      "soyad": "BICAKCI (ESI)",
      "telefon": "05398745626",
      "tcKimlik": "DAIRESAHIBI",
      "email": null,
      "basRaw": "",
      "bitRaw": "",
      "kiraBedeli": null,
      "baslangiç": null,
      "bitis": null
    }
  ],
  "164": [
    {
      "ad": "UFUK",
      "soyad": "CALISIR",
      "telefon": "05396616620",
      "tcKimlik": "12287492140",
      "email": "ufukcalisir612@gmail.com",
      "basRaw": "01.09.2025",
      "bitRaw": "01.09.2026",
      "kiraBedeli": 17750.0,
      "baslangiç": "2025-09-01",
      "bitis": "2026-09-01"
    }
  ],
  "165": [
    {
      "ad": "ZEHRA",
      "soyad": "SIMSEK",
      "telefon": "05496583458",
      "tcKimlik": "11714472434",
      "email": "zehrasims@icloud.com",
      "basRaw": "19.07.2025",
      "bitRaw": "19.07.2026",
      "kiraBedeli": 20800.0,
      "baslangiç": "2025-07-19",
      "bitis": "2026-07-19"
    },
    {
      "ad": "ENLIK",
      "soyad": "MURZAGALIYEVA",
      "telefon": "05065055694",
      "tcKimlik": null,
      "email": "enlikmurzagalieva@gmail.com",
      "basRaw": "",
      "bitRaw": "",
      "kiraBedeli": null,
      "baslangiç": null,
      "bitis": null
    }
  ],
  "166": [
    {
      "ad": "ARSLAN",
      "soyad": "STATOV",
      "telefon": "77051387997",
      "tcKimlik": null,
      "email": "statovars@gmail.com",
      "basRaw": "23.10.2025",
      "bitRaw": "23.09.2026",
      "kiraBedeli": 16000.0,
      "baslangiç": "2025-10-23",
      "bitis": "2026-09-23"
    },
    {
      "ad": "ALIYEV",
      "soyad": "ABDULMATALIB",
      "telefon": "87766327251",
      "tcKimlik": null,
      "email": "aamirhan050@gmail.com",
      "basRaw": "",
      "bitRaw": "",
      "kiraBedeli": null,
      "baslangiç": null,
      "bitis": null
    }
  ],
  "167": [
    {
      "ad": "DURU",
      "soyad": "ÖZCAN",
      "telefon": "05307924990",
      "tcKimlik": "11435674124",
      "email": "duruozcan90@gmail.com",
      "basRaw": "08.10.2025",
      "bitRaw": "08.07.2026",
      "kiraBedeli": 16500.0,
      "baslangiç": "2025-10-08",
      "bitis": "2026-07-08"
    }
  ],
  "168": [
    {
      "ad": "GÜLBAHAR",
      "soyad": "KÜÇÜKATEŞ",
      "telefon": "05340418328",
      "tcKimlik": "50185374328",
      "email": "mg.kucukates@hotmail.com",
      "basRaw": "07.10.2025",
      "bitRaw": "07.09.2026",
      "kiraBedeli": 16000.0,
      "baslangiç": "2025-10-07",
      "bitis": "2026-09-07"
    }
  ],
  "169": [
    {
      "ad": "MELIKE",
      "soyad": "ŞENER",
      "telefon": "05423092168",
      "tcKimlik": "10866095140",
      "email": "melikesener119@gmail.com",
      "basRaw": "02.12.2025",
      "bitRaw": "02.07.2026",
      "kiraBedeli": 13000.0,
      "baslangiç": "2025-12-02",
      "bitis": "2026-07-02"
    }
  ],
  "170": [
    {
      "ad": "NURCAN",
      "soyad": "YILMAZ",
      "telefon": "05350149729",
      "tcKimlik": "13792815400",
      "email": "1.nurcanyilmaz@gmail.com",
      "basRaw": "05.10.2025",
      "bitRaw": "05.09.2026",
      "kiraBedeli": 16500.0,
      "baslangiç": "2025-10-05",
      "bitis": "2026-09-05"
    }
  ],
  "171": [
    {
      "ad": "GÖRKEM",
      "soyad": "AYGÖR",
      "telefon": "05512709398",
      "tcKimlik": "DAIRESAHIBI",
      "email": null,
      "basRaw": "",
      "bitRaw": "",
      "kiraBedeli": null,
      "baslangiç": null,
      "bitis": null
    }
  ],
  "172": [
    {
      "ad": "YUNUS",
      "soyad": "CANTÖRK",
      "telefon": "05322573107",
      "tcKimlik": "20431915544",
      "email": "yunuscanturk@hotmail.com",
      "basRaw": "27.10.2025",
      "bitRaw": "27.10.2026",
      "kiraBedeli": 16000.0,
      "baslangiç": "2025-10-27",
      "bitis": "2026-10-27"
    }
  ],
  "173": [
    {
      "ad": "SEHER",
      "soyad": "PARLAK",
      "telefon": "05439374130",
      "tcKimlik": "16630022572",
      "email": "Seherimsi134@gmail.com",
      "basRaw": "10.06.2025",
      "bitRaw": "10.06.2026",
      "kiraBedeli": 15220.0,
      "baslangiç": "2025-06-10",
      "bitis": "2026-06-10"
    }
  ],
  "174": [
    {
      "ad": "BURAK",
      "soyad": "SINIK",
      "telefon": "05525116156",
      "tcKimlik": "15089543072",
      "email": "burak.siniks@gmail.com",
      "basRaw": "01.09.2025",
      "bitRaw": "01.09.2026",
      "kiraBedeli": 18000.0,
      "baslangiç": "2025-09-01",
      "bitis": "2026-09-01"
    }
  ],
  "175": [
    {
      "ad": "AHMET",
      "soyad": "BOZTEPE",
      "telefon": "5051234054",
      "tcKimlik": "10127108336",
      "email": "ahmetboztepe314@gmail.com",
      "basRaw": "26.01.2025",
      "bitRaw": "26.08.2026",
      "kiraBedeli": 14000.0,
      "baslangiç": "2025-01-26",
      "bitis": "2026-08-26"
    }
  ],
  "176": [
    {
      "ad": "HASRET",
      "soyad": "ELMAS",
      "telefon": "05419412027",
      "tcKimlik": "20909423908",
      "email": "HasretElmas0102@gmail.com",
      "basRaw": "04.11.2025",
      "bitRaw": "04.06.2026",
      "kiraBedeli": 13500.0,
      "baslangiç": "2025-11-04",
      "bitis": "2026-06-04"
    }
  ],
  "177": [
    {
      "ad": "ZEYNEP",
      "soyad": "DENIZ ŞAHİN",
      "telefon": "05439392818",
      "tcKimlik": "19394399478",
      "email": "zdsahin26@gmail.com",
      "basRaw": "04.09.2025",
      "bitRaw": "04.09.2026",
      "kiraBedeli": 17000.0,
      "baslangiç": "2025-09-04",
      "bitis": "2026-09-04"
    }
  ],
  "178": [
    {
      "ad": "CEREN",
      "soyad": "ISIDAN",
      "telefon": "05050112830",
      "tcKimlik": "28657942092",
      "email": "duaceren661@gmail.com",
      "basRaw": "02.09.2025",
      "bitRaw": "02.09.2026",
      "kiraBedeli": 18000.0,
      "baslangiç": "2025-09-02",
      "bitis": "2026-09-02"
    }
  ],
  "179": [
    {
      "ad": "SEMANUR",
      "soyad": "ÖZDEMIR",
      "telefon": "05364119920",
      "tcKimlik": "11648657198",
      "email": "semaozdmr678@gmail.com",
      "basRaw": "01.09.2025",
      "bitRaw": "01.09.2026",
      "kiraBedeli": 18500.0,
      "baslangiç": "2025-09-01",
      "bitis": "2026-09-01"
    }
  ],
  "180": [
    {
      "ad": "ESRA",
      "soyad": "KAYMAZ",
      "telefon": "05011282806",
      "tcKimlik": "56779048040",
      "email": "esrakaymazz.35@gmail.com",
      "basRaw": "14.09.2025",
      "bitRaw": "14.09.2025",
      "kiraBedeli": 16000.0,
      "baslangiç": "2025-09-14",
      "bitis": "2025-09-14"
    }
  ],
  "181": [
    {
      "ad": "GURKAN",
      "soyad": "ALTUNIGI",
      "telefon": "05340138475",
      "tcKimlik": "10049711812",
      "email": "altunigurkan@hotmail.com",
      "basRaw": "01.09.2025",
      "bitRaw": "01.09.2025",
      "kiraBedeli": 14480.0,
      "baslangiç": "2025-09-01",
      "bitis": "2025-09-01"
    }
  ],
  "182": [
    {
      "ad": "ZEYNEP",
      "soyad": "GUZELHAN",
      "telefon": "05373491566",
      "tcKimlik": "2939629918",
      "email": "guzelhanzeynep@gmail.com",
      "basRaw": "06.02.2025",
      "bitRaw": "06.09.2026",
      "kiraBedeli": 16500.0,
      "baslangiç": "2025-02-06",
      "bitis": "2026-09-06"
    }
  ],
  "183": [
    {
      "ad": "ENES",
      "soyad": "ARAS",
      "telefon": "05313106964",
      "tcKimlik": "17095371700",
      "email": "enesaras136@icloud.com",
      "basRaw": "01.08.2025",
      "bitRaw": "01.08.2026",
      "kiraBedeli": 14480.0,
      "baslangiç": "2025-08-01",
      "bitis": "2026-08-01"
    },
    {
      "ad": "BEZHAN",
      "soyad": "TOLIBZODA",
      "telefon": "05461577707",
      "tcKimlik": null,
      "email": "tolibzodabezhan@gmail.com",
      "basRaw": "",
      "bitRaw": "",
      "kiraBedeli": null,
      "baslangiç": null,
      "bitis": null
    }
  ],
  "184": [
    {
      "ad": "SILA",
      "soyad": "ÖZEN",
      "telefon": "05336724137",
      "tcKimlik": "17375466706",
      "email": "silanazozen436@gmail.com",
      "basRaw": "19.11.2025",
      "bitRaw": "19.06.2026",
      "kiraBedeli": 13500.0,
      "baslangiç": "2025-11-19",
      "bitis": "2026-06-19"
    }
  ],
  "185": [
    {
      "ad": "SUDE",
      "soyad": "DÖNMEZ",
      "telefon": "05366711859",
      "tcKimlik": "10069962126",
      "email": "sudeedonmezz18@icloud.com",
      "basRaw": "19.09.2025",
      "bitRaw": "19.09.2026",
      "kiraBedeli": 15500.0,
      "baslangiç": "2025-09-19",
      "bitis": "2026-09-19"
    }
  ],
  "186": [
    {
      "ad": "ZEYNEP",
      "soyad": "KURT",
      "telefon": "05330577248",
      "tcKimlik": "10859822050",
      "email": "zeynepkurt1914@gmail.com",
      "basRaw": "26.07.2025",
      "bitRaw": "26.07.2026",
      "kiraBedeli": 17500.0,
      "baslangiç": "2025-07-26",
      "bitis": "2026-07-26"
    }
  ],
  "187": [
    {
      "ad": "BERKAY",
      "soyad": "BAL",
      "telefon": "05078603566",
      "tcKimlik": "40678307858",
      "email": "balberkay28@gmail.com",
      "basRaw": "01.09.2025",
      "bitRaw": "01.09.2025",
      "kiraBedeli": 18500.0,
      "baslangiç": "2025-09-01",
      "bitis": "2025-09-01"
    }
  ],
  "188": [
    {
      "ad": "MEHMET",
      "soyad": "EMIR SUZER",
      "telefon": "05436869048",
      "tcKimlik": "15595724996",
      "email": "a.suzer@yandex.com",
      "basRaw": "23.08.2025",
      "bitRaw": "23.08.2025",
      "kiraBedeli": 17500.0,
      "baslangiç": "2025-08-23",
      "bitis": "2025-08-23"
    }
  ],
  "189": [
    {
      "ad": "BERRA",
      "soyad": "NUR CAKIR",
      "telefon": "05459230803",
      "tcKimlik": "10901384512",
      "email": "cakirberra462@gmail.com",
      "basRaw": "16.09.2025",
      "bitRaw": "16.09.2025",
      "kiraBedeli": 16000.0,
      "baslangiç": "2025-09-16",
      "bitis": "2025-09-16"
    }
  ],
  "190": [
    {
      "ad": "MUHAMMED",
      "soyad": "UYAN",
      "telefon": "05315435386",
      "tcKimlik": "14744074708",
      "email": "muhammeduyan4624@gmail.com",
      "basRaw": "24.09.2025",
      "bitRaw": "24.08.2026",
      "kiraBedeli": 17000.0,
      "baslangiç": "2025-09-24",
      "bitis": "2026-08-24"
    }
  ],
  "191": [
    {
      "ad": "ŞEKİFE",
      "soyad": "NUR ÇAKMAKÇI",
      "telefon": "05462640806",
      "tcKimlik": "10819957358",
      "email": "sekife.cakmakci@gmail.com",
      "basRaw": "19.08.2025",
      "bitRaw": "19.08.2026",
      "kiraBedeli": 17425.0,
      "baslangiç": "2025-08-19",
      "bitis": "2026-08-19"
    }
  ],
  "192": [
    {
      "ad": "SİNEM",
      "soyad": "HANEDAR",
      "telefon": "05378997554",
      "tcKimlik": "DAIRESAHIBI",
      "email": null,
      "basRaw": "",
      "bitRaw": "",
      "kiraBedeli": null,
      "baslangiç": null,
      "bitis": null
    }
  ],
  "193": [
    {
      "ad": "SABIHA",
      "soyad": "YESILDAG",
      "telefon": "05511926875",
      "tcKimlik": "10724368348",
      "email": "sabihayesildag@outlook.com",
      "basRaw": "18.10.2025",
      "bitRaw": "18.09.2026",
      "kiraBedeli": 15000.0,
      "baslangiç": "2025-10-18",
      "bitis": "2026-09-18"
    }
  ],
  "194": [
    {
      "ad": "YAREN",
      "soyad": "BALABAN",
      "telefon": "05366080019",
      "tcKimlik": "DAIRESAHIBI",
      "email": null,
      "basRaw": "",
      "bitRaw": "",
      "kiraBedeli": null,
      "baslangiç": null,
      "bitis": null
    }
  ],
  "195": [
    {
      "ad": "DENIZ",
      "soyad": "YETKIN",
      "telefon": "05312208073",
      "tcKimlik": "43882864452",
      "email": "yetgindeniz02@gmail.com",
      "basRaw": "01.09.2026",
      "bitRaw": "01.09.2026",
      "kiraBedeli": 18750.0,
      "baslangiç": "2026-09-01",
      "bitis": "2026-09-01"
    }
  ],
  "196": [
    {
      "ad": "MUHAMMED",
      "soyad": "RUSTOM",
      "telefon": "05349615005",
      "tcKimlik": null,
      "email": "morustom11@gmail.com",
      "basRaw": "21.01.2025",
      "bitRaw": "21.08.2026",
      "kiraBedeli": 16000.0,
      "baslangiç": "2025-01-21",
      "bitis": "2026-08-21"
    }
  ],
  "197": [
    {
      "ad": "GÜLCE",
      "soyad": "TOPKAYA",
      "telefon": "05070516495",
      "tcKimlik": "33467163452",
      "email": "topkayagulce@gmail.com",
      "basRaw": "31.07.2025",
      "bitRaw": "31.07.2025",
      "kiraBedeli": 22000.0,
      "baslangiç": "2025-07-31",
      "bitis": "2025-07-31"
    }
  ],
  "198": [
    {
      "ad": "TUANA",
      "soyad": "VERIM",
      "telefon": "05416444803",
      "tcKimlik": "10121990036",
      "email": "tuanaverim2004@gmail.com",
      "basRaw": "01.09.2025",
      "bitRaw": "01.09.2025",
      "kiraBedeli": 21000.0,
      "baslangiç": "2025-09-01",
      "bitis": "2025-09-01"
    }
  ],
  "199": [
    {
      "ad": "BEYZA",
      "soyad": "TUNCAY",
      "telefon": "05348837762",
      "tcKimlik": null,
      "email": null,
      "basRaw": "",
      "bitRaw": "",
      "kiraBedeli": null,
      "baslangiç": null,
      "bitis": null
    }
  ],
  "200": [
    {
      "ad": "SUDE",
      "soyad": "SENA ERDAGI",
      "telefon": "05370572706",
      "tcKimlik": "16445210676",
      "email": "erdagisudesena@gmail.com",
      "basRaw": "15.08.2025",
      "bitRaw": "15.08.2025",
      "kiraBedeli": 20000.0,
      "baslangiç": "2025-08-15",
      "bitis": "2025-08-15"
    }
  ],
  "201": [
    {
      "ad": "AZRA",
      "soyad": "HATICE KARADUMAN",
      "telefon": "05418363834",
      "tcKimlik": "11897520564",
      "email": "azrakrdmn@icloud.com",
      "basRaw": "04.10.2025",
      "bitRaw": "04.10.2026",
      "kiraBedeli": 22000.0,
      "baslangiç": "2025-10-04",
      "bitis": "2026-10-04"
    },
    {
      "ad": "RABIA",
      "soyad": "AKKOC",
      "telefon": "05519401917",
      "tcKimlik": "10546200918",
      "email": "akkocrabia64@gmail.com",
      "basRaw": "",
      "bitRaw": "",
      "kiraBedeli": null,
      "baslangiç": null,
      "bitis": null
    }
  ],
  "202": [
    {
      "ad": "ELIF",
      "soyad": "KARATEKIN",
      "telefon": "05401904107",
      "tcKimlik": "10132697122",
      "email": "karatekine74@gmail.com",
      "basRaw": "19.08.2025",
      "bitRaw": "19.08.2025",
      "kiraBedeli": 17000.0,
      "baslangiç": "2025-08-19",
      "bitis": "2025-08-19"
    }
  ],
  "204": [
    {
      "ad": "ELIF",
      "soyad": "ISRA AKSOZ",
      "telefon": "05538345828",
      "tcKimlik": "15674391590",
      "email": "elifisraaksoz@gmail.com",
      "basRaw": "03.12.2025",
      "bitRaw": "03.09.2026",
      "kiraBedeli": 14000.0,
      "baslangiç": "2025-12-03",
      "bitis": "2026-09-03"
    }
  ],
  "205": [
    {
      "ad": "ALPEREN",
      "soyad": "GUNGOR",
      "telefon": "05531073362",
      "tcKimlik": "12628906824",
      "email": "alperengingor48@gmail.com",
      "basRaw": "01.09.2025",
      "bitRaw": "01.09.2025",
      "kiraBedeli": 17400.0,
      "baslangiç": "2025-09-01",
      "bitis": "2025-09-01"
    }
  ],
  "206": [
    {
      "ad": "SERDAR",
      "soyad": "INCE",
      "telefon": "05331364569",
      "tcKimlik": "DAIRESAHIBI",
      "email": null,
      "basRaw": "",
      "bitRaw": "",
      "kiraBedeli": null,
      "baslangiç": null,
      "bitis": null
    }
  ],
  "207": [
    {
      "ad": "MEHMET",
      "soyad": "BERKAY KOSE",
      "telefon": "05380841128",
      "tcKimlik": "21278193676",
      "email": "mbkose1907@gmail.com",
      "basRaw": "03.09.2025",
      "bitRaw": "03.09.2025",
      "kiraBedeli": 18000.0,
      "baslangiç": "2025-09-03",
      "bitis": "2025-09-03"
    }
  ],
  "208": [
    {
      "ad": "BURI",
      "soyad": "HAMRAYEV",
      "telefon": "05015825654",
      "tcKimlik": "DAIRESAHIBI",
      "email": null,
      "basRaw": "",
      "bitRaw": "",
      "kiraBedeli": null,
      "baslangiç": null,
      "bitis": null
    },
    {
      "ad": "GURBANGUL",
      "soyad": "DAVLATOVA",
      "telefon": "05524059880",
      "tcKimlik": "DAIRESAHIBI",
      "email": null,
      "basRaw": "",
      "bitRaw": "",
      "kiraBedeli": null,
      "baslangiç": null,
      "bitis": null
    }
  ],
  "209": [
    {
      "ad": "MEHMET",
      "soyad": "KARA",
      "telefon": "05076966599",
      "tcKimlik": "DAIRESAHIBI",
      "email": null,
      "basRaw": "",
      "bitRaw": "",
      "kiraBedeli": null,
      "baslangiç": null,
      "bitis": null
    }
  ],
  "210": [
    {
      "ad": "EYMEN",
      "soyad": "ISERI",
      "telefon": "05324815017",
      "tcKimlik": "DAIRESAHIBI",
      "email": null,
      "basRaw": "",
      "bitRaw": "",
      "kiraBedeli": null,
      "baslangiç": null,
      "bitis": null
    }
  ],
  "211": [
    {
      "ad": "ÖZGE",
      "soyad": "TUNC",
      "telefon": "05547489788",
      "tcKimlik": "18017893928",
      "email": "ozgetunc72@gmail.com",
      "basRaw": "06.12.2025",
      "bitRaw": "06.09.2026",
      "kiraBedeli": 13500.0,
      "baslangiç": "2025-12-06",
      "bitis": "2026-09-06"
    }
  ],
  "212": [
    {
      "ad": "Zeynep",
      "soyad": "Mutlu",
      "telefon": "05412930242",
      "tcKimlik": "52720530060",
      "email": "zeynepmutlu9@icloud.com",
      "basRaw": "20.09.2025",
      "bitRaw": "20.09.2025",
      "kiraBedeli": 15500.0,
      "baslangiç": "2025-09-20",
      "bitis": "2025-09-20"
    }
  ],
  "213": [
    {
      "ad": "ÖMER",
      "soyad": "MERT KIYUNAT",
      "telefon": "05533572527",
      "tcKimlik": "10031166200",
      "email": "mertkyunatt@gmail.com",
      "basRaw": "25.08.2025",
      "bitRaw": "25.08.2025",
      "kiraBedeli": 17500.0,
      "baslangiç": "2025-08-25",
      "bitis": "2025-08-25"
    }
  ],
  "214": [
    {
      "ad": "CEREN",
      "soyad": "CIRICIK",
      "telefon": "05318313781",
      "tcKimlik": "10028006816",
      "email": "cerenciricik17@icloud.com",
      "basRaw": "24.08.2025",
      "bitRaw": "24.08.2025",
      "kiraBedeli": 16500.0,
      "baslangiç": "2025-08-24",
      "bitis": "2025-08-24"
    }
  ],
  "215": [
    {
      "ad": "ZEYNEP",
      "soyad": "AKGUN",
      "telefon": "05454056451",
      "tcKimlik": "22795037634",
      "email": "zeytuba@icloud.com",
      "basRaw": "20.08.2025",
      "bitRaw": "20.08.2025",
      "kiraBedeli": 17500.0,
      "baslangiç": "2025-08-20",
      "bitis": "2025-08-20"
    }
  ],
  "216": [
    {
      "ad": "BERIL",
      "soyad": "KAZANDUVEN",
      "telefon": "05397046177",
      "tcKimlik": "11249671708",
      "email": "berilkb240@gmail.com",
      "basRaw": "01.09.2025",
      "bitRaw": "01.09.2026",
      "kiraBedeli": 17500.0,
      "baslangiç": "2025-09-01",
      "bitis": "2026-09-01"
    }
  ],
  "217": [
    {
      "ad": "SANEM",
      "soyad": "EFSUN SARIHAN",
      "telefon": "05530137894",
      "tcKimlik": "16472929268",
      "email": "efsunsarihan@gmail.com",
      "basRaw": "01.09.2025",
      "bitRaw": "01.09.2026",
      "kiraBedeli": 17400.0,
      "baslangiç": "2025-09-01",
      "bitis": "2026-09-01"
    }
  ],
  "218": [
    {
      "ad": "MEHMET",
      "soyad": "YAGIZ ALTUNBULAT",
      "telefon": "05074698175",
      "tcKimlik": "1027184188",
      "email": "myzaltunbulat@gmail.com",
      "basRaw": "03.08.2025",
      "bitRaw": "03.08.2026",
      "kiraBedeli": 13900.0,
      "baslangiç": "2025-08-03",
      "bitis": "2026-08-03"
    }
  ],
  "219": [
    {
      "ad": "BERKAY",
      "soyad": "ALIC",
      "telefon": "05418002762",
      "tcKimlik": "43924417240",
      "email": "berkayalicc@hotmail.com",
      "basRaw": "01.08.2025",
      "bitRaw": "01.08.2026",
      "kiraBedeli": 14100.0,
      "baslangiç": "2025-08-01",
      "bitis": "2026-08-01"
    }
  ],
  "220": [
    {
      "ad": "MERTCAN",
      "soyad": "AKSUT",
      "telefon": "05453759504",
      "tcKimlik": "10310589232",
      "email": "mertcanaksut06@icloud.com",
      "basRaw": "24.10.2025",
      "bitRaw": "24.08.2026",
      "kiraBedeli": 18000.0,
      "baslangiç": "2025-10-24",
      "bitis": "2026-08-24"
    }
  ],
  "221": [
    {
      "ad": "VIKTORIYA",
      "soyad": "KASHELEVA",
      "telefon": "05333755170",
      "tcKimlik": "DAIRESAHIBI",
      "email": null,
      "basRaw": "",
      "bitRaw": "",
      "kiraBedeli": null,
      "baslangiç": null,
      "bitis": null
    }
  ],
  "222": [
    {
      "ad": "TURGUT",
      "soyad": "ERSARI",
      "telefon": "05428357915",
      "tcKimlik": "29557457150",
      "email": "turgut20ersari@gmail.com",
      "basRaw": "01.09.2025",
      "bitRaw": "01.09.2026",
      "kiraBedeli": 17000.0,
      "baslangiç": "2025-09-01",
      "bitis": "2026-09-01"
    }
  ],
  "223": [
    {
      "ad": "Esma",
      "soyad": "Gulsüm BILGIN",
      "telefon": "5325747436",
      "tcKimlik": "10958681558",
      "email": "esmaglsmb61@gmail.com",
      "basRaw": "07.02.2025",
      "bitRaw": "07.07.2026",
      "kiraBedeli": 17000.0,
      "baslangiç": "2025-02-07",
      "bitis": "2026-07-07"
    }
  ],
  "224": [
    {
      "ad": "ESLEM",
      "soyad": "KILIC",
      "telefon": "05308961471",
      "tcKimlik": "DAIRESAHIBI",
      "email": null,
      "basRaw": "",
      "bitRaw": "",
      "kiraBedeli": null,
      "baslangiç": null,
      "bitis": null
    }
  ],
  "225": [
    {
      "ad": "ŞABAN",
      "soyad": "GULALI (BABASI)",
      "telefon": "05324656821",
      "tcKimlik": "DAIRESAHIBI",
      "email": null,
      "basRaw": "",
      "bitRaw": "",
      "kiraBedeli": null,
      "baslangiç": null,
      "bitis": null
    }
  ],
  "226": [
    {
      "ad": "ESLEM",
      "soyad": "DOGAN",
      "telefon": "05398523942",
      "tcKimlik": "32093029378",
      "email": "eslemdogaan16@gmail.com",
      "basRaw": "28.09.2025",
      "bitRaw": "28.09.2026",
      "kiraBedeli": 20750.0,
      "baslangiç": "2025-09-28",
      "bitis": "2026-09-28"
    }
  ],
  "227": [
    {
      "ad": "YUSUF",
      "soyad": "BERAT GUNCÜ",
      "telefon": "05415613376",
      "tcKimlik": "DAIRESAHIBI",
      "email": null,
      "basRaw": "",
      "bitRaw": "",
      "kiraBedeli": null,
      "baslangiç": null,
      "bitis": null
    }
  ],
  "228": [
    {
      "ad": "ENES",
      "soyad": "YURTCU",
      "telefon": "05375671273",
      "tcKimlik": "DAIRESAHIBI",
      "email": null,
      "basRaw": "",
      "bitRaw": "",
      "kiraBedeli": null,
      "baslangiç": null,
      "bitis": null
    }
  ],
  "229": [
    {
      "ad": "DAIREYE",
      "soyad": "TADILATLAR YAPILACAK",
      "telefon": "",
      "tcKimlik": null,
      "email": null,
      "basRaw": "DAIRE SAH",
      "bitRaw": "",
      "kiraBedeli": null,
      "baslangiç": null,
      "bitis": null
    }
  ],
  "230": [
    {
      "ad": "AYCA",
      "soyad": "CAKIR",
      "telefon": "05327822341",
      "tcKimlik": "10030960908",
      "email": "aycaca666@gmail.com",
      "basRaw": "02.09.2025",
      "bitRaw": "02.09.2026",
      "kiraBedeli": 22000.0,
      "baslangiç": "2025-09-02",
      "bitis": "2026-09-02"
    }
  ],
  "231": [
    {
      "ad": "ELANUR",
      "soyad": "KAPICIOGLU",
      "telefon": "05522175030",
      "tcKimlik": "11156675394",
      "email": "ekapicioglu2@gmail.com",
      "basRaw": "01.09.2025",
      "bitRaw": "01.09.2026",
      "kiraBedeli": 22000.0,
      "baslangiç": "2025-09-01",
      "bitis": "2026-09-01"
    }
  ],
  "232": [
    {
      "ad": "Mikail",
      "soyad": "Cankaya",
      "telefon": "05050450341",
      "tcKimlik": "DAIRESAHIBI",
      "email": null,
      "basRaw": "",
      "bitRaw": "",
      "kiraBedeli": null,
      "baslangiç": null,
      "bitis": null
    }
  ],
  "233": [
    {
      "ad": "AYSENAZ",
      "soyad": "ERGUN",
      "telefon": "05443391920",
      "tcKimlik": "28142291650",
      "email": "aysenazergun@hotmail.com",
      "basRaw": "25.08.2025",
      "bitRaw": "25.08.2026",
      "kiraBedeli": 21000.0,
      "baslangiç": "2025-08-25",
      "bitis": "2026-08-25"
    }
  ],
  "234": [
    {
      "ad": "ESMA",
      "soyad": "KUCUKBALKAN",
      "telefon": "05331420496",
      "tcKimlik": "DAIRESAHIBI",
      "email": null,
      "basRaw": "",
      "bitRaw": "",
      "kiraBedeli": null,
      "baslangiç": null,
      "bitis": null
    }
  ],
  "235": [
    {
      "ad": "MUSTAFA",
      "soyad": "KURT",
      "telefon": "05428009718",
      "tcKimlik": "DAIRESAHIBI",
      "email": null,
      "basRaw": "",
      "bitRaw": "",
      "kiraBedeli": null,
      "baslangiç": null,
      "bitis": null
    }
  ],
  "236": [
    {
      "ad": "YUSUF",
      "soyad": "SINAN OZDAGLAR",
      "telefon": "05075994559",
      "tcKimlik": "10241772420",
      "email": "yusufsinanozdaglar@gmail.com",
      "basRaw": "01.09.2025",
      "bitRaw": "01.09.2026",
      "kiraBedeli": 22000.0,
      "baslangiç": "2025-09-01",
      "bitis": "2026-09-01"
    }
  ],
  "238": [
    {
      "ad": "KADER",
      "soyad": "",
      "telefon": "05313123463",
      "tcKimlik": "DAIRESAHIBI",
      "email": null,
      "basRaw": "",
      "bitRaw": "",
      "kiraBedeli": null,
      "baslangiç": null,
      "bitis": null
    }
  ],
  "239": [
    {
      "ad": "CEM",
      "soyad": "UNAL",
      "telefon": "05322928304",
      "tcKimlik": "DAIRESAHIBI",
      "email": null,
      "basRaw": "",
      "bitRaw": "",
      "kiraBedeli": null,
      "baslangiç": null,
      "bitis": null
    }
  ],
  "240": [
    {
      "ad": "UTKU",
      "soyad": "DEMIRKO",
      "telefon": "05306271705",
      "tcKimlik": "11621663994",
      "email": "utku.demirko@gmail.com",
      "basRaw": "16.10.2025",
      "bitRaw": "16.09.2026",
      "kiraBedeli": 18000.0,
      "baslangiç": "2025-10-16",
      "bitis": "2026-09-16"
    }
  ],
  "241": [
    {
      "ad": "ISRAFIL",
      "soyad": "GOKBURUN",
      "telefon": "05323674696",
      "tcKimlik": "DAIRESAHIBI",
      "email": null,
      "basRaw": "",
      "bitRaw": "",
      "kiraBedeli": null,
      "baslangiç": null,
      "bitis": null
    }
  ]
};

function sozlesmeNo(no: string) { return `ETK3-${no.padStart(3,"0")}`; }

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-import-secret");
  if (secret !== SECRET) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const results = { daireler: 0, kiracılar: 0, sozlesmeler: 0, atlandı: 0, hatalar: [] as string[] };

  for (const d of DAIRELER) {
    const daireNo = d.no;
    const tip = d.tip === "Loft" ? "Loft" : d.tip === "2+1" ? "2+1" : "1+0";
    const kiracıListesi = KIRACILAR[daireNo] ?? [];
    const anaKiraci = kiracıListesi[0];
    const kiraBedeli = anaKiraci?.kiraBedeli ?? 0;

    const konut = await prisma.konut.upsert({
      where: { daireNo },
      create: {
        daireNo, blok: "3. Etap", katNo: 0, tip,
        metrekare: tip === "Loft" ? 45 : 30,
        kiraBedeli, durum: kiracıListesi.length > 0 ? "Dolu" : "Bos", etap: 3,
      },
      update: { tip, etap: 3, kiraBedeli: kiraBedeli || undefined },
    });
    results.daireler++;

    for (let i = 0; i < kiracıListesi.length; i++) {
      const k = kiracıListesi[i];
      if (!k.ad) continue;
      const tcKimlik = k.tcKimlik && k.tcKimlik.length >= 10 ? k.tcKimlik : null;
      const email = k.email?.trim().toLowerCase() || null;

      try {
        let ogrenci;
        if (tcKimlik) {
          ogrenci = await prisma.ogrenci.upsert({
            where: { tcKimlik },
            create: { ad: k.ad, soyad: k.soyad, tcKimlik, telefon: k.telefon || "0000000000", email },
            update: { ad: k.ad, soyad: k.soyad, telefon: k.telefon || "0000000000", ...(email ? { email } : {}) },
          });
        } else if (email) {
          ogrenci = await prisma.ogrenci.upsert({
            where: { email },
            create: { ad: k.ad, soyad: k.soyad, telefon: k.telefon || "0000000000", email },
            update: { ad: k.ad, soyad: k.soyad, telefon: k.telefon || "0000000000" },
          });
        } else {
          ogrenci = await prisma.ogrenci.create({
            data: { ad: k.ad, soyad: k.soyad, telefon: k.telefon || "0000000000" },
          });
        }
        results.kiracılar++;

        if (i === 0 && k.kiraBedeli && k.baslangiç && k.bitis) {
          const sNo = sozlesmeNo(daireNo);
          const mevcut = await prisma.sozlesme.findUnique({ where: { sozlesmeNo: sNo } });
          if (!mevcut) {
            await prisma.sozlesme.create({
              data: {
                sozlesmeNo: sNo, konutId: konut.id, ogrenciId: ogrenci.id,
                baslangicTarihi: new Date(k.baslangiç),
                bitisTarihi: new Date(k.bitis),
                aylikKira: k.kiraBedeli, depozito: k.kiraBedeli, durum: "Aktif",
              },
            });
            await prisma.konut.update({ where: { id: konut.id }, data: { durum: "Dolu" } });
            results.sozlesmeler++;
          } else { results.atlandı++; }
        }
      } catch (e: unknown) {
        results.hatalar.push(`Daire ${daireNo} - ${k.ad} ${k.soyad}: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
  }
  return NextResponse.json({ ok: true, ...results });
}
