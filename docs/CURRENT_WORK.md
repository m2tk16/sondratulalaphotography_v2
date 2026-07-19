# Current Work

Last updated: 2026-07-19

## Current objective

Design the isolated clone resource map for Phase 2 after confirming the
deployed Phase 1 client upgrade with an authenticated browser session.

## Current state

- The public portfolio redesign is implemented locally.
- Google sign-in is integrated for authenticated likes.
- The `/admin` studio supports uploads, photograph metadata, categories,
  featured status, visibility controls, and confirmed permanent deletion.
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

## Next steps

1. Re-test Google sign-in, like/unlike, Studio visibility, and route scrolling
   in production after the dependency upgrade.
2. Design the Phase 2 clone isolation map and request approval before creating
   any AWS resources.

## Resume point after interruption

Phase 1 backend and frontend deployment is complete. Resume with the
authenticated production smoke test, then the Phase 2 isolation map. No
migration `lock`, `generate`, `refactor`, or clone command has been run.

## Known risks and blockers

- The deployed Lambda code currently differs from the function version tracked
  by CloudFormation because the Amplify root deployment role cannot update the
  Auth nested stack. Hosting builds are protected by
  `AMPLIFY_SKIP_BACKEND_BUILD=true`, but a manual backend push could overwrite
  the direct Lambda deployment unless the Cognito permission issue is repaired
  or the function change is reconciled through CloudFormation first.
- Ports `3000`, `3001`, and `5173` are registered Cognito callbacks. OAuth must
  be tested in a regular browser rather than VS Code's embedded preview.
- The current like-count implementation scans the likes table. This is
  acceptable only for initial low traffic and should be replaced with a better
  data model before scale.
- The manifest JSON in S3 is a transitional metadata store. Moving photograph
  metadata and likes to AppSync is recommended before comments or purchasing.
- The official Gen 2 migration tool is in Developer Preview and operates on
  production CloudFormation resources. Use the documented blue/green process
  with human supervision and explicit approval at every mutation gate.
