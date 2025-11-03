import { http } from './request'
import type {
  Project,
  ProjectQueryParams,
  CreateProjectParams,
  UpdateProjectParams,
  ProjectListResponse,
  BatchDeleteProjectsParams,
  BatchDeleteProjectsResponse,
  BatchUpdateStatusParams,
  BatchUpdateStatusResponse,
  BatchUpdateFeaturedParams,
  BatchUpdateFeaturedResponse,
  TechStackStat,
  ProjectTimelineYear,
} from '@/types/project'

/**
 * 获取项目列表（支持筛选和分页）
 */
export const getProjects = (params?: ProjectQueryParams) =>
  http.get<ProjectListResponse>('/projects', { params })

/**
 * 获取项目详情
 */
export const getProjectById = (id: number) =>
  http.get<Project>(`/projects/${id}`)

/**
 * 创建项目
 */
export const createProject = (data: CreateProjectParams) =>
  http.post<Project>('/projects', data)

/**
 * 更新项目
 */
export const updateProject = (id: number, data: UpdateProjectParams) =>
  http.put<Project>(`/projects/${id}`, data)

/**
 * 删除项目
 */
export const deleteProject = (id: number) =>
  http.delete<null>(`/projects/${id}`)

/**
 * 批量删除项目
 */
export const batchDeleteProjects = (data: BatchDeleteProjectsParams) =>
  http.post<BatchDeleteProjectsResponse>('/projects/batch-delete', data)

/**
 * 批量更新项目状态
 */
export const batchUpdateStatus = (data: BatchUpdateStatusParams) =>
  http.post<BatchUpdateStatusResponse>('/projects/batch-update-status', data)

/**
 * 批量设置/取消精选
 */
export const batchUpdateFeatured = (data: BatchUpdateFeaturedParams) =>
  http.post<BatchUpdateFeaturedResponse>('/projects/batch-update-featured', data)

/**
 * 增加浏览量
 */
export const incrementView = (id: number) =>
  http.post<{ view_count: number }>(`/projects/${id}/view`)

/**
 * 获取技术栈统计
 */
export const getTechStackStats = () =>
  http.get<TechStackStat[]>('/projects/stats/tech-stack')

/**
 * 获取项目时间线
 */
export const getProjectTimeline = () =>
  http.get<ProjectTimelineYear[]>('/projects/timeline')
