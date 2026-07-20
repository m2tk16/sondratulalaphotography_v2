# Current Work

Last updated: 2026-07-19

## Current objective

Keep frontend cutover paused while expanding the accepted Gen 2 Studio so
every existing photograph's metadata can be edited safely, including ordering
and accessible alternative text, and so Sondra can choose the homepage photo.
Preserve the live Gen 1 backend and frontend as rollback. Do not cut over the
frontend or decommission Gen 1 without separate approval.

## Current state

- The public portfolio redesign is implemented locally.
- Google sign-in is integrated for authenticated likes.
- The `/admin` studio supports uploads, photograph metadata, categories,
  homepage-photo selection, visibility controls, and confirmed permanent
  deletion.
- Admin API requests verify the signed-in account server-side against the two
  approved email addresses.
- Public like counts and authenticated like toggling are implemented locally.
- The contact form endpoint was corrected.
- Production build, ESLint, and Lambda syntax checks pass.
- The approved backend changes are deployed to the live `main` Amplify
  environment. Amplify reports no pending backend changes.
- The public like-count smoke test reaches Lambda and DynamoDB successfully.
- The local production build, lint, and all five like-handler tests pass after
  deployment.
- Local visual and Google-login review passed. Authenticated like/unlike is
  ready for a browser retest against the corrected backend.
- The live likes table is active with the expected `username` partition key and
  `photo` sort key. The live S3 CORS rules permit signed uploads.
- Focused like-handler regression tests cover missing input, authentication,
  server-derived identity, toggling, and paginated totals.
- The first approved deployment exposed a missing API Gateway-to-Lambda invoke
  permission on newly added routes. A scoped CloudFormation permission was
  deployed and the repeated smoke test passed.
- Sign-in testing on port `5174` exposed drift between the Amplify auth template
  and the live Cognito callback list. The attempted auth update was rolled back;
  the unused pending `5174` change was removed after testing returned to the
  registered `5173` port.
- The approved auth deployment rolled back because the Amplify deployment role
  lacks `cognito-identity:ListTagsForResource`. Rollback completed safely. The
  live client now permits `3001` but still does not permit `5174`.
- Cognito accepts the registered `5173` callback and returns a Google redirect.
  Sign-in was being tested in VS Code's embedded preview, which restricts the
  external OAuth navigation. The UI now directs users to a regular browser.
- The sign-in UI now preserves Amplify's safe error name and message instead of
  replacing every failure with a generic redirect warning. Session detection
  also keeps a valid User Pool login visible if optional Identity Pool
  credential loading fails.
- The OAuth diagnostic change passes both ESLint and the production build.
- Browser diagnostics identified `UserAlreadyAuthenticatedException`: cached
  Cognito tokens were present while the user-profile request returned HTTP 400.
  Session restoration now reads the email and admin group from the refreshed ID
  token, avoiding the unnecessary profile request. If cached tokens cannot be
  refreshed, sign-in clears the stale OAuth session before the next attempt.
- A signed-in browser retest reached the like Lambda but returned HTTP 401
  because the session did not yield an Identity Pool ID. A local fix now sends
  the Cognito access token and validates it server-side before deriving the
  liker identity.
- All six focused like-handler tests, ESLint, the production build, and the
  updated Lambda syntax check pass for the access-token fix.
- The access-token like fix is deployed to the live Lambda. AWS reports the
  function active with code hash
  `JWv7lpdA822OhAmhLjubkOzhG1EQ+dWJB36aGKh6rxM=`, matching the tested local
  build artifact.
- The first function-category Amplify push still included the Auth nested stack
  and hit the known missing `cognito-identity:ListTagsForResource` permission.
  CloudFormation completed rollback safely and canceled the Lambda update.
  The tested ZIP was then deployed directly to the Lambda so Cognito remained
  untouched.
- A post-deployment unsigned like request is correctly rejected with HTTP 401.
- The first access-token implementation used Cognito `GetUser`, but Google
  OAuth access tokens from the configured scopes do not include
  `aws.cognito.signin.user.admin`, so valid signed-in requests still returned
  HTTP 401. The deployed handler now uses AWS's `aws-jwt-verify` library to
  validate the token signature, issuer, expiration, access-token use, and exact
  app client, then derives the like identity from the verified `sub` claim.
- The Lambda entry point no longer logs the complete API event or request body,
  preventing bearer tokens and submitted form contents from being written to
  CloudWatch.
- A post-deployment cold-start smoke test confirmed the JWT dependency loads
  successfully and an invalid bearer token is correctly rejected with HTTP 401.
- Authenticated browser testing passed with two separate Google accounts:
  like and unlike work, each account contributes its own like, and the shared
  count incremented from one to two.
- The approved `sondratulalaphotography@gmail.com` account correctly sees the
  Studio navigation entry.
- The live bucket contains all 17 legacy photographs but no
  `public/images/portfolio/manifest.json`. The two console 404s are duplicate
  development-mode requests for that one missing manifest, not missing images.
- A local Studio authorization fix now sends the Cognito ID token, verifies its
  signature and exact User Pool app client server-side, then enforces the two
  approved email addresses from the verified email claim.
- All 10 focused like and Studio authorization tests, ESLint, the production
  build, and Lambda syntax checks pass. The verified Studio JWT Lambda package
  is deployed.
- AWS reports the Studio JWT Lambda active with code hash
  `WMVpcBASGoGMJNCT5OPYjyuuQRXgRMMfOKqpSVd9Bik=`, exactly matching the tested
  local package.
- Post-deployment checks passed: an invalid Studio ID token is rejected with
  HTTP 401, and the public like-count endpoint still returns HTTP 200 with the
  preserved count of two.
- Live Studio smoke testing passed for upload, public portfolio appearance,
  deactivation, and confirmed permanent deletion.
- Live Studio reactivation passed; a deactivated photograph returned to the
  public portfolio.
- The first Studio write created the missing live manifest. After deleting the
  disposable test photograph, S3 contains the original 17 images plus one
  manifest; the manifest has exactly 17 records and zero missing object
  references.
- Live contact-form submission passed.
- The production Amplify Hosting build configuration is now frontend-only, so
  a `main` push will not retrigger the blocked Cognito backend deployment. The
  same build specification is stored in `amplify.yml`.
- Release commit `7889cef` is pushed to `origin/main`.
- Amplify Hosting jobs 41 and 42 completed successfully with backend builds
  skipped. Job 42 is the active production deployment.
- The `main` branch has automatic builds enabled and
  `AMPLIFY_SKIP_BACKEND_BUILD=true`. Failed jobs 38 and 39 rolled back safely;
  job 40 was stopped and also completed rollback.
- The production SPA rewrite now excludes static asset extensions. Direct
  requests to `/portfolio`, `/about`, `/contact`, and `/admin` return the app,
  while JavaScript, CSS, and image assets retain their correct content types.
- Production public-route and asset smoke tests passed on
  `https://sondratulalaphotography.com`.
- A failed Amplify backend rollback briefly restored the older Lambda package.
  The tested Studio JWT package was redeployed directly afterward. AWS reports
  the function active with code hash
  `WMVpcBASGoGMJNCT5OPYjyuuQRXgRMMfOKqpSVd9Bik=`.
- Final backend regression checks passed: the Flowers like count remains two,
  unsigned likes return HTTP 401, and an invalid Studio ID token returns HTTP
  401 with the ID-token verifier response.
- The production authenticated review passed and the redesigned site was
  accepted.
- A router-level scroll reset now moves the window to the top whenever the URL
  pathname changes, preventing a new page from inheriting the previous page's
  scroll position.
- ESLint, the production build, and all 10 backend regression tests pass with
  the route-scroll change.
- Production diagnostics for the reported phone like failure confirmed the
  tested JWT Lambda is still deployed and public counts remain healthy. The
  failed phone write did not reach Lambda, and the authenticated API CORS
  preflight passes.
- The like client now force-refreshes its Cognito access token before a write
  and calls the bearer-token endpoint directly, avoiding optional Identity Pool
  credential resolution in restored mobile sessions. Expired sessions receive
  an actionable sign-out/sign-in message.
- Commits through `e1bd57e` are pushed to `main`. Amplify Hosting job 43
  completed its frontend-only build, deploy, and verification successfully.
- Production routes return HTTP 200 and the deployed
  `/assets/index-DlkHVv3k.js` bundle contains the direct like endpoint and
  expired-session handling.
- Post-deployment checks confirm like CORS is healthy,
  `AMPLIFY_SKIP_BACKEND_BUILD=true` remains set, and the live Lambda still
  matches verified hash
  `WMVpcBASGoGMJNCT5OPYjyuuQRXgRMMfOKqpSVd9Bik=`.
- Real-phone verification passed for the restored-session like fix and route
  behavior. Release `STP-2026.07.19-02` is accepted.
- Gen 2 migration discovery is documented in `docs/GEN2_MIGRATION.md`.
- The current toolchain has Node 22.13, TypeScript 5.6, Amplify UI 6, and CDK
  bootstrap version 30. `aws-amplify` must be upgraded from 6.12.1 to at least
  6.16.2.
- The only Amplify backend environment is production `main`; an isolated clone
  is required before migration rehearsal.
- The Gen 1 root stack is `UPDATE_ROLLBACK_COMPLETE`, while the migration lock
  accepts only `UPDATE_COMPLETE` or `CREATE_COMPLETE`.
- The known missing `cognito-identity:ListTagsForResource` deployment
  permission and direct Lambda/CloudFormation drift must be resolved before the
  Gen 1 CLI v14 prerequisite deployment can succeed.
- The aggregate read-only before-state is recorded in
  `docs/GEN2_BASELINE.md`. It confirms 17 intact manifest references, 5 like
  records, 5 estimated Cognito users, and the verified Lambda hash.
- Current protection gaps: S3 versioning, DynamoDB point-in-time recovery and
  deletion protection, and Cognito deletion protection are disabled.
- A least-privilege, single-resource permission proposal is documented in
  `docs/GEN2_IAM_PROPOSAL.md`; it is applied and verified.
- `aws-amplify` is upgraded to 6.18.0. Amplify UI React, React Router DOM, and
  the Gen 2 backend CLI were also updated within their existing major versions;
  unused duplicate Amplify modules were removed.
- Lint, production build, all 10 tests, Lambda syntax checks, and the
  high/critical production dependency audit pass.
- Gen 1 CLI 14.4.0 successfully reconciled the verified JWT Lambda through
  CloudFormation. Contact form field/body logging was removed from the deployed
  handler.
- The root and every nested stack are `UPDATE_COMPLETE`; `amplify status`
  reports no pending backend changes.
- The live Lambda hash exactly matches the generated CloudFormation artifact:
  `HM9SlqGaPcwb2Ugy4n+82rwfIdylTj7JJWvRGN1+mz8=`.
- Post-deployment no-write checks passed for Cognito callbacks, all 17 manifest
  references, public like count, unsigned-like rejection, Studio token
  rejection, and contact CORS.
- Phase 1 source commit `3fe51fa` is pushed to `main`.
- Amplify Hosting job 44 completed its frontend-only build, deploy, and
  verification successfully; the backend-skip guard remains enabled.
- Production routes and the new JavaScript/CSS assets return HTTP 200 with the
  correct content types. The deployed bundle retains the restored-mobile
  session fix.
- Authenticated production acceptance passed after Phase 1: contact submission,
  like and unlike across several accounts, Studio upload, portfolio appearance,
  deactivation, and permanent deletion all work.
- Google OAuth is now configured on the isolated `gentest` User Pool with a
  securely supplied credential. The clone root stack is `UPDATE_COMPLETE`,
  Amplify reports no pending changes, and the Cognito authorization endpoint
  redirects to `accounts.google.com`.
- The Google client secret was loaded from the local downloaded credential at
  deployment time and is absent from project files and source control.
- The first clone like attempt was rejected by API Gateway before reaching
  Lambda because the migrated route still required legacy AWS-IAM signing while
  the client uses a Cognito bearer token. The clone route now has no gateway
  authorizer; Lambda remains the authentication boundary and verifies the
  access token, issuer, token use, and app client before writing.
- The repaired clone route is deployed, the root stack is `UPDATE_COMPLETE`,
  Amplify reports no pending changes, and a valid unsigned request reaches
  Lambda and is rejected with HTTP 401.
- Authenticated clone acceptance passed with two Google accounts: an approved
  admin uploaded a photograph and liked it, a non-admin account added the
  second like, and the admin permanently deleted the photograph. The portfolio
  returned to its empty state.
- The clone contact form accepted the request but did not deliver email, as
  designed, because `CONTACT_DELIVERY_ENABLED=false`.
- Post-test inspection found only the empty portfolio manifest in clone S3, two
  clone Cognito users, and two orphaned like records for the deleted test
  photograph. Cleaning related likes during permanent deletion is now tracked
  as a product/data-integrity follow-up.
- Phase 3 is complete. The Gen 1 `gentest` clone was locked for the rehearsal,
  the generated Gen 2 backend is manually reconciled, and the isolated
  `gen2rehearsal` sandbox is deployed with an `UPDATE_COMPLETE` root stack.
  Phase 5 has since unlocked the clone.
- The Gen 2 sandbox has separate empty Cognito, S3, DynamoDB, Lambda, and REST
  API resources. Production remains unchanged and the migration `refactor`
  command has not been run.
- The migrated Lambda uses Node 20, 512 MB, and least-privilege access to only
  the sandbox bucket and likes table. Live smoke tests passed for public count,
  unsigned-like rejection, Studio-token rejection, and suppressed contact
  submission.
- The rehearsal frontend now consumes generated Gen 2 outputs. Phase 4 Google
  sign-in requires the new Cognito `/oauth2/idpresponse` redirect URI recorded
  in `docs/GEN2_PHASE3_REHEARSAL.md`.
- The first Phase 4 Google callback failed with
  `attributes required: [email]` because the provider requested only CDK's
  default `profile` scope. The auth definition now explicitly requests
  `openid`, `profile`, and `email`.
- The scope correction is deployed only to `gen2rehearsal`. Its root stack is
  `UPDATE_COMPLETE`, Cognito stores `openid profile email`, and a live
  authorization request forwards all three scopes to Google.
- The first two-account like test persisted both user records but exposed that
  the frontend reset each account's heart and used a session-dependent helper
  for the public total. It now uses a direct non-cached public count request
  and an authenticated per-user status request.
- The like-state correction is deployed only to `gen2rehearsal`. The public
  endpoint returns the persisted total, unsigned status reads return HTTP 401,
  and the sandbox stack is `UPDATE_COMPLETE`.
- Phase 4 authenticated browser acceptance passed: two Google accounts
  produced a shared total of two, and Studio upload, deactivate, reactivate,
  and permanent delete all worked.
- The contact submission reached the sandbox Lambda. Delivery was suppressed
  by design because `CONTACT_DELIVERY_ENABLED=false` and the sandbox has no
  SES permission.
- Console 404s captured during the test preceded the corrected Lambda
  deployment. Post-deployment like-status requests route successfully.
- Phase 5 read-only preparation is recorded in
  `docs/GEN2_PHASE5_PRODUCTION.md`.
- Production `main` reports no pending Amplify changes and its root stack is
  `UPDATE_COMPLETE`; its auth nested stack is `UPDATE_ROLLBACK_COMPLETE`.
- The initial production reassessment did not run because Amplify still marked
  `gentest` as the migration environment. No production mutation occurred.
- The approved clone unlock stopped before mutation because CLI drift
  validation detected the two standard Gen 1 Identity Pool trust-policy
  differences. Production reports the same two-resource drift pattern and no
  additional root-stack drift.
- The user approved the validation bypass. The project migration marker was
  removed, the clone policy now permits updates, and `gentest` remains
  `UPDATE_COMPLETE`.
- The read-only production assessment passed. Both REST APIs, Cognito, S3, and
  Lambda support generation; Cognito and S3 support later stateful refactor.
  The Lambda custom policy remains the only manual code item.
- The approved normal production lock did not apply. After correcting the
  temporary CLI credential source, validation identified the intentional
  Phase 1 Lambda permission replacement, the approved extra Cognito callback,
  stale API Gateway trust on the Lambda role, and non-functional REST API
  description drift.
- All unexecuted validation change sets were deleted. Production remains
  unlocked and `UPDATE_COMPLETE`, and the project migration marker is absent.
- The user approved a clean Gen 2 blue/green replacement instead of continuing
  the migration CLI workflow. The plan is recorded in
  `docs/GEN2_BLUE_GREEN.md`.
- The production candidate enables SES only on the Gen 2 `production` branch
  and protects the new likes table with retention, deletion protection, and
  point-in-time recovery.
- Candidate type-checking, ESLint, the production frontend build, and all 13
  backend tests pass.
- The clean backend-only Gen 2 production candidate is deployed in Amplify app
  `d15h7apgzubla9`; its root stack is `UPDATE_COMPLETE`.
- The candidate S3 bucket has encryption, versioning, public-access blocking,
  and retention. Cognito deletion protection is active. The likes table has
  deletion protection, 35-day point-in-time recovery, and retention.
- All 28 real portfolio files (27,874,789 bytes) were copied and match the
  Gen 1 source by key and size. The manifest ETag is identical. Fourteen
  zero-byte folder markers were not copied.
- The candidate User Pool and likes table are empty by design. Existing likes
  were not copied because their user subjects belong to the Gen 1 User Pool.
- Candidate API smoke tests pass: public count HTTP 200, unsigned like HTTP
  401, unsigned Studio HTTP 401, and production contact delivery HTTP 200.
- The new Google callback URI is recorded in
  `docs/GEN2_BLUE_GREEN.md`. Authenticated acceptance and frontend cutover
  remain pending.
- Authenticated candidate acceptance passed with two Google accounts. Shared
  likes persisted across account switches; Studio upload, metadata editing,
  activation, deactivation, permanent deletion, and contact email all worked.
- Final candidate inspection is healthy: root stack `UPDATE_COMPLETE`, 28
  portfolio files, 17 active manifest records, two Cognito users, and three
  active like records.
- The candidate is accepted. Frontend cutover is the next separate approval
  gate; Gen 1 resources remain intact for rollback.
- Frontend cutover is now paused for Studio metadata editing. Each existing
  photograph can locally edit its title, category, alternative text, location,
  capture date, description, visibility, homepage status, and portfolio
  position without changing its immutable ID or S3 path.
- Reordering produces unique contiguous positions for the entire collection.
  Existing records without alternative text safely default to their title.
- The public portfolio now passes stored alternative text to rendered images.
  New uploads require both a title and alternative text.
- The full capture-date field now opens the native calendar picker in both the
  upload and edit forms.
- The navigation now offers a light/dark appearance control. New visitors
  receive the warm light theme by default; the night-gallery theme is
  accessible on desktop and mobile, persists locally, updates native browser
  color treatment, and is applied before the app renders on return visits.
- The Studio manifest boundary now validates every metadata field, category,
  capture date, order, and duplicate ID/path before writing to S3.
- The stored `featured` field now has one clear product meaning: the active
  homepage photograph. Studio calls it "Use as homepage photo," choosing a new
  one replaces the previous selection, deactivating it clears the selection,
  and the collection view clearly identifies it.
- The homepage loads that photograph and its title/alternative text from the
  manifest. `Into the Fog` remains the safe fallback when none is selected or
  the manifest cannot be loaded.
- The old portfolio "Featured" badge and category are removed. A legacy
  `Featured` category is normalized to `Nature` when loaded, while new
  manifests reject it.
- Backend type-checking, ESLint, the production build, and all 22 automated
  tests pass. The accepted Gen 2 candidate has not yet received the stricter
  manifest validator; local Studio acceptance is pending.

## Next steps

1. Obtain approval to deploy the stricter manifest and single-homepage-photo
   validator only to the Gen 2 candidate.
2. Run local Studio field-editing, reordering, and homepage-photo acceptance.
3. Obtain explicit approval for the frontend cutover.
4. Keep the Gen 1 backend intact through an observation window before any
   separate decommissioning decision.

## Resume point after interruption

The clean backend-only Gen 2 candidate in Amplify app `d15h7apgzubla9` is
deployed, protected, populated, and accepted after two-account likes, Studio
lifecycle, and contact-delivery testing. Frontend cutover is paused at the
user's request while complete Studio metadata editing and homepage-photo
selection are implemented. No frontend cutover or Gen 1 decommission has
occurred.

## Known risks and blockers

- Ports `3000`, `3001`, and `5173` are registered Cognito callbacks. OAuth must
  be tested in a regular browser rather than VS Code's embedded preview.
- The current like-count implementation scans the likes table. This is
  acceptable only for initial low traffic and should be replaced with a better
  data model before scale.
- The manifest JSON in S3 is a transitional metadata store. Moving photograph
  metadata and likes to AppSync is recommended before comments or purchasing.
- Permanent photograph deletion currently leaves related DynamoDB like records
  behind. Delete those records transactionally when the data model is revised.
- The official Gen 2 migration tool is in Developer Preview and operates on
  production CloudFormation resources. Use the documented blue/green process
  with human supervision and explicit approval at every mutation gate.
- The assessment supports every reported resource. The Lambda custom policy is
  the only reported manual post-generation item.
