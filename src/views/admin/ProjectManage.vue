<template>
  <div class="project-manage">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h2>项目管理</h2>
        <p class="subtitle">管理展示项目和作品集</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" :icon="Plus" @click="handleAdd">新建项目</el-button>
        <el-button :icon="Refresh" @click="handleRefresh">刷新</el-button>

        <el-dropdown v-if="selectedIds.length > 0" trigger="click" @command="handleBatchCommand">
          <el-button type="warning">
            批量操作 ({{ selectedIds.length }})
            <el-icon class="el-icon--right"><ArrowDown /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="featured" :icon="Star">
                设为精选
              </el-dropdown-item>
              <el-dropdown-item command="unfeatured" :icon="Star">
                取消精选
              </el-dropdown-item>
              <el-dropdown-item command="publish" :icon="Check">
                发布项目
              </el-dropdown-item>
              <el-dropdown-item command="draft" :icon="Edit">
                转为草稿
              </el-dropdown-item>
              <el-dropdown-item command="delete" :icon="Delete" divided>
                批量删除
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <!-- 筛选栏 -->
    <div class="search-bar">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索项目标题"
        :prefix-icon="Search"
        clearable
        style="width: 240px"
        @input="handleSearch"
      />

      <el-select
        v-model="filterType"
        placeholder="项目类型"
        clearable
        style="width: 140px"
        @change="applyFilters"
      >
        <el-option label="全部" :value="undefined" />
        <el-option label="Web应用" value="web" />
        <el-option label="移动应用" value="mobile" />
        <el-option label="桌面应用" value="desktop" />
        <el-option label="后端服务" value="backend" />
        <el-option label="全栈项目" value="fullstack" />
        <el-option label="其他" value="other" />
      </el-select>

      <el-select
        v-model="filterStatus"
        placeholder="状态"
        clearable
        style="width: 140px"
        @change="applyFilters"
      >
        <el-option label="全部" :value="undefined" />
        <el-option label="已完成" value="completed" />
        <el-option label="进行中" value="in_progress" />
        <el-option label="已归档" value="archived" />
        <el-option label="草稿" value="draft" />
      </el-select>

      <el-select
        v-model="filterFeatured"
        placeholder="精选"
        clearable
        style="width: 140px"
        @change="applyFilters"
      >
        <el-option label="全部" :value="undefined" />
        <el-option label="仅精选" :value="true" />
        <el-option label="非精选" :value="false" />
      </el-select>

      <el-select
        v-model="filterOpenSource"
        placeholder="开源"
        clearable
        style="width: 140px"
        @change="applyFilters"
      >
        <el-option label="全部" :value="undefined" />
        <el-option label="开源项目" :value="true" />
        <el-option label="闭源项目" :value="false" />
      </el-select>
    </div>

    <!-- 数据统计 -->
    <el-row :gutter="16" class="stats-row">
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #ecf5ff">
              <el-icon :size="32" color="#409EFF"><DataLine /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ projectStore.pagination.total }}</div>
              <div class="stat-label">项目总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #fef0f0">
              <el-icon :size="32" color="#F56C6C"><Star /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ featuredCount }}</div>
              <div class="stat-label">精选项目</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #f0f9ff">
              <el-icon :size="32" color="#67C23A"><CircleCheck /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ completedCount }}</div>
              <div class="stat-label">已完成</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #f4f4f5">
              <el-icon :size="32" color="#909399"><View /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ totalViews }}</div>
              <div class="stat-label">总浏览量</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card>
      <!-- 数据表格 -->
      <el-table
        v-loading="projectStore.loading"
        :data="displayProjects"
        style="width: 100%"
        stripe
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />

        <el-table-column prop="id" label="ID" width="70" />

        <el-table-column label="封面" width="100">
          <template #default="{ row }">
            <el-image
              v-if="row.cover_image"
              :src="row.cover_image"
              :preview-src-list="[row.cover_image]"
              fit="cover"
              style="width: 60px; height: 60px; border-radius: 4px"
            >
              <template #error>
                <div class="image-error">
                  <el-icon><Picture /></el-icon>
                </div>
              </template>
            </el-image>
            <div v-else class="no-image">
              <el-icon><Picture /></el-icon>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="项目信息" min-width="250">
          <template #default="{ row }">
            <div class="project-info">
              <div class="project-title">{{ row.title }}</div>
              <div v-if="row.subtitle" class="project-subtitle">{{ row.subtitle }}</div>
              <div class="project-tags">
                <el-tag v-if="row.is_featured" type="danger" size="small" effect="dark">
                  <el-icon><Star /></el-icon>
                  精选
                </el-tag>
                <el-tag v-if="row.is_open_source" type="success" size="small">开源</el-tag>
                <el-tag :type="getTypeColor(row.project_type)" size="small">
                  {{ PROJECT_TYPE_MAP[row.project_type] }}
                </el-tag>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="描述" min-width="200" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.description }}
          </template>
        </el-table-column>

        <el-table-column label="技术栈" width="180">
          <template #default="{ row }">
            <div class="tech-stack">
              <el-tag
                v-for="(tech, index) in row.tech_stack?.slice(0, 3)"
                :key="index"
                size="small"
                type="info"
              >
                {{ tech }}
              </el-tag>
              <el-tag v-if="row.tech_stack?.length > 3" size="small" type="info">
                +{{ row.tech_stack.length - 3 }}
              </el-tag>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ PROJECT_STATUS_MAP[row.status] }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="统计" width="120">
          <template #default="{ row }">
            <div class="stats-column">
              <div>
                <el-icon><View /></el-icon>
                {{ row.view_count }}
              </div>
              <div>
                <el-icon><User /></el-icon>
                {{ row.team_size }}人
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="时间" width="140">
          <template #default="{ row }">
            <div class="date-column">
              <div>创建: {{ formatDate(row.created_at) }}</div>
              <div v-if="row.updated_at">更新: {{ formatDate(row.updated_at) }}</div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <el-space wrap>
              <el-button link type="primary" size="small" :icon="View" @click="handleView(row)">
                查看
              </el-button>
              <el-button link type="primary" size="small" :icon="Edit" @click="handleEdit(row)">
                编辑
              </el-button>
              <el-button
                link
                :type="row.is_featured ? 'warning' : 'default'"
                size="small"
                :icon="Star"
                @click="handleToggleFeatured(row)"
              >
                {{ row.is_featured ? '取消精选' : '精选' }}
              </el-button>
              <el-popconfirm
                title="确定要删除这个项目吗？"
                confirm-button-text="确定"
                cancel-button-text="取消"
                @confirm="handleDelete(row)"
              >
                <template #reference>
                  <el-button link type="danger" size="small" :icon="Delete">删除</el-button>
                </template>
              </el-popconfirm>
            </el-space>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="projectStore.pagination.total"
          :page-sizes="[10, 20, 30, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus,
  Edit,
  Delete,
  Star,
  ArrowDown,
  Refresh,
  Search,
  Check,
  Picture,
  View,
  User,
  DataLine,
  CircleCheck,
} from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import { useProjectStore } from '@/stores/project'
import { PROJECT_TYPE_MAP, PROJECT_STATUS_MAP } from '@/types'
import type { Project, ProjectType, ProjectStatus } from '@/types'

const router = useRouter()
const projectStore = useProjectStore()

const selectedIds = ref<number[]>([])
const searchKeyword = ref('')
const filterType = ref<ProjectType | undefined>(undefined)
const filterStatus = ref<ProjectStatus | undefined>(undefined)
const filterFeatured = ref<boolean | undefined>(undefined)
const filterOpenSource = ref<boolean | undefined>(undefined)

// 与 store 分页联动
const currentPage = computed({
  get: () => projectStore.pagination.page,
  set: (val: number) => projectStore.setPage(val)
})
const pageSize = computed({
  get: () => projectStore.pagination.limit,
  set: (val: number) => projectStore.setLimit(val)
})

// 筛选后的项目列表
const displayProjects = computed(() => {
  let rows = projectStore.projects

  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    rows = rows.filter(p => p.title?.toLowerCase().includes(keyword))
  }

  if (filterType.value) {
    rows = rows.filter(p => p.project_type === filterType.value)
  }

  if (filterStatus.value) {
    rows = rows.filter(p => p.status === filterStatus.value)
  }

  if (filterFeatured.value !== undefined) {
    rows = rows.filter(p => p.is_featured === filterFeatured.value)
  }

  if (filterOpenSource.value !== undefined) {
    rows = rows.filter(p => p.is_open_source === filterOpenSource.value)
  }

  return rows
})

// 统计数据
const featuredCount = computed(() => {
  return projectStore.projects.filter(p => p.is_featured).length
})

const completedCount = computed(() => {
  return projectStore.projects.filter(p => p.status === 'completed').length
})

const totalViews = computed(() => {
  return projectStore.projects.reduce((sum, p) => sum + (p.view_count || 0), 0)
})

// 格式化日期
const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD')
}

// 获取类型颜色
const getTypeColor = (type: ProjectType) => {
  const colorMap: Record<ProjectType, any> = {
    web: 'primary',
    mobile: 'success',
    desktop: 'warning',
    backend: 'info',
    fullstack: 'danger',
    other: '',
  }
  return colorMap[type] || ''
}

// 获取状态类型
const getStatusType = (status: ProjectStatus) => {
  const typeMap: Record<ProjectStatus, any> = {
    completed: 'success',
    in_progress: 'primary',
    archived: 'info',
    draft: 'warning',
  }
  return typeMap[status] || ''
}

// 搜索防抖
let searchTimer: ReturnType<typeof setTimeout> | null = null
const handleSearch = () => {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    // 搜索逻辑已在 computed 中处理
  }, 300)
}

// 应用筛选
const applyFilters = () => {
  loadProjects()
}

// 加载项目列表
const loadProjects = async () => {
  await projectStore.fetchProjects({
    project_type: filterType.value,
    status: filterStatus.value,
    is_featured: filterFeatured.value,
    is_open_source: filterOpenSource.value,
  })
}

const handleRefresh = () => {
  searchKeyword.value = ''
  filterType.value = undefined
  filterStatus.value = undefined
  filterFeatured.value = undefined
  filterOpenSource.value = undefined
  loadProjects()
}

// 新建项目
const handleAdd = () => {
  router.push('/admin/projects/create')
}

// 查看项目
const handleView = (project: Project) => {
  router.push(`/projects/${project.id}`)
}

// 编辑项目
const handleEdit = (project: Project) => {
  router.push(`/admin/projects/${project.id}/edit`)
}

// 删除项目
const handleDelete = async (project: Project) => {
  try {
    await projectStore.deleteProject(project.id)
    ElMessage.success('删除成功')
    loadProjects()
  } catch (error) {
    ElMessage.error('删除失败')
  }
}

// 切换精选状态
const handleToggleFeatured = async (project: Project) => {
  try {
    await projectStore.updateProject(project.id, {
      is_featured: !project.is_featured
    })
    ElMessage.success(project.is_featured ? '已取消精选' : '已设为精选')
    loadProjects()
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

// 表格选择变化
const handleSelectionChange = (selection: Project[]) => {
  selectedIds.value = selection.map(item => item.id)
}

// 批量操作
const handleBatchCommand = async (command: string) => {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请先选择要操作的项目')
    return
  }

  switch (command) {
    case 'featured':
      await handleBatchFeatured(true)
      break
    case 'unfeatured':
      await handleBatchFeatured(false)
      break
    case 'publish':
      await handleBatchStatus('completed')
      break
    case 'draft':
      await handleBatchStatus('draft')
      break
    case 'delete':
      await handleBatchDelete()
      break
  }
}

// 批量设置精选
const handleBatchFeatured = async (featured: boolean) => {
  try {
    await ElMessageBox.confirm(
      `确定${featured ? '设为精选' : '取消精选'}选中的 ${selectedIds.value.length} 个项目吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    for (const id of selectedIds.value) {
      await projectStore.updateProject(id, { is_featured: featured })
    }

    ElMessage.success('操作成功')
    selectedIds.value = []
    loadProjects()
  } catch (error) {
    // 用户取消操作
  }
}

// 批量修改状态
const handleBatchStatus = async (status: ProjectStatus) => {
  try {
    await ElMessageBox.confirm(
      `确定将选中的 ${selectedIds.value.length} 个项目状态修改为"${PROJECT_STATUS_MAP[status]}"吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    for (const id of selectedIds.value) {
      await projectStore.updateProject(id, { status })
    }

    ElMessage.success('操作成功')
    selectedIds.value = []
    loadProjects()
  } catch (error) {
    // 用户取消操作
  }
}

// 批量删除
const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(
      `确定删除选中的 ${selectedIds.value.length} 个项目吗？删除后将无法恢复。`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'error'
      }
    )

    for (const id of selectedIds.value) {
      await projectStore.deleteProject(id)
    }

    ElMessage.success('删除成功')
    selectedIds.value = []
    loadProjects()
  } catch (error) {
    // 用户取消操作
  }
}

// 分页变化
const handlePageChange = (page: number) => {
  projectStore.setPage(page)
  loadProjects()
}

// 每页数量变化
const handleSizeChange = (size: number) => {
  projectStore.setLimit(size)
  projectStore.setPage(1)
  loadProjects()
}

// 初始化
onMounted(() => {
  loadProjects()
})
</script>

<style scoped lang="scss">
.project-manage {
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    .header-left {
      h2 {
        margin: 0;
        font-size: 20px;
        font-weight: 600;
      }
      .subtitle {
        margin-top: 6px;
        font-size: 13px;
        color: #909399;
      }
    }
    .header-actions {
      display: flex;
      gap: 10px;
    }
  }

  .search-bar {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;
    flex-wrap: wrap;
  }

  .stats-row {
    margin-bottom: 16px;

    .stat-card {
      .stat-content {
        display: flex;
        align-items: center;
        gap: 16px;

        .stat-icon {
          width: 60px;
          height: 60px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stat-info {
          flex: 1;

          .stat-value {
            font-size: 24px;
            font-weight: 600;
            color: #303133;
            margin-bottom: 4px;
          }

          .stat-label {
            font-size: 13px;
            color: #909399;
          }
        }
      }
    }
  }

  .image-error,
  .no-image {
    width: 60px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f5f7fa;
    border-radius: 4px;
    color: #c0c4cc;
    font-size: 24px;
  }

  .project-info {
    .project-title {
      font-size: 14px;
      font-weight: 600;
      color: #303133;
      margin-bottom: 4px;
    }

    .project-subtitle {
      font-size: 12px;
      color: #909399;
      margin-bottom: 6px;
    }

    .project-tags {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
    }
  }

  .tech-stack {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }

  .stats-column {
    font-size: 13px;
    color: #606266;

    > div {
      display: flex;
      align-items: center;
      gap: 4px;
      margin-bottom: 4px;

      &:last-child {
        margin-bottom: 0;
      }
    }
  }

  .date-column {
    font-size: 12px;
    color: #909399;

    > div {
      margin-bottom: 4px;

      &:last-child {
        margin-bottom: 0;
      }
    }
  }

  .pagination-wrapper {
    display: flex;
    justify-content: flex-end;
    margin-top: 16px;
  }
}
</style>
