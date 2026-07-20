# Clean Gen 2 Blue/Green Deployment

Date started: 2026-07-19
Status: backend candidate accepted; frontend cutover pending approval

## Decision

Abandon the Developer Preview in-place migration workflow. It repeatedly
blocked on Amplify CLI validation, temporary-role permissions, and known
CloudFormation drift even though the isolated Gen 2 application passed
acceptance.

Deploy the accepted Gen 2 code as a separate backend application. Keep the
current Gen 1 backend and hosted frontend unchanged until the replacement
passes acceptance and receives separate cutover approval.

No production lock or CloudFormation stack refactor will be used.

## Architecture

- Existing Amplify app `dm7aei9mgulua` continues hosting the production
  frontend and Gen 1 rollback backend.
- Backend-only Gen 2 Amplify app: `d15h7apgzubla9`
  (`sondratulalaphotography-gen2-backend`).
- Logical Gen 2 branch: `production`.
- The existing frontend will be switched to the new
  `amplify_outputs.json` only after candidate acceptance.
- The custom domain remains on the existing hosting app, avoiding a DNS or
  domain-association move.

## Data policy

- The 42 source S3 objects consist of 28 files and 14 zero-byte folder
  markers. All 28 files were copied into the new bucket and verified by key,
  size, total bytes, and manifest ETag. Folder markers were intentionally not
  copied.
- Do not copy the 8 existing likes. Their Cognito subjects belong to the old
  User Pool and would create duplicate votes when users first sign into the
  new pool.
- Google users sign into the new User Pool again; Google remains the identity
  provider, so no passwords need to be migrated.
- Keep all original Gen 1 data intact for rollback.

## Production protections

- Auth and S3 stateful resources use retain policies on the production branch.
- The production S3 bucket uses AES-256 server-side encryption, versioning,
  public-access blocking, and a retain policy.
- The production User Pool uses Cognito deletion protection and a retain
  policy.
- The production likes table uses deletion protection, point-in-time recovery,
  and a retain removal policy.
- Contact delivery is enabled only when `AWS_BRANCH=production`.
- SES permission is limited to `ses:SendEmail` for the verified sender domain
  `sondratulalaphotography.com` and verified sandbox recipient
  `sondratulalaphotography@gmail.com`.
- Sandbox contact delivery remains suppressed.

## Gates

1. Deploy the backend-only Gen 2 production candidate.
2. Copy portfolio objects into its new bucket.
3. Add the new Cognito redirect URI to Google.
4. Test auth, two-account likes, Studio, storage, and real contact delivery.
5. Request separate approval before publishing a frontend configured for the
   new backend.
6. Keep Gen 1 resources through an observation window before any
   decommissioning decision.

## Deployed candidate

- Root stack:
  `amplify-d15h7apgzubla9-production-branch-45c0080e99`
- Cognito User Pool: `us-east-1_eQ43OQcYS`
- Google callback to register:
  `https://92a0617f43296415834c.auth.us-east-1.amazoncognito.com/oauth2/idpresponse`
- S3 bucket:
  `amplify-d15h7apgzubla9-pr-sondratulalaphotogra25f7-85z3yb82cyrd`
- Likes table: `SondraTulalaPhotography-PhotoLikes-production`
- Public/Studio/contact API:
  `https://uieb1nwuih.execute-api.us-east-1.amazonaws.com/prod`
- Authenticated-like API:
  `https://waghv1ws21.execute-api.us-east-1.amazonaws.com/prod`

The root stack is `UPDATE_COMPLETE`. Public like count, unsigned-like
rejection, unsigned Studio rejection, and real contact delivery smoke tests
pass.

Authenticated acceptance passed on 2026-07-19:

- Two Google accounts signed into the new User Pool.
- Likes persisted across account switches and shared totals updated.
- Studio upload, metadata editing, activation, deactivation, and permanent
  deletion worked.
- The contact form delivered email.
- After deleting the disposable upload, the bucket again contains the 28
  copied files and the manifest again contains the original 17 active records.
- Final inspection found two Cognito users and three active like records.

The live Gen 1 frontend and backend have not been changed. Frontend cutover
remains a separate approval gate.
