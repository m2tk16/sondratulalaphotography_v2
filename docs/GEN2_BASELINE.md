# Amplify Gen 2 Pre-Migration Baseline

Captured: 2026-07-19
Region: `us-east-1`
AWS account: `178450627339`

This is a read-only before-state. It contains aggregate counts and resource
configuration, not Cognito identities or DynamoDB user keys.

## Amplify and CloudFormation

- Amplify Hosting app: `dm7aei9mgulua`
- Backend environment: `main` (the only environment)
- Root stack: `amplify-sondratulalaphotogra-main-496bb`
- Root stack status: `UPDATE_ROLLBACK_COMPLETE`
- Root stack termination protection: disabled
- CDK bootstrap stack: `UPDATE_COMPLETE`
- CDK bootstrap version: 30
- Production hosting backend builds:
  `AMPLIFY_SKIP_BACKEND_BUILD=true`

## Storage

- Bucket:
  `sondratulalaphotogra25f72088efde4213955fdfd598b496bb-main`
- Portfolio prefix: `public/images/portfolio/`
- Total prefix objects: 19
  - 17 image objects
  - 1 manifest
  - 1 zero-byte folder marker
- Total prefix bytes: 16,756,761
- Manifest records: 17
- Missing manifest object references: 0
- Default encryption: S3-managed AES-256
- Bucket versioning: disabled

Risk: originals and the manifest do not currently have version-history
protection. Enabling versioning is a separate AWS mutation and must be approved
before execution.

## Likes table

- Table: `SondraTulalaPhotography-PhotoLikes`
- Status: `ACTIVE`
- Billing: on demand
- Partition key: `username`
- Sort key: `photo`
- Exact scanned records: 5
- Active (`liked = Y`) records: 5
- Deletion protection: disabled
- Point-in-time recovery: disabled

The table is referenced through Lambda custom IAM and is not represented as an
Amplify backend data/storage category. Treat it as an external stateful
resource until migration assessment proves otherwise.

## Cognito

- User Pool: `us-east-1_Ag1DJ56zy`
- Estimated users: 5
- MFA: off
- User Pool deletion protection: inactive
- Hosted UI domain:
  `sondratulalaphotograaaef21f8-aaef21f8-main`
- Providers: Cognito and Google
- OAuth flow: authorization code
- OAuth scopes: `email`, `openid`, `profile`
- Token revocation: enabled
- Production callback/logout URL:
  `https://sondratulalaphotography.com/`
- Local callback/logout URLs: ports 3000, 3001, and 5173
- Identity Pool:
  `us-east-1:5340cb1e-27f6-43aa-b966-44e7c93d9e78`
- Unauthenticated Identity Pool identities: allowed

No usernames, email addresses, or tokens were captured.

## REST APIs

Public/workflow API `wco3y6e125`:

- `POST /contact/send-email`
- `GET /photos/likes/count`
- `POST /admin/upload-url`
- `PUT /admin/manifest`
- `DELETE /admin/photo`
- Generated proxy and `OPTIONS` routes

Authenticated-like API `5rvjxmddfc`:

- `POST /photos/likes`
- Generated proxy and `OPTIONS` routes

The frontend currently uses both Amplify API names and hardcoded API URLs.
Replace those with a single outputs-driven configuration during migration.

## Lambda

- Function: `sondratulalaphotogradcd4b5ed-main`
- Runtime: Node.js 18
- Handler: `index.handler`
- Memory: 128 MB
- Timeout: 25 seconds
- State/update: active/successful
- Verified code hash:
  `WMVpcBASGoGMJNCT5OPYjyuuQRXgRMMfOKqpSVd9Bik=`
- Environment variable names: `ENV`, `REGION`

Tracked inline permissions:

- DynamoDB `GetItem`, `PutItem`, and `Scan` on the production likes table
- S3 `GetObject`, `PutObject`, and `DeleteObject` on the production portfolio
  prefix
- CloudWatch Logs write access

Live attached policies not fully represented in the tracked function:

- `SondraTulalaPhotographySES`
- `SondraTulalaPhotographyInvokeLambdaPolicy`

The SES policy permits email sending. The invoke policy references the current
Lambda and contact REST route. Both require explicit Gen 2 replacement/review.

## Baseline acceptance

- Production gallery routes and assets: passed
- Google authentication: passed
- Mobile like/unlike after token-refresh fix: passed
- Studio upload/deactivate/reactivate/delete: passed
- Contact submission: passed
- Manifest integrity: 17 of 17 references present

## Recommended protection changes

These are recommendations only and have not been applied:

1. Enable S3 versioning before stateful migration work.
2. Enable DynamoDB point-in-time recovery and deletion protection.
3. Enable Cognito User Pool deletion protection if compatible with the
   migration tool's refactor workflow.
4. Enable CloudFormation termination protection where it will not conflict
   with the documented migration steps.
5. Create a separate backup/export before the production stateful refactor.

Each protection change must be checked against the migration tool and approved
before execution.
