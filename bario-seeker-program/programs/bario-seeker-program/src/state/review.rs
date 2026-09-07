use anchor_lang::prelude::*;

/// A consumer rating of one batch.
///
/// Seeded by (batch, reviewer) so one wallet can rate a batch exactly once.
/// Review prose lives off-chain; only its CID is anchored here.
#[account]
#[derive(InitSpace)]
pub struct Review {
    pub batch: Pubkey,
    pub reviewer: Pubkey,
    /// 1..=5 stars.
    pub rating: u8,
    #[max_len(64)]
    pub review_cid: String,
    pub created_at: i64,
    pub bump: u8,
}
