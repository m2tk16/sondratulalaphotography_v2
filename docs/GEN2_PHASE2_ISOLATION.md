# Gen 2 Phase 2 Clone Isolation

Last updated: 2026-07-19

## Scope

Create a disposable Gen 1 environment named `gentest` and use it only to
rehearse the Gen 1-to-Gen 2 migration. Production `main` remains the source of
truth and is not a migration target during this phase.

AWS recommends rehearsing on a cloned environment first. The clone receives
new Amplify-managed resources, but imported resources and hardcoded identifiers
can still point at production, so every such reference must be replaced before
the clone is deployed.

## Isolation map

| Capability | Production `main` | Clone `gen2test` | Isolation rule |
| --- | --- | --- | --- |
| Root stack | `amplify-sondratulalaphotogra-main-496bb` | New Amplify environment stack | Never update or lock `main` during rehearsal. |
| Cognito | Existing User Pool and Identity Pool | New User Pool, clients, and Identity Pool | Do not import or copy users. Google OAuth testing waits until clone callback URLs are explicitly registered. |
| Storage | Existing portfolio S3 bucket with originals | New Amplify-managed S3 bucket | Start empty and use disposable test images only. No clone role may reference the production bucket ARN. |
| Likes | `SondraTulalaPhotography-PhotoLikes` | `SondraTulalaPhotography-PhotoLikes-gentest` | Create an empty, on-demand table in the clone function stack with the same `username`/`photo` key. The table is conditional and is never created for `main`; no production records are copied. |
| Lambda | Existing `-main` function | New `-gentest` function | Resolve User Pool, client, bucket, and likes table from clone-specific configuration. Remove production fallbacks from clone execution paths. |
| REST APIs | Existing public/admin and private-like APIs | New Amplify-generated APIs | Test only clone endpoints. Do not publish clone URLs in the production frontend. |
| Contact email | Live SES delivery | Delivery disabled | The clone returns a clearly identified suppressed-delivery response and never calls SES. |
| Hosting | Production Git-connected branch | None initially | Exercise the backend locally with clone-generated configuration; do not connect or deploy the rehearsal branch to production Hosting. |

## Required source changes before clone deployment

1. Make the function depend on the Amplify storage and auth outputs so its
   bucket, User Pool, and client values are environment-specific.
2. Derive the likes table name from the Amplify environment, retaining the
   current unsuffixed name only for `main`.
3. Scope Lambda IAM to that environment's storage bucket and likes table.
4. Suppress SES outside `main`; retain current production delivery unchanged.
5. Remove the hardcoded production API Gateway invoke permission. The REST API
   stacks already own invocation of their environment's Lambda.
6. Create an empty likes table only when the environment is not `main`.
7. Verify the effective clone CloudFormation resources cannot resolve to a
   production bucket, table, User Pool, client, or API identifier before
   deployment. The conditional template retains the production likes table
   name solely in the `main` branch of `Fn::If`; `gentest` resolves the isolated
   suffixed name.

The rehearsal auth input omits the legacy direct
`accounts.google.com` Identity Pool provider because Amplify CLI 14.4 generates
an invalid nested template for that field (it references an undeclared
`googleClientId` parameter). The application authenticates Google users through
the Cognito User Pool hosted UI, whose Google provider shape remains in the
clone. Its credential is intentionally invalid until it can be entered
securely, so Google sign-in is a known deferred clone test rather than an
accidental production dependency.

## Deployment sequence

1. Create and check out the local `gen2-rehearsal` Git branch.
2. Apply and test environment-aware function configuration.
3. Create the `gentest` Amplify environment without deploying backend
   categories.
4. Inspect `amplify status` and generated CloudFormation inputs for production
   references.
5. Deploy the cloned Gen 1 backend.
6. Verify clone IAM, endpoints, empty storage, Cognito separation, like
   behavior, Studio behavior with disposable files, and suppressed contact
   delivery.
7. Run only the read-only `amplify gen2-migration assess` command.

## Abort conditions

Stop before deployment if any clone template or role references:

- the production S3 bucket;
- the unsuffixed production likes table;
- the production User Pool or app clients;
- either production API ID; or
- an SES send permission or live recipient.

Do not run migration `lock`, `generate`, or `refactor` in Phase 2.
