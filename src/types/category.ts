/**
 * 分类类型定义
 */
export interface Category {
  id: number
  name: string
  description: string | null
  sort_order: number
  created_at: string
  updated_at: string
  article_count?: number
  // 扩展字段
  is_featured?: boolean    // 是否精选分类
  icon?: string            // 自定义图标
  color?: string           // 分类主题色
  cover_image?: string     // 分类封面图
  total_views?: number     // 总浏览量
}

/**
 * 创建/更新分类参数
 */
export interface CategoryFormData {
  name: string
  description?: string
  sort_order?: number
}

/**
 * 批量删除参数
 */
export interface BatchDeleteCategoriesParams {
  ids: number[]
}

/**
 * 批量更新排序参数
 */
export interface BatchUpdateOrderParams {
  orders: Array<{
    id: number
    sort_order: number
  }>
}

/**
 * 批量合并分类参数
 */
export interface BatchMergeCategoriesParams {
  source_ids: number[]
  target_id: number
}

/**
 * 批量删除响应
 */
export interface BatchDeleteCategoriesResponse {
  deleted_count: number
  total_count: number
  errors: string[] | null
}

/**
 * 批量更新排序响应
 */
export interface BatchUpdateOrderResponse {
  updated_count: number
  categories: Category[]
}

/**
 * 批量合并分类响应
 */
export interface BatchMergeCategoriesResponse {
  merged_categories: number
  migrated_articles: number
  target_category: {
    id: number
    name: string
    article_count: number
  }
}
