import type { User } from './user'
import type { PaginationParams } from './common'

// 说说可见性类型
export type MomentVisibility = 'public' | 'private' | 'friends'

// 说说接口
export interface Moment {
  id: number
  user_id: number
  content: string
  images: string[]
  location?: string | null
  visibility: MomentVisibility
  is_pinned: boolean
  published_at: string
  created_at: string
  updated_at: string
  user?: User // 关联用户信息
}

// 创建说说请求参数
export interface CreateMomentParams {
  content: string
  images?: string[]
  location?: string
  visibility?: MomentVisibility
}

// 更新说说请求参数
export interface UpdateMomentParams {
  content?: string
  images?: string[]
  location?: string
  visibility?: MomentVisibility
}

// 获取说说列表请求参数（与通用分页参数对齐）
export interface GetMomentsParams extends PaginationParams {
  user_id?: number
  visibility?: MomentVisibility
}

// 说说分页列表响应（与其他模块对齐）
export interface MomentListResponse {
  moments?: Moment[] // 语义化资源键
  items?: Moment[]   // 兼容字段
  total: number
  page: number
  limit: number
  totalPages?: number
}

// 批量删除请求参数
export interface BatchDeleteMomentsParams {
  ids: number[]
}

// 批量删除响应
export interface BatchDeleteMomentsResponse {
  deleted_count: number
  total_count: number
  errors: string[] | null
}

// 置顶请求参数
export interface TogglePinParams {
  is_pinned: boolean
}
