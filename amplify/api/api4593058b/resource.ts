import {
  RestApi,
  LambdaIntegration,
  Cors,
  ResponseType,
} from 'aws-cdk-lib/aws-apigateway';
import { Stack } from 'aws-cdk-lib';
import type { Backend } from '../../backend';

const branchName = process.env.AWS_BRANCH ?? 'sandbox';

export function defineApi4593058bApi(backend: Backend) {
  const stack = backend.createStack('rest-api-stack-api4593058b');
  const api4593058bApi = new RestApi(stack, 'RestApi', {
    restApiName: `api4593058b-${branchName}`,
  });
  api4593058bApi.addGatewayResponse('Default4XX', {
    type: ResponseType.DEFAULT_4XX,
    responseHeaders: {
      'Access-Control-Allow-Origin': "'*'",
      'Access-Control-Allow-Headers':
        "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
      'Access-Control-Allow-Methods':
        "'DELETE,GET,HEAD,OPTIONS,PATCH,POST,PUT'",
      'Access-Control-Expose-Headers': "'Date,X-Amzn-ErrorType'",
    },
  });
  api4593058bApi.addGatewayResponse('Default5XX', {
    type: ResponseType.DEFAULT_5XX,
    responseHeaders: {
      'Access-Control-Allow-Origin': "'*'",
      'Access-Control-Allow-Headers':
        "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
      'Access-Control-Allow-Methods':
        "'DELETE,GET,HEAD,OPTIONS,PATCH,POST,PUT'",
      'Access-Control-Expose-Headers': "'Date,X-Amzn-ErrorType'",
    },
  });
  const sondratulalaphotogradcd4b5edIntegration = new LambdaIntegration(
    backend.sondratulalaphotogradcd4b5ed.resources.lambda
  );
  const contactsendemail = api4593058bApi.root
    .addResource('contact')
    .addResource('send-email', {
      defaultCorsPreflightOptions: {
        allowOrigins: Cors.ALL_ORIGINS,
        allowMethods: Cors.ALL_METHODS,
        allowHeaders: [
          'Content-Type',
          'X-Amz-Date',
          'Authorization',
          'X-Api-Key',
          'X-Amz-Security-Token',
          'X-Amz-User-Agent',
        ],
        statusCode: 200,
      },
  });
  contactsendemail.addMethod('ANY', sondratulalaphotogradcd4b5edIntegration);
  const photoslikescount = api4593058bApi.root
    .addResource('photos')
    .addResource('likes')
    .addResource('count', {
      defaultCorsPreflightOptions: {
        allowOrigins: Cors.ALL_ORIGINS,
        allowMethods: Cors.ALL_METHODS,
        allowHeaders: [
          'Content-Type',
          'X-Amz-Date',
          'Authorization',
          'X-Api-Key',
          'X-Amz-Security-Token',
          'X-Amz-User-Agent',
        ],
        statusCode: 200,
      },
  });
  photoslikescount.addMethod('ANY', sondratulalaphotogradcd4b5edIntegration);
  const admin = api4593058bApi.root.addResource('admin');
  const adminuploadurl = admin
    .addResource('upload-url', {
      defaultCorsPreflightOptions: {
        allowOrigins: Cors.ALL_ORIGINS,
        allowMethods: Cors.ALL_METHODS,
        allowHeaders: [
          'Content-Type',
          'X-Amz-Date',
          'Authorization',
          'X-Api-Key',
          'X-Amz-Security-Token',
          'X-Amz-User-Agent',
        ],
        statusCode: 200,
      },
  });
  adminuploadurl.addMethod('ANY', sondratulalaphotogradcd4b5edIntegration);
  const adminmanifest = admin
    .addResource('manifest', {
      defaultCorsPreflightOptions: {
        allowOrigins: Cors.ALL_ORIGINS,
        allowMethods: Cors.ALL_METHODS,
        allowHeaders: [
          'Content-Type',
          'X-Amz-Date',
          'Authorization',
          'X-Api-Key',
          'X-Amz-Security-Token',
          'X-Amz-User-Agent',
        ],
        statusCode: 200,
      },
  });
  adminmanifest.addMethod('ANY', sondratulalaphotogradcd4b5edIntegration);
  const adminphoto = admin
    .addResource('photo', {
      defaultCorsPreflightOptions: {
        allowOrigins: Cors.ALL_ORIGINS,
        allowMethods: Cors.ALL_METHODS,
        allowHeaders: [
          'Content-Type',
          'X-Amz-Date',
          'Authorization',
          'X-Api-Key',
          'X-Amz-Security-Token',
          'X-Amz-User-Agent',
        ],
        statusCode: 200,
      },
  });
  adminphoto.addMethod('ANY', sondratulalaphotogradcd4b5edIntegration);
  backend.addOutput({
    custom: {
      API: {
        api4593058b: {
          endpoint: api4593058bApi.url.slice(0, -1),
          region: Stack.of(api4593058bApi).region,
          apiName: api4593058bApi.restApiName,
        },
      },
    },
  });
}
