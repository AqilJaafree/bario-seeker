use anchor_lang::prelude::*;

/// A registered Bario farmer or cooperative.
///
/// One per wallet, enforced by the PDA seeds. Mirrors the on-chain state that
/// backs the Producer SBT, and holds the running reputation aggregate so the
/// verification page can render a score without replaying every review.
#[account]
#[derive(InitSpace)]
pub struct Producer {
    /// The producer's wallet. Owns both SBTs but cannot move them.
    pub authority: Pubkey,
    /// Producer SBT — a frozen Metaplex Core asset.
    pub asset: Pubkey,
    /// This producer's own Core Collection, holding their batch SBTs.
    pub batch_collection: Pubkey,
    #[max_len(48)]
    pub name: String,
    /// Farm location in micro-degrees, validated against the Bario bounding box.
    pub farm_lat: i32,
    pub farm_lon: i32,
    pub farm_elevation_m: u16,
    /// Digest standing in for an off-chain identity verification record.
    /// No personally identifying data is ever written on-chain.
    pub identity_hash: [u8; 32],
    pub joined_at: i64,
    pub batch_count: u32,
    /// Quantity-weighted reputation: sum of (stars x batch kg) over all reviews.
    pub rating_sum: u64,
    /// Sum of batch kg over all reviews. Score = rating_sum / rating_weight.
    pub rating_weight: u64,
    pub bump: u8,
}

impl Producer {
    /// Mean rating in hundredths of a star (470 = 4.70), or `None` if unrated.
    ///
    /// Returned scaled so callers never need floating point to display it.
    pub fn rating_centistars(&self) -> Option<u32> {
        if self.rating_weight == 0 {
            return None;
        }
        Some((self.rating_sum.saturating_mul(100) / self.rating_weight) as u32)
    }
}
