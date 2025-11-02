import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, LoginParams, RegisterParams } from '@/types'
import { authApi } from '@/api'
import { ElMessage } from 'element-plus'

export const useUserStore = defineStore('user', () => {
  // 状态
  const token = ref<string | null>(localStorage.getItem('token'))
  const user = ref<User | null>(null)

  // 计算属性
  const isLoggedIn = computed(() => !!token.value && !!user.value)
  const isAdmin = computed(() => user.value?.role === 'admin')

  // 初始化用户信息
  const initUser = () => {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      try {
        user.value = JSON.parse(savedUser)
      } catch (error) {
        console.error('解析用户信息失败:', error)
        localStorage.removeItem('user')
      }
    }
  }

  // 登录
  const login = async (params: LoginParams) => {
    try {
      const data = await authApi.login(params)
      token.value = data.token
      user.value = data.user

      // 保存到 localStorage
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))

      ElMessage.success('登录成功')
      return data
    } catch (error) {
      console.error('登录失败:', error)
      throw error
    }
  }

  // 注册
  const register = async (params: RegisterParams) => {
    try {
      const data = await authApi.register(params)
      token.value = data.token
      user.value = data.user

      // 保存到 localStorage
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))

      ElMessage.success('注册成功')
      return data
    } catch (error) {
      console.error('注册失败:', error)
      throw error
    }
  }

  // 登出
  const logout = async () => {
    try {
      await authApi.logout()
    } catch (error) {
      console.error('登出请求失败:', error)
    } finally {
      // 清除状态
      token.value = null
      user.value = null

      // 清除 localStorage
      localStorage.removeItem('token')
      localStorage.removeItem('user')

      ElMessage.success('已退出登录')
    }
  }

  // 获取用户信息
  const fetchProfile = async () => {
    try {
      const data = await authApi.getProfile()
      user.value = data
      localStorage.setItem('user', JSON.stringify(data))
      return data
    } catch (error) {
      console.error('获取用户信息失败:', error)
      // 如果获取失败，可能 token 已过期，清除登录状态
      logout()
      throw error
    }
  }

  // 更新用户信息
  const updateProfile = async (params: Partial<User>) => {
    try {
      const data = await authApi.updateProfile(params)
      user.value = data
      localStorage.setItem('user', JSON.stringify(data))
      ElMessage.success('更新成功')
      return data
    } catch (error) {
      console.error('更新用户信息失败:', error)
      throw error
    }
  }

  return {
    // 状态
    token,
    user,
    // 计算属性
    isLoggedIn,
    isAdmin,
    // 方法
    initUser,
    login,
    register,
    logout,
    fetchProfile,
    updateProfile,
  }
})
