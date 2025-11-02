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
