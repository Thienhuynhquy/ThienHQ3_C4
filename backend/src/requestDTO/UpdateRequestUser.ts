/**
 * Fields in a request to update a single TODO item.
 */
export interface UpdateRequestUser {
  name: string
  timedate: string
  done: boolean
}