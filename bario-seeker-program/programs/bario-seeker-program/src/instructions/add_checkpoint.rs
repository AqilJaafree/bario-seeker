use anchor_lang::prelude::*;

use crate::constants::*;
use crate::error::BarioError;
use crate::state::{Actor, ActorRole, Batch, Checkpoint, CheckpointKind, Producer};
use crate::util::*;

/// Append a geotagged, priced stop to a batch's journey.
///
/// Role-gated: a Distributor may only log `Distribution` and `Collection`
/// stops, a Retailer only `Retail`. `Farm` and `Audit` are written by their own
/// instructions, and `ConsumerScan` by `record_scan`, so they cannot be forged
/// through this path.
#[derive(Accounts)]
#[instruction(args: AddCheckpointArgs)]
pub struct AddCheckpoint<'info> {
    #[account(mut)]
    pub actor_authority: Signer<'info>,

    #[account(
        seeds = [ACTOR_SEED, actor_authority.key().as_ref()],
        bump = actor.bump,
        constraint = actor.authority == actor_authority.key() @ BarioError::ActorNotRegistered,
        constraint = actor.active @ BarioError::ActorInactive,
    )]
    pub actor: Account<'info, Actor>,

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
        constraint = args.index == batch.checkpoint_count @ BarioError::CheckpointBatchMismatch,
    )]
    pub batch: Account<'info, Batch>,

    #[account(
        init,
        payer = actor_authority,
        space = 8 + Checkpoint::INIT_SPACE,
        seeds = [CHECKPOINT_SEED, batch.key().as_ref(), &args.index.to_le_bytes()],
        bump,
    )]
    pub checkpoint: Account<'info, Checkpoint>,

    pub system_program: Program<'info, System>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct AddCheckpointArgs {
    /// Must equal the batch's current `checkpoint_count`.
    pub index: u32,
    pub kind: CheckpointKind,
    pub lat: i32,
    pub lon: i32,
    /// e.g. "Tesco Pavilion, Kuala Lumpur".
    pub label: String,
    /// Sen per kg at this stop.
    pub price_sen: u32,
    /// IPFS CID for a delivery note or shelf photo. May be empty.
    pub note_cid: String,
}

/// Which checkpoint kinds each role may submit.
fn role_may_submit(role: ActorRole, kind: CheckpointKind) -> bool {
    match role {
        ActorRole::Distributor => matches!(
            kind,
            CheckpointKind::Collection | CheckpointKind::Distribution
        ),
        ActorRole::Retailer => matches!(kind, CheckpointKind::Retail),
        // Auditors write grades through `record_audit`, which also records the
        // report CID and updates the certificate. Letting them post a bare
        // Audit checkpoint here would create a second, weaker path to the same
        // claim.
        ActorRole::Auditor => false,
    }
}

pub fn add_checkpoint_handler(ctx: Context<AddCheckpoint>, args: AddCheckpointArgs) -> Result<()> {
    require!(
        !matches!(
            args.kind,
            CheckpointKind::Farm | CheckpointKind::Audit | CheckpointKind::ConsumerScan
        ),
        BarioError::InvalidCheckpointKind
    );
    require!(
        role_may_submit(ctx.accounts.actor.role, args.kind),
        BarioError::WrongRole
    );
    require_text(&args.label, MAX_LABEL_LEN)?;
    require_optional_text(&args.note_cid, MAX_CID_LEN)?;
    require_valid_coordinates(args.lat, args.lon)?;
    require!(args.price_sen > 0, BarioError::InvalidPrice);

    let now = Clock::get()?.unix_timestamp;
    let batch_key = ctx.accounts.batch.key();

    let checkpoint = &mut ctx.accounts.checkpoint;
    checkpoint.batch = batch_key;
    checkpoint.index = args.index;
    checkpoint.kind = args.kind;
    checkpoint.actor = ctx.accounts.actor_authority.key();
    checkpoint.lat = args.lat;
    checkpoint.lon = args.lon;
    checkpoint.label = args.label;
    checkpoint.price_sen = args.price_sen;
    checkpoint.grade = None;
    checkpoint.note_cid = args.note_cid;
    checkpoint.timestamp = now;
    checkpoint.bump = ctx.bumps.checkpoint;

    let batch = &mut ctx.accounts.batch;
    batch.checkpoint_count = batch
        .checkpoint_count
        .checked_add(1)
        .ok_or(BarioError::CounterOverflow)?;

    msg!(
        "Batch {} stop #{}: {:?} at {} — {}/kg",
        batch.batch_code,
        args.index,
        args.kind,
        checkpoint.label,
        format_sen(args.price_sen)
    );

    Ok(())
}
