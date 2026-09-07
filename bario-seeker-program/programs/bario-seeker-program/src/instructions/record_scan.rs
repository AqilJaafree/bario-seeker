use anchor_lang::prelude::*;

use crate::constants::*;
use crate::error::BarioError;
use crate::state::{Batch, Checkpoint, CheckpointKind, Producer};
use crate::util::*;

/// Record a consumer scan.
///
/// Permissionless by design: consumers never hold a wallet, so a platform
/// relayer pays the fee. The trade-off is that anyone can submit a scan, which
/// makes raw scan counts a soft signal rather than proof — the anomaly rules in
/// F7 treat them as one input among several, never as sole evidence.
#[derive(Accounts)]
#[instruction(args: RecordScanArgs)]
pub struct RecordScan<'info> {
    /// The relayer. Pays rent and fees on the consumer's behalf.
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
        seeds = [PRODUCER_SEED, producer.authority.as_ref()],
        bump = producer.bump,
    )]
    pub producer: Account<'info, Producer>,

    #[account(
        mut,
        seeds = [BATCH_SEED, producer.key().as_ref(), batch.batch_code.as_bytes()],
        bump = batch.bump,
        constraint = batch.producer == producer.key() @ BarioError::BatchProducerMismatch,
        constraint = args.index == batch.scan_count @ BarioError::CheckpointBatchMismatch,
    )]
    pub batch: Account<'info, Batch>,

    /// Scans live under their own seed namespace so they never interleave with
    /// the supply-chain journey — the route line and the heat layer are
    /// separate readings of the same primitive.
    #[account(
        init,
        payer = payer,
        space = 8 + Checkpoint::INIT_SPACE,
        seeds = [SCAN_SEED, batch.key().as_ref(), &args.index.to_le_bytes()],
        bump,
    )]
    pub scan: Account<'info, Checkpoint>,

    pub system_program: Program<'info, System>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct RecordScanArgs {
    /// Must equal the batch's current `scan_count`.
    pub index: u32,
    /// Approximate consumer location in micro-degrees. Clients must truncate to
    /// ~1 km before sending; the program snaps to the same grid regardless.
    pub lat: i32,
    pub lon: i32,
    /// Coarse place name, e.g. "Kuala Lumpur". Never a street address.
    pub label: String,
}

pub fn record_scan_handler(ctx: Context<RecordScan>, args: RecordScanArgs) -> Result<()> {
    require_valid_coordinates(args.lat, args.lon)?;
    require_optional_text(&args.label, MAX_LABEL_LEN)?;

    let now = Clock::get()?.unix_timestamp;
    let batch_key = ctx.accounts.batch.key();

    // Snap regardless of what the client sent. This ledger cannot forget, so
    // precise consumer coordinates must never reach it in the first place.
    let lat = coarsen(args.lat);
    let lon = coarsen(args.lon);

    let scan = &mut ctx.accounts.scan;
    scan.batch = batch_key;
    scan.index = args.index;
    scan.kind = CheckpointKind::ConsumerScan;
    scan.actor = ctx.accounts.payer.key();
    scan.lat = lat;
    scan.lon = lon;
    scan.label = args.label;
    scan.price_sen = 0;
    scan.grade = None;
    scan.note_cid = String::new();
    scan.timestamp = now;
    scan.bump = ctx.bumps.scan;

    let batch = &mut ctx.accounts.batch;
    batch.scan_count = batch
        .scan_count
        .checked_add(1)
        .ok_or(BarioError::CounterOverflow)?;

    msg!(
        "Batch {} scanned near {} ({} total)",
        batch.batch_code,
        scan.label,
        batch.scan_count
    );

    Ok(())
}
