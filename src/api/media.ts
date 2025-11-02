import { http } from './request'
import type { Media, MediaQueryParams, UpdateMediaParams, UploadResponse, PaginationResponse } from '@/types'

/**
 * 上传媒体文件
 */
export const uploadMedia = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return http.upload<UploadResponse>('/media/upload', formData)
}

/**
 * 获取媒体列表
 */
export const getMediaList = (params?: MediaQueryParams) => {
  return http.get<PaginationResponse<Media>>('/media', { params })
}

/**
 * 获取媒体详情
 */
export const getMediaById = (id: number) => {
  return http.get<Media>(`/media/${id}`)
}

/**
 * 更新媒体信息
 */
export const updateMedia = (id: number, data: UpdateMediaParams) => {
  return http.put<Media>(`/media/${id}`, data)
}

/**
 * 删除媒体文件
 */
export const deleteMedia = (id: number) => {
  return http.delete(`/media/${id}`)
}

/**
 * 批量删除媒体文件
 */
export const batchDeleteMedia = (ids: number[]) => {
  return http.post('/media/batch-delete', { ids })
}
