# Project Steering

These instructions apply to the entire `sondra-tulala-photography-v2` project.

## Start and finish every work session

1. Read `docs/CURRENT_WORK.md` before making changes.
2. Preserve unrelated and uncommitted work.
3. Keep `docs/CURRENT_WORK.md` current while work is in progress, including the
   exact next step and any blocker that would matter after an interruption.
4. When a coherent change is complete, add a dated entry with a stable release
   ID to `docs/RELEASES.md`.
5. Record new product ideas in `docs/FEATURES.md`; do not implement them merely
   because they were recorded.

## Engineering standards

- Prefer clear, maintainable code over clever abstractions.
- Keep authentication and authorization separate. Client-side route checks are
  for usability only; AWS must enforce every privileged operation.
- Never trust a user ID, email, role, price, file path, or ownership claim sent
  by the browser. Derive or verify it server-side.
- Validate inputs at system boundaries and return safe, useful errors.
- Follow least-privilege IAM and avoid secrets or credentials in source code.
- Keep accessibility, responsive behavior, loading states, empty states, and
  failure states part of the definition of done.
- Avoid adding dependencies when platform or existing project capabilities are
  sufficient.
- Do not edit generated Amplify outputs by hand unless the workflow explicitly
  requires it and the reason is documented.
- Run `npm run lint` and `npm run build` for production-facing changes.

## Testing

Use tests in proportion to behavior and risk.

- Add unit tests for parsing, normalization, authorization decisions, metadata
  transformations, and other deterministic business rules.
- Add component tests for forms, stateful controls, route guards, and important
  accessibility behavior.
- Add integration tests for API contracts, authentication boundaries, likes,
  uploads, deletion, and persistence when those flows are changed.
- A regression fix should include a test that fails without the fix whenever
  practical.
- Pure documentation or cosmetic copy changes do not require automated tests.
- Do not rely on a successful build as the only verification for behavior that
  can lose data, leak access, charge money, or change ownership.

Vitest with React Testing Library is configured for stateful frontend behavior.
Name those files `*.component.test.tsx` and run them with
`npm run test:components`; `npm test` runs both the Node and component suites.

## Environments and release safety

The project currently uses one Amplify environment. Keep that model while
changes remain low-risk and independently recoverable.

Before implementing a change, recommend adding a non-production environment if
any of these become true:

- a database migration can lose or incompatibly transform production data;
- authentication, authorization, payments, or purchasing receive a broad
  redesign;
- a backend replacement requires old and new clients to coexist;
- rollback cannot be completed quickly and safely;
- several dependent infrastructure changes must deploy in a precise order;
- realistic testing would modify customer data, purchases, or irreplaceable
  originals.

Never run `amplify push`, publish, or otherwise mutate the live AWS environment
without explicit user approval for that deployment.

## Backend selection: GraphQL, Lambda, and S3

Choose the smallest backend surface that naturally owns the behavior.

Use GraphQL/AppSync for structured, queryable application data:

- photograph metadata, categories, visibility, ordering, and featured status;
- likes, comments, users, purchase records, and relationships between them;
- paginated/filterable queries;
- authorization expressed as owner, signed-in user, or Cognito group rules;
- real-time subscriptions where the product genuinely needs them.

Use Lambda for event-driven or custom workflows:

- contact email delivery;
- image processing, thumbnails, watermarking, and moderation;
- secure upload coordination or signed URLs;
- payment-provider webhooks and fulfillment;
- operations that orchestrate multiple AWS or third-party services.

Use S3 for original images and generated image assets, not as the primary
database for relational metadata.

Do not put routine CRUD behind bespoke Lambda handlers when AppSync models and
authorization rules express it more safely and simply. Do not force file bytes,
email delivery, webhooks, or image processing through GraphQL.

Current direction: the contact and secure-upload workflows remain good Lambda
fits. Photograph metadata and likes are candidates for a focused AppSync
refactor before comments or purchasing are added. Avoid maintaining two sources
of truth during that migration.
