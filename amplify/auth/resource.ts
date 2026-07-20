import { defineAuth, secret } from '@aws-amplify/backend';
import { CfnResource } from 'aws-cdk-lib';
import type { Backend } from '../backend';

export const auth = defineAuth({
  loginWith: {
    email: {
      verificationEmailSubject: 'Sondra Tulala Photography Verification Code',
      verificationEmailBody: () => 'Your verification code is {####}',
    },
    externalProviders: {
      google: {
        clientId: secret('GOOGLE_CLIENT_ID'),
        clientSecret: secret('GOOGLE_CLIENT_SECRET'),
        scopes: ['openid', 'profile', 'email'],
        attributeMapping: {
          email: 'email',
        },
      },
      callbackUrls: [
        'http://localhost:3000/',
        'http://localhost:3001/',
        'http://localhost:5173/',
        'https://sondratulalaphotography.com/',
      ],
      logoutUrls: [
        'http://localhost:3000/',
        'http://localhost:3001/',
        'http://localhost:5173/',
        'https://sondratulalaphotography.com/',
      ],
    },
  },
  userAttributes: {
    email: {
      required: true,
      mutable: true,
    },
  },
  multifactor: {
    mode: 'OFF',
  },
});

export function applyEscapeHatches(backend: Backend) {
  const cfnUserPool = backend.auth.resources.cfnResources.cfnUserPool;
  cfnUserPool.usernameAttributes = ['email'];
  cfnUserPool.policies = {
    passwordPolicy: {
      minimumLength: 8,
      requireLowercase: false,
      requireNumbers: false,
      requireSymbols: false,
      requireUppercase: false,
      temporaryPasswordValidityDays: 7,
    },
  };
  const cfnUserPoolClient =
    backend.auth.resources.cfnResources.cfnUserPoolClient;
  cfnUserPoolClient.allowedOAuthFlows = ['code'];
  if (process.env.AWS_BRANCH) {
    for (const cfnResource of backend.auth.stack.node
      .findAll()
      .filter(
        (c) =>
          CfnResource.isCfnResource(c) &&
          [
            'AWS::Cognito::UserPool',
            'AWS::Cognito::IdentityPool',
            'AWS::Cognito::UserPoolClient',
            'AWS::Cognito::IdentityPoolRoleAttachment',
            'AWS::Cognito::UserPoolGroup',
          ].includes(c.cfnResourceType)
      )) {
      (cfnResource as CfnResource).addOverride('UpdateReplacePolicy', 'Retain');
      (cfnResource as CfnResource).addOverride('DeletionPolicy', 'Retain');
    }
  }
}
