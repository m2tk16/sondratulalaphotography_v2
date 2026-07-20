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
- [x] Let Sondra edit all existing photograph metadata (title, category,
  location, capture date, description, homepage-photo status, alt text) and
  reorder photographs after upload.
- [x] Let Sondra select one active portfolio photograph as the homepage hero,
  with a safe default image when no photograph is selected.
- [ ] Remove all related like records when a photograph is permanently deleted.
- [ ] Add dedicated collection pages and shareable photograph detail routes.
- [ ] Add accessible full-screen lightbox browsing.
- [ ] Add per-photograph social preview metadata, image sitemaps, creator and
  copyright metadata, and an optional licensing/contact link.
- [x] Add image alt text as a required admin field.
- [x] Add a light/dark appearance control that defaults to light and remembers
  each visitor's preference.
- [ ] Add basic analytics that respects visitor privacy.
- [ ] Add rate limiting and operational monitoring for public endpoints.

## Community

- [ ] Comments on individual photographs.
- [ ] Threaded replies so signed-in visitors can respond to a specific comment.
- [ ] Studio moderation queue with hide, restore, and permanent-delete tools.
- [ ] Comment reporting, spam prevention, rate limiting, block controls, and
  notification preferences.
- [ ] Optional saved favorites for signed-in visitors.
- [ ] Share links with rich social previews.

Comments should not ship without moderation and abuse controls. Start with one
or two reply levels rather than unlimited Reddit-style nesting so conversations
remain readable on mobile and the first moderation model stays manageable.

## Commerce

- [ ] Decide between a managed photography storefront/print lab and a custom
  checkout before building commerce.
- [ ] Let Studio mark photographs available for purchase and manage products.
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

## Recommended sequence after launch

1. Shareable photograph pages, lightbox browsing, responsive image variants,
   privacy-respecting analytics, and image search/copyright metadata.
2. Validate print demand with a managed storefront or a small manual-fulfillment
   pilot before committing to custom tax, shipping, and fulfillment systems.
3. Build custom commerce only if the managed option cannot support Sondra's
   products, presentation, pricing, or customer experience.
4. Add comments and threaded replies only when Sondra wants to actively
   moderate a community, not simply as a portfolio convention.

## Platform and operations

- [x] Plan Amplify Gen 1 to Gen 2 migration.
- [ ] Repair Gen 1 deployment permissions and reconcile the tracked Lambda
  artifact before migration.
- [x] Rehearse Amplify Gen 2 migration in an isolated non-production
  environment.
- [ ] Migrate Lambda handlers from AWS SDK for JavaScript v2 to modular v3
  clients.
- [ ] Add automated unit and component testing with Vitest and React Testing
  Library when the next behavioral change requires it.
- [ ] Add end-to-end coverage for login, likes, admin uploads, and deletion.
- [ ] Add image backup and recovery procedures.
- [ ] Add structured logs, alarms, and a lightweight operational runbook.
- [ ] Consider staging when the risk thresholds in `AGENTS.md` are met.
