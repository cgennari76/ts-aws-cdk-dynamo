import { App, Stack, StackProps } from 'aws-cdk-lib';
import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import {NodejsFunction} from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import {
  CorsHttpMethod,
  HttpApi,
  HttpMethod,
} from '@aws-cdk/aws-apigatewayv2-alpha';
import {HttpLambdaIntegration} from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import * as path from 'path';


export class CdktwitterStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // HTTP API
    const httpApi = new HttpApi(this, 'http-api-example', {
      description: 'HTTP API example',
      corsPreflight: {
        allowHeaders: [
          'Content-Type',
          'X-Amz-Date',
          'Authorization',
          'X-Api-Key',
        ],
        allowMethods: [
          CorsHttpMethod.OPTIONS,
          CorsHttpMethod.GET,
          CorsHttpMethod.POST,
          CorsHttpMethod.PUT,
          CorsHttpMethod.PATCH,
          CorsHttpMethod.DELETE,
        ],
        allowCredentials: true,
        allowOrigins: ['http://localhost:3000'],
      },
    });

    console.log('url 👉', httpApi.url!);

    // DynamoDB table for tasks
    const table = new dynamodb.Table(this, 'Table', {
      partitionKey: {
        name: 'PK',
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });

    console.log('table name 👉', table.tableName);

    // Lambda functions for GET
    const getTasksLambda = new NodejsFunction(this, 'get-tasks', {
      handler: 'get',
      entry: __dirname + '/../lib/tasks.ts',
      environment: {
        TABLE_NAME: table.tableName,
      },
    });

    httpApi.addRoutes({
      path: '/tasks',
      methods: [ HttpMethod.GET ],
      integration: new HttpLambdaIntegration(
        'get-tasks-integration',
        getTasksLambda,
      ),
    });

    table.grantReadData(getTasksLambda);
    
    // Lambda functions for POST

    const createTaskLambda = new NodejsFunction(this, 'create-task', {
      handler: 'post',
      entry: __dirname + '/../lib/tasks.ts',
      environment: {
        TABLE_NAME: table.tableName,
      },
    });

    httpApi.addRoutes({
      path: '/tasks',
      methods: [ HttpMethod.POST ],
      integration: new HttpLambdaIntegration(
        'create-task-integration',
        createTaskLambda,
      ),
    });

    table.grantReadWriteData(createTaskLambda);

  }
}
