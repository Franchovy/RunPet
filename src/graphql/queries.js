/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getUser = /* GraphQL */ `
  query GetUser($userid: String!) {
    getUser(userid: $userid) {
      userid
      date
      stepCount
      calories
      distance
    }
  }
`;
export const getData = /* GraphQL */ `
  query GetData($userid: String!, $date: AWSDate!) {
    getData(userid: $userid, date: $date) {
      userid
      date
      stepCount
      calories
      distance
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
        userid
        date
        stepCount
        calories
        distance
      }
      nextToken
    }
  }
`;
