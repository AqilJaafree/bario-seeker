use anchor_lang::prelude::*;

#[error_code]
pub enum BarioError {
    #[msg("Only the platform admin may perform this action")]
    NotAdmin,

    #[msg("Signer is not registered as an actor on this platform")]
    ActorNotRegistered,

    #[msg("This actor's registration has been deactivated")]
    ActorInactive,

    #[msg("Signer does not hold the role required for this action")]
    WrongRole,

    #[msg("Only a registered auditor may record a grade")]
    NotAuditor,

    #[msg("Farm coordinates fall outside the Bario highlands")]
    OutsideBarioBounds,

    #[msg("Farm elevation is below the 1,100 m highland threshold for Bario rice")]
    ElevationTooLow,

    #[msg("Coordinates are not a valid point on Earth")]
    InvalidCoordinates,

    #[msg("Text field exceeds its maximum length")]
    TextTooLong,

    #[msg("Text field must not be empty")]
    TextEmpty,

    #[msg("Quantity must be greater than zero")]
    InvalidQuantity,

    #[msg("Bag count must be greater than zero")]
    InvalidBagCount,

    #[msg("Price must be greater than zero for this checkpoint kind")]
    InvalidPrice,

    #[msg("Rating must be between 1 and 5")]
    InvalidRating,

    #[msg("Grade must be A1, A2 or B — Pending cannot be recorded by an audit")]
    InvalidGrade,

    #[msg("This checkpoint kind cannot be submitted through this instruction")]
    InvalidCheckpointKind,

    #[msg("Batch does not belong to the producer account provided")]
    BatchProducerMismatch,

    #[msg("Checkpoint does not belong to the batch account provided")]
    CheckpointBatchMismatch,

    #[msg("Harvest date is implausible")]
    InvalidHarvestDate,

    #[msg("A counter overflowed — this batch or producer has reached its limit")]
    CounterOverflow,
}
