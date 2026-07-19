# Release and Learning Log

Release IDs use `STP-YYYY.MM.DD-NN`. An entry may be `candidate`, `deployed`,
`superseded`, or `rolled-back`.

## STP-2026.07.19-02 - Navigation and mobile-like follow-up

Status: deployed - real-phone authenticated retest pending
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
- Real-phone authenticated like/unlike and route-scroll retest: pending.

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
