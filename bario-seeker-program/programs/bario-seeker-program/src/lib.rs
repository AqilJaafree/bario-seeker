//! # Bario Seeker
//!
//! Soulbound provenance, grading and geotagged journey checkpoints for Bario
//! rice, on Solana.
//!
//! ## What is on-chain
//!
//! - **Producer SBT** — a Metaplex Core asset in the `Bario Seeker Producers`
//!   Collection, owned by the farmer's wallet and frozen at mint.
//! - **Batch SBT** — a Metaplex Core asset in *that producer's own* Collection,
//!   which is what makes the parent/child relationship structural rather than a
//!   claim in a database.
//! - **Checkpoints** — append-only, geotagged records of every stop a batch
//!   makes. One primitive serves four features: the consumer journey map, the
//!   price journey, the grading history, and the scan-anomaly signal.
//!
//! ## How soulbinding is enforced
//!
//! Every certificate carries `PermanentFreezeDelegate { frozen: true }` with
//! `PluginAuthority::None`. The Metaplex Core program itself refuses to
//! transfer or burn a frozen asset, and with a `None` authority the freeze can
//! never be lifted — not by the holder, not by the platform admin, and not by a
//! future upgrade of this program. See `util::soulbound_plugins`.
//!
//! ## What this program does not prove
//!
//! Coordinates are self-reported by whoever submits them. A checkpoint proves
//! that a registered actor asserted a place and a price at a time, and that the
//! assertion has not been altered since. It does not prove that the actor, or
//! the rice, was actually there. The defence is consistency across independent
//! actors and thousands of consumer scans, not the honesty of any one write.

use anchor_lang::prelude::*;

pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;
pub mod util;

use instructions::*;
use state::ActorRole;

declare_id!("7aTL3mhtrRg57Jr3dBmTgHYHufmsepzhPqbYMhioV5Yc");

#[program]
pub mod bario_seeker_program {
    use super::*;

    /// Create the platform config and the global producer Collection.
    /// Runs once per deployment.
    pub fn initialize(ctx: Context<Initialize>, collection_uri: String) -> Result<()> {
        instructions::initialize::initialize_handler(ctx, collection_uri)
    }

    /// Grant a wallet the Auditor, Distributor or Retailer role. Admin only.
    pub fn register_actor(
        ctx: Context<RegisterActor>,
        actor_authority: Pubkey,
        role: ActorRole,
        name: String,
    ) -> Result<()> {
        instructions::register_actor::register_actor_handler(ctx, actor_authority, role, name)
    }

    /// Withdraw or restore an actor's accreditation. Their existing
    /// checkpoints are deliberately left in place.
    pub fn set_actor_active(ctx: Context<SetActorActive>, active: bool) -> Result<()> {
        instructions::register_actor::set_actor_active_handler(ctx, active)
    }

    /// Register a Bario producer: validates the farm is in the highlands,
    /// mints their soulbound identity, and creates their harvest Collection.
    pub fn register_producer(
        ctx: Context<RegisterProducer>,
        args: RegisterProducerArgs,
    ) -> Result<()> {
        instructions::register_producer::register_producer_handler(ctx, args)
    }

    /// Register a harvest lot: mints its soulbound certificate into the
    /// producer's Collection and writes checkpoint #0 at the farm.
    pub fn register_batch(ctx: Context<RegisterBatch>, args: RegisterBatchArgs) -> Result<()> {
        instructions::register_batch::register_batch_handler(ctx, args)
    }

    /// Record an independent lab audit. Auditor role required.
    /// Re-audits append; they never overwrite.
    pub fn record_audit(ctx: Context<RecordAudit>, args: RecordAuditArgs) -> Result<()> {
        instructions::record_audit::record_audit_handler(ctx, args)
    }

    /// Append a geotagged, priced stop. Distributor or Retailer role required.
    pub fn add_checkpoint(ctx: Context<AddCheckpoint>, args: AddCheckpointArgs) -> Result<()> {
        instructions::add_checkpoint::add_checkpoint_handler(ctx, args)
    }

    /// Record a consumer scan at ~1 km precision. Permissionless; a relayer pays.
    pub fn record_scan(ctx: Context<RecordScan>, args: RecordScanArgs) -> Result<()> {
        instructions::record_scan::record_scan_handler(ctx, args)
    }

    /// Rate a batch 1-5 stars. One rating per wallet per batch.
    pub fn rate_batch(ctx: Context<RateBatch>, rating: u8, review_cid: String) -> Result<()> {
        instructions::rate_batch::rate_batch_handler(ctx, rating, review_cid)
    }

    /// File a counterfeit report against a batch. One per wallet per batch.
    pub fn report_counterfeit(
        ctx: Context<ReportCounterfeit>,
        lat: i32,
        lon: i32,
        evidence_cid: String,
    ) -> Result<()> {
        instructions::report_counterfeit::report_counterfeit_handler(ctx, lat, lon, evidence_cid)
    }
}
