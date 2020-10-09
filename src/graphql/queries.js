/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getData = /* GraphQL */ `
  query GetData($ID: ID!, $date: AWSDate!) {
    getData(ID: $ID, date: $date) {
      calories
      date
      distance
      stepCount
      ID
    }
  }
`;
export const listData = /* GraphQL */ `
  query ListData(
    $filter: TableDataFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listData(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        calories
        date
        distance
        stepCount
        ID
      }
      nextToken
    }
  }
`;
export const getUser = /* GraphQL */ `
  query GetUser($ID: ID!) {
    getUser(ID: $ID) {
      ID
      email
      username
    }
  }
`;
export const listUsers = /* GraphQL */ `
  query ListUsers(
    $filter: TableUserFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listUsers(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        ID
        email
        username
      }
      nextToken
    }
  }
`;
