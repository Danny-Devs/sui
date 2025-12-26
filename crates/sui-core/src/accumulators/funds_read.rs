// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

use std::{collections::BTreeMap, sync::Arc};

use sui_types::{
    accumulator_root::{AccumulatorObjId, AccumulatorValue, U128},
    base_types::SequenceNumber,
    error::{SuiErrorKind, SuiResult, UserInputError},
    storage::ChildObjectResolver,
};

pub(crate) trait AccountFundsRead: Send + Sync {
    fn get_account_amount(
        &self,
        account_id: &AccumulatorObjId,
        // Version of the accumulator root object, used to
        // bound the version when we look for child account objects.
        accumulator_version: SequenceNumber,
    ) -> u128;

    /// Gets latest amount in account, without a version bound on the accumulator root object.
    /// Only used for signing time checks / RPC reads, not scheduling.
    fn get_latest_account_amount(&self, account_id: &AccumulatorObjId) -> u128;

    /// Checks if given amounts are available in the latest versions of the referenced acccumulator
    /// objects. This does un-sequenced reads and can only be used on the signing/voting path
    /// where deterministic results are not required.
    fn check_amounts_available(
        &self,
        requested_amounts: &BTreeMap<AccumulatorObjId, u64>,
    ) -> SuiResult {
        for (object_id, requested_amount) in requested_amounts {
            let actual_amount = self.get_latest_account_amount(object_id);

            if actual_amount < *requested_amount as u128 {
                return Err(SuiErrorKind::UserInputError {
                    error: UserInputError::InvalidWithdrawReservation {
                        error: format!(
                            "Available amount in account for object id {} is less than requested: {} < {}",
                            object_id, actual_amount, requested_amount
                        ),
                    },
                }
                .into());
            }
        }

        Ok(())
    }
}

impl AccountFundsRead for Arc<dyn ChildObjectResolver + Send + Sync> {
    fn get_account_amount(
        &self,
        account_id: &AccumulatorObjId,
        accumulator_version: SequenceNumber,
    ) -> u128 {
        // Returns 0 if the object is not found or on error. This prevents over-scheduling
        // withdrawals when aggressive pruning removes old object versions before the scheduler
        // reads them. Returning 0 is safe: it under-schedules (transactions wait for next
        // settlement) rather than over-schedules (which could cause double-spend).
        match AccumulatorValue::load_by_id::<U128>(
            self.as_ref(),
            Some(accumulator_version),
            *account_id,
        ) {
            Ok(Some(value)) => value.value,
            Ok(None) => 0,
            Err(e) => {
                // Log unexpected errors but return 0 to maintain validator liveness.
                tracing::error!(
                    account_id = ?account_id,
                    requested_version = ?accumulator_version,
                    error = ?e,
                    "Unexpected error reading account amount - returning 0 for safety"
                );
                0
            }
        }
    }

    fn get_latest_account_amount(&self, account_id: &AccumulatorObjId) -> u128 {
        // Read the latest version of the account value.
        // Used for signing-time checks which are documented as non-deterministic.
        match AccumulatorValue::load_by_id::<U128>(self.as_ref(), None, *account_id) {
            Ok(Some(value)) => value.value,
            Ok(None) => 0,
            Err(e) => {
                // Same rationale as get_account_amount: log and return 0 for safety.
                tracing::error!(
                    account_id = ?account_id,
                    error = ?e,
                    "Unexpected error reading latest account amount - returning 0 for safety"
                );
                0
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::sync::Arc;
    use sui_types::{
        base_types::ObjectID,
        error::SuiErrorKind,
        object::Object,
        storage::ChildObjectResolver,
    };

    // Unit tests for error handling paths introduced by this fix.
    //
    // The happy path (Ok(Some(value))) requires a properly BCS-serialized AccumulatorValue
    // within an Object, which is complex to construct in isolation. That path is unchanged
    // by this fix and is covered by address_funds/e2e_tests.rs and simtests.

    /// Mock ChildObjectResolver for testing error scenarios.
    struct MockChildObjectResolver {
        /// If Some, read_child_object returns Ok(Some(object))
        /// If None with no error, returns Ok(None)
        object: Option<Object>,
        /// If Some, read_child_object returns Err(error)
        error: Option<sui_types::error::SuiError>,
    }

    impl MockChildObjectResolver {
        fn with_none() -> Self {
            Self {
                object: None,
                error: None,
            }
        }

        fn with_error(error: sui_types::error::SuiError) -> Self {
            Self {
                object: None,
                error: Some(error),
            }
        }
    }

    impl ChildObjectResolver for MockChildObjectResolver {
        fn read_child_object(
            &self,
            _parent: &ObjectID,
            _child: &ObjectID,
            _child_version_upper_bound: SequenceNumber,
        ) -> SuiResult<Option<Object>> {
            if let Some(ref error) = self.error {
                return Err(error.clone());
            }
            Ok(self.object.clone())
        }

        fn get_object_received_at_version(
            &self,
            _owner: &ObjectID,
            _receiving_object_id: &ObjectID,
            _receive_object_at_version: SequenceNumber,
            _epoch_id: sui_types::committee::EpochId,
        ) -> SuiResult<Option<Object>> {
            Ok(None)
        }
    }

    #[test]
    fn test_get_account_amount_returns_zero_when_object_not_found() {
        // Ok(None) should return 0 - account doesn't exist or was pruned
        let resolver = Arc::new(MockChildObjectResolver::with_none())
            as Arc<dyn ChildObjectResolver + Send + Sync>;

        let account_id = AccumulatorObjId::new_unchecked(ObjectID::random());
        let version = SequenceNumber::from_u64(1);

        let result = resolver.get_account_amount(&account_id, version);

        assert_eq!(result, 0);
    }

    #[test]
    fn test_get_account_amount_returns_zero_on_error() {
        // Err(e) should return 0 - unexpected error, be conservative
        let error: sui_types::error::SuiError = SuiErrorKind::InvalidChildObjectAccess {
            object: ObjectID::random(),
            given_parent: ObjectID::random(),
            actual_owner: sui_types::object::Owner::Immutable,
        }
        .into();

        let resolver = Arc::new(MockChildObjectResolver::with_error(error))
            as Arc<dyn ChildObjectResolver + Send + Sync>;

        let account_id = AccumulatorObjId::new_unchecked(ObjectID::random());
        let version = SequenceNumber::from_u64(1);

        let result = resolver.get_account_amount(&account_id, version);

        assert_eq!(result, 0);
    }

    #[test]
    fn test_get_latest_account_amount_returns_zero_when_object_not_found() {
        let resolver = Arc::new(MockChildObjectResolver::with_none())
            as Arc<dyn ChildObjectResolver + Send + Sync>;

        let account_id = AccumulatorObjId::new_unchecked(ObjectID::random());

        let result = resolver.get_latest_account_amount(&account_id);

        assert_eq!(result, 0);
    }

    #[test]
    fn test_get_latest_account_amount_returns_zero_on_error() {
        let error: sui_types::error::SuiError = SuiErrorKind::DynamicFieldReadError(
            "deserialization failed".to_string(),
        )
        .into();

        let resolver = Arc::new(MockChildObjectResolver::with_error(error))
            as Arc<dyn ChildObjectResolver + Send + Sync>;

        let account_id = AccumulatorObjId::new_unchecked(ObjectID::random());

        let result = resolver.get_latest_account_amount(&account_id);

        assert_eq!(result, 0);
    }

    #[test]
    fn test_check_amounts_available_returns_error_when_insufficient() {
        // When get_latest_account_amount returns 0, check_amounts_available should fail
        let resolver = Arc::new(MockChildObjectResolver::with_none())
            as Arc<dyn ChildObjectResolver + Send + Sync>;

        let account_id = AccumulatorObjId::new_unchecked(ObjectID::random());
        let mut requested = BTreeMap::new();
        requested.insert(account_id, 100u64);

        let result = resolver.check_amounts_available(&requested);

        assert!(result.is_err());
        // Should be InvalidWithdrawReservation error (SuiError derefs to SuiErrorKind)
        let err = result.unwrap_err();
        assert!(matches!(
            &*err,
            SuiErrorKind::UserInputError {
                error: UserInputError::InvalidWithdrawReservation { .. }
            }
        ));
    }

    #[test]
    fn test_check_amounts_available_succeeds_when_zero_requested() {
        // Requesting 0 should always succeed
        let resolver = Arc::new(MockChildObjectResolver::with_none())
            as Arc<dyn ChildObjectResolver + Send + Sync>;

        let account_id = AccumulatorObjId::new_unchecked(ObjectID::random());
        let mut requested = BTreeMap::new();
        requested.insert(account_id, 0u64);

        let result = resolver.check_amounts_available(&requested);

        assert!(result.is_ok());
    }
}
