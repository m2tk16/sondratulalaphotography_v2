# Gen 2 Phase 3 Rehearsal

Date: 2026-07-19

## Outcome

Phase 3 is complete on the `gen2-rehearsal` branch.

- The accepted Gen 1 `gentest` clone is locked against updates.
- Production `main` remains unlocked and unchanged.
- The migration generator replaced the local Gen 1 backend definition with a
  Gen 2 TypeScript backend.
- An isolated Gen 2 sandbox named `gen2rehearsal` is deployed and
  `UPDATE_COMPLETE`.
- No migration `refactor` command has been run.

The sandbox root stack is:

`amplify-sondratulalaphotographyv2-gen2rehearsal-sandbox-7532666a3b`

## Manual reconciliation

The generated backend required the following corrections before deployment:

- Removed hardcoded `gentest` Cognito, DynamoDB, REST API, and active sandbox
  S3 references. The generator's inactive `postRefactor` mapping remains
  intentionally pointed at the clone bucket for the later refactor gate.
- Created a sandbox-only on-demand likes table with `username` and `photo`
  keys.
- Granted the function read/write access only to the sandbox likes table and
  sandbox bucket.
- Injected the generated sandbox User Pool, app client, bucket, table, and
  region into the function environment.
- Preserved Lambda-side JWT verification and approved-admin email checks.
- Recreated both REST APIs with gateway authorization `NONE`; the Lambda
  remains the authentication boundary for likes and Studio operations.
- Converted the migrated Lambda handlers and tests to ESM.
- Kept contact delivery disabled in the rehearsal environment.
- Changed stateful-resource retention overrides to apply only to branch
  deployments, not disposable sandboxes.
- Raised the migrated Node 20 Lambda from 128 MB to 512 MB after live logs
  showed the legacy AWS SDK/JWT bundle exhausting 128 MB during cold start.
- Switched the rehearsal frontend from `aws-exports.js` to the generated
  `amplify_outputs.json`.

`amplify_outputs.json` is intentionally ignored. A fresh checkout must deploy
or generate Gen 2 outputs before building the rehearsal frontend.

## Deployment recovery

The first sandbox creation rolled back because a shared CDK asset object was
encrypted with a KMS key that no longer exists. The execution role already had
authorization; only the stale, undecryptable asset version was invalid.

The failed stack and its retained empty Cognito and S3 resources were deleted.
The single stale CDK cache object was removed so CDK could republish it under
the current key. The clean retry completed successfully. No shared IAM policy
was changed.

## Verification

- Sandbox root stack: `UPDATE_COMPLETE`.
- Sandbox storage, likes table, and User Pool: empty.
- Sandbox likes table: `PAY_PER_REQUEST`, `username` partition key, `photo`
  sort key.
- Sandbox Lambda: Node 20, 512 MB, 25-second timeout, active.
- Lambda IAM contains only sandbox DynamoDB and S3 access; it has no SES,
  `gentest`, or production resource access.
- Every REST application method reports authorization type `NONE`.
- Public like count: HTTP 200 with zero.
- Unsigned like write: HTTP 401.
- Invalid Studio ID token: HTTP 401.
- Contact submission: HTTP 200 with `suppressed: true`; no email delivered.
- `npm test`: all 12 backend tests passed.
- `npm run lint`: passed.
- `npm run build`: passed against Gen 2 outputs.
- Production Lambda remains active with code hash
  `HM9SlqGaPcwb2Ugy4n+82rwfIdylTj7JJWvRGN1+mz8=`.
- The Gen 1 `gentest` root stack remains `UPDATE_COMPLETE` with its deny-update
  stack policy.

## Phase 4 gate

Before browser acceptance, add this exact authorized redirect URI to the
Google OAuth client used by the sandbox:

`https://29077ae35863c1471f71.auth.us-east-1.amazoncognito.com/oauth2/idpresponse`

Then run the accepted two-account workflow against the local frontend:

1. Google sign-in as an approved Studio account.
2. Upload a disposable photograph and confirm it appears publicly.
3. Like it as the admin account.
4. Sign in as a non-admin account and add the second like.
5. Deactivate and reactivate the photograph.
6. Permanently delete it and confirm the gallery is empty.
7. Submit the contact form and confirm the suppressed success response.

Stop after functional acceptance. Do not run migration `refactor` without a
new explicit approval.
