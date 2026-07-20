# Release and Learning Log

Release IDs use `STP-YYYY.MM.DD-NN`. An entry may be `candidate`, `deployed`,
`superseded`, or `rolled-back`.

## STP-2026.07.19-09 - Production migration assessment

Status: completed - clone unlock and read-only production assessment
Date: 2026-07-19
Target: Gen 1 `gentest` unlock; production read-only

### Completed

- Removed the project-level `gentest` migration marker.
- Replaced only the clone's deny-update stack policy with a permissive update
  policy after the official rollback partially completed.
- Verified `gentest` remains `UPDATE_COMPLETE`.
- Completed `amplify gen2-migration assess --yes` against production `main`.

### Assessment

- Both REST APIs, Cognito, S3, and Lambda support Gen 2 generation.
- Cognito and S3 support the later stateful-refactor step.
- The Lambda `custom-policies.json` file is the only reported manual
  post-generation code item, matching the rehearsal.
- Production remains `UPDATE_COMPLETE`, unlocked, and on the verified Lambda
  hash. No production resource or frontend was changed.

### Next gate

- Production lock requires separate explicit approval.
- Generation, parallel deployment, stateful refactor, cutover, and
  decommission remain later independent gates.

## STP-2026.07.19-08 - Phase 5 production reassessment baseline

Status: superseded by STP-2026.07.19-09
Date: 2026-07-19
Target: production migration planning; no production mutation

### Recorded

- Captured the production root, auth nested stack, Lambda, Gen 1 clone, and
  Gen 2 rehearsal stack statuses.
- Reconstructed ignored Gen 1 metadata in a temporary detached `main`
  worktree using a read-only Amplify pull.
- Confirmed production reports no pending Amplify backend changes.

### Blocker

- The migration CLI rejected the `main` assessment because the project still
  marks `gentest` as its migration environment.
- The approved normal clone-lock rollback stopped before mutation because
  drift validation detected the standard Amplify Gen 1 Identity Pool role
  trust-policy pattern.
- Independent drift detection found the same two root-role differences, and
  no others, on both clone and production.
- Repeating only the clone rollback with the CLI-recommended
  `--skip-validations` option is the next separate approval gate.
- No production lock, deployment, refactor, cutover, or decommission occurred.

## STP-2026.07.19-07 - Gen 2 account-switch like state

Status: deployed - isolated sandbox only
Date: 2026-07-19
Target: Gen 2 `gen2rehearsal` sandbox; production unchanged

### Implemented

- Replaced the session-dependent public count read with a direct, non-cached
  request.
- Added an authenticated like-status read that restores the signed-in
  account's persisted heart state and the shared total.
- Routed `GET /photos/likes` to the verified-token Lambda handler.

### Verification

- Backend type-check, ESLint, production build, and all 13 backend tests pass.
- The sandbox root stack is `UPDATE_COMPLETE`.
- The public count endpoint returns the persisted shared total.
- An unsigned per-user status request returns HTTP 401.
- Phase 4 browser acceptance passed with two Google accounts and a shared
  total of two.
- Studio upload, deactivate, reactivate, and permanent delete passed.
- The contact endpoint accepted the request and suppressed delivery as
  designed because the sandbox delivery flag is false.
- Console 404s shown during acceptance preceded the corrected Lambda
  deployment; post-deployment status requests route successfully.
- Production and the locked Gen 1 clone were not changed; no migration
  `refactor` was run.

## STP-2026.07.19-06 - Gen 2 Google email scope correction

Status: deployed - isolated sandbox only
Date: 2026-07-19
Target: Gen 2 `gen2rehearsal` sandbox; production unchanged

### Implemented

- Added explicit Google OAuth scopes `openid`, `profile`, and `email` to the
  Gen 2 auth definition.
- Redeployed only the isolated rehearsal sandbox after the first Phase 4
  callback reported `attributes required: [email]`.

### Verification

- Backend type-check, ESLint, production build, and all 12 backend tests pass.
- The sandbox root stack is `UPDATE_COMPLETE`.
- Cognito reports `authorize_scopes` as `openid profile email`.
- The live Cognito authorization endpoint redirects to Google with all three
  scopes.
- Production and the locked Gen 1 clone were not changed; no migration
  `refactor` was run.

## STP-2026.07.19-05 - Isolated Gen 2 sandbox

Status: deployed - isolated sandbox only
Date: 2026-07-19
Target: Gen 2 `gen2rehearsal` sandbox; production unchanged

### Implemented

- Locked only the accepted Gen 1 `gentest` clone and confirmed production has
  no deny-update stack policy.
- Generated the Gen 2 TypeScript backend and manually removed hardcoded clone
  references from the active sandbox path while preserving the inactive
  clone-bucket mapping for the later refactor gate.
- Recreated isolated Cognito, S3, DynamoDB, Lambda, and REST API resources.
- Restored scoped Lambda IAM, JWT verification, Studio authorization, REST
  routes, suppressed contact delivery, and stable frontend API output keys.
- Converted migrated handlers and tests to ESM and moved the Lambda to Node 20
  with 512 MB for reliable cold starts.
- Switched the rehearsal frontend to generated `amplify_outputs.json`.
- Kept branch resource-retention protection while allowing disposable
  sandboxes to clean up normally.

### Verification

- Gen 2 root stack is `UPDATE_COMPLETE`; no `refactor` was run.
- Sandbox S3, DynamoDB, and Cognito data are empty.
- Lambda IAM is limited to the sandbox bucket and likes table and contains no
  SES permission.
- All REST application methods use API Gateway authorization `NONE`; Lambda
  performs token validation where required.
- Public count returns HTTP 200/0, unsigned likes return 401, invalid Studio
  tokens return 401, and contact returns 200 with delivery suppressed.
- All 12 backend tests, ESLint, and the production frontend build pass.
- Production Lambda remains active with the verified Phase 1 code hash.
- The Gen 1 clone remains locked and `UPDATE_COMPLETE`.

### Deployment note

- The first create rolled back on one stale CDK asset encrypted with a deleted
  KMS key. The failed sandbox was fully cleaned up, only that undecryptable
  cache object was removed, and the clean retry succeeded without changing
  shared IAM.

### Phase 4 gate

- Add the sandbox Cognito redirect URI documented in
  `docs/GEN2_PHASE3_REHEARSAL.md` to Google, then run the two-account browser
  acceptance workflow.
- Do not run migration `refactor` without new explicit approval.

## STP-2026.07.19-04 - Isolated Gen 2 migration rehearsal baseline

Status: deployed - isolated clone only
Date: 2026-07-19
Target: Gen 1 `gentest` environment; production unchanged

### Implemented

- Created the `gen2-rehearsal` branch and documented the Phase 2 isolation map.
- Deployed distinct clone Cognito, Identity Pool, S3, Lambda, REST APIs, and an
  empty on-demand likes table.
- Parameterized Lambda auth, storage, and likes configuration by environment.
- Scoped clone IAM to only the clone bucket and clone likes table.
- Disabled contact email delivery outside production.
- Removed the production-API-specific Lambda invoke permission; each REST stack
  owns an environment-specific permission.
- Resolved frontend REST endpoints from generated Amplify configuration instead
  of hardcoded production URLs.
- Changed the like route from legacy API Gateway AWS-IAM authorization to the
  existing Lambda-verified Cognito bearer-token boundary.
- Recorded existing browser-level image lazy loading and expanded the Studio
  metadata-editing backlog item.

### Verification

- `amplify status`: no pending clone changes.
- Clone root and nested stacks: complete.
- Clone storage, likes table, and User Pool: empty.
- Clone Lambda environment and IAM contain only clone resources and no SES
  permission.
- Clone public count, suppressed contact, invalid Studio token, and unsigned
  like-write checks passed.
- Production root, Lambda, Cognito, S3 objects, and likes data remained intact.
- Read-only `amplify gen2-migration assess` supports all reported resources;
  only the Lambda custom policy requires manual post-generation code.
- Clone Google OAuth is configured through a runtime-only secret, the Cognito
  provider reports the expected client and scopes, and authorization redirects
  to Google through the clone callback.
- The Google client secret is absent from project files and source control.
- The repaired clone like route is deployed with gateway authorization `NONE`;
  a valid unsigned request reaches Lambda and is rejected with HTTP 401.
- Authenticated clone acceptance passed with an admin and non-admin Google
  account: upload, portfolio appearance, incremental likes from one to two,
  and permanent deletion all worked.
- Contact submission passed with delivery intentionally suppressed by the
  clone-only `CONTACT_DELIVERY_ENABLED=false` guard.
- Post-test state contains only the empty portfolio manifest in clone S3 and
  two test users. The two like records remain after photograph deletion, so
  related-like cleanup is recorded in the product backlog.
- `npm test`: all 12 backend tests passed.
- `npm run lint`: passed.
- `npm run build`: passed.
- No migration `lock`, `generate`, `refactor`, or Gen 2 deployment was run.

### Deferred

- Existing-photo metadata editing remains a separate post-migration product
  feature.
- Cleaning related like records during permanent photograph deletion remains a
  separate product/data-integrity feature.

## STP-2026.07.19-03 - Amplify Gen 2 migration discovery

Status: deployed - Phase 1 complete
Date: 2026-07-19
Target: isolated rehearsal before production migration

### Implemented

- Documented the AWS-recommended blue/green Gen 1-to-Gen 2 migration strategy.
- Inventoried the current Cognito, S3, DynamoDB, REST API, Lambda, IAM, Hosting,
  CloudFormation, and CDK state without changing AWS resources.
- Recorded the migration blockers, approval gates, acceptance tests, rollback
  principles, and stateful-resource protections.
- Prepared a least-privilege IAM proposal for the missing Cognito Identity Pool
  tag-read permission.

### Verification

- Confirmed all 17 manifest records reference existing S3 images.
- Confirmed the production Lambda remains active on the verified JWT code hash.
- Confirmed Node 22, TypeScript 5.6, Amplify UI 6, and CDK bootstrap version 30.
- Confirmed only production `main` exists and its root stack is
  `UPDATE_ROLLBACK_COMPLETE`.
- Confirmed no migration lock, generation, refactor, clone, IAM change, or
  backend deployment was performed during discovery.
- Applied and verified the scoped Identity Pool tag-read permission.
- Upgraded Amplify/client tooling and removed redundant direct dependencies.
- Lint, build, all 10 tests, Lambda syntax, and the high/critical production
  dependency audit passed.
- Gen 1 CLI 14.4.0 reconciliation completed successfully; the root and nested
  stacks are `UPDATE_COMPLETE`.
- CloudFormation now owns the verified JWT Lambda artifact, and the live hash
  matches `latest-build.zip`.
- Removed contact submission payload logging from the deployed Lambda.
- Post-deployment no-write backend regression suite passed.
- Phase 1 commit `3fe51fa` pushed to `main`.
- Amplify Hosting job 44 frontend-only build, deploy, and verification passed.
- Production routes and upgraded JavaScript/CSS assets return HTTP 200 with
  correct content types.
- Root stack, Lambda hash, and backend-skip protection remained unchanged after
  the frontend deployment.
- Authenticated production acceptance passed: contact submission, likes and
  unlikes across several accounts, Studio upload, public appearance,
  deactivation, and permanent deletion all work.

## STP-2026.07.19-02 - Navigation and mobile-like follow-up

Status: deployed
Date: 2026-07-19
Target: existing single Amplify environment
Frontend deployment: completed 2026-07-19, Amplify job 43

### Implemented

- Reset the browser window to the top whenever the client-side route pathname
  changes.
- Preserve the current scroll position during updates that do not navigate to
  a different route.
- Force-refresh the Cognito access token immediately before authenticated like
  writes.
- Send bearer-token like requests directly to the API, avoiding optional
  Identity Pool credential resolution that can fail in restored mobile
  sessions.
- Show an actionable sign-out/sign-in message when a session cannot be
  refreshed.

### Verification

- `npm run lint`: passed.
- `npm run build`: passed.
- `npm test`: all 10 backend regression tests passed.
- Local route-transition review: pending.
- Live Lambda hash still matches the tested JWT package.
- Production like CORS preflight: passed.
- The reported phone failure did not reach Lambda; local authenticated mobile
  retest is pending.
- Release commit `e1bd57e` pushed to `main`.
- Amplify job 43 build, deploy, and verification: passed with backend build
  skipped.
- Production deep routes and the new JavaScript bundle return HTTP 200 with
  correct content types.
- Deployed bundle contains the direct bearer-token like request and
  expired-session handling.
- Post-deployment CORS preflight passed; the verified Lambda hash was
  unchanged.
- Real-phone authenticated like/unlike and route-scroll retest: passed.

## STP-2026.07.19-01 - Portfolio P0 redesign

Status: deployed - final authenticated production smoke pending
Date: 2026-07-19
Target: existing single Amplify environment
Backend deployment: completed 2026-07-19
Frontend deployment: completed 2026-07-19

### Implemented

- Rebuilt the site in a responsive, editorial photography style.
- Added public category-filtered portfolio browsing.
- Added shared Google authentication state and admin route handling.
- Restricted admin workflows to the two approved email accounts, with
  server-side token verification.
- Added secure S3 upload coordination, structured photograph metadata,
  featured status, deactivate/reactivate, and typed permanent-delete
  confirmation.
- Added public like counts and one like state per authenticated Cognito
  identity.
- Validate like access tokens with AWS's Cognito JWT verifier and derive each
  like identity from the verified token subject.
- Refreshed the About, Contact, navigation, footer, metadata, and error states.
- Removed unused browser-side AWS signing dependencies.
- Added repository steering and continuity logs.

### Verification

- `npm run lint`: passed.
- `npm test`: 6 like-handler regression tests passed.
- `npm run build`: passed.
- Updated Lambda handlers passed `node --check`.
- Public API-to-Lambda-to-DynamoDB smoke test: passed.
- Amplify backend status: no pending changes.
- Access-token like fix deployed directly to the live Lambda after the scoped
  Amplify push retriggered the known Cognito permission failure and rolled back.
- Deployed Lambda code hash matches the tested local build artifact.
- Post-deployment unsigned like request: correctly rejected with HTTP 401.
- Post-deployment invalid-token cold-start request: correctly rejected with
  HTTP 401 after loading the JWT verifier.
- Authenticated like/unlike passed with two separate Google accounts.
- Cross-account shared like count passed, incrementing from one to two.
- Approved Studio navigation visibility passed for
  `sondratulalaphotography@gmail.com`.
- Studio ID-token authorization package deployed directly to the live Lambda;
  deployed AWS code hash matches the tested local package.
- Invalid Studio ID-token smoke test: correctly rejected with HTTP 401.
- Post-Studio-deployment public like-count regression smoke test: HTTP 200 with
  the existing count of two preserved.
- Live Studio upload and public portfolio appearance: passed.
- Live Studio deactivation and confirmed permanent deletion: passed.
- Live Studio reactivation: passed.
- Initial live manifest creation: passed; 17 records reference 17 existing S3
  images with no missing object references after test cleanup.
- Live contact-form submission: passed.
- Amplify Hosting production build configuration changed to frontend-only and
  recorded in `amplify.yml`, preventing the blocked Cognito backend stack from
  running during frontend releases.
- Source release commit `7889cef` pushed to `origin/main`.
- Amplify Hosting jobs 41 and 42 succeeded with
  `AMPLIFY_SKIP_BACKEND_BUILD=true`; job 42 is the active production
  deployment.
- Earlier hosting jobs 38 and 39 failed during the known Auth permission issue
  and rolled back safely. Job 40 was stopped and completed rollback.
- Production SPA routes `/portfolio`, `/about`, `/contact`, and `/admin`
  return HTTP 200. The deployed JavaScript, CSS, and representative image
  assets also return HTTP 200 with the correct content types.
- Replaced the broad SPA wildcard with an extension-excluding rewrite so deep
  links resolve to `index.html` without rewriting static assets.
- After a failed backend rollback restored the older function package, the
  tested Studio JWT Lambda package was redeployed directly. Its live code hash
  again matches `WMVpcBASGoGMJNCT5OPYjyuuQRXgRMMfOKqpSVd9Bik=`.
- Final backend regression smoke passed: Flowers retains two likes, unsigned
  likes return HTTP 401, and invalid Studio ID tokens return HTTP 401 from the
  ID-token verifier.
- Authenticated production-site smoke test: pending.

### Barriers, decisions, and reusable lessons

1. **Barrier:** IP-based public likes cannot reliably guarantee one person or
   one vote. NAT, mobile networks, proxies, VPNs, and IPv6 rotation make IPs a
   poor identity boundary.
   **Decision:** Require Google sign-in for liking and use the server-derived
   Cognito identity.
   **Learning:** Rate limiting may still be useful for abuse protection, but it
   should complement authenticated identity rather than replace it.

2. **Barrier:** Granting browser-side S3 write access to every authenticated
   user would make a client email allowlist meaningless.
   **Decision:** Verify the Cognito access token and approved email in Lambda,
   then issue a short-lived upload URL.
   **Learning:** Route visibility is not authorization; privileged storage
   operations must be enforced by AWS.

3. **Barrier:** Existing photograph files did not have a structured metadata
   model.
   **Decision:** Use a public S3 manifest as a transitional P0 solution, with
   fallback to the legacy folder listing.
   **Learning:** Move metadata to AppSync before adding comments, purchasing, or
   richer queries so S3 does not become an application database.

4. **Barrier:** The in-app browser was unavailable during implementation.
   **Decision:** Complete build, lint, and syntax validation and explicitly
   leave visual QA pending.
   **Learning:** Do not claim responsive or interaction QA from compilation
   alone.

5. **Barrier:** Likes failed during local review even though the frontend and
   DynamoDB table were configured correctly.
   **Decision:** Compare the live Lambda metadata with the local Amplify
   changes before altering the data model.
   **Learning:** The live Lambda was still the May 2025 version. The corrected
   handler and permissions remain pending until the approved Amplify
   deployment.

6. **Barrier:** The first approved deployment created the new public routes,
   but API Gateway returned an internal error before invoking Lambda.
   **Decision:** Inspect Lambda logs, API integrations, and the Lambda resource
   policy instead of changing application behavior.
   **Learning:** Amplify did not extend the existing public API's Lambda invoke
   permission to the newly generated routes. Track a least-privilege
   `AWS::Lambda::Permission` for the specific REST API in CloudFormation.

7. **Barrier:** Clicking sign-in on local port `5174` did not navigate or show
   an error.
   **Decision:** Compare the live Cognito client, Amplify auth template, and
   active browser origin before changing the Google provider.
   **Learning:** The live client allowed only `3000` and `5173`, while the
   Amplify template also expected `3001`. Add `5174` through tracked auth
   configuration and expose sign-in startup errors in the UI.

8. **Barrier:** The approved callback deployment rolled back after Cognito
   client updates because CloudFormation could not read Identity Pool tags.
   **Decision:** Verify rollback and live callbacks before requesting any IAM
   change.
   **Learning:** The Amplify deployment role's managed policy does not include
   the newer `cognito-identity:ListTagsForResource` read action. Port `3001` is
   now live; completing `5174` requires a separately approved, narrowly scoped
   IAM permission followed by another auth push.

9. **Barrier:** Sign-in still appeared unavailable on registered port `5173`.
   **Decision:** Verify the hosted Cognito authorization URL independently and
   identify the browser surface used for testing.
   **Learning:** Cognito returned the expected Google redirect; VS Code's
   embedded preview restricted the external OAuth navigation. Detect embedded
   previews and direct the user to a standard browser.
