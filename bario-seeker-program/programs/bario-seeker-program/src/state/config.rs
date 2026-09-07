use anchor_lang::prelude::*;

/// Platform-wide singleton. Owns the global producer Collection and acts as the
/// update authority for every Metaplex Core asset the program mints, which is
/// what makes the soulbound guarantee hold: the freeze authority is this PDA,
/// and no private key controls it.
#[account]
#[derive(InitSpace)]
pub struct Config {
    /// May register actors and hand over admin.
    pub admin: Pubkey,
    /// The `Bario Seeker Producers` Metaplex Core Collection.
    pub producer_collection: Pubkey,
    pub producer_count: u32,
    pub batch_count: u32,
    pub bump: u8,
}
