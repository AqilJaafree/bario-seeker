use anchor_lang::prelude::*;
use mpl_core::instructions::CreateCollectionV2CpiBuilder;

use crate::constants::*;
use crate::state::Config;
use crate::util::*;

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        init,
        payer = admin,
        space = 8 + Config::INIT_SPACE,
        seeds = [CONFIG_SEED],
        bump,
    )]
    pub config: Account<'info, Config>,

    /// The `Bario Seeker Producers` Metaplex Core Collection.
    ///
    /// A PDA rather than a fresh keypair, so its address is derivable by any
    /// client without being told — the verification page can find every
    /// producer certificate from the program ID alone.
    ///
    /// CHECK: created by the Metaplex Core program via CPI; its address is
    /// constrained by these seeds and it must not already exist.
    #[account(
        mut,
        seeds = [PRODUCER_COLLECTION_SEED],
        bump,
    )]
    pub producer_collection: UncheckedAccount<'info>,

    /// CHECK: address-constrained to the Metaplex Core program.
    #[account(address = mpl_core::ID)]
    pub mpl_core_program: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
}

pub fn initialize_handler(ctx: Context<Initialize>, collection_uri: String) -> Result<()> {
    require_text(&collection_uri, MAX_URI_LEN)?;

    let config = &mut ctx.accounts.config;
    config.admin = ctx.accounts.admin.key();
    config.producer_collection = ctx.accounts.producer_collection.key();
    config.producer_count = 0;
    config.batch_count = 0;
    config.bump = ctx.bumps.config;

    let collection_signer: &[&[&[u8]]] = &[&[
        PRODUCER_COLLECTION_SEED,
        &[ctx.bumps.producer_collection],
    ]];

    CreateCollectionV2CpiBuilder::new(&ctx.accounts.mpl_core_program.to_account_info())
        .collection(&ctx.accounts.producer_collection.to_account_info())
        // The config PDA is the update authority for every asset the program
        // mints. No private key controls it.
        .update_authority(Some(&config.to_account_info()))
        .payer(&ctx.accounts.admin.to_account_info())
        .system_program(&ctx.accounts.system_program.to_account_info())
        .name(PRODUCER_COLLECTION_NAME.to_string())
        .uri(collection_uri)
        .invoke_signed(collection_signer)?;

    msg!(
        "Bario Seeker initialised. Admin {}, producer collection {}",
        config.admin,
        config.producer_collection
    );

    Ok(())
}
