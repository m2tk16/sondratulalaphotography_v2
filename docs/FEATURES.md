# Feature Ideas

This is a product backlog, not an implementation commitment. Reorder it as
Sondra's priorities become clearer.

## P0 completion

- [x] Desktop and mobile visual QA.
- [x] Live Google login and logout verification.
- [x] Admin upload, deactivate, reactivate, and delete smoke tests.
- [x] Public like-count and authenticated like-toggle smoke tests.
- [x] Contact form production smoke test.

## Near term

- [ ] Move photograph metadata and likes to AppSync/GraphQL.
- [x] Lazy-load portfolio images at the browser level as they approach the
  viewport.
- [ ] Add thumbnail and responsive-image generation after upload.
- [ ] Let Sondra edit all existing photograph metadata (title, category,
  location, capture date, description, featured status, alt text) and reorder
  photographs after upload.
- [ ] Add dedicated collection pages and shareable photograph detail routes.
- [ ] Add accessible full-screen lightbox browsing.
- [ ] Add image alt text as a required admin field.
- [ ] Add basic analytics that respects visitor privacy.
- [ ] Add rate limiting and operational monitoring for public endpoints.

## Community

- [ ] Comments on individual photographs.
- [ ] Comment moderation, reporting, spam prevention, and notification controls.
- [ ] Optional saved favorites for signed-in visitors.
- [ ] Share links with rich social previews.

Comments should not ship without moderation and abuse controls.

## Commerce

- [ ] Print sizes and crop previews.
- [ ] Paper, canvas, metal, and frame options.
- [ ] Pricing and inventory rules.
- [ ] Shopping cart and checkout.
- [ ] Payment-provider integration.
- [ ] Order history and fulfillment status.
- [ ] Download or delivery workflow for purchased digital images.
- [ ] Tax, shipping, refund, privacy, and terms policies.

Commerce is a trigger to reconsider adding a non-production environment because
errors could charge customers or create incorrect orders.

## Platform and operations

- [x] Plan Amplify Gen 1 to Gen 2 migration.
- [ ] Repair Gen 1 deployment permissions and reconcile the tracked Lambda
  artifact before migration.
- [ ] Rehearse Amplify Gen 2 migration in an isolated non-production
  environment.
- [ ] Migrate Lambda handlers from AWS SDK for JavaScript v2 to modular v3
  clients.
- [ ] Add automated unit and component testing with Vitest and React Testing
  Library when the next behavioral change requires it.
- [ ] Add end-to-end coverage for login, likes, admin uploads, and deletion.
- [ ] Add image backup and recovery procedures.
- [ ] Add structured logs, alarms, and a lightweight operational runbook.
- [ ] Consider staging when the risk thresholds in `AGENTS.md` are met.
