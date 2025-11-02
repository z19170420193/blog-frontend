/**
 * 标签类型定义
 */
export interface Tag {
  id: number
  name: string
  color: string | null
  created_at: string
  updated_at: string
  article_count?: number
}

/**
 * 创建/更新标签参数
 */
export interface TagFormData {
  name: string
  color?: string
}

/**
 * 批量删除标签参数
 */
export interface BatchDeleteTagsParams {
  ids: number[]
}

/**
 * 批量合并标签参数
 */
export interface BatchMergeTagsParams {
  source_ids: number[]
  target_id: number
}

/**
 * 批量更新标签颜色参数
 */
export interface BatchUpdateTagColorParams {
  ids: number[]
  color: string
}

/**
 * 批量删除标签响应
 */
export interface BatchDeleteTagsResponse {
  deleted_count: number
  total_count: number
}

/**
 * 批量合并标签响应
 */
export interface BatchMergeTagsResponse {
  merged_tags: number
  affected_articles: number
  target_tag: {
    id: number
    name: string
    article_count: number
  }
}

/**
 * 批量更新颜色响应
 */
export interface BatchUpdateTagColorResponse {
  updated_count: number
  tags: Tag[]
}
