# Clean Gen 2 Blue/Green Deployment

Date started: 2026-07-19
Status: production candidate preparation

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
- A new backend-only Amplify app will own the Gen 2 production candidate.
- Logical Gen 2 branch: `production`.
- The existing frontend will be switched to the new
  `amplify_outputs.json` only after candidate acceptance.
- The custom domain remains on the existing hosting app, avoiding a DNS or
  domain-association move.

## Data policy

- Copy all 42 existing S3 objects into the new Gen 2 bucket.
- Do not copy the 8 existing likes. Their Cognito subjects belong to the old
  User Pool and would create duplicate votes when users first sign into the
  new pool.
- Google users sign into the new User Pool again; Google remains the identity
  provider, so no passwords need to be migrated.
- Keep all original Gen 1 data intact for rollback.

## Production protections

- Auth and S3 stateful resources use retain policies on branch deployments.
- The production likes table uses deletion protection, point-in-time recovery,
  and a retain removal policy.
- Contact delivery is enabled only when `AWS_BRANCH=production`.
- SES permission is limited to `ses:SendEmail` from the verified
  `sondratulalaphotography.com` identity.
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
