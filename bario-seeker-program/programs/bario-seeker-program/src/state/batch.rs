use anchor_lang::prelude::*;

/// Audited quality classification.
///
/// `Pending` is the state between registration and the first audit. It is a
/// real state, not a null: a bag can legitimately be in the supply chain before
/// its lab result comes back, and the verification page must say so plainly
/// rather than implying a grade the batch has not earned.
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, Debug, InitSpace)]
pub enum Grade {
    Pending,
    /// <5% broken grain, <12% moisture, uniform colour.
    A1,
    /// 5-8% broken grain, <13% moisture, minor discolouration.
    A2,
    /// 8-12% broken grain, <14% moisture, visible colour variance.
    B,
}

impl Grade {
    /// An audit may set a real grade but never revert a batch to `Pending`.
    pub fn is_auditable(&self) -> bool {
        !matches!(self, Grade::Pending)
    }
}

/// One harvest lot, certified as a child of its producer.
#[account]
#[derive(InitSpace)]
pub struct Batch {
    /// The `Producer` PDA this batch belongs to.
    pub producer: Pubkey,
    /// Batch SBT — a frozen Metaplex Core asset in the producer's Collection.
    pub asset: Pubkey,
    #[max_len(16)]
    pub batch_code: String,
    #[max_len(32)]
    pub variety: String,
    /// The most recent audited grade. Earlier grades are never erased — they
    /// remain readable as `Audit` checkpoints.
    pub grade: Grade,
    pub harvest_date: i64,
    pub quantity_kg: u32,
    pub bag_count: u32,
    /// What the farmer was paid, in sen per kg.
    pub farmgate_price_sen: u32,
    /// Next index in the journey checkpoint sequence.
    pub checkpoint_count: u32,
    /// How many audits this batch has had. >1 means it was re-audited.
    pub audit_count: u16,
    /// Next index in the consumer scan sequence.
    pub scan_count: u32,
    pub rating_sum: u32,
    pub rating_count: u32,
    pub report_count: u32,
    pub registered_at: i64,
    pub bump: u8,
}

impl Batch {
    /// Mean rating in hundredths of a star (480 = 4.80), or `None` if unrated.
    pub fn rating_centistars(&self) -> Option<u32> {
        if self.rating_count == 0 {
            return None;
        }
        Some(self.rating_sum.saturating_mul(100) / self.rating_count)
    }
}
