import { http } from './request'
import type { LoginParams, RegisterParams, LoginResponse, User } from '@/types'

/**
 * 用户登录
 */
export const login = (data: LoginParams) => {
  return http.post<LoginResponse>('/auth/login', data)
}

/**
 * 用户注册
 */
export const register = (data: RegisterParams) => {
  return http.post<LoginResponse>('/auth/register', data)
}

/**
 * 用户登出
 */
export const logout = () => {
  return http.post('/auth/logout')
}

/**
 * 获取当前用户信息
 */
export const getProfile = () => {
  return http.get<User>('/auth/profile')
}

/**
 * 更新用户信息
 */
export const updateProfile = (data: Partial<User>) => {
  return http.put<User>('/auth/profile', data)
}
