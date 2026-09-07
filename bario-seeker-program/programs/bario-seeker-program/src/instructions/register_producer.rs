use anchor_lang::prelude::*;
use mpl_core::instructions::{CreateCollectionV2CpiBuilder, CreateV2CpiBuilder};

use crate::constants::*;
use crate::error::BarioError;
use crate::state::{Config, Producer};
use crate::util::*;

#[derive(Accounts)]
pub struct RegisterProducer<'info> {
    /// The farmer's wallet. Pays for its own registration and ends up owning
    /// the Producer SBT — though it will never be able to move it.
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        mut,
        seeds = [CONFIG_SEED],
        bump = config.bump,
    )]
    pub config: Account<'info, Config>,

    #[account(
        init,
        payer = authority,
        space = 8 + Producer::INIT_SPACE,
        seeds = [PRODUCER_SEED, authority.key().as_ref()],
        bump,
    )]
    pub producer: Account<'info, Producer>,

    /// The Producer SBT.
    ///
    /// CHECK: created by Metaplex Core via CPI; address constrained by seeds.
    #[account(
        mut,
        seeds = [PRODUCER_ASSET_SEED, authority.key().as_ref()],
        bump,
    )]
    pub producer_asset: UncheckedAccount<'info>,

    /// This producer's own Collection, which will hold their batch SBTs.
    /// Creating it here is what makes "batch is a child of producer"
    /// structural rather than a claim we ask people to believe.
    ///
    /// CHECK: created by Metaplex Core via CPI; address constrained by seeds.
    #[account(
        mut,
        seeds = [BATCH_COLLECTION_SEED, producer.key().as_ref()],
        bump,
    )]
    pub batch_collection: UncheckedAccount<'info>,

    /// CHECK: the global producer Collection, pinned to the one in config.
    #[account(mut, address = config.producer_collection)]
    pub producer_collection: UncheckedAccount<'info>,

    /// CHECK: address-constrained to the Metaplex Core program.
    #[account(address = mpl_core::ID)]
    pub mpl_core_program: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct RegisterProducerArgs {
    pub name: String,
    /// Farm location in micro-degrees.
    pub farm_lat: i32,
    pub farm_lon: i32,
    pub farm_elevation_m: u16,
    /// Digest of an off-chain identity verification record. No PII on-chain.
    pub identity_hash: [u8; 32],
    /// Metadata URI for the Producer SBT.
    pub asset_uri: String,
    /// Metadata URI for this producer's batch Collection.
    pub collection_uri: String,
}

pub fn register_producer_handler(ctx: Context<RegisterProducer>, args: RegisterProducerArgs) -> Result<()> {
    require_text(&args.name, MAX_NAME_LEN)?;
    require_text(&args.asset_uri, MAX_URI_LEN)?;
    require_text(&args.collection_uri, MAX_URI_LEN)?;

    // The one geographic claim we can actually enforce.
    require_bario_farm(args.farm_lat, args.farm_lon, args.farm_elevation_m)?;

    let now = Clock::get()?.unix_timestamp;
    let authority_key = ctx.accounts.authority.key();
    let producer_key = ctx.accounts.producer.key();

    let config_signer: &[&[u8]] = &[CONFIG_SEED, &[ctx.accounts.config.bump]];
    let batch_collection_signer: &[&[u8]] = &[
        BATCH_COLLECTION_SEED,
        producer_key.as_ref(),
        &[ctx.bumps.batch_collection],
    ];
    let producer_asset_signer: &[&[u8]] = &[
        PRODUCER_ASSET_SEED,
        authority_key.as_ref(),
        &[ctx.bumps.producer_asset],
    ];

    // 1. This producer's batch Collection, owned by the program's config PDA.
    CreateCollectionV2CpiBuilder::new(&ctx.accounts.mpl_core_program.to_account_info())
        .collection(&ctx.accounts.batch_collection.to_account_info())
        .update_authority(Some(&ctx.accounts.config.to_account_info()))
        .payer(&ctx.accounts.authority.to_account_info())
        .system_program(&ctx.accounts.system_program.to_account_info())
        .name(format!("{} — Bario Harvests", args.name))
        .uri(args.collection_uri)
        .invoke_signed(&[batch_collection_signer])?;

    // 2. The Producer SBT itself, frozen at mint and owned by the farmer.
    let attributes = vec![
        attr("region", "Bario Highlands, Sarawak"),
        attr("farm_lat", format_micro_degrees(args.farm_lat)),
        attr("farm_lon", format_micro_degrees(args.farm_lon)),
        attr("elevation_m", args.farm_elevation_m),
        attr("joined_at", now),
        attr("certificate", "Bario Seeker Producer"),
    ];

    CreateV2CpiBuilder::new(&ctx.accounts.mpl_core_program.to_account_info())
        .asset(&ctx.accounts.producer_asset.to_account_info())
        .collection(Some(&ctx.accounts.producer_collection.to_account_info()))
        // The collection's update authority must approve the mint.
        .authority(Some(&ctx.accounts.config.to_account_info()))
        .payer(&ctx.accounts.authority.to_account_info())
        .owner(Some(&ctx.accounts.authority.to_account_info()))
        .system_program(&ctx.accounts.system_program.to_account_info())
        .name(args.name.clone())
        .uri(args.asset_uri)
        .plugins(soulbound_plugins(attributes))
        .invoke_signed(&[producer_asset_signer, config_signer])?;

    let producer = &mut ctx.accounts.producer;
    producer.authority = authority_key;
    producer.asset = ctx.accounts.producer_asset.key();
    producer.batch_collection = ctx.accounts.batch_collection.key();
    producer.name = args.name;
    producer.farm_lat = args.farm_lat;
    producer.farm_lon = args.farm_lon;
    producer.farm_elevation_m = args.farm_elevation_m;
    producer.identity_hash = args.identity_hash;
    producer.joined_at = now;
    producer.batch_count = 0;
    producer.rating_sum = 0;
    producer.rating_weight = 0;
    producer.bump = ctx.bumps.producer;

    let config = &mut ctx.accounts.config;
    config.producer_count = config
        .producer_count
        .checked_add(1)
        .ok_or(BarioError::CounterOverflow)?;

    msg!(
        "Producer {} registered. SBT {} (soulbound), harvest collection {}",
        producer.name,
        producer.asset,
        producer.batch_collection
    );

    Ok(())
}
