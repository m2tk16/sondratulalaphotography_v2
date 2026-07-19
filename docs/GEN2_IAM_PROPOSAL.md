# Gen 1 Deployment IAM Proposal

Status: applied and verified 2026-07-19
Date: 2026-07-19

## Problem

Amplify Hosting backend deployments use:

`arn:aws:iam::178450627339:role/amplifyconsole-backend-role`

Its AWS-managed `AdministratorAccess-Amplify` policy does not include
`cognito-identity:ListTagsForResource`. CloudFormation therefore cannot
complete the existing Cognito Identity Pool update, and the Gen 1 root stack
remains `UPDATE_ROLLBACK_COMPLETE`.

The role already has a narrowly scoped inline policy for the same action on
unrelated TalentPulse Identity Pools. Do not add a wildcard resource or modify
that unrelated policy.

## Proposed inline policy

Policy name:

`SondraTulalaCognitoIdentityTagRead`

Document:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ReadSondraTulalaIdentityPoolTags",
      "Effect": "Allow",
      "Action": "cognito-identity:ListTagsForResource",
      "Resource": "arn:aws:cognito-identity:us-east-1:178450627339:identitypool/us-east-1:5340cb1e-27f6-43aa-b966-44e7c93d9e78"
    }
  ]
}
```

## Validation plan

1. Applied only the proposed inline policy after explicit approval.
2. Confirmed it appears on `amplifyconsole-backend-role`.
3. Ran a reviewed Gen 1 CLI v14 deployment that reconciled the verified Lambda
   package and current tracked backend.
4. Confirmed the root stack ended in `UPDATE_COMPLETE`.
5. Confirmed Cognito callbacks, S3 manifest integrity, likes, Studio
   authorization,
   and contact behavior remain unchanged.
6. Confirmed the live Lambda code hash exactly matches the newly tracked build
   artifact:
   `HM9SlqGaPcwb2Ugy4n+82rwfIdylTj7JJWvRGN1+mz8=`.

## Rollback

If the deployment still fails, allow CloudFormation rollback to complete and
do not broaden IAM automatically. Inspect the exact denied action first.

After a successful migration to Gen 2 and Gen 1 decommissioning, remove this
inline policy if the role no longer needs it.
