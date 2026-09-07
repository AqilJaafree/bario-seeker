use anchor_lang::prelude::*;

/// A counterfeit report against one batch.
///
/// Recording a report on-chain makes the signal tamper-evident and gives the
/// regulator a spatial feed. It is deliberately *not* a public accusation: the
/// PRD requires every report to route to a human, and the producer to have a
/// right of reply, before anything is shown to consumers.
#[account]
#[derive(InitSpace)]
pub struct Report {
    pub batch: Pubkey,
    pub reporter: Pubkey,
    /// Coarsened to the same ~1 km grid as consumer scans.
    pub lat: i32,
    pub lon: i32,
    #[max_len(64)]
    pub evidence_cid: String,
    pub created_at: i64,
    pub bump: u8,
}
