# Gen 2 Phase 2 Assessment

Date: 2026-07-19
Environment: `gentest`
Branch: `gen2-rehearsal`

## Result

The isolated Gen 1 clone deployed successfully and
`amplify gen2-migration assess` completed read-only.

| Category | Resource | Generate | Refactor |
| --- | --- | --- | --- |
| API Gateway | `api4593058b` | Supported | Not needed |
| API Gateway | `apid5657c10` | Supported | Not needed |
| Cognito | `sondratulalaphotograaaef21f8` | Supported | Supported |
| Lambda | `sondratulalaphotogradcd4b5ed` | Supported | Not needed |
| S3 | `sondratulalaphotographys3` | Supported | Supported |

Advanced feature result:

- `function/sondratulalaphotogradcd4b5ed/custom-policies.json` requires manual
  Gen 2 code after generation. Refactor is not needed.

No migration `lock`, `generate`, `refactor`, or Gen 2 deployment command was
run.

## Live clone verification

- Root stack: `UPDATE_COMPLETE`.
- `amplify status`: no pending changes.
- Lambda: active and update successful.
- Lambda configuration resolves only:
  - clone User Pool `us-east-1_fhyEhGyB1`;
  - clone web client `570fsn8ba7t0prioh62et7ejb2`;
  - clone S3 bucket ending in `9bd46-gentest`;
  - clone table `SondraTulalaPhotography-PhotoLikes-gentest`;
  - `CONTACT_DELIVERY_ENABLED=false`.
- Lambda role has only inline log, clone S3, and clone DynamoDB permissions.
  It has no attached SES policy.
- Clone S3 bucket started empty. After acceptance testing and permanent
  deletion, only `public/images/portfolio/manifest.json` remains.
- Clone likes table: active, on-demand, and correct composite key. It started
  empty and now contains two orphaned test-like records for the deleted
  photograph.
- Clone Cognito User Pool: distinct from production and contains the two Google
  accounts used for acceptance.
- Clone Google identity provider: configured with the expected client ID and
  `openid email profile` scopes.
- Clone Cognito authorization endpoint: HTTP 302 redirect to
  `accounts.google.com` with the clone `/oauth2/idpresponse` callback.
- Clone like route: API Gateway authorization is `NONE` so the direct bearer
  request reaches Lambda; Lambda performs Cognito JWT verification before any
  write. A valid unsigned request is rejected by Lambda with HTTP 401.
- Public like count: HTTP 200 with total `0`.
- Suppressed contact request: HTTP 200 with `suppressed: true`.
- Invalid Studio token: HTTP 401.
- Unsigned private like request after the route fix: HTTP 401 from Lambda.
- Authenticated like testing: admin like produced total `1`; a non-admin Google
  account produced total `2`.
- Studio acceptance: upload, public appearance, and permanent deletion passed;
  the gallery returned to empty.
- Contact acceptance: submission succeeded and email was correctly suppressed
  because clone delivery is disabled.

## Production no-change verification

- Production root stack remains `UPDATE_COMPLETE`.
- Production Lambda remains active with a successful last update.
- Production Cognito still has five users.
- The production S3 bucket still contains all 42 current objects, including the
  portfolio manifest and photograph files.
- Production likes contain eight current records after the user's multi-account
  acceptance testing; no clone test used that table.

## Clone authentication state

The Google User Pool provider is enabled with a valid credential supplied at
deployment time from a local downloaded JSON file. The clone Cognito redirect
is registered in Google, and a non-interactive authorization check reaches
Google successfully. No secret was copied into project files or source control.
Real-browser sign-in succeeded for an approved admin and a non-admin Google
account. Studio upload/deletion and cross-account incremental likes passed.

The legacy direct `accounts.google.com` Identity Pool provider is omitted from
the clone because Amplify CLI 14.4 generated an invalid nested template for
that field. The application uses the Cognito User Pool hosted UI path.

## Phase 3 gate

Before migration `lock` or `generate`:

1. Review the generated manual Gen 2 IAM plan for the clone S3 bucket and likes
   table.
2. Confirm the clone-only DynamoDB table created inside the Lambda nested stack
   will be represented manually in Gen 2.
3. Decide whether orphaned-like cleanup belongs in the migration or the
   post-migration product backlog.
4. Obtain separate explicit approval for `lock`, `generate`, and any Gen 2
   deployment.
