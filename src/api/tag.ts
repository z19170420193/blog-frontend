import { http } from './request'
import type { Tag, TagFormData } from '@/types'

/**
 * 获取标签列表
 */
export const getTags = () => {
  return http.get<Tag[]>('/tags')
}

/**
 * 获取标签详情
 */
export const getTagById = (id: number) => {
  return http.get<Tag>(`/tags/${id}`)
}

/**
 * 创建标签
 */
export const createTag = (data: TagFormData) => {
  return http.post<Tag>('/tags', data)
}

/**
 * 更新标签
 */
export const updateTag = (id: number, data: TagFormData) => {
  return http.put<Tag>(`/tags/${id}`, data)
}

/**
 * 删除标签
 */
export const deleteTag = (id: number) => {
  return http.delete(`/tags/${id}`)
}
