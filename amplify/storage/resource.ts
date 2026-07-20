import { defineStorage } from '@aws-amplify/backend';
import { CfnResource } from 'aws-cdk-lib';
import type { Backend } from '../backend';

const branchName = process.env.AWS_BRANCH ?? 'sandbox';
const isProduction = branchName === 'production';

export const storage = defineStorage({
  name: `sondratulalaphotogra25f72088efde4213955fdfd598b9bd46-${branchName}`,
  access: (allow) => ({
    'public/*': [allow.guest.to(['read']), allow.authenticated.to(['read'])],
    'protected/{entity_id}/*': [allow.authenticated.to(['read'])],
    'private/{entity_id}/*': [allow.authenticated.to(['read'])],
  }),
});

export function postRefactor(backend: Backend) {
  const s3Bucket = backend.storage.resources.cfnResources.cfnBucket;
  s3Bucket.bucketName =
    'sondratulalaphotogra25f72088efde4213955fdfd598b9bd46-gentest';
}

export function applyEscapeHatches(backend: Backend) {
  const s3Bucket = backend.storage.resources.cfnResources.cfnBucket;
  s3Bucket.bucketEncryption = {
    serverSideEncryptionConfiguration: [
      {
        serverSideEncryptionByDefault: {
          sseAlgorithm: 'AES256',
        },
        bucketKeyEnabled: false,
      },
    ],
  };
  s3Bucket.versioningConfiguration = isProduction
    ? { status: 'Enabled' }
    : undefined;
  if (isProduction) {
    for (const cfnResource of backend.storage.stack.node
      .findAll()
      .filter(
        (c) =>
          CfnResource.isCfnResource(c) &&
          ['AWS::S3::Bucket', 'Custom::S3AutoDeleteObjects'].includes(
            c.cfnResourceType
          )
      )) {
      (cfnResource as CfnResource).addOverride('UpdateReplacePolicy', 'Retain');
      (cfnResource as CfnResource).addOverride('DeletionPolicy', 'Retain');
    }
  }
}
