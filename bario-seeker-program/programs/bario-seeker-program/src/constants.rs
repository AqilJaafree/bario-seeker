//! Seeds, geographic bounds and field size limits.
//!
//! Coordinates are stored as signed micro-degrees (degrees x 1_000_000), which
//! gives roughly 11 cm of resolution and keeps every arithmetic operation in
//! integers. Money is stored as sen (1/100 MYR) for the same reason: there is
//! no floating point anywhere in the price path.

use anchor_lang::prelude::*;

#[constant]
pub const CONFIG_SEED: &[u8] = b"config";
#[constant]
pub const PRODUCER_COLLECTION_SEED: &[u8] = b"producer_collection";
#[constant]
pub const ACTOR_SEED: &[u8] = b"actor";
#[constant]
pub const PRODUCER_SEED: &[u8] = b"producer";
#[constant]
pub const PRODUCER_ASSET_SEED: &[u8] = b"producer_asset";
#[constant]
pub const BATCH_COLLECTION_SEED: &[u8] = b"batch_collection";
#[constant]
pub const BATCH_SEED: &[u8] = b"batch";
#[constant]
pub const BATCH_ASSET_SEED: &[u8] = b"batch_asset";
#[constant]
pub const CHECKPOINT_SEED: &[u8] = b"checkpoint";
#[constant]
pub const SCAN_SEED: &[u8] = b"scan";
#[constant]
pub const REVIEW_SEED: &[u8] = b"review";
#[constant]
pub const REPORT_SEED: &[u8] = b"report";

/// Bario highlands bounding box, in micro-degrees.
///
/// Bario town sits at roughly 3.7333 N, 115.4667 E. The box is deliberately
/// generous — it covers the Kelabit Highlands paddy area rather than the town
/// alone — because a box that is too tight rejects honest farmers, which is a
/// far worse failure than admitting a plot near the edge.
pub const BARIO_LAT_MIN: i32 = 3_500_000;
pub const BARIO_LAT_MAX: i32 = 4_100_000;
pub const BARIO_LON_MIN: i32 = 115_200_000;
pub const BARIO_LON_MAX: i32 = 115_800_000;

/// The highland threshold that defines Bario rice, in metres.
pub const BARIO_MIN_ELEVATION_M: u16 = 1_100;

/// Sanity bounds for any coordinate on Earth, in micro-degrees.
pub const LAT_MIN: i32 = -90_000_000;
pub const LAT_MAX: i32 = 90_000_000;
pub const LON_MIN: i32 = -180_000_000;
pub const LON_MAX: i32 = 180_000_000;

/// Consumer scan coordinates are snapped to this grid before they are stored.
///
/// 10_000 micro-degrees is 0.01 degrees, a little over 1 km. Clients are
/// required to truncate before transmitting; the program snaps again so that a
/// careless or malicious client cannot write a precise consumer location to a
/// permanent public ledger.
pub const SCAN_GRID_MICRO: i32 = 10_000;

pub const MAX_NAME_LEN: usize = 48;
pub const MAX_LABEL_LEN: usize = 64;
pub const MAX_CID_LEN: usize = 64;
pub const MAX_BATCH_CODE_LEN: usize = 16;
pub const MAX_VARIETY_LEN: usize = 32;
pub const MAX_URI_LEN: usize = 200;

/// Ratings are 1..=5 stars.
pub const MIN_RATING: u8 = 1;
pub const MAX_RATING: u8 = 5;

/// Metaplex Core collection naming.
pub const PRODUCER_COLLECTION_NAME: &str = "Bario Seeker Producers";
