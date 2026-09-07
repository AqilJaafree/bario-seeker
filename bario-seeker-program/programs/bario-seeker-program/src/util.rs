//! Shared validation and Metaplex Core plugin construction.

use anchor_lang::prelude::*;
use mpl_core::types::{
    Attribute, Attributes, PermanentFreezeDelegate, Plugin, PluginAuthority, PluginAuthorityPair,
};

use crate::constants::*;
use crate::error::BarioError;

/// Reject coordinates that are not a point on Earth.
pub fn require_valid_coordinates(lat: i32, lon: i32) -> Result<()> {
    require!(
        (LAT_MIN..=LAT_MAX).contains(&lat) && (LON_MIN..=LON_MAX).contains(&lon),
        BarioError::InvalidCoordinates
    );
    Ok(())
}

/// Reject a farm that is not in the Bario highlands.
///
/// This is the one geographic claim the program can actually enforce, and it is
/// worth enforcing on-chain rather than in a backend: "Bario rice" is a
/// geographical indication, so a certificate issued to a farm outside the
/// highlands is not a mistake, it is the counterfeit we exist to prevent.
pub fn require_bario_farm(lat: i32, lon: i32, elevation_m: u16) -> Result<()> {
    require_valid_coordinates(lat, lon)?;
    require!(
        (BARIO_LAT_MIN..=BARIO_LAT_MAX).contains(&lat)
            && (BARIO_LON_MIN..=BARIO_LON_MAX).contains(&lon),
        BarioError::OutsideBarioBounds
    );
    require!(
        elevation_m >= BARIO_MIN_ELEVATION_M,
        BarioError::ElevationTooLow
    );
    Ok(())
}

/// Snap a coordinate to the ~1 km consumer-privacy grid.
///
/// Clients are required to truncate before transmitting. Snapping again here
/// means a careless or hostile client cannot write a precise consumer location
/// to a ledger that can never forget it.
pub fn coarsen(value: i32) -> i32 {
    value.div_euclid(SCAN_GRID_MICRO) * SCAN_GRID_MICRO
}

/// Bound a required text field.
pub fn require_text(value: &str, max_len: usize) -> Result<()> {
    require!(!value.trim().is_empty(), BarioError::TextEmpty);
    require!(value.len() <= max_len, BarioError::TextTooLong);
    Ok(())
}

/// Bound an optional text field, which may be empty.
pub fn require_optional_text(value: &str, max_len: usize) -> Result<()> {
    require!(value.len() <= max_len, BarioError::TextTooLong);
    Ok(())
}

/// The plugin set that makes a Metaplex Core asset soulbound.
///
/// `PermanentFreezeDelegate { frozen: true }` is enforced by the Metaplex Core
/// program itself: a frozen asset can be neither transferred nor burned. The
/// authority is `PluginAuthority::None`, which means the freeze can never be
/// lifted by anyone — not the holder, not the platform admin, and not a future
/// upgrade of this program. That is a deliberately irreversible choice: it makes
/// the soulbound claim true without depending on our own good behaviour, at the
/// cost of ruling out any future "move this certificate" escape hatch.
///
/// See OQ-3 in the PRD: producer succession has to be solved by issuing a new
/// certificate and retiring the old one, because this one will never move.
pub fn soulbound_plugins(attributes: Vec<Attribute>) -> Vec<PluginAuthorityPair> {
    vec![
        PluginAuthorityPair {
            plugin: Plugin::PermanentFreezeDelegate(PermanentFreezeDelegate { frozen: true }),
            authority: Some(PluginAuthority::None),
        },
        PluginAuthorityPair {
            plugin: Plugin::Attributes(Attributes {
                attribute_list: attributes,
            }),
            // The collection's update authority is the program's config PDA, so
            // only this program can amend attributes — which is how an audit
            // writes a grade onto the certificate itself.
            authority: Some(PluginAuthority::UpdateAuthority),
        },
    ]
}

/// Convenience constructor for a Core attribute.
pub fn attr(key: &str, value: impl ToString) -> Attribute {
    Attribute {
        key: key.to_string(),
        value: value.to_string(),
    }
}

/// Render micro-degrees as a decimal degree string for asset attributes.
///
/// Integer arithmetic only: `3_733_300` becomes `"3.733300"`.
pub fn format_micro_degrees(value: i32) -> String {
    let sign = if value < 0 { "-" } else { "" };
    let magnitude = value.unsigned_abs();
    format!("{}{}.{:06}", sign, magnitude / 1_000_000, magnitude % 1_000_000)
}

/// Render sen as a Ringgit string. `1550` becomes `"RM15.50"`.
pub fn format_sen(sen: u32) -> String {
    format!("RM{}.{:02}", sen / 100, sen % 100)
}
