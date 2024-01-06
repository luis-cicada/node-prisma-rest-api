export interface ICreateUserParams {
  first_name: string
  middle_name?: string
  last_name: string
  email: string
  phone_number: string
}

export interface Users {
  key: string
  first_name: string
  middle_name?: string
  last_name: string
  email: string
  phone_number: string
}
