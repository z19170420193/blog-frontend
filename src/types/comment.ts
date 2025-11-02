import type { User } from './user'

/**
 * 评论类型定义
 */
export interface Comment {
  id: number
  article_id: number
  user_id: number | null
  parent_id: number | null
  nickname: string
  email: string | null
  content: string
  is_approved: boolean
  created_at: string
  updated_at: string
  // 关联数据
  user?: User
  replies?: Comment[]
}

/**
 * 创建评论参数
 */
export interface CommentFormData {
  article_id: number
  parent_id?: number
  nickname: string
  email?: string
  content: string
}

/**
 * 更新评论参数
 */
export interface UpdateCommentParams {
  content?: string
  is_approved?: boolean
}
