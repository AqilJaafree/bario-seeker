/**
 * The demo dataset: three real Kelabit Highlands farms and six harvest lots,
 * each walking the actual road Bario rice travels to a Klang Valley shelf.
 *
 * Prices are drawn from the ranges in the PRD — roughly RM15-16/kg at the
 * farmgate rising to RM19-23/kg on the shelf — so the price journey on the
 * verification page shows a realistic markup rather than a flattering one.
 */
import { PLACES, Place, daysAgo, deg, rm } from "./bario";

export interface DemoProducer {
  key: string;
  name: string;
  farm: Place;
  elevationM: number;
  /** Village collection point this producer delivers to. */
  collectionPoint: Place;
}

export interface DemoBatch {
  producerKey: string;
  batchCode: string;
  variety: string;
  harvestDaysAgo: number;
  quantityKg: number;
  bagCount: number;
  farmgateSen: number;
  /** `null` leaves the batch Pending, which the page must show honestly. */
  grade: "a1" | "a2" | "b" | null;
  distributionSen: number;
  retail: Place;
  retailSen: number;
  scanCount: number;
  ratings: number[];
}

export const PRODUCERS: DemoProducer[] = [
  {
    key: "ruben",
    name: "Ruben Kalang",
    farm: PLACES.barioAsal,
    elevationM: 1130,
    collectionPoint: { label: "Bario Asal Collection Point", lat: deg(3.7471), lon: deg(115.4562) },
  },
  {
    key: "sina",
    name: "Sina Rian",
    farm: { label: "Pa' Umor, Kelabit Highlands", lat: deg(3.762), lon: deg(115.489) },
    elevationM: 1155,
    collectionPoint: { label: "Bario Asal Collection Point", lat: deg(3.7471), lon: deg(115.4562) },
  },
  {
    key: "balang",
    name: "Balang Radu",
    farm: PLACES.paDalih,
    elevationM: 1182,
    collectionPoint: { label: "Pa' Dalih Collection Point", lat: deg(3.6091), lon: deg(115.5501) },
  },
];

export const BATCHES: DemoBatch[] = [
  {
    producerKey: "ruben",
    batchCode: "2026-11-001",
    variety: "Adan Halus",
    harvestDaysAgo: 22,
    quantityKg: 500,
    bagCount: 200,
    farmgateSen: rm(15.5),
    grade: "a1",
    distributionSen: rm(17.5),
    retail: PLACES.pavilionKl,
    retailSen: rm(21.5),
    scanCount: 6,
    ratings: [5, 5, 4],
  },
  {
    producerKey: "ruben",
    batchCode: "2026-10-014",
    variety: "Adan Merah",
    harvestDaysAgo: 48,
    quantityKg: 260,
    bagCount: 104,
    farmgateSen: rm(16.2),
    grade: "a1",
    distributionSen: rm(18.4),
    retail: PLACES.usjSubang,
    retailSen: rm(22.9),
    scanCount: 4,
    ratings: [5, 4],
  },
  {
    producerKey: "sina",
    batchCode: "2026-11-002",
    variety: "Adan Halus",
    harvestDaysAgo: 19,
    quantityKg: 320,
    bagCount: 128,
    farmgateSen: rm(15.0),
    grade: "a2",
    distributionSen: rm(16.9),
    retail: PLACES.midValley,
    retailSen: rm(19.8),
    scanCount: 5,
    ratings: [4, 4, 3],
  },
  {
    producerKey: "sina",
    batchCode: "2026-11-007",
    variety: "Adan Putih",
    harvestDaysAgo: 12,
    quantityKg: 180,
    bagCount: 72,
    farmgateSen: rm(14.8),
    grade: "b",
    distributionSen: rm(16.2),
    retail: PLACES.midValley,
    retailSen: rm(18.5),
    scanCount: 2,
    ratings: [3],
  },
  {
    producerKey: "balang",
    batchCode: "2026-10-031",
    variety: "Adan Merah",
    harvestDaysAgo: 55,
    quantityKg: 410,
    bagCount: 164,
    farmgateSen: rm(16.0),
    grade: "a1",
    distributionSen: rm(18.0),
    retail: PLACES.pavilionKl,
    retailSen: rm(22.4),
    scanCount: 7,
    ratings: [5, 5, 5, 4],
  },
  {
    // Deliberately left unaudited: the verification page has to show a real
    // "awaiting audit" state, not pretend every bag is graded.
    producerKey: "balang",
    batchCode: "2026-12-002",
    variety: "Adan Halus",
    harvestDaysAgo: 3,
    quantityKg: 220,
    bagCount: 88,
    farmgateSen: rm(15.9),
    grade: null,
    distributionSen: 0,
    retail: PLACES.pavilionKl,
    retailSen: 0,
    scanCount: 0,
    ratings: [],
  },
];

export const harvestTimestamp = (b: DemoBatch): number => daysAgo(b.harvestDaysAgo);
