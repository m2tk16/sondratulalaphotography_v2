import {
  RestApi,
  LambdaIntegration,
  Cors,
  ResponseType,
} from 'aws-cdk-lib/aws-apigateway';
import { Stack } from 'aws-cdk-lib';
import type { Backend } from '../../backend';

const branchName = process.env.AWS_BRANCH ?? 'sandbox';

export function defineApid5657c10Api(backend: Backend) {
  const stack = backend.createStack('rest-api-stack-apid5657c10');
  const apid5657c10Api = new RestApi(stack, 'RestApi', {
    restApiName: `apid5657c10-${branchName}`,
  });
  apid5657c10Api.addGatewayResponse('Default4XX', {
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
  apid5657c10Api.addGatewayResponse('Default5XX', {
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
  const photoslikes = apid5657c10Api.root
    .addResource('photos')
    .addResource('likes', {
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
  photoslikes.addMethod('ANY', sondratulalaphotogradcd4b5edIntegration);
  backend.addOutput({
    custom: {
      API: {
        apid5657c10: {
          endpoint: apid5657c10Api.url.slice(0, -1),
          region: Stack.of(apid5657c10Api).region,
          apiName: apid5657c10Api.restApiName,
        },
      },
    },
  });
}
