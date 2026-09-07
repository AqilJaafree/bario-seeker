use anchor_lang::prelude::*;

use crate::constants::*;
use crate::error::BarioError;
use crate::state::{Batch, Producer, Report};
use crate::util::*;

/// Report a suspected counterfeit.
///
/// Recording this on-chain makes the signal tamper-evident and gives the
/// regulator a spatial feed. It is explicitly not a public accusation: the PRD
/// requires human moderation and a producer right of reply before anything
/// surfaces to consumers, and malicious reports against competitors are a
/// foreseeable abuse of this instruction.
#[derive(Accounts)]
pub struct ReportCounterfeit<'info> {
    /// The reporter, or a relayer acting for a consumer with no wallet.
    #[account(mut)]
    pub reporter: Signer<'info>,

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
    )]
    pub batch: Account<'info, Batch>,

    #[account(
        init,
        payer = reporter,
        space = 8 + Report::INIT_SPACE,
        seeds = [REPORT_SEED, batch.key().as_ref(), reporter.key().as_ref()],
        bump,
    )]
    pub report: Account<'info, Report>,

    pub system_program: Program<'info, System>,
}

pub fn report_counterfeit_handler(
    ctx: Context<ReportCounterfeit>,
    lat: i32,
    lon: i32,
    evidence_cid: String,
) -> Result<()> {
    require_valid_coordinates(lat, lon)?;
    require_optional_text(&evidence_cid, MAX_CID_LEN)?;

    let now = Clock::get()?.unix_timestamp;

    let report = &mut ctx.accounts.report;
    report.batch = ctx.accounts.batch.key();
    report.reporter = ctx.accounts.reporter.key();
    // Same privacy grid as consumer scans — a report should not pin the person
    // who filed it to a street corner, permanently and publicly.
    report.lat = coarsen(lat);
    report.lon = coarsen(lon);
    report.evidence_cid = evidence_cid;
    report.created_at = now;
    report.bump = ctx.bumps.report;

    let batch = &mut ctx.accounts.batch;
    batch.report_count = batch
        .report_count
        .checked_add(1)
        .ok_or(BarioError::CounterOverflow)?;

    msg!(
        "Counterfeit report #{} filed against batch {} — routed for moderation",
        batch.report_count,
        batch.batch_code
    );

    Ok(())
}
