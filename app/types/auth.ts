export interface SSOUser {
  id: string
  email: string
  name: string
  role: UserRole
  avatar?: string
}

export type UserRole = 'admin' | 'manager' | 'operator'

export interface AuthSession {
  user: SSOUser
  accessToken: string
  refreshToken?: string
  expiresAt: number
}
