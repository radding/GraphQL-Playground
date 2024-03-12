import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { buildSubgraphSchema } from '@apollo/subgraph';
import { graphql } from 'graphql';
import gql from "graphql-tag";



// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.
const typeDefs = gql`#graphql
  extend schema @link(url: "https://specs.apollo.dev/federation/v2.0", import: ["@key", "@shareable"])

  # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.

  # This "Book" type defines the queryable fields for every book in our data source.

type Details @key(fields: "id") {
  id: ID!
  apr: Float
}

type DerivedDetails @key(fields: "id") {
  id: ID!
  apr: Float
}


type Product @key(fields: "id"){
  id: ID! 
  name: String
}

type ProductOffer {
  id: ID!
  product: Product
  details: Details
  DerivedDetails: DerivedDetails
}

  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each. In this
  # case, the "books" query returns an array of zero or more Books (defined above).
  extend type Query {
    offers: [ProductOffer!]
  }
`;

const resolvers = {
  Query: {
    offers: () => [
      {
        id: "1-0",
        product: {
          id: "1",
          name: "something"
        },
        details: {
          id: "1-d",
          apr: .1,
        },
        derivedDetails: {
          id: "1-dd",
          apr: .2
        }
      },
      {
        id: "2-0",
        product: {
          id: "2",
          name: "something"
        },
        details: {
          id: "2-d",
          apr: .3,
        },
        derivedDetails: {
          id: "1-dd",
          apr: .4
        }
      },
  ],
  },
};
export const server = new ApolloServer({
  schema: buildSubgraphSchema({ typeDefs, resolvers }),
});

// Note the top level await!

