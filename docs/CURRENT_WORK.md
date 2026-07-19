# Current Work

Last updated: 2026-07-19

## Current objective

Complete the final authenticated production smoke test for the deployed
photography portfolio P0 release.

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

## Next steps

1. In a regular browser, hard-refresh
   `https://sondratulalaphotography.com`.
2. Confirm production Google sign-in, like/unlike, and Studio visibility for an
   approved account.
3. Optionally perform a safe Studio deactivate/reactivate check and submit the
   contact form once from production.
4. Record any follow-up defect; otherwise close release
   `STP-2026.07.19-01`.

## Resume point after interruption

The code and production frontend are deployed. Start with the authenticated
production smoke test listed above. The working tree should be clean; record
the smoke result in this file and `docs/RELEASES.md`.

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
- Amplify Gen 1 is in maintenance mode; a Gen 2 migration should be planned
  separately, without blocking this P0.
