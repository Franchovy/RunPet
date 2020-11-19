/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateData = /* GraphQL */ `
  subscription OnCreateData(
    $calories: Int
    $date: AWSDate
    $distance: Float
    $stepCount: Int
    $ID: ID
  ) {
    onCreateData(
      calories: $calories
      date: $date
      distance: $distance
      stepCount: $stepCount
      ID: $ID
    ) {
      calories
      date
      distance
      stepCount
      ID
    }
  }
`;
export const onUpdateData = /* GraphQL */ `
  subscription OnUpdateData(
    $calories: Int
    $date: AWSDate
    $distance: Float
    $stepCount: Int
    $ID: ID
  ) {
    onUpdateData(
      calories: $calories
      date: $date
      distance: $distance
      stepCount: $stepCount
      ID: $ID
    ) {
      calories
      date
      distance
      stepCount
      ID
    }
  }
`;
export const onDeleteData = /* GraphQL */ `
  subscription OnDeleteData(
    $calories: Int
    $date: AWSDate
    $distance: Float
    $stepCount: Int
    $ID: ID
  ) {
    onDeleteData(
      calories: $calories
      date: $date
      distance: $distance
      stepCount: $stepCount
      ID: $ID
    ) {
      calories
      date
      distance
      stepCount
      ID
    }
  }
`;
export const onCreateUser = /* GraphQL */ `
  subscription OnCreateUser($ID: ID, $email: AWSEmail, $username: String) {
    onCreateUser(ID: $ID, email: $email, username: $username) {
      ID
      email
      username
    }
  }
`;
export const onUpdateUser = /* GraphQL */ `
  subscription OnUpdateUser($ID: ID, $email: AWSEmail, $username: String) {
    onUpdateUser(ID: $ID, email: $email, username: $username) {
      ID
      email
      username
    }
  }
`;
export const onDeleteUser = /* GraphQL */ `
  subscription OnDeleteUser($ID: ID, $email: AWSEmail, $username: String) {
    onDeleteUser(ID: $ID, email: $email, username: $username) {
      ID
      email
      username
    }
  }
`;
