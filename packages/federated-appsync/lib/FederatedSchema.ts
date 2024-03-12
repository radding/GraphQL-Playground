import * as appsync from 'aws-cdk-lib/aws-appsync';
import * as fs from "fs";
import gql from "graphql-tag";
import { printSchema } from "graphql";
import { buildSubgraphSchema } from '@apollo/subgraph';


export interface IFederatedSchema extends appsync.ISchema {
  _federation(): appsync.ISchema;
  bind(api: appsync.IGraphqlApi, options?: appsync.SchemaBindOptions): appsync.ISchemaConfig;
}

class InlineFederatedSchema implements IFederatedSchema {
    protected definition: string;

    constructor(code: string) {
        const federatedGraphql = buildSubgraphSchema(gql(code));
        this.definition = printSchema(federatedGraphql);
        console.log("Schema:", this.definition);
    }

    bind(api: appsync.IGraphqlApi, options?: appsync.SchemaBindOptions | undefined): appsync.ISchemaConfig {
        return {
            apiId: api.apiId,
            definition: this.definition,
        }
    }

    _federation(): appsync.ISchema {
        return this;
    }
}

class FileFederatedSchema extends InlineFederatedSchema {
    constructor(filePath: string) {
        const file = fs.readFileSync(filePath);
        super(file.toString());
    }
}

export abstract class FederatedSchema {
    static fromFile(filePath: string): FileFederatedSchema {
        return new FileFederatedSchema(filePath);
    }
    
    static fromInlineSchema(schema: string): InlineFederatedSchema {
        return new InlineFederatedSchema(schema);
    }
}
