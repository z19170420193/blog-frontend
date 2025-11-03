<template>
  <div class="projects-page">
    <!-- 页面头部 -->
    <div class="page-header full-bleed">
      <div class="container">
        <h1 class="page-title">项目作品集</h1>
        <p class="page-description">技术实践与创新成果展示</p>

        <!-- 工具栏 -->
        <div class="header-toolbar">
          <el-input
            v-model="keyword"
            placeholder="搜索项目名称/描述…"
            clearable
            @input="onKeywordInput"
            class="toolbar-item search-input"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>

          <el-button
            class="toolbar-item"
            type="primary"
            plain
            @click="filterVisible = !filterVisible"
          >
            <el-icon><Filter /></el-icon>
            筛选
          </el-button>
        </div>

        <!-- 激活的筛选标签 -->
        <div v-if="activeFilters.length" class="active-chips">
          <el-tag
            v-for="filter in activeFilters"
            :key="filter.key"
            closable
            @close="removeFilter(filter.key)"
            effect="dark"
            type="info"
          >
            {{ filter.label }}
          </el-tag>
          <el-button link type="primary" @click="resetFilters">清空全部</el-button>
        </div>
      </div>
    </div>

    <!-- 筛选抽屉 -->
    <el-drawer
      v-model="filterVisible"
      title="筛选项目"
      direction="rtl"
      :size="360"
    >
      <div class="filter-content">
        <!-- 项目类型 -->
        <div class="filter-section">
          <h4>项目类型</h4>
          <el-radio-group v-model="filters.type" @change="applyFilters">
            <el-radio :label="undefined">全部</el-radio>
            <el-radio
              v-for="option in PROJECT_TYPE_OPTIONS"
              :key="option.value"
              :label="option.value"
            >
              {{ option.label }}
            </el-radio>
          </el-radio-group>
        </div>

        <!-- 项目状态 -->
        <div class="filter-section">
          <h4>项目状态</h4>
          <el-radio-group v-model="filters.status" @change="applyFilters">
            <el-radio :label="undefined">全部</el-radio>
            <el-radio label="completed">已完成</el-radio>
            <el-radio label="in_progress">进行中</el-radio>
          </el-radio-group>
        </div>

        <!-- 技术栈筛选 -->
        <div class="filter-section">
          <h4>技术栈</h4>
          <el-select
            v-model="filters.tech"
            placeholder="选择技术栈"
            clearable
            filterable
            @change="applyFilters"
            style="width: 100%"
          >
            <el-option
              v-for="tech in techStackOptions"
              :key="tech.tech"
              :label="`${tech.tech} (${tech.count})`"
              :value="tech.tech"
            />
          </el-select>
        </div>

        <!-- 特殊标记 -->
        <div class="filter-section">
          <h4>特殊标记</h4>
          <el-checkbox v-model="filters.featured" @change="applyFilters">
            精选项目
          </el-checkbox>
        </div>

        <div class="filter-actions">
          <el-button @click="resetFilters">重置</el-button>
          <el-button type="primary" @click="filterVisible = false">确定</el-button>
        </div>
      </div>
    </el-drawer>

    <!-- 主要内容 -->
    <div class="container">
      <!-- 统计信息 -->
      <div class="projects-stats">
        <span>
          共找到 <strong>{{ projectStore.pagination.total }}</strong> 个项目
        </span>
        <div class="quick-filters">
          <el-button
            size="small"
            :type="filters.featured ? 'primary' : 'default'"
            @click="toggleFeatured"
          >
            <el-icon><Star /></el-icon>
            精选项目
          </el-button>
          <el-button
            size="small"
            :type="showOnlyOpenSource ? 'success' : 'default'"
            @click="toggleOpenSource"
          >
            <Icon icon="mdi:open-source-initiative" :width="16" />
            开源项目
          </el-button>
        </div>
      </div>

      <!-- 精选项目轮播 (仅在首页且有精选项目时显示) -->
      <div v-if="!hasActiveFilters && featuredProjects.length > 0" class="featured-section">
        <h2 class="section-title">
          <el-icon><Star /></el-icon>
          精选项目
        </h2>
        <el-carousel
          :interval="5000"
          arrow="hover"
          indicator-position="outside"
          height="400px"
        >
          <el-carousel-item v-for="project in featuredProjects" :key="project.id">
            <div class="featured-card" @click="goToDetail(project.id)">
              <div class="featured-image">
                <el-image
                  :src="project.cover_image || defaultCover"
                  fit="cover"
                  style="width: 100%; height: 100%"
                />
              </div>
              <div class="featured-content">
                <h3>{{ project.title }}</h3>
                <p>{{ project.subtitle || project.description }}</p>
                <div class="featured-tech">
                  <el-tag
                    v-for="(tech, index) in project.tech_stack.slice(0, 5)"
                    :key="index"
                    size="small"
                  >
                    {{ tech }}
                  </el-tag>
                </div>
              </div>
            </div>
          </el-carousel-item>
        </el-carousel>
      </div>

      <!-- 加载状态 -->
      <div v-if="projectStore.loading" class="loading-container">
        <el-skeleton :rows="6" animated />
      </div>

      <!-- 项目网格 -->
      <div
        v-else-if="projectStore.projects.length > 0"
        class="projects-grid"
      >
        <transition-group name="fade-slide">
          <div
            v-for="project in projectStore.projects"
            :key="project.id"
            class="project-item"
          >
            <ProjectCard :project="project" />
          </div>
        </transition-group>
      </div>

      <!-- 空状态 -->
      <div v-else class="empty-container">
        <el-empty description="暂无项目">
          <el-button type="primary" @click="resetFilters">
            重置筛选条件
          </el-button>
        </el-empty>
      </div>

      <!-- 分页 -->
      <div v-if="projectStore.pagination.total > 0" class="pagination-container">
        <el-pagination
          v-model:current-page="projectStore.pagination.page"
          v-model:page-size="projectStore.pagination.limit"
          :total="projectStore.pagination.total"
          :page-sizes="[12, 24, 36, 48]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import { Search, Filter, Star } from '@element-plus/icons-vue'
import { useProjectStore } from '@/stores/project'
import ProjectCard from '@/components/project/ProjectCard.vue'
import { PROJECT_TYPE_OPTIONS } from '@/types'
import type { ProjectType, ProjectStatus } from '@/types'

const router = useRouter()
const projectStore = useProjectStore()

// 状态
const keyword = ref('')
const filterVisible = ref(false)
const showOnlyOpenSource = ref(false)
const filters = ref<{
  type?: ProjectType
  status?: ProjectStatus
  tech?: string
  featured?: boolean
}>({
  type: undefined,
  status: undefined,
  tech: undefined,
  featured: undefined,
})

// 默认封面
const defaultCover = 'https://via.placeholder.com/1200x400/667eea/ffffff?text=Featured+Project'

// 技术栈选项（从统计数据获取）
const techStackOptions = ref<Array<{ tech: string; count: number }>>([])

// 计算属性
const featuredProjects = computed(() => projectStore.featuredProjects)

const activeFilters = computed(() => {
  const result = []
  if (keyword.value) {
    result.push({ key: 'keyword', label: `关键词: ${keyword.value}` })
  }
  if (filters.value.type) {
    const option = PROJECT_TYPE_OPTIONS.find(o => o.value === filters.value.type)
    result.push({ key: 'type', label: `类型: ${option?.label}` })
  }
  if (filters.value.status) {
    const statusMap = { completed: '已完成', in_progress: '进行中' }
    result.push({ key: 'status', label: `状态: ${statusMap[filters.value.status]}` })
  }
  if (filters.value.tech) {
    result.push({ key: 'tech', label: `技术栈: ${filters.value.tech}` })
  }
  if (filters.value.featured) {
    result.push({ key: 'featured', label: '精选项目' })
  }
  if (showOnlyOpenSource.value) {
    result.push({ key: 'opensource', label: '开源项目' })
  }
  return result
})

const hasActiveFilters = computed(() => activeFilters.value.length > 0)

// 方法
const fetchProjects = async () => {
  await projectStore.fetchProjects({
    keyword: keyword.value || undefined,
    ...filters.value,
    featured: filters.value.featured ? true : undefined,
  })
}

const fetchTechStackStats = async () => {
  try {
    const stats = await projectStore.fetchTechStackStats()
    techStackOptions.value = stats
  } catch (error) {
    console.error('获取技术栈统计失败:', error)
  }
}

// 防抖搜索
let searchTimeout: ReturnType<typeof setTimeout>
const onKeywordInput = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    projectStore.setPage(1)
    applyFilters()
  }, 500)
}

const applyFilters = () => {
  projectStore.setFilters(filters.value)
  fetchProjects()
}

const removeFilter = (key: string) => {
  switch (key) {
    case 'keyword':
      keyword.value = ''
      break
    case 'type':
      filters.value.type = undefined
      break
    case 'status':
      filters.value.status = undefined
      break
    case 'tech':
      filters.value.tech = undefined
      break
    case 'featured':
      filters.value.featured = undefined
      break
    case 'opensource':
      showOnlyOpenSource.value = false
      break
  }
  applyFilters()
}

const resetFilters = () => {
  keyword.value = ''
  filters.value = {
    type: undefined,
    status: undefined,
    tech: undefined,
    featured: undefined,
  }
  showOnlyOpenSource.value = false
  projectStore.clearFilters()
  projectStore.setPage(1)
  fetchProjects()
}

const toggleFeatured = () => {
  filters.value.featured = !filters.value.featured
  projectStore.setPage(1)
  applyFilters()
}

const toggleOpenSource = () => {
  showOnlyOpenSource.value = !showOnlyOpenSource.value
  // 注意：后端需要支持 is_open_source 筛选
  projectStore.setPage(1)
  applyFilters()
}

const handlePageChange = (page: number) => {
  projectStore.setPage(page)
  fetchProjects()
  // 滚动到顶部
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const handleSizeChange = (size: number) => {
  projectStore.setLimit(size)
  projectStore.setPage(1)
  fetchProjects()
}

const goToDetail = (id: number) => {
  router.push(`/projects/${id}`)
}

// 生命周期
onMounted(async () => {
  await fetchProjects()
  await fetchTechStackStats()
})
</script>

<style scoped lang="scss">
.projects-page {
  min-height: calc(100vh - 60px);
  background: var(--el-bg-color-page);
}

// 内容容器：居中 + 左右边距
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

// 页面头部
.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 60px 0 40px;
  margin-bottom: 40px;
  text-align: center;

  &.full-bleed {
    margin-left: calc(-50vw + 50%);
    margin-right: calc(-50vw + 50%);
    padding-left: calc(50vw - 50%);
    padding-right: calc(50vw - 50%);
  }
}

.page-title {
  font-size: 42px;
  font-weight: 700;
  margin: 0 0 12px 0;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.page-description {
  font-size: 18px;
  opacity: 0.95;
  margin: 0 0 32px 0;
}

// 工具栏
.header-toolbar {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;

  .toolbar-item {
    flex-shrink: 0;
  }

  .search-input {
    flex: 1;
    min-width: 200px;
    max-width: 500px;

    :deep(.el-input__wrapper) {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
    }
  }
}

// 激活的筛选标签
.active-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 20px;
  align-items: center;
  justify-content: center;
}

// 筛选抽屉
.filter-content {
  padding: 0 20px 20px;

  .filter-section {
    margin-bottom: 28px;

    h4 {
      font-size: 15px;
      font-weight: 600;
      margin: 0 0 12px 0;
      color: var(--el-text-color-primary);
    }

    .el-radio-group,
    .el-checkbox-group {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .el-checkbox {
      margin: 0;
    }
  }

  .filter-actions {
    display: flex;
    gap: 12px;
    margin-top: 32px;

    .el-button {
      flex: 1;
    }
  }
}

// 统计信息
.projects-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 16px 20px;
  background: var(--el-bg-color);
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

  strong {
    color: var(--el-color-primary);
    font-size: 18px;
  }

  .quick-filters {
    display: flex;
    gap: 8px;
  }
}

// 精选项目区域
.featured-section {
  margin-bottom: 48px;

  .section-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 24px;
    font-weight: 600;
    margin: 0 0 24px 0;
    color: var(--el-text-color-primary);

    .el-icon {
      color: var(--el-color-danger);
    }
  }
}

.featured-card {
  display: flex;
  height: 100%;
  background: var(--el-bg-color);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.02);
  }

  .featured-image {
    flex: 1;
    min-width: 0;
  }

  .featured-content {
    flex: 1;
    padding: 40px;
    display: flex;
    flex-direction: column;
    justify-content: center;

    h3 {
      font-size: 28px;
      font-weight: 600;
      margin: 0 0 16px 0;
      color: var(--el-text-color-primary);
    }

    p {
      font-size: 16px;
      line-height: 1.8;
      color: var(--el-text-color-regular);
      margin: 0 0 24px 0;
    }

    .featured-tech {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
  }
}

// 项目网格
.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
  margin-bottom: 48px;
}

// 加载和空状态
.loading-container,
.empty-container {
  padding: 60px 0;
  text-align: center;
}

// 分页
.pagination-container {
  display: flex;
  justify-content: center;
  padding: 40px 0;
}

// 过渡动画
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

// 响应式
@media (max-width: 768px) {
  .page-header {
    padding: 40px 0 30px;
  }

  .page-title {
    font-size: 32px;
  }

  .page-description {
    font-size: 16px;
  }

  .projects-stats {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;

    .quick-filters {
      justify-content: center;
    }
  }

  .featured-card {
    flex-direction: column;

    .featured-content {
      padding: 24px;
    }
  }

  .projects-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}
</style>
