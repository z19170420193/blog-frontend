import type { User } from './user'
import type { PaginationParams } from './common'

/**
 * 存储类型
 */
export type StorageType = 'local' | 'oss'

/**
 * 媒体文件类型定义
 */
export interface Media {
  id: number
  filename: string
  stored_name: string
  file_path: string
  file_url: string
  file_size: number
  mime_type: string
  width: number | null
  height: number | null
  uploader_id: number
  usage_count: number
  storage_type: StorageType
  created_at: string
  updated_at: string
  uploader?: User
}

/**
 * 媒体查询参数
 */
export interface MediaQueryParams extends PaginationParams {
  mime_type?: string
  keyword?: string
  storage_type?: StorageType
}

/**
 * 更新媒体信息参数
 */
export interface UpdateMediaParams {
  filename?: string
}

/**
 * 上传文件响应
 */
export interface UploadResponse {
  id: number
  filename: string
  file_url: string
  file_size: number
  mime_type: string
  width?: number
  height?: number
}
