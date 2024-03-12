"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const gateway_1 = require("@apollo/gateway");
const signature_v4_1 = require("@aws-sdk/signature-v4");
const sha256_js_1 = require("@aws-crypto/sha256-js");
const apollo_server_1 = require("apollo-server");
const credential_providers_1 = require("@aws-sdk/credential-providers"); // ES6 import
const awsSigV4Fetch = (url, init) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const sigv4 = new signature_v4_1.SignatureV4({
        service: 'lambda',
        region: 'us-east-2',
        credentials: (0, credential_providers_1.fromNodeProviderChain)(),
        sha256: sha256_js_1.Sha256,
    });
    const apiUrl = new URL(url);
    const signed = yield sigv4.presign({
        method: (init === null || init === void 0 ? void 0 : init.method) || "GET",
        hostname: apiUrl.host,
        path: apiUrl.pathname,
        protocol: apiUrl.protocol,
        body: init === null || init === void 0 ? void 0 : init.body,
        headers: Object.assign({ 'Content-Type': 'application/json', Host: apiUrl.hostname }, ((_a = init === null || init === void 0 ? void 0 : init.headers) !== null && _a !== void 0 ? _a : {})),
    });
    Object.entries(signed.query).map(([key, value]) => {
        apiUrl.searchParams.set(key, value.toString());
    });
    console.log(`${apiUrl.toString()}: ${JSON.stringify(init)}`);
    return fetch(apiUrl, init);
});
class AWSSigV4DataSource extends gateway_1.RemoteGraphQLDataSource {
    constructor(options) {
        super(options);
        this.fetcher = awsSigV4Fetch;
    }
}
const gateway = new gateway_1.ApolloGateway({
    // fetcher: awsSigV4Fetch,
    supergraphSdl: new gateway_1.IntrospectAndCompose({
        subgraphs: [
            { name: 'marketplace', url: 'https://fzsf7wnsjrz3afiggtmuzvyhuu0ahmvp.lambda-url.us-east-2.on.aws/' },
        ],
    }),
    buildService: (def) => {
        return new AWSSigV4DataSource({ url: def.url });
    }
});
const server = new apollo_server_1.ApolloServer({
    gateway,
});
server.listen({ port: 4001 }).then(({ url }) => {
    console.log(`🚀 Server ready at ${url}`);
});
