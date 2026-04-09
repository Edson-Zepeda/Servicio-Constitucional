import { SEED_USERS } from './seedData'

export const DEMO_ACCOUNTS = SEED_USERS.map((user) => ({
  accountNumber: user.accountNumber,
  password: user.password,
  name: user.name,
  role: user.role,
  email: user.email,
  status: user.status,
}))

export const getDemoAccountForDisplay = () => {
  return DEMO_ACCOUNTS.filter((account) => account.status === 'active').map((account) => ({
    accountNumber: account.accountNumber,
    password: account.password,
    role: account.role,
  }))
}

export const validateCredentials = (
  accountNumber: string,
  password: string
): boolean => {
  return DEMO_ACCOUNTS.some(
    (account) =>
      account.accountNumber === accountNumber &&
      account.password === password &&
      account.status === 'active'
  )
}

export const getUserInfo = (accountNumber: string) => {
  return DEMO_ACCOUNTS.find((account) => account.accountNumber === accountNumber)
}
