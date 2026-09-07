use anchor_lang::prelude::*;

use crate::constants::*;
use crate::error::BarioError;
use crate::state::{Batch, Producer, Review};
use crate::util::require_optional_text;

/// Rate a batch 1-5 stars.
///
/// Seeded by (batch, reviewer), so one wallet rates a batch exactly once.
/// That is ballot-stuffing resistance, not identity: a determined actor can
/// still fund many wallets. Moderation and the off-chain review pipeline carry
/// the rest of that weight.
#[derive(Accounts)]
pub struct RateBatch<'info> {
    #[account(mut)]
    pub reviewer: Signer<'info>,

    #[account(
        mut,
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
        payer = reviewer,
        space = 8 + Review::INIT_SPACE,
        seeds = [REVIEW_SEED, batch.key().as_ref(), reviewer.key().as_ref()],
        bump,
    )]
    pub review: Account<'info, Review>,

    pub system_program: Program<'info, System>,
}

pub fn rate_batch_handler(ctx: Context<RateBatch>, rating: u8, review_cid: String) -> Result<()> {
    require!(
        (MIN_RATING..=MAX_RATING).contains(&rating),
        BarioError::InvalidRating
    );
    require_optional_text(&review_cid, MAX_CID_LEN)?;

    let now = Clock::get()?.unix_timestamp;
    let batch_key = ctx.accounts.batch.key();
    let quantity_kg = ctx.accounts.batch.quantity_kg as u64;

    let review = &mut ctx.accounts.review;
    review.batch = batch_key;
    review.reviewer = ctx.accounts.reviewer.key();
    review.rating = rating;
    review.review_cid = review_cid;
    review.created_at = now;
    review.bump = ctx.bumps.review;

    let batch = &mut ctx.accounts.batch;
    batch.rating_sum = batch
        .rating_sum
        .checked_add(rating as u32)
        .ok_or(BarioError::CounterOverflow)?;
    batch.rating_count = batch
        .rating_count
        .checked_add(1)
        .ok_or(BarioError::CounterOverflow)?;

    // The producer's score is quantity-weighted, so a rating on a 500 kg batch
    // counts for more than one on a 20 kg batch.
    let producer = &mut ctx.accounts.producer;
    producer.rating_sum = producer
        .rating_sum
        .checked_add((rating as u64).saturating_mul(quantity_kg))
        .ok_or(BarioError::CounterOverflow)?;
    producer.rating_weight = producer
        .rating_weight
        .checked_add(quantity_kg)
        .ok_or(BarioError::CounterOverflow)?;

    msg!(
        "Batch {} rated {} stars — batch mean {:?} centistars, producer {:?}",
        batch.batch_code,
        rating,
        batch.rating_centistars(),
        producer.rating_centistars()
    );

    Ok(())
}
