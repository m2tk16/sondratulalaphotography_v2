# Sondra Tulala Photography

An AWS Amplify, React, and TypeScript photography portfolio for Sondra Tulala.
The site provides a public gallery, Google authentication, authenticated likes,
and a private portfolio-management studio.

## Local development

```text
npm install
npm run dev
```

## Verification

```text
npm run lint
npm test
npm run build
```

The current automated tests cover authenticated likes, Studio authorization,
manifest validation, contact delivery, and deterministic photograph-metadata
editing and ordering. Browser component tests are not configured yet.

## Project documentation

- [Project steering](AGENTS.md)
- [Current work and resume point](docs/CURRENT_WORK.md)
- [Release and learning log](docs/RELEASES.md)
- [Feature ideas](docs/FEATURES.md)

## Architecture direction

- S3 stores original photographs and generated image files.
- Lambda handles event-driven workflows such as email, signed uploads, image
  processing, and future payment webhooks.
- AppSync/GraphQL is the preferred direction for structured photograph
  metadata, likes, comments, users, and future commerce records.

The project currently has one Amplify environment. A separate environment
should be introduced when the risk signals documented in `AGENTS.md` appear.

## Deployment safety

This project uses live AWS resources. Review the Amplify backend diff and get
explicit approval before running `amplify push` or publishing.
