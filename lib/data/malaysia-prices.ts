export type RiceGrade = "A1" | "A2" | "B";

export interface StatePriceData {
  id: string; // MY01 to MY16
  name: string;
  shortName: string;
  region: "Peninsular" | "Borneo";
  isOrigin?: boolean;
  prices: {
    A1: number;
    A2: number;
    B: number;
  };
  sampleRetailers: string[];
  stockistCount: number;
  avgMarkupPct: number;
  status: "verified" | "monitoring" | "high_risk";
  notes: string;
}

export const FARMGATE_PRICE_BENCHMARK = {
  A1: 15.5,
  A2: 13.8,
  B: 12.0,
};

export const MALAYSIA_STATES_DATA: Record<string, StatePriceData> = {
  MY13: {
    id: "MY13",
    name: "Sarawak",
    shortName: "SWK",
    region: "Borneo",
    isOrigin: true,
    prices: {
      A1: 17.5,
      A2: 15.2,
      B: 13.5,
    },
    sampleRetailers: [
      "Bario Highland Cooperative (Origin)",
      "Kuching Central Market Grocer",
      "Miri Specialty Rice Depo",
    ],
    stockistCount: 38,
    avgMarkupPct: 12.9,
    status: "verified",
    notes:
      "Origin territory (Kelabit Highlands, elevation ≥1,100m). Base farmgate pricing monitored directly at mill gate.",
  },
  MY12: {
    id: "MY12",
    name: "Sabah",
    shortName: "SBH",
    region: "Borneo",
    prices: {
      A1: 19.8,
      A2: 17.2,
      B: 15.0,
    },
    sampleRetailers: [
      "Gaya Street Organic Corner, KK",
      "Citymall Premium Grocer",
      "Sandakan Sea & Mountain Foods",
    ],
    stockistCount: 19,
    avgMarkupPct: 27.7,
    status: "monitoring",
    notes:
      "Direct sea/air logistics from Miri to Kota Kinabalu. Steady demand with moderate markups.",
  },
  MY14: {
    id: "MY14",
    name: "Kuala Lumpur",
    shortName: "KUL",
    region: "Peninsular",
    prices: {
      A1: 24.5,
      A2: 21.0,
      B: 18.5,
    },
    sampleRetailers: [
      "Village Grocer Bangsar Village",
      "Ben's Independent Grocer (B.I.G.) Publika",
      "Isetan KLCC Foodmarket",
      "Aeon Mid Valley Megamall",
    ],
    stockistCount: 64,
    avgMarkupPct: 58.1,
    status: "high_risk",
    notes:
      "Primary retail volume hub. Counterfeit incidence historically high (40–50% mislabelled without SBT verification).",
  },
  MY10: {
    id: "MY10",
    name: "Selangor",
    shortName: "SGR",
    region: "Peninsular",
    prices: {
      A1: 23.8,
      A2: 20.5,
      B: 18.0,
    },
    sampleRetailers: [
      "Jaya Grocer The Starling, PJ",
      "Aeon Bandar Utama",
      "HeroMarket Subang Jaya",
    ],
    stockistCount: 52,
    avgMarkupPct: 53.5,
    status: "high_risk",
    notes:
      "Dense suburban market with high wellness-oriented consumer demand. Shelf prices vary between RM21 and RM27/kg.",
  },
  MY07: {
    id: "MY07",
    name: "Pulau Pinang",
    shortName: "PNG",
    region: "Peninsular",
    prices: {
      A1: 23.2,
      A2: 19.8,
      B: 17.5,
    },
    sampleRetailers: [
      "Gurney Paragon Market Hall",
      "Sunshine Farlim Gourmet",
      "Queensbay Aeon",
    ],
    stockistCount: 22,
    avgMarkupPct: 49.7,
    status: "verified",
    notes:
      "Strong demand among older home cooks and heritage restaurants. Verified direct distributor chain.",
  },
  MY01: {
    id: "MY01",
    name: "Johor",
    shortName: "JHR",
    region: "Peninsular",
    prices: {
      A1: 24.0,
      A2: 20.8,
      B: 18.2,
    },
    sampleRetailers: [
      "Mid Valley Southkey Grocer, JB",
      "Aeon Tebrau City",
      "Village Grocer Mall of Medini",
    ],
    stockistCount: 28,
    avgMarkupPct: 54.8,
    status: "monitoring",
    notes:
      "Cross-border spillover demand from Singapore. Premium pricing sustained across Grade A1 batches.",
  },
  MY08: {
    id: "MY08",
    name: "Perak",
    shortName: "PRK",
    region: "Peninsular",
    prices: {
      A1: 22.0,
      A2: 19.0,
      B: 16.8,
    },
    sampleRetailers: [
      "Aeon Mall Kinta City, Ipoh",
      "Ipoh Old Town Natural Foods",
    ],
    stockistCount: 16,
    avgMarkupPct: 41.9,
    status: "verified",
    notes:
      "Steady retail base with traditional grocery adoption. Margin remains below Klang Valley peak.",
  },
  MY06: {
    id: "MY06",
    name: "Pahang",
    shortName: "PHG",
    region: "Peninsular",
    prices: {
      A1: 22.5,
      A2: 19.2,
      B: 17.0,
    },
    sampleRetailers: [
      "Kuantan City Mall Supermarket",
      "Genting Highlands Premium Grocer",
    ],
    stockistCount: 14,
    avgMarkupPct: 45.2,
    status: "verified",
    notes:
      "Supplied through East Coast distributor corridor; hospitality buyers in Genting.",
  },
  MY05: {
    id: "MY05",
    name: "Negeri Sembilan",
    shortName: "NSN",
    region: "Peninsular",
    prices: {
      A1: 22.2,
      A2: 18.9,
      B: 16.5,
    },
    sampleRetailers: [
      "Aeon Mall Seremban 2",
      "Seremban Gateway Organics",
    ],
    stockistCount: 11,
    avgMarkupPct: 43.2,
    status: "verified",
    notes: "Direct distributor drop from Klang Valley depot.",
  },
  MY04: {
    id: "MY04",
    name: "Melaka",
    shortName: "MLK",
    region: "Peninsular",
    prices: {
      A1: 22.8,
      A2: 19.4,
      B: 16.9,
    },
    sampleRetailers: [
      "Mahkota Parade Gourmet",
      "Aeon Bandaraya Melaka",
    ],
    stockistCount: 12,
    avgMarkupPct: 47.1,
    status: "verified",
    notes: "Key culinary market for Peranakan and heritage restaurants.",
  },
  MY02: {
    id: "MY02",
    name: "Kedah",
    shortName: "KDH",
    region: "Peninsular",
    prices: {
      A1: 21.5,
      A2: 18.5,
      B: 16.2,
    },
    sampleRetailers: [
      "Aman Central Grocer, Alor Setar",
      "Langkawi Fair Supermarket",
    ],
    stockistCount: 9,
    avgMarkupPct: 38.7,
    status: "verified",
    notes:
      "Malaysia's rice bowl state; Bario rice sold as distinct high-altitude specialty grain.",
  },
  MY03: {
    id: "MY03",
    name: "Kelantan",
    shortName: "KTN",
    region: "Peninsular",
    prices: {
      A1: 21.0,
      A2: 18.2,
      B: 16.0,
    },
    sampleRetailers: [
      "KB Mall Supermarket, Kota Bharu",
      "Pasir Mas Specialty Dry Foods",
    ],
    stockistCount: 8,
    avgMarkupPct: 35.5,
    status: "monitoring",
    notes:
      "Lower retail markup with smaller distribution volumes.",
  },
  MY11: {
    id: "MY11",
    name: "Terengganu",
    shortName: "TRG",
    region: "Peninsular",
    prices: {
      A1: 21.5,
      A2: 18.5,
      B: 16.2,
    },
    sampleRetailers: [
      "KTCC Mall Gourmet Store",
      "Chukai Kemaman Grocer",
    ],
    stockistCount: 7,
    avgMarkupPct: 38.7,
    status: "monitoring",
    notes: "Coastal logistics route with emerging verified retail outlets.",
  },
  MY09: {
    id: "MY09",
    name: "Perlis",
    shortName: "PLS",
    region: "Peninsular",
    prices: {
      A1: 21.0,
      A2: 18.0,
      B: 15.8,
    },
    sampleRetailers: ["Kangar Central Mart"],
    stockistCount: 4,
    avgMarkupPct: 35.5,
    status: "verified",
    notes: "Smallest regional volume; verified stockist delivery on order.",
  },
  MY15: {
    id: "MY15",
    name: "Labuan",
    shortName: "LBN",
    region: "Borneo",
    prices: {
      A1: 20.5,
      A2: 17.8,
      B: 15.5,
    },
    sampleRetailers: ["Financial Park Duty-Free Grocer"],
    stockistCount: 5,
    avgMarkupPct: 32.3,
    status: "verified",
    notes: "Federal Territory duty-free supply chain via Kota Kinabalu.",
  },
  MY16: {
    id: "MY16",
    name: "Putrajaya",
    shortName: "PJY",
    region: "Peninsular",
    prices: {
      A1: 24.2,
      A2: 20.9,
      B: 18.3,
    },
    sampleRetailers: [
      "Alamanda Shopping Centre Foodmarket",
      "IOI City Mall Premium Gourmet",
    ],
    stockistCount: 14,
    avgMarkupPct: 56.1,
    status: "high_risk",
    notes:
      "Administrative capital with premium consumer demographic. Similar pricing profile to Klang Valley.",
  },
};

export interface VerifiedBatchSample {
  batchId: string;
  producerName: string;
  producerLocation: string;
  producerPhoto: string;
  farmElevationMeters: number;
  grade: RiceGrade;
  harvestDate: string;
  auditDate: string;
  auditorOrg: string;
  labCertificateId: string;
  brokenGrainPct: number;
  moisturePct: number;
  quantityBags: number;
  sbtTokenHash: string;
  priceJourney: {
    stage: string;
    actor: string;
    location: string;
    price: number;
    marginPct?: number;
    date: string;
  }[];
}

export const SAMPLE_BATCH_2026: VerifiedBatchSample = {
  batchId: "2026-11-001",
  producerName: "Ruben Kalang & Family",
  producerLocation: "Bario Asal Lembaa, Sarawak",
  producerPhoto:
    "https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&auto=format&fit=crop&q=80",
  farmElevationMeters: 1180,
  grade: "A1",
  harvestDate: "15 Nov 2026",
  auditDate: "17 Nov 2026",
  auditorOrg: "Sarawak Agri-Lab Accreditation (DOA-SAR-782)",
  labCertificateId: "SBT-AUD-2026-BAR-9902",
  brokenGrainPct: 3.2,
  moisturePct: 11.4,
  quantityBags: 350,
  sbtTokenHash: "5fK7x9PqM3vL8z2A1bE4tG6kH",
  priceJourney: [
    {
      stage: "Farmgate",
      actor: "Ruben K. (Producer SBT #402)",
      location: "Bario Highlands, Sarawak",
      price: 15.5,
      date: "1 Nov 2026",
    },
    {
      stage: "Regional Distributor",
      actor: "Sarawak Highlands Logistic Hub",
      location: "Kuching Hub",
      price: 17.5,
      marginPct: 12.9,
      date: "2 Nov 2026",
    },
    {
      stage: "Peninsula Retail Shelf",
      actor: "Village Grocer Bangsar / KL Retail Point",
      location: "Kuala Lumpur",
      price: 24.5,
      marginPct: 40.0,
      date: "5 Nov 2026",
    },
  ],
};
