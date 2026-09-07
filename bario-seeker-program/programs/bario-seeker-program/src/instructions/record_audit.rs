use anchor_lang::prelude::*;
use mpl_core::instructions::UpdatePluginV1CpiBuilder;
use mpl_core::types::{Attributes, Plugin};

use crate::constants::*;
use crate::error::BarioError;
use crate::state::{
    Actor, ActorRole, Batch, Checkpoint, CheckpointKind, Config, Grade, Producer,
};
use crate::util::*;

#[derive(Accounts)]
#[instruction(args: RecordAuditArgs)]
pub struct RecordAudit<'info> {
    /// Must hold the Auditor role. This is the check the whole trust chain
    /// rests on, so it lives here rather than in a backend that could be
    /// bypassed or misconfigured.
    #[account(mut)]
    pub auditor: Signer<'info>,

    #[account(
        seeds = [CONFIG_SEED],
        bump = config.bump,
    )]
    pub config: Account<'info, Config>,

    #[account(
        seeds = [ACTOR_SEED, auditor.key().as_ref()],
        bump = actor.bump,
        constraint = actor.authority == auditor.key() @ BarioError::ActorNotRegistered,
        constraint = actor.active @ BarioError::ActorInactive,
        constraint = actor.role == ActorRole::Auditor @ BarioError::NotAuditor,
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

    /// CHECK: the Batch SBT, pinned to the batch record.
    #[account(mut, address = batch.asset)]
    pub batch_asset: UncheckedAccount<'info>,

    /// CHECK: the producer's Collection, pinned to the producer record.
    #[account(mut, address = producer.batch_collection)]
    pub batch_collection: UncheckedAccount<'info>,

    #[account(
        init,
        payer = auditor,
        space = 8 + Checkpoint::INIT_SPACE,
        seeds = [CHECKPOINT_SEED, batch.key().as_ref(), &args.index.to_le_bytes()],
        bump,
    )]
    pub checkpoint: Account<'info, Checkpoint>,

    /// CHECK: address-constrained to the Metaplex Core program.
    #[account(address = mpl_core::ID)]
    pub mpl_core_program: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct RecordAuditArgs {
    /// Must equal the batch's current `checkpoint_count`. Passing it explicitly
    /// makes a concurrent write fail loudly instead of overwriting a stop.
    pub index: u32,
    pub grade: Grade,
    /// Where the audit was carried out, in micro-degrees.
    pub lat: i32,
    pub lon: i32,
    /// e.g. "Sarawak Rice Laboratory, Miri".
    pub label: String,
    /// IPFS CID of the full audit report.
    pub report_cid: String,
}

pub fn record_audit_handler(ctx: Context<RecordAudit>, args: RecordAuditArgs) -> Result<()> {
    require!(args.grade.is_auditable(), BarioError::InvalidGrade);
    require_text(&args.label, MAX_LABEL_LEN)?;
    require_text(&args.report_cid, MAX_CID_LEN)?;
    require_valid_coordinates(args.lat, args.lon)?;

    let now = Clock::get()?.unix_timestamp;
    let batch_key = ctx.accounts.batch.key();

    // Append the audit as a checkpoint. A re-audit adds another one; nothing
    // is overwritten, so the full grading history stays readable forever.
    let checkpoint = &mut ctx.accounts.checkpoint;
    checkpoint.batch = batch_key;
    checkpoint.index = args.index;
    checkpoint.kind = CheckpointKind::Audit;
    checkpoint.actor = ctx.accounts.auditor.key();
    checkpoint.lat = args.lat;
    checkpoint.lon = args.lon;
    checkpoint.label = args.label;
    checkpoint.price_sen = 0;
    checkpoint.grade = Some(args.grade);
    checkpoint.note_cid = args.report_cid;
    checkpoint.timestamp = now;
    checkpoint.bump = ctx.bumps.checkpoint;

    let batch = &mut ctx.accounts.batch;
    batch.grade = args.grade;
    batch.checkpoint_count = batch
        .checkpoint_count
        .checked_add(1)
        .ok_or(BarioError::CounterOverflow)?;
    batch.audit_count = batch
        .audit_count
        .checked_add(1)
        .ok_or(BarioError::CounterOverflow)?;

    // Write the grade onto the certificate itself, so a wallet or explorer
    // shows it without consulting our backend.
    let attributes = vec![
        attr("producer", ctx.accounts.producer.name.clone()),
        attr("batch_code", batch.batch_code.clone()),
        attr("variety", batch.variety.clone()),
        attr("grade", format!("{:?}", args.grade)),
        attr("harvest_date", batch.harvest_date),
        attr("quantity_kg", batch.quantity_kg),
        attr("farmgate_price", format_sen(batch.farmgate_price_sen)),
        attr("audited_at", now),
        attr("audit_count", batch.audit_count),
        attr("auditor", ctx.accounts.actor.name.clone()),
    ];

    let config_signer: &[&[u8]] = &[CONFIG_SEED, &[ctx.accounts.config.bump]];

    UpdatePluginV1CpiBuilder::new(&ctx.accounts.mpl_core_program.to_account_info())
        .asset(&ctx.accounts.batch_asset.to_account_info())
        .collection(Some(&ctx.accounts.batch_collection.to_account_info()))
        .payer(&ctx.accounts.auditor.to_account_info())
        .authority(Some(&ctx.accounts.config.to_account_info()))
        .system_program(&ctx.accounts.system_program.to_account_info())
        .plugin(Plugin::Attributes(Attributes {
            attribute_list: attributes,
        }))
        .invoke_signed(&[config_signer])?;

    msg!(
        "Batch {} graded {:?} by {} (audit #{})",
        batch.batch_code,
        args.grade,
        ctx.accounts.actor.name,
        batch.audit_count
    );

    Ok(())
}
