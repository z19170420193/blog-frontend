/**
 * 用户类型定义
 */
export interface User {
  id: number
  username: string
  email: string
  avatar: string | null
  role: 'admin' | 'user'
  created_at: string
  updated_at: string
}

/**
 * 更新用户信息参数
 */
export interface UpdateProfileParams {
  username?: string
  email?: string
  avatar?: string
  password?: string
}
