use anchor_lang::prelude::*;

/// Supply-chain participants other than producers and consumers.
///
/// Roles are checked on-chain rather than in the backend, because the trust
/// claim in the PRD ("only an accredited auditor sets a grade") is only worth
/// making if a rogue backend cannot forge it.
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, Debug, InitSpace)]
pub enum ActorRole {
    /// Accredited laboratory. May record grades.
    Auditor,
    /// Consolidator moving rice out of the highlands. May log Distribution stops.
    Distributor,
    /// Store selling to consumers. May log Retail stops.
    Retailer,
}

#[account]
#[derive(InitSpace)]
pub struct Actor {
    pub authority: Pubkey,
    pub role: ActorRole,
    #[max_len(48)]
    pub name: String,
    /// Accreditation can be withdrawn without erasing the actor's history.
    pub active: bool,
    pub registered_at: i64,
    pub bump: u8,
}
