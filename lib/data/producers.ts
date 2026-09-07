import { RiceGrade } from "@/lib/data/malaysia-prices";

export interface Review {
  id: string;
  author: string;
  rating: number;
  comment: string;
  date: string;
  retailer?: string;
}

export interface Batch {
  batchId: string;
  grade: RiceGrade;
  harvestDate: string;
  auditDate: string;
  auditorOrg: string;
  labCertificateId: string;
  brokenGrainPct: number;
  moisturePct: number;
  quantityBags: number;
  sbtTokenHash: string;
  sellPriceRmKg: number;
  bagSizeKg: number;
}

export interface Producer {
  id: string;
  sbtId: string;
  name: string;
  location: string;
  region: "Bario Asal" | "Pa' Dalih" | "Pa' Lungan" | "Bario Arur Dalan";
  elevationMeters: number;
  photo: string;
  joinedYear: number;
  bio: string;
  rating: number;
  reviewCount: number;
  batches: Batch[];
  reviews: Review[];
}

const PLACEHOLDER_PHOTO = "/images/bario-farmer.jpg";

export const PRODUCERS: Producer[] = [
  {
    id: "ruben-kalang",
    sbtId: "#BAR-402",
    name: "Ruben Kalang & Family",
    location: "Bario Asal Lembaa, Sarawak",
    region: "Bario Asal",
    elevationMeters: 1180,
    photo: PLACEHOLDER_PHOTO,
    joinedYear: 2015,
    bio: "Third-generation Kelabit smallholder. Farms 4 terraces on the Bario Asal plain, hand-harvested and sun-dried before milling.",
    rating: 4.7,
    reviewCount: 142,
    batches: [
      {
        batchId: "2026-11-001",
        grade: "A1",
        harvestDate: "15 Nov 2026",
        auditDate: "17 Nov 2026",
        auditorOrg: "Sarawak Agri-Lab Accreditation (DOA-SAR-782)",
        labCertificateId: "SBT-AUD-2026-BAR-9902",
        brokenGrainPct: 3.2,
        moisturePct: 11.4,
        quantityBags: 350,
        sbtTokenHash: "5fK7x9PqM3vL8z2A1bE4tG6kH",
        sellPriceRmKg: 24.5,
        bagSizeKg: 5,
      },
      {
        batchId: "2026-06-014",
        grade: "A2",
        harvestDate: "10 Jun 2026",
        auditDate: "12 Jun 2026",
        auditorOrg: "Sarawak Agri-Lab Accreditation (DOA-SAR-782)",
        labCertificateId: "SBT-AUD-2026-BAR-6614",
        brokenGrainPct: 6.1,
        moisturePct: 12.6,
        quantityBags: 210,
        sbtTokenHash: "7mN2p4RxQ8wZ1c3D5eF9tJ0oI",
        sellPriceRmKg: 20.5,
        bagSizeKg: 5,
      },
    ],
    reviews: [
      { id: "r1", author: "Siti H.", rating: 5, comment: "Grains cook up whole every time. Can taste the difference from supermarket Bario.", date: "20 Nov 2026", retailer: "Village Grocer Bangsar" },
      { id: "r2", author: "Wong K.L.", rating: 4, comment: "Good batch, one bag arrived slightly damp from storage at the store, not the farm's fault.", date: "8 Nov 2026", retailer: "Village Grocer Bangsar" },
      { id: "r3", author: "Aina R.", rating: 5, comment: "Scanned the QR right in the aisle, parents finally believe it's real Bario now.", date: "22 Oct 2026" },
    ],
  },
  {
    id: "lucy-baru",
    sbtId: "#BAR-418",
    name: "Lucy Baru Cooperative",
    location: "Pa' Dalih, Sarawak",
    region: "Pa' Dalih",
    elevationMeters: 1240,
    photo: PLACEHOLDER_PHOTO,
    joinedYear: 2018,
    bio: "Women-led cooperative of 6 smallholder families in Pa' Dalih, pooling harvests for a single audited batch each season.",
    rating: 4.9,
    reviewCount: 96,
    batches: [
      {
        batchId: "2026-11-007",
        grade: "A1",
        harvestDate: "18 Nov 2026",
        auditDate: "20 Nov 2026",
        auditorOrg: "Sarawak Agri-Lab Accreditation (DOA-SAR-782)",
        labCertificateId: "SBT-AUD-2026-BAR-9918",
        brokenGrainPct: 2.6,
        moisturePct: 10.9,
        quantityBags: 180,
        sbtTokenHash: "9qR4t6VbN2mL7x1C3sD8fG5jK",
        sellPriceRmKg: 25.0,
        bagSizeKg: 5,
      },
    ],
    reviews: [
      { id: "r1", author: "Farah N.", rating: 5, comment: "Best grade A1 I've had. Proud to support a women-led co-op too.", date: "24 Nov 2026", retailer: "Ben's Independent Grocer" },
      { id: "r2", author: "Tan C.H.", rating: 5, comment: "Consistent quality across two purchases, both scanned clean.", date: "1 Nov 2026" },
    ],
  },
  {
    id: "james-lian",
    sbtId: "#BAR-355",
    name: "James Lian",
    location: "Pa' Lungan, Sarawak",
    region: "Pa' Lungan",
    elevationMeters: 1310,
    photo: PLACEHOLDER_PHOTO,
    joinedYear: 2012,
    bio: "One of the highest-elevation registered farms on the platform. Small yield, sold almost entirely to hotel and restaurant buyers.",
    rating: 4.6,
    reviewCount: 58,
    batches: [
      {
        batchId: "2026-10-022",
        grade: "A1",
        harvestDate: "22 Oct 2026",
        auditDate: "24 Oct 2026",
        auditorOrg: "Sarawak Agri-Lab Accreditation (DOA-SAR-782)",
        labCertificateId: "SBT-AUD-2026-BAR-8871",
        brokenGrainPct: 3.8,
        moisturePct: 11.8,
        quantityBags: 90,
        sbtTokenHash: "3wE5r7YtU1iO9pA2sD4fG6hJ",
        sellPriceRmKg: 26.0,
        bagSizeKg: 5,
      },
    ],
    reviews: [
      { id: "r1", author: "Chef Marcus T.", rating: 5, comment: "We put his name on the menu. Guests ask about it more than the wine list.", date: "2 Nov 2026", retailer: "The Ritz-Carlton, Kuala Lumpur" },
      { id: "r2", author: "Yeoh S.", rating: 4, comment: "Excellent grain, wish supply was bigger.", date: "18 Oct 2026" },
    ],
  },
  {
    id: "peter-along",
    sbtId: "#BAR-390",
    name: "Peter Along",
    location: "Bario Arur Dalan, Sarawak",
    region: "Bario Arur Dalan",
    elevationMeters: 1120,
    photo: PLACEHOLDER_PHOTO,
    joinedYear: 2016,
    bio: "Runs the largest single-family plot in Arur Dalan. Recently re-audited after a moisture dispute; re-audit is public per platform policy.",
    rating: 4.3,
    reviewCount: 71,
    batches: [
      {
        batchId: "2026-09-005",
        grade: "A2",
        harvestDate: "5 Sep 2026",
        auditDate: "7 Sep 2026",
        auditorOrg: "Sarawak Agri-Lab Accreditation (DOA-SAR-782)",
        labCertificateId: "SBT-AUD-2026-BAR-7743",
        brokenGrainPct: 7.4,
        moisturePct: 12.9,
        quantityBags: 260,
        sbtTokenHash: "1xC3v5BnM7qA9wE2rT4yU6iO",
        sellPriceRmKg: 20.5,
        bagSizeKg: 5,
      },
    ],
    reviews: [
      { id: "r1", author: "Ravi K.", rating: 3, comment: "One bag had more broken grain than expected, but producer responded and platform confirmed re-audit.", date: "15 Sep 2026", retailer: "Aeon Bandar Utama" },
      { id: "r2", author: "Lim P.F.", rating: 5, comment: "Latest batch after the re-audit was excellent.", date: "20 Sep 2026" },
    ],
  },
];

export function getProducerById(id: string): Producer | undefined {
  return PRODUCERS.find((p) => p.id === id);
}

export function getBatchWithProducer(
  batchId: string
): { producer: Producer; batch: Batch } | undefined {
  for (const producer of PRODUCERS) {
    const batch = producer.batches.find((b) => b.batchId === batchId);
    if (batch) return { producer, batch };
  }
  return undefined;
}

export function getLatestBatch(producer: Producer): Batch {
  return producer.batches[0];
}
