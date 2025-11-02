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
