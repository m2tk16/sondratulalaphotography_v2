# Amplify Gen 2 Migration

Last updated: 2026-07-19

## Decision

Migrate by rehearsing the full process in an isolated non-production
environment before making any structural change to `main`.

AWS marks the Gen 1-to-Gen 2 migration tool as Developer Preview, says it
operates on production resources, and requires supervised confirmation. Its
recommended process is partial blue/green: generate a parallel Gen 2 backend,
test it thoroughly, then refactor stateful resources only after validation.

Do not combine this infrastructure migration with the later photograph
metadata/likes AppSync redesign. First preserve current behavior on Gen 2;
modernize the data model in a separate release.

## Current resource inventory

| Capability | Current implementation | Migration concern |
| --- | --- | --- |
| Authentication | Cognito User Pool and Identity Pool with Google OAuth | Preserve users and add Gen 2 callback/logout URLs before testing social sign-in. |
| Portfolio files | Amplify-managed S3 bucket with originals and a JSON manifest | Stateful and irreplaceable; clone tests must never point writes or deletes at production. |
| Likes | External DynamoDB table `SondraTulalaPhotography-PhotoLikes` | The table is referenced by Lambda IAM but is not an Amplify backend category, so automatic discovery/refactor may not own it. |
| Application API | Two API Gateway REST APIs | Gen 2 supports REST through generated/custom CDK; frontend API names and URLs will change. |
| Workflows | One CommonJS Lambda handles contact, likes, and Studio operations | Generated code requires ESM-compatible handlers and manual review of all IAM. |
| Contact email | Lambda sends through SES | The live Lambda role has an attached SES policy that is not represented in the tracked custom policy file. |
| Studio authorization | Verified Cognito ID token plus server-side email allowlist | Preserve the exact User Pool/client verification and approved account behavior. |
| Like authorization | Verified Cognito access token and server-derived subject | Preserve bearer-token validation and one-like-per-subject behavior. |
| Hosting | Git-connected Amplify app with frontend-only builds | Keep production protected until the Gen 2 branch passes all acceptance tests. |

## Readiness snapshot

### Ready

- Node.js `22.13.0` satisfies the Gen 2 Node 20+ requirement.
- TypeScript `5.6` satisfies the TypeScript 5+ requirement.
- `@aws-amplify/ui-react` is already on major version 6.
- The account is CDK-bootstrapped in `us-east-1`; `CDKToolkit` is
  `UPDATE_COMPLETE` at bootstrap version 30.
- REST API, Google auth, S3, Node.js Lambda, custom IAM, and Git hosting all
  have supported Gen 2 paths.

### Must be resolved before migration commands

1. Resolved: `aws-amplify` is 6.18.0.
2. Resolved: Gen 1 migration CLI 14.4.0 is verified.
3. Open: the only backend environment is production `main`; create and validate an
   isolated clone first.
4. Resolved: the Gen 1 root stack is `UPDATE_COMPLETE`.
5. Resolved: the deployment role has a single-resource
   `cognito-identity:ListTagsForResource` permission.
6. Resolved: the live Lambda package is reconciled through CloudFormation and
   `amplify status` reports no changes.
7. Open: the Lambda custom policy hardcodes the production S3 bucket and likes table.
   Those references must be replaced with isolated clone resources during the
   rehearsal.
8. Open: the live Lambda role has attached SES and invoke policies that are not fully
   represented in `custom-policies.json`; Gen 2 must define only the permissions
   actually required.
9. Open: the frontend imports generated `aws-exports.js` and also hardcodes API
   endpoints in Contact, Portfolio, and Studio. Gen 2 should consume
   `amplify_outputs.json` and resolve endpoints from one typed configuration
   module.

## Migration phases and approval gates

### Phase 0 - Protect and baseline

- Back up the S3 manifest and inventory all original object keys.
- Export the likes table and record its key schema and item count.
- Record Cognito app client callback/logout URLs and user count.
- Record REST routes, Lambda environment, role policies, and deployed code
  hash.
- Finish the P0 production acceptance checklist.

Gate: read-only inventory may proceed. Any backup creation or AWS mutation
requires explicit approval.

### Phase 1 - Repair Gen 1 deployability

- Grant the narrow missing Cognito Identity read permission to the deployment
  role.
- Reconcile the verified Lambda code into the tracked Gen 1 deployment.
- Upgrade and deploy once with Gen 1 CLI v14 so the root stack reaches
  `UPDATE_COMPLETE`.
- Re-run the full production smoke suite.

Gate: IAM changes and a live Gen 1 deployment require explicit approval.

### Phase 2 - Create an isolated Gen 1 clone

- Use an environment name of lowercase letters, at most 10 characters.
- Provision separate Cognito, S3, REST, Lambda, and test-like resources.
- Remove every hardcoded production ARN from clone policies.
- Use test email delivery or a safe recipient; do not send migration test
  messages to customers.
- Validate the clone before invoking the migration tool.

Gate: creating the clone incurs AWS resources and requires explicit approval.

### Phase 3 - Rehearse the migration

- Run `amplify gen2-migration assess` and save the report.
- Resolve every unsupported or manual item.
- Lock only the cloned Gen 1 environment.
- Generate Gen 2 TypeScript definitions on a dedicated migration branch.
- Convert the Lambda handlers from CommonJS to ESM.
- Recreate REST APIs, least-privilege IAM, auth callbacks, storage access, and
  frontend outputs.
- Deploy a Gen 2 sandbox/branch alongside the clone.

Gate: `assess` is read-only. Lock, generate, and cloud deployment require
separate review and explicit approval.

### Phase 4 - Validate Gen 2

Required acceptance tests:

- Google sign-in, sign-out, session refresh, and both approved Studio accounts.
- Public gallery loading and all original object references.
- Like count, like, unlike, cross-account increment, and expired mobile session.
- Studio upload, appearance, deactivate, reactivate, and permanent deletion
  using disposable test files only.
- Contact validation and safe SES delivery.
- Direct SPA routes, static asset types, responsive layout, and route scroll
  reset.
- IAM review showing no test role can write to production resources.

### Phase 5 - Production migration

- Repeat assessment against `main`.
- Disable Gen 1 backend automation and lock the Gen 1 stack.
- Generate/review the production Gen 2 code.
- Deploy parallel stateless Gen 2 resources.
- Test them against the migration plan before any stateful refactor.
- Refactor/import Cognito and S3 only after a reviewed CloudFormation plan.
- Publish a frontend using `amplify_outputs.json`.
- Keep the Gen 1 stateless backend available during the observation window.
- Decommission Gen 1 only after rollback is no longer needed.

Gate: each lock, deploy, refactor, cutover, and decommission action requires an
explicit approval and a recorded rollback point.

## Rollback principles

- Never delete or overwrite the production S3 bucket during rehearsal.
- Never point clone Studio delete operations at production.
- Do not refactor stateful resources until the parallel Gen 2 stateless stack
  passes acceptance.
- Keep the last known-good frontend artifact and Gen 1 API endpoints available
  through cutover.
- Treat CloudFormation stack refactor as the final high-risk step, not the
  starting point.

## Immediate next action

Phase 1 is complete. Prepare a concrete isolation map for the cloned Gen 1
environment, including a separate S3 bucket, likes table, Cognito resources,
REST APIs, Lambda policies, and safe SES behavior. Do not create the clone or
run `lock`, `generate`, or `refactor` without explicit approval.
