import type { User } from './user'

/**
 * 登录请求参数
 */
export interface LoginParams {
  email: string
  password: string
}

/**
 * 注册请求参数
 */
export interface RegisterParams {
  username: string
  email: string
  password: string
}

/**
 * 登录响应数据
 */
export interface LoginResponse {
  token: string
  user: User
}

/**
 * 认证状态
 */
export interface AuthState {
  token: string | null
  user: User | null
  isLoggedIn: boolean
}
