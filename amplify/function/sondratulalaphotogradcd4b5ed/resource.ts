import { defineFunction } from '@aws-amplify/backend';
import {
  AttributeType,
  BillingMode,
  Table,
} from 'aws-cdk-lib/aws-dynamodb';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Function as LambdaFunction } from 'aws-cdk-lib/aws-lambda';
import { ArnFormat, RemovalPolicy, Stack } from 'aws-cdk-lib';
import type { Backend } from '../../backend';

const branchName = process.env.AWS_BRANCH ?? 'sandbox';
const isProduction = branchName === 'production';

export const sondratulalaphotogradcd4b5ed = defineFunction({
  entry: './index.js',
  name: `sondratulalaphotogradcd4b5ed-${branchName}`,
  timeoutSeconds: 25,
  memoryMB: 512,
  environment: {
    CONTACT_DELIVERY_ENABLED: isProduction ? 'true' : 'false',
    ENV: `${branchName}`,
  },
  runtime: 20,
});

export function applyEscapeHatches(backend: Backend) {
  backend.sondratulalaphotogradcd4b5ed.resources.cfnResources.cfnFunction.functionName = `sondratulalaphotogradcd4b5ed-${branchName}`;
}

export function configureRuntimeResources(backend: Backend) {
  const lambda =
    backend.sondratulalaphotogradcd4b5ed.resources.lambda as LambdaFunction;
  const likesTable = new Table(
    backend.sondratulalaphotogradcd4b5ed.stack,
    'PhotoLikes',
    {
      tableName: `SondraTulalaPhotography-PhotoLikes-${branchName}`,
      partitionKey: {
        name: 'username',
        type: AttributeType.STRING,
      },
      sortKey: {
        name: 'photo',
        type: AttributeType.STRING,
      },
      billingMode: BillingMode.PAY_PER_REQUEST,
      deletionProtection: isProduction,
      pointInTimeRecovery: isProduction,
    }
  );

  if (isProduction) {
    likesTable.applyRemovalPolicy(RemovalPolicy.RETAIN);
    lambda.addToRolePolicy(
      new PolicyStatement({
        actions: ['ses:SendEmail'],
        resources: [
          Stack.of(lambda).formatArn({
            service: 'ses',
            resource: 'identity',
            resourceName: 'sondratulalaphotography.com',
            arnFormat: ArnFormat.SLASH_RESOURCE_NAME,
          }),
        ],
      })
    );
  }

  likesTable.grantReadWriteData(lambda);
  backend.storage.resources.bucket.grantReadWrite(lambda);

  lambda.addEnvironment('PHOTO_LIKES_TABLE', likesTable.tableName);
  lambda.addEnvironment(
    'PHOTO_BUCKET',
    backend.storage.resources.bucket.bucketName
  );
  lambda.addEnvironment(
    'USER_POOL_ID',
    backend.auth.resources.userPool.userPoolId
  );
  lambda.addEnvironment(
    'USER_POOL_CLIENT_ID',
    backend.auth.resources.userPoolClient.userPoolClientId
  );
  lambda.addEnvironment('REGION', Stack.of(lambda).region);
}
