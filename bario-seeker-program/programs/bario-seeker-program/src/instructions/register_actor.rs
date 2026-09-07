use anchor_lang::prelude::*;

use crate::constants::*;
use crate::error::BarioError;
use crate::state::{Actor, ActorRole, Config};
use crate::util::require_text;

#[derive(Accounts)]
#[instruction(actor_authority: Pubkey)]
pub struct RegisterActor<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        seeds = [CONFIG_SEED],
        bump = config.bump,
        has_one = admin @ BarioError::NotAdmin,
    )]
    pub config: Account<'info, Config>,

    #[account(
        init,
        payer = admin,
        space = 8 + Actor::INIT_SPACE,
        seeds = [ACTOR_SEED, actor_authority.as_ref()],
        bump,
    )]
    pub actor: Account<'info, Actor>,

    pub system_program: Program<'info, System>,
}

pub fn register_actor_handler(
    ctx: Context<RegisterActor>,
    actor_authority: Pubkey,
    role: ActorRole,
    name: String,
) -> Result<()> {
    require_text(&name, MAX_NAME_LEN)?;

    let actor = &mut ctx.accounts.actor;
    actor.authority = actor_authority;
    actor.role = role;
    actor.name = name;
    actor.active = true;
    actor.registered_at = Clock::get()?.unix_timestamp;
    actor.bump = ctx.bumps.actor;

    msg!("Registered {:?} {} ({})", actor.role, actor.name, actor_authority);

    Ok(())
}

#[derive(Accounts)]
pub struct SetActorActive<'info> {
    pub admin: Signer<'info>,

    #[account(
        seeds = [CONFIG_SEED],
        bump = config.bump,
        has_one = admin @ BarioError::NotAdmin,
    )]
    pub config: Account<'info, Config>,

    #[account(
        mut,
        seeds = [ACTOR_SEED, actor.authority.as_ref()],
        bump = actor.bump,
    )]
    pub actor: Account<'info, Actor>,
}

/// Withdraw or restore an actor's accreditation.
///
/// Deactivation stops future submissions but deliberately leaves the actor's
/// existing checkpoints in place: the audit trail must record that a since-
/// discredited auditor graded a batch, not quietly erase it.
pub fn set_actor_active_handler(ctx: Context<SetActorActive>, active: bool) -> Result<()> {
    ctx.accounts.actor.active = active;
    msg!(
        "Actor {} ({}) set active = {}",
        ctx.accounts.actor.name,
        ctx.accounts.actor.authority,
        active
    );
    Ok(())
}
