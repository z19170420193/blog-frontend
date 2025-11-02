/**
 * API 响应类型
 */
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

/**
 * 分页响应类型
 */
export interface PaginationResponse<T> {
  total: number
  page: number
  limit: number
  data: T[]
}

/**
 * 分页查询参数基础类型
 */
export interface PaginationParams {
  page?: number
  limit?: number
}

/**
 * 排序参数
 */
export interface SortParams {
  sort?: string
  order?: 'ASC' | 'DESC'
}

/**
 * 路由元信息
 */
export interface RouteMeta {
  title?: string
  requiresAuth?: boolean
  roles?: string[]
}
