import * as cdk from 'aws-cdk-lib';
import { Definition, GraphqlApi, Code, MappingTemplate, FunctionRuntime } from 'aws-cdk-lib/aws-appsync';
import { Function, Code as LambdaCode, Runtime } from 'aws-cdk-lib/aws-lambda';

import { Construct } from 'constructs';
import path = require('path');
import { FederatedAppsync, FederatedSchema } from 'federated-appsync-cdk';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class TestAppsyncStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const func = new NodejsFunction(this, "TestFunctions", {
      entry: "/Users/raddi/code/rnmicro/packages/example-federated-server/src/lambda.ts",
      handler: "handler",
    })
    func.addFunctionUrl();
  }
}
