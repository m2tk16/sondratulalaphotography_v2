# Gen 2 Phase 5 Production Migration

Date started: 2026-07-19
Status: production reassessment blocked before mutation

## Authorization boundary

The user approved beginning the next migration gate. Phase 5 contains separate
approval gates for clone unlock, production lock, parallel deployment,
stateful refactor, frontend cutover, and decommission.

This first step performed read-only preparation only. No production stack
policy, resource, application, or frontend was changed.

## Read-only baseline

- Local production source: `main` at `baed016`.
- `origin/main`: `3fe51fa`; local `main` is ahead by two documentation commits.
- Production root stack:
  `amplify-sondratulalaphotogra-main-496bb`.
- Production root status: `UPDATE_COMPLETE`.
- Production root has no stack policy.
- Gen 1 reports no pending backend changes.
- Production Lambda is active on Node 18 with verified code hash
  `HM9SlqGaPcwb2Ugy4n+82rwfIdylTj7JJWvRGN1+mz8=`.
- Production auth nested stack is `UPDATE_ROLLBACK_COMPLETE`; the root stack
  remains `UPDATE_COMPLETE`. The production assessment must determine whether
  this nested status blocks migration.
- Gen 1 clone root
  `amplify-sondratulalaphotogra-gentest-9bd46` is `UPDATE_COMPLETE` and has a
  deny-all-updates stack policy.
- Gen 2 rehearsal sandbox root is `UPDATE_COMPLETE`.

## Assessment attempts

The first `amplify gen2-migration assess` attempt stopped locally because the
temporary detached `main` checkout did not contain the ignored generated
`amplify/backend/amplify-meta.json`.

A read-only `amplify pull --appId dm7aei9mgulua --envName main --yes`
reconstructed the temporary metadata successfully. The repeated assessment
then stopped before analysis with:

`Environment mismatch: Your local env (main) does not match the environment
you marked for migration (gentest)`

No assessment, lock, deployment, or refactor reached production.

## Next approval gate

The migration CLI permits only one marked environment per Amplify project.
Before production can be assessed, roll back the clone lock while operating
against `gentest`:

`amplify gen2-migration lock --rollback`

Expected scope:

- remove the clone root's deny-update stack policy;
- clear the project-level `gentest` migration marker;
- leave production unchanged.

After verifying the clone is unlocked and healthy, rerun the read-only
assessment against `main`. Production lock remains a later, separate approval
gate.

## Clone unlock attempt

The approved `amplify gen2-migration lock --rollback` command was run against
the temporary `gentest` checkout. The CLI stopped before rollback because its
drift validation reported:

`Template drift detected beyond expected DeletionPolicy changes`

The clone remains `UPDATE_COMPLETE`, retains its deny-update stack policy, and
is still marked as the migration environment. Production remains unchanged.

Independent CloudFormation drift detection found exactly two drifted root
resources on the clone:

- `AuthRole` trust policy;
- `UnauthRole` trust policy.

Both are the standard Amplify Gen 1 Identity Pool role pattern: the
CloudFormation template contains a placeholder Cognito `Deny`, while the live
role contains the scoped Cognito `Allow` policy bound to the environment's
Identity Pool. Production independently reports the same two resources and no
other root-stack drift.

The CLI recommends repeating the clone rollback with `--skip-validations`.
Because this bypasses a migration safety guard, it requires a new explicit
approval even though the detected drift is understood and matches production.
