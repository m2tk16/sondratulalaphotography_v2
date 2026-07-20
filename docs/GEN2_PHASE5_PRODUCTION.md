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

## Clone unlock completion

The user explicitly approved repeating the clone rollback with
`--skip-validations`.

The non-interactive `--yes` flag accepted the Developer Preview confirmation.
The CLI removed the project-level `GEN2_MIGRATION_ENVIRONMENT_NAME` marker,
then its Amplify Studio role failed on
`cloudformation:GetStackPolicy`. The AWS CLI identity that had already
verified both policies completed the second approved operation by replacing
only the clone's deny-update policy with an allow-all-updates policy.

Final verification:

- The project migration marker is absent.
- `gentest` is `UPDATE_COMPLETE`.
- The `gentest` root stack policy permits updates.
- Production remains `UPDATE_COMPLETE` and has no stack policy.
- Production Lambda remains active with code hash
  `HM9SlqGaPcwb2Ugy4n+82rwfIdylTj7JJWvRGN1+mz8=`.

## Production assessment result

`amplify gen2-migration assess --yes` completed successfully against `main`.

| Resource | Generate | Stateful refactor |
| --- | --- | --- |
| REST API `api4593058b` | supported | not needed |
| REST API `apid5657c10` | supported | not needed |
| Cognito `sondratulalaphotograaaef21f8` | supported | supported |
| S3 `sondratulalaphotographys3` | supported | supported |
| Lambda `sondratulalaphotogradcd4b5ed` | supported | not needed |

The only reported manual item is
`function/sondratulalaphotogradcd4b5ed/custom-policies.json`, which requires
adding code after generation. This matches the rehearsal assessment and the
manually reconciled Gen 2 sandbox.

The assessment did not modify or lock production. The next gate is a
production lock, which requires separate explicit approval and a recorded
rollback point.

## Production lock attempt

The user explicitly approved the production `main` lock gate. A fresh rollback
point recorded:

- production root `UPDATE_COMPLETE` with no stack policy;
- absent project migration marker;
- active Lambda hash
  `HM9SlqGaPcwb2Ugy4n+82rwfIdylTj7JJWvRGN1+mz8=`;
- 42 S3 objects and manifest ETag
  `87740ad466a51f71a4e59d300f75e45a`;
- 8 DynamoDB like records;
- 5 Cognito users.

The first lock attempt used Amplify Studio credentials and stopped during
validation because that temporary role lacks
`cloudformation:DeleteChangeSet`. Its two unexecuted validation change sets
were inspected and deleted. No lock operation ran.

The temporary checkout was then configured to use the verified local
`default` AWS profile. Normal validation completed but rejected existing
production drift:

- The public API stack's original Lambda permission is deleted. Phase 1
  intentionally replaced it with the tracked, broader public-API permission
  in the function stack; the live Lambda policy contains the replacement.
- Both Cognito clients contain every expected callback plus the approved
  `http://localhost:3001/` callback. CloudFormation drift reports the callback
  list difference even though the required callbacks are live.
- The Lambda execution role additionally trusts API Gateway. All current REST
  integrations have no credentials role, so this trust is stale and is not
  required by the live API paths.
- The REST API description is absent while the template expects an empty
  string; this is non-functional metadata drift.

The validation environment-health and unchanged-auth-stack checks passed.
Every validation change set was deleted without execution. The project marker
remains absent, production has no stack policy, and the root remains
`UPDATE_COMPLETE`.

The CLI recommends `gen2-migration lock --yes --skip-validations`. The drift is
understood and already represented correctly in the rehearsed Gen 2 backend,
but bypassing production validation requires a new explicit approval.
