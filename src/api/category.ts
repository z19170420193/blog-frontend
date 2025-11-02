import { http } from './request'
import type { Category, CategoryFormData } from '@/types'

/**
 * 获取分类列表
 */
export const getCategories = () => {
  return http.get<Category[]>('/categories')
}

/**
 * 获取分类详情
 */
export const getCategoryById = (id: number) => {
  return http.get<Category>(`/categories/${id}`)
}

/**
 * 创建分类
 */
export const createCategory = (data: CategoryFormData) => {
  return http.post<Category>('/categories', data)
}

/**
 * 更新分类
 */
export const updateCategory = (id: number, data: CategoryFormData) => {
  return http.put<Category>(`/categories/${id}`, data)
}

/**
 * 删除分类
 */
export const deleteCategory = (id: number) => {
  return http.delete(`/categories/${id}`)
}
