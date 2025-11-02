import type { User } from './user'
import type { Category } from './category'
import type { Tag } from './tag'
import type { PaginationParams, SortParams } from './common'

/**
 * 文章状态
 */
export type ArticleStatus = 'draft' | 'published'

/**
 * 文章类型定义
 */
export interface Article {
  id: number
  title: string
  summary: string | null
  content: string
  cover_image: string | null
  author_id: number
  category_id: number | null
  status: ArticleStatus
  views: number
  is_top: boolean
  published_at: string | null
  created_at: string
  updated_at: string
  // 关联数据
  author?: User
  category?: Category
  tags?: Tag[]
  comment_count?: number
  // 互动统计数据
  like_count?: number      // 点赞数
  favorite_count?: number  // 收藏数
  share_count?: number     // 分享数
}

/**
 * 文章查询参数
 */
export interface ArticleQueryParams extends PaginationParams, SortParams {
  category_id?: number
  tag_id?: number
  keyword?: string
  status?: ArticleStatus
}

/**
 * 创建/更新文章参数
 */
export interface ArticleFormData {
  title: string
  summary?: string
  content: string
  cover_image?: string
  category_id?: number
  tag_ids?: number[]
  status: ArticleStatus
  is_top?: boolean
}

/**
 * 文章列表项（简化版）
 */
export interface ArticleListItem {
  id: number
  title: string
  summary: string | null
  cover_image: string | null
  views: number
  is_top: boolean
  published_at: string | null
  created_at: string
  author?: {
    id: number
    username: string
    avatar: string | null
  }
  category?: {
    id: number
    name: string
  }
  tags?: Array<{
    id: number
    name: string
    color: string | null
  }>
  comment_count?: number
}

/**
 * 文章分页列表响应（与后端保持一致）
 */
export interface ArticleListResponse {
  articles?: Article[]        // 推荐字段（语义化）
  items?: Article[]           // 向后兼容字段
  total: number
  page: number
  limit: number
  totalPages?: number
}
