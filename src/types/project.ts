import type { User } from './user'
import type { PaginationParams } from './common'

/**
 * 项目类型枚举
 */
export type ProjectType = 'web' | 'mobile' | 'desktop' | 'backend' | 'fullstack' | 'other'

/**
 * 项目状态枚举
 */
export type ProjectStatus = 'completed' | 'in_progress' | 'archived' | 'draft'

/**
 * 项目接口
 */
export interface Project {
  id: number
  title: string
  subtitle: string | null
  description: string
  content: string | null
  
  // 视觉元素
  cover_image: string | null
  images: string[]
  demo_video: string | null
  
  // 项目信息
  tech_stack: string[]
  project_type: ProjectType
  status: ProjectStatus
  
  // 链接
  github_url: string | null
  demo_url: string | null
  documentation_url: string | null
  
  // 时间与统计
  start_date: string | null
  end_date: string | null
  duration: number | null
  team_size: number
  
  // 展示控制
  is_featured: boolean
  is_open_source: boolean
  display_order: number
  view_count: number
  
  // 元数据
  author_id: number
  category: string | null
  tags: string[]
  
  created_at: string
  updated_at: string
  
  // 关联数据
  author?: User
}

/**
 * 项目列表项（简化版）
 */
export interface ProjectListItem {
  id: number
  title: string
  subtitle: string | null
  description: string
  cover_image: string | null
  tech_stack: string[]
  project_type: ProjectType
  status: ProjectStatus
  is_featured: boolean
  view_count: number
  start_date: string | null
  created_at: string
  author?: {
    id: number
    username: string
    avatar: string | null
  }
}

/**
 * 获取项目列表查询参数
 */
export interface ProjectQueryParams extends PaginationParams {
  status?: ProjectStatus | 'all'
  type?: ProjectType
  featured?: boolean | 'true' | 'false'
  tech?: string
  keyword?: string
}

/**
 * 创建项目表单数据
 */
export interface CreateProjectParams {
  title: string
  subtitle?: string
  description: string
  content?: string
  cover_image?: string
  images?: string[]
  demo_video?: string
  tech_stack: string[]
  project_type?: ProjectType
  status?: ProjectStatus
  github_url?: string
  demo_url?: string
  documentation_url?: string
  start_date: string
  end_date: string
  duration?: number
  team_size?: number
  is_featured?: boolean
  is_open_source?: boolean
  display_order?: number
  category?: string
  tags?: string[]
}

/**
 * 更新项目表单数据
 */
export interface UpdateProjectParams extends Partial<CreateProjectParams> {
  // 更新时所有字段都是可选的
}

/**
 * 项目分页列表响应
 */
export interface ProjectListResponse {
  projects?: Project[]    // 语义化资源键
  items?: Project[]       // 兼容字段
  total: number
  page: number
  limit: number
  totalPages?: number
}

/**
 * 批量删除项目请求参数
 */
export interface BatchDeleteProjectsParams {
  ids: number[]
}

/**
 * 批量删除项目响应
 */
export interface BatchDeleteProjectsResponse {
  deleted_count: number
  total_count: number
  errors: string | null
}

/**
 * 批量更新项目状态请求参数
 */
export interface BatchUpdateStatusParams {
  ids: number[]
  status: ProjectStatus
}

/**
 * 批量更新项目状态响应
 */
export interface BatchUpdateStatusResponse {
  affected_count: number
  total_count: number
}

/**
 * 批量设置精选请求参数
 */
export interface BatchUpdateFeaturedParams {
  ids: number[]
  is_featured: boolean
}

/**
 * 批量设置精选响应
 */
export interface BatchUpdateFeaturedResponse {
  affected_count: number
}

/**
 * 技术栈统计项
 */
export interface TechStackStat {
  tech: string
  count: number
}

/**
 * 项目时间线年份分组
 */
export interface ProjectTimelineYear {
  year: number
  projects: Array<{
    id: number
    title: string
    subtitle: string | null
    start_date: string | null
    end_date: string | null
    cover_image: string | null
    tech_stack: string[]
    project_type: ProjectType
  }>
}

/**
 * 项目类型选项（用于下拉选择）
 */
export const PROJECT_TYPE_OPTIONS = [
  { label: 'Web 应用', value: 'web' },
  { label: '移动应用', value: 'mobile' },
  { label: '桌面应用', value: 'desktop' },
  { label: '后端服务', value: 'backend' },
  { label: '全栈项目', value: 'fullstack' },
  { label: '其他', value: 'other' },
] as const

/**
 * 项目状态选项（用于下拉选择）
 */
export const PROJECT_STATUS_OPTIONS = [
  { label: '已完成', value: 'completed', type: 'success' },
  { label: '进行中', value: 'in_progress', type: 'primary' },
  { label: '已归档', value: 'archived', type: 'info' },
  { label: '草稿', value: 'draft', type: 'warning' },
] as const

/**
 * 项目类型映射（用于显示）
 */
export const PROJECT_TYPE_MAP: Record<ProjectType, string> = {
  web: 'Web 应用',
  mobile: '移动应用',
  desktop: '桌面应用',
  backend: '后端服务',
  fullstack: '全栈项目',
  other: '其他',
}

/**
 * 项目状态映射（用于显示）
 */
export const PROJECT_STATUS_MAP: Record<ProjectStatus, string> = {
  completed: '已完成',
  in_progress: '进行中',
  archived: '已归档',
  draft: '草稿',
}
