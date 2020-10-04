/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateData = /* GraphQL */ `
  subscription OnCreateData(
    $calories: Int
    $date: AWSDate
    $distance: Float
    $stepCount: Int
    $userid: ID
  ) {
    onCreateData(
      calories: $calories
      date: $date
      distance: $distance
      stepCount: $stepCount
      userid: $userid
    ) {
      calories
      date
      distance
      stepCount
      userid
    }
  }
`;
export const onDeleteData = /* GraphQL */ `
  subscription OnDeleteData(
    $calories: Int
    $date: AWSDate
    $distance: Float
    $stepCount: Int
    $userid: ID
  ) {
    onDeleteData(
      calories: $calories
      date: $date
      distance: $distance
      stepCount: $stepCount
      userid: $userid
    ) {
      calories
      date
      distance
      stepCount
      userid
    }
  }
`;
export const onUpdateData = /* GraphQL */ `
  subscription OnUpdateData(
    $calories: Int
    $date: AWSDate
    $distance: Float
    $stepCount: Int
    $userid: ID
  ) {
    onUpdateData(
      calories: $calories
      date: $date
      distance: $distance
      stepCount: $stepCount
      userid: $userid
    ) {
      calories
      date
      distance
      stepCount
      userid
    }
  }
`;
