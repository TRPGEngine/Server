import ApolloClient, {
  ApolloQueryResult,
  OperationVariables,
} from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { createHttpLink } from 'apollo-link-http';
import gql from 'graphql-tag';

const cache = new InMemoryCache();

const client = new ApolloClient({
  link: createHttpLink({
    uri: '/core/graphql',
  }),
  cache,
});

/**
 * gql 查询
 * @param query gql查询语句
 * @param variables 查询变量
 */
const gqlQuery = <T = any, TVariables = OperationVariables>(
  query: string,
  variables?: TVariables
): Promise<ApolloQueryResult<T>> => {
  return client.query({
    query: gql(query),
    variables,
  });
};

export default gqlQuery;
