/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getData = /* GraphQL */ `
  query GetData($date: AWSDate!, $userid: ID!) {
    getData(date: $date, userid: $userid) {
      calories
      date
      distance
      stepCount
      userid
    }
  }
`;
export const getData2 = /* GraphQL */ `
  query GetData2($enddate: AWSDate, $startdate: AWSDate, $userid: ID!) {
    getData2(enddate: $enddate, startdate: $startdate, userid: $userid) {
      calories
      date
      distance
      stepCount
      userid
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
        userid
      }
      nextToken
    }
  }
`;
