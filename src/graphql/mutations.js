/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const addData = /* GraphQL */ `
  mutation AddData(
    $calories: Int
    $date: AWSDate
    $distance: Float
    $stepCount: Int
    $userid: ID!
  ) {
    addData(
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
export const createData = /* GraphQL */ `
  mutation CreateData($input: CreateDataInput!) {
    createData(input: $input) {
      calories
      date
      distance
      stepCount
      userid
    }
  }
`;
export const deleteData = /* GraphQL */ `
  mutation DeleteData($input: DeleteDataInput!) {
    deleteData(input: $input) {
      calories
      date
      distance
      stepCount
      userid
    }
  }
`;
export const updateData = /* GraphQL */ `
  mutation UpdateData($input: UpdateDataInput!) {
    updateData(input: $input) {
      calories
      date
      distance
      stepCount
      userid
    }
  }
`;
