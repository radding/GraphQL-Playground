import { ApolloGateway, GraphQLDataSourceProcessOptions, IntrospectAndCompose, RemoteGraphQLDataSource } from '@apollo/gateway';
import { Fetcher, FetcherRequestInit, FetcherResponse } from '@apollo/utils.fetcher';

import { SignatureV4 } from '@aws-sdk/signature-v4';
import { Sha256 } from '@aws-crypto/sha256-js';
import { ApolloServer } from 'apollo-server';
import { fromNodeProviderChain } from "@aws-sdk/credential-providers"; // ES6 import

const awsSigV4Fetch = async (url: string, init?: FetcherRequestInit): Promise<FetcherResponse> => {
    const sigv4 = new SignatureV4({
  service: 'lambda',
  region: 'us-east-2',
  credentials: fromNodeProviderChain(),
  sha256: Sha256,
});
const apiUrl = new URL(url);
  const signed = await sigv4.presign({
    method: init?.method || "GET",
    hostname: apiUrl.host,
    path: apiUrl.pathname,
    protocol: apiUrl.protocol,
    body: init?.body,
    headers: {
      'Content-Type': 'application/json',
      Host: apiUrl.hostname, // compulsory,
      ...(init?.headers ?? {}),
    },
  });

    Object.entries(signed.query!).map(([key, value]) => {
        apiUrl.searchParams.set(key, value!.toString())
    });
    console.log(`${apiUrl.toString()}: ${JSON.stringify(init)}`);
    return fetch(apiUrl, init);
}

class AWSSigV4DataSource extends RemoteGraphQLDataSource {
    constructor(options?: any) {
        super(options);
        this.fetcher = awsSigV4Fetch;
    }

    
}

const gateway = new ApolloGateway({
    // fetcher: awsSigV4Fetch,
  supergraphSdl: new IntrospectAndCompose({
    subgraphs: [
      { name: 'marketplace', url: 'https://fzsf7wnsjrz3afiggtmuzvyhuu0ahmvp.lambda-url.us-east-2.on.aws/' },
    ],
  }),
  buildService: (def) => {
    return new AWSSigV4DataSource({url: def.url!});
  }
});

const server = new ApolloServer({
  gateway,
});

server.listen({port: 4001}).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});