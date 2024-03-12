// import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as appsync from 'aws-cdk-lib/aws-appsync';
import { type IFederatedSchema, FederatedSchema } from './FederatedSchema';

export { FederatedSchema };

export interface FederatedAppsyncProps extends Omit<appsync.GraphqlApiProps, "schema" | "definition"> {
  schema: IFederatedSchema;
}

/**
 * Implements an appsync API that satisfies Apollo's federation spec
 */
export class FederatedAppsync extends appsync.GraphqlApi {

  constructor(scope: Construct, id: string, props: FederatedAppsyncProps) {
    super(scope, id, {
      ...props,
      schema: undefined,
      definition: appsync.Definition.fromSchema(props.schema),
    });

    const entityDataSource = this.addNoneDataSource("_entity-federated-source");
    entityDataSource.createResolver("_entity-query-resolver", {
      typeName: "Query",
      fieldName: "_entities",
      code: appsync.Code.fromInline(`
      export function request(ctx) {
        return {
          payload: ctx.args,
        };
      }

      export function response(ctx) {
        return ctx.args.representations;
      }
      `),
      runtime: appsync.FunctionRuntime.JS_1_0_0,
    });
  }

}
