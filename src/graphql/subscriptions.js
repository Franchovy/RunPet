/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateData = /* GraphQL */ `
  subscription OnCreateData(
    $userid: String
    $date: AWSDate
    $stepCount: Int
    $calories: Int
    $distance: Float
  ) {
    onCreateData(
      userid: $userid
      date: $date
      stepCount: $stepCount
      calories: $calories
      distance: $distance
    ) {
      userid
      date
      stepCount
      calories
      distance
    }
  }
`;
export const onUpdateData = /* GraphQL */ `
  subscription OnUpdateData(
    $userid: String
    $date: AWSDate
    $stepCount: Int
    $calories: Int
    $distance: Float
  ) {
    onUpdateData(
      userid: $userid
      date: $date
      stepCount: $stepCount
      calories: $calories
      distance: $distance
    ) {
      userid
      date
      stepCount
      calories
      distance
    }
  }
`;
export const onDeleteData = /* GraphQL */ `
  subscription OnDeleteData(
    $userid: String
    $date: AWSDate
    $stepCount: Int
    $calories: Int
    $distance: Float
  ) {
    onDeleteData(
      userid: $userid
      date: $date
      stepCount: $stepCount
      calories: $calories
      distance: $distance
    ) {
      userid
      date
      stepCount
      calories
      distance
    }
  }
`;
