use anchor_lang::prelude::*;

use super::Grade;

/// What happened at a checkpoint.
///
/// The kind determines who is allowed to submit it and how the verification
/// page draws it — journey kinds form the route line, `ConsumerScan` forms the
/// heat layer underneath it.
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, Debug, InitSpace)]
pub enum CheckpointKind {
    /// Written automatically at batch registration, at the producer's farm.
    Farm,
    /// Village or cooperative aggregation point.
    Collection,
    /// Laboratory. Carries the grade.
    Audit,
    /// Consolidator pickup or transfer.
    Distribution,
    /// Store inbound. The last stop before a consumer.
    Retail,
    /// A consumer scanning a bag. Coordinates are coarsened to ~1 km.
    ConsumerScan,
}

impl CheckpointKind {
    /// Kinds that carry a meaningful price per kg.
    pub fn is_priced(&self) -> bool {
        matches!(
            self,
            CheckpointKind::Farm | CheckpointKind::Distribution | CheckpointKind::Retail
        )
    }
}

/// One append-only, geotagged event in a batch's life.
///
/// This is the single primitive behind four features: the consumer journey map,
/// the price journey, the audit history, and the scan-anomaly signal. No
/// instruction in this program mutates or closes a checkpoint once written.
#[account]
#[derive(InitSpace)]
pub struct Checkpoint {
    /// The `Batch` PDA this checkpoint belongs to.
    pub batch: Pubkey,
    /// Position in its sequence. Journey checkpoints and consumer scans are
    /// numbered separately and live under different seeds.
    pub index: u32,
    pub kind: CheckpointKind,
    /// The wallet that submitted this checkpoint. For consumer scans this is
    /// the relayer, not the consumer — consumers never hold a wallet.
    pub actor: Pubkey,
    /// Micro-degrees.
    pub lat: i32,
    pub lon: i32,
    #[max_len(64)]
    pub label: String,
    /// Sen per kg. Zero where the kind carries no price.
    pub price_sen: u32,
    /// Set on `Audit` checkpoints only.
    pub grade: Option<Grade>,
    /// IPFS CID for photos or the audit report. Empty where there is none.
    #[max_len(64)]
    pub note_cid: String,
    pub timestamp: i64,
    pub bump: u8,
}
