import { http } from './request'
import type { 
  Category, 
  CategoryFormData,
  BatchDeleteCategoriesParams,
  BatchDeleteCategoriesResponse,
  BatchUpdateOrderParams,
  BatchUpdateOrderResponse,
  BatchMergeCategoriesParams,
  BatchMergeCategoriesResponse
} from '@/types'

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

/**
 * 批量删除分类
 */
export const batchDeleteCategories = (data: BatchDeleteCategoriesParams) => {
  return http.post<BatchDeleteCategoriesResponse>('/categories/batch-delete', data)
}

/**
 * 批量更新分类排序
 */
export const batchUpdateOrder = (data: BatchUpdateOrderParams) => {
  return http.post<BatchUpdateOrderResponse>('/categories/batch-update-order', data)
}

/**
 * 批量合并分类
 */
export const batchMergeCategories = (data: BatchMergeCategoriesParams) => {
  return http.post<BatchMergeCategoriesResponse>('/categories/batch-merge', data)
}
