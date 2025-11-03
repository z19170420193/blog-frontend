import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  Project,
  ProjectQueryParams,
  CreateProjectParams,
  UpdateProjectParams,
  TechStackStat,
  ProjectTimelineYear,
} from '@/types'
import * as projectApi from '@/api/project'
import { ElMessage } from 'element-plus'

export const useProjectStore = defineStore('project', () => {
  // ========== 状态 ==========
  const projects = ref<Project[]>([])
  const currentProject = ref<Project | null>(null)
  const pagination = ref({
    total: 0,
    page: 1,
    limit: 12, // 项目列表默认一页显示12个（3x4 网格）
  })
  const loading = ref(false)
  
  // 技术栈统计
  const techStackStats = ref<TechStackStat[]>([])
  
  // 项目时间线
  const projectTimeline = ref<ProjectTimelineYear[]>([])
  
  // 筛选条件
  const filters = ref<ProjectQueryParams>({
    status: undefined,
    type: undefined,
    featured: undefined,
    tech: undefined,
    keyword: undefined,
  })

  // ========== 派生状态 ==========
  
  // 精选项目
  const featuredProjects = computed(() => 
    projects.value.filter((p) => p.is_featured)
  )
  
  // 开源项目
  const openSourceProjects = computed(() => 
    projects.value.filter((p) => p.is_open_source)
  )
  
  // 按项目类型分组
  const projectsByType = computed(() => {
    const grouped: Record<string, Project[]> = {}
    projects.value.forEach((project) => {
      if (!grouped[project.project_type]) {
        grouped[project.project_type] = []
      }
      grouped[project.project_type].push(project)
    })
    return grouped
  })

  // ========== Actions ==========
  
  /**
   * 获取项目列表
   */
  const fetchProjects = async (params?: ProjectQueryParams) => {
    loading.value = true
    try {
      const data = await projectApi.getProjects({
        page: pagination.value.page,
        limit: pagination.value.limit,
        ...filters.value,
        ...params,
      })
      
      projects.value = data.projects || data.items || []
      pagination.value = {
        total: data.total,
        page: data.page,
        limit: data.limit,
      }
      
      return data
    } catch (error) {
      console.error('获取项目列表失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * 获取项目详情
   */
  const fetchProjectById = async (id: number) => {
    loading.value = true
    try {
      const data = await projectApi.getProjectById(id)
      currentProject.value = data
      return data
    } catch (error) {
      console.error('获取项目详情失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * 创建项目
   */
  const createProject = async (payload: CreateProjectParams) => {
    loading.value = true
    try {
      const data = await projectApi.createProject(payload)
      ElMessage.success('项目创建成功')
      // 重新加载列表
      await fetchProjects()
      return data
    } catch (error) {
      console.error('创建项目失败:', error)
      ElMessage.error('创建项目失败')
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * 更新项目
   */
  const updateProject = async (id: number, payload: UpdateProjectParams) => {
    loading.value = true
    try {
      const data = await projectApi.updateProject(id, payload)
      ElMessage.success('项目更新成功')
      
      // 更新当前项目
      if (currentProject.value?.id === id) {
        currentProject.value = data
      }
      
      // 更新列表中的项目
      const index = projects.value.findIndex((p) => p.id === id)
      if (index !== -1) {
        projects.value[index] = data
      }
      
      return data
    } catch (error) {
      console.error('更新项目失败:', error)
      ElMessage.error('更新项目失败')
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * 删除项目
   */
  const deleteProject = async (id: number) => {
    loading.value = true
    try {
      await projectApi.deleteProject(id)
      
      // 从列表中移除
      projects.value = projects.value.filter((p) => p.id !== id)
      pagination.value.total = Math.max(0, pagination.value.total - 1)
      
      // 如果是当前项目，清空
      if (currentProject.value?.id === id) {
        currentProject.value = null
      }
      
      ElMessage.success('项目删除成功')
    } catch (error) {
      console.error('删除项目失败:', error)
      ElMessage.error('删除项目失败')
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * 批量删除项目
   */
  const batchDeleteProjects = async (ids: number[]) => {
    loading.value = true
    try {
      const data = await projectApi.batchDeleteProjects({ ids })
      ElMessage.success(`成功删除 ${data.deleted_count} 个项目`)
      
      // 重新加载列表
      await fetchProjects()
      return data
    } catch (error) {
      console.error('批量删除项目失败:', error)
      ElMessage.error('批量删除失败')
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * 批量更新项目状态
   */
  const batchUpdateStatus = async (ids: number[], status: string) => {
    loading.value = true
    try {
      const data = await projectApi.batchUpdateStatus({ 
        ids, 
        status: status as any 
      })
      ElMessage.success(`成功更新 ${data.affected_count} 个项目状态`)
      
      // 重新加载列表
      await fetchProjects()
      return data
    } catch (error) {
      console.error('批量更新状态失败:', error)
      ElMessage.error('批量更新失败')
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * 批量设置精选
   */
  const batchUpdateFeatured = async (ids: number[], isFeatured: boolean) => {
    loading.value = true
    try {
      const data = await projectApi.batchUpdateFeatured({ 
        ids, 
        is_featured: isFeatured 
      })
      ElMessage.success(`成功${isFeatured ? '设置' : '取消'}精选 ${data.affected_count} 个项目`)
      
      // 重新加载列表
      await fetchProjects()
      return data
    } catch (error) {
      console.error('批量设置精选失败:', error)
      ElMessage.error('操作失败')
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * 增加浏览量
   */
  const incrementView = async (id: number) => {
    try {
      const data = await projectApi.incrementView(id)
      
      // 更新当前项目的浏览量
      if (currentProject.value?.id === id) {
        currentProject.value.view_count = data.view_count
      }
      
      // 更新列表中的浏览量
      const index = projects.value.findIndex((p) => p.id === id)
      if (index !== -1) {
        projects.value[index].view_count = data.view_count
      }
      
      return data
    } catch (error) {
      console.error('增加浏览量失败:', error)
      // 浏览量失败不影响用户体验，静默处理
    }
  }

  /**
   * 获取技术栈统计
   */
  const fetchTechStackStats = async () => {
    try {
      const data = await projectApi.getTechStackStats()
      techStackStats.value = data
      return data
    } catch (error) {
      console.error('获取技术栈统计失败:', error)
      throw error
    }
  }

  /**
   * 获取项目时间线
   */
  const fetchProjectTimeline = async () => {
    try {
      const data = await projectApi.getProjectTimeline()
      projectTimeline.value = data
      return data
    } catch (error) {
      console.error('获取项目时间线失败:', error)
      throw error
    }
  }

  /**
   * 设置筛选条件
   */
  const setFilters = (newFilters: Partial<ProjectQueryParams>) => {
    filters.value = { ...filters.value, ...newFilters }
  }

  /**
   * 清空筛选条件
   */
  const clearFilters = () => {
    filters.value = {
      status: undefined,
      type: undefined,
      featured: undefined,
      tech: undefined,
      keyword: undefined,
    }
  }

  /**
   * 设置分页
   */
  const setPage = (page: number) => {
    pagination.value.page = page
  }

  const setLimit = (limit: number) => {
    pagination.value.limit = limit
  }

  /**
   * 清空当前项目
   */
  const clearCurrentProject = () => {
    currentProject.value = null
  }

  /**
   * 重置所有状态
   */
  const reset = () => {
    projects.value = []
    currentProject.value = null
    pagination.value = { total: 0, page: 1, limit: 12 }
    loading.value = false
    techStackStats.value = []
    projectTimeline.value = []
    clearFilters()
  }

  return {
    // ========== 状态 ==========
    projects,
    currentProject,
    pagination,
    loading,
    techStackStats,
    projectTimeline,
    filters,
    
    // ========== 派生状态 ==========
    featuredProjects,
    openSourceProjects,
    projectsByType,
    
    // ========== Actions ==========
    fetchProjects,
    fetchProjectById,
    createProject,
    updateProject,
    deleteProject,
    batchDeleteProjects,
    batchUpdateStatus,
    batchUpdateFeatured,
    incrementView,
    fetchTechStackStats,
    fetchProjectTimeline,
    setFilters,
    clearFilters,
    setPage,
    setLimit,
    clearCurrentProject,
    reset,
  }
})
