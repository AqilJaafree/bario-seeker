use anchor_lang::prelude::*;
use mpl_core::instructions::CreateV2CpiBuilder;

use crate::constants::*;
use crate::error::BarioError;
use crate::state::{Batch, Checkpoint, CheckpointKind, Config, Grade, Producer};
use crate::util::*;

#[derive(Accounts)]
#[instruction(args: RegisterBatchArgs)]
pub struct RegisterBatch<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        mut,
        seeds = [CONFIG_SEED],
        bump = config.bump,
    )]
    pub config: Account<'info, Config>,

    #[account(
        mut,
        seeds = [PRODUCER_SEED, authority.key().as_ref()],
        bump = producer.bump,
        has_one = authority,
    )]
    pub producer: Account<'info, Producer>,

    #[account(
        init,
        payer = authority,
        space = 8 + Batch::INIT_SPACE,
        seeds = [BATCH_SEED, producer.key().as_ref(), args.batch_code.as_bytes()],
        bump,
    )]
    pub batch: Account<'info, Batch>,

    /// The Batch SBT.
    ///
    /// CHECK: created by Metaplex Core via CPI; address constrained by seeds.
    #[account(
        mut,
        seeds = [BATCH_ASSET_SEED, producer.key().as_ref(), args.batch_code.as_bytes()],
        bump,
    )]
    pub batch_asset: UncheckedAccount<'info>,

    /// CHECK: this producer's own Collection, pinned to the producer record.
    #[account(mut, address = producer.batch_collection)]
    pub batch_collection: UncheckedAccount<'info>,

    /// Checkpoint #0 — the farm. Written in the same transaction as the batch
    /// so that no batch can ever exist without an origin.
    #[account(
        init,
        payer = authority,
        space = 8 + Checkpoint::INIT_SPACE,
        seeds = [CHECKPOINT_SEED, batch.key().as_ref(), &0u32.to_le_bytes()],
        bump,
    )]
    pub farm_checkpoint: Account<'info, Checkpoint>,

    /// CHECK: address-constrained to the Metaplex Core program.
    #[account(address = mpl_core::ID)]
    pub mpl_core_program: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct RegisterBatchArgs {
    /// Human-readable lot code, e.g. "2026-11-001". Part of the PDA seeds, so
    /// it is unique per producer and cannot be reused.
    pub batch_code: String,
    pub variety: String,
    pub harvest_date: i64,
    pub quantity_kg: u32,
    pub bag_count: u32,
    /// What the farmer was paid, in sen per kg.
    pub farmgate_price_sen: u32,
    pub asset_uri: String,
    /// IPFS CID for harvest photos. May be empty.
    pub note_cid: String,
}

pub fn register_batch_handler(ctx: Context<RegisterBatch>, args: RegisterBatchArgs) -> Result<()> {
    require_text(&args.batch_code, MAX_BATCH_CODE_LEN)?;
    require_text(&args.variety, MAX_VARIETY_LEN)?;
    require_text(&args.asset_uri, MAX_URI_LEN)?;
    require_optional_text(&args.note_cid, MAX_CID_LEN)?;
    require!(args.quantity_kg > 0, BarioError::InvalidQuantity);
    require!(args.bag_count > 0, BarioError::InvalidBagCount);
    require!(args.farmgate_price_sen > 0, BarioError::InvalidPrice);

    let now = Clock::get()?.unix_timestamp;
    // A harvest cannot be from the future. Backdating is allowed — farmers
    // register batches late, especially where connectivity is intermittent.
    require!(args.harvest_date <= now, BarioError::InvalidHarvestDate);

    let producer_key = ctx.accounts.producer.key();

    let config_signer: &[&[u8]] = &[CONFIG_SEED, &[ctx.accounts.config.bump]];
    let batch_asset_signer: &[&[u8]] = &[
        BATCH_ASSET_SEED,
        producer_key.as_ref(),
        args.batch_code.as_bytes(),
        &[ctx.bumps.batch_asset],
    ];

    let attributes = vec![
        attr("producer", ctx.accounts.producer.name.clone()),
        attr("batch_code", args.batch_code.clone()),
        attr("variety", args.variety.clone()),
        attr("grade", "Pending"),
        attr("harvest_date", args.harvest_date),
        attr("quantity_kg", args.quantity_kg),
        attr("farmgate_price", format_sen(args.farmgate_price_sen)),
    ];

    CreateV2CpiBuilder::new(&ctx.accounts.mpl_core_program.to_account_info())
        .asset(&ctx.accounts.batch_asset.to_account_info())
        // Minting into the producer's own Collection is the parent/child link.
        .collection(Some(&ctx.accounts.batch_collection.to_account_info()))
        .authority(Some(&ctx.accounts.config.to_account_info()))
        .payer(&ctx.accounts.authority.to_account_info())
        .owner(Some(&ctx.accounts.authority.to_account_info()))
        .system_program(&ctx.accounts.system_program.to_account_info())
        .name(format!("Bario Batch {}", args.batch_code))
        .uri(args.asset_uri)
        .plugins(soulbound_plugins(attributes))
        .invoke_signed(&[batch_asset_signer, config_signer])?;

    let batch = &mut ctx.accounts.batch;
    batch.producer = producer_key;
    batch.asset = ctx.accounts.batch_asset.key();
    batch.batch_code = args.batch_code.clone();
    batch.variety = args.variety;
    batch.grade = Grade::Pending;
    batch.harvest_date = args.harvest_date;
    batch.quantity_kg = args.quantity_kg;
    batch.bag_count = args.bag_count;
    batch.farmgate_price_sen = args.farmgate_price_sen;
    batch.checkpoint_count = 1; // checkpoint #0 is written below
    batch.audit_count = 0;
    batch.scan_count = 0;
    batch.rating_sum = 0;
    batch.rating_count = 0;
    batch.report_count = 0;
    batch.registered_at = now;
    batch.bump = ctx.bumps.batch;

    let checkpoint = &mut ctx.accounts.farm_checkpoint;
    checkpoint.batch = batch.key();
    checkpoint.index = 0;
    checkpoint.kind = CheckpointKind::Farm;
    checkpoint.actor = ctx.accounts.authority.key();
    checkpoint.lat = ctx.accounts.producer.farm_lat;
    checkpoint.lon = ctx.accounts.producer.farm_lon;
    checkpoint.label = format!("{}, Bario", ctx.accounts.producer.name);
    checkpoint.price_sen = args.farmgate_price_sen;
    checkpoint.grade = None;
    checkpoint.note_cid = args.note_cid;
    checkpoint.timestamp = now;
    checkpoint.bump = ctx.bumps.farm_checkpoint;

    let producer = &mut ctx.accounts.producer;
    producer.batch_count = producer
        .batch_count
        .checked_add(1)
        .ok_or(BarioError::CounterOverflow)?;

    let config = &mut ctx.accounts.config;
    config.batch_count = config
        .batch_count
        .checked_add(1)
        .ok_or(BarioError::CounterOverflow)?;

    msg!(
        "Batch {} registered by {} — {} kg at {}/kg, journey starts at the farm",
        args.batch_code,
        producer.name,
        args.quantity_kg,
        format_sen(args.farmgate_price_sen)
    );

    Ok(())
}
