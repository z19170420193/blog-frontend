<template>
  <div class="categories-page">
    <!-- 页面头部 -->
    <section class="page-header">
      <div class="header-content">
        <h1 class="page-title">
          <el-icon><Collection /></el-icon>
          文章分类
        </h1>
        <p class="page-subtitle">探索不同领域的知识，发现感兴趣的内容</p>
        
        <!-- 搜索栏 -->
        <div class="search-bar">
          <el-input
            v-model="searchQuery"
            placeholder="搜索分类..."
            clearable
            size="large"
            @input="handleSearchInput"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          
          <el-select v-model="sortBy" size="large" style="width: 150px" @change="handleSort">
            <el-option label="默认排序" value="default" />
            <el-option label="文章最多" value="count" />
            <el-option label="最新更新" value="time" />
            <el-option label="名称排序" value="name" />
          </el-select>
        </div>
      </div>
    </section>

    <!-- 统计概览 -->
    <section class="stats-section">
      <div class="container">
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">
              <el-icon><FolderOpened /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.totalCategories }}</div>
              <div class="stat-label">分类总数</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">
              <el-icon><Document /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.totalArticles }}</div>
              <div class="stat-label">文章总数</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">
              <el-icon><View /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ formatNumber(stats.totalViews) }}</div>
              <div class="stat-label">总浏览量</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">
              <el-icon><TrendCharts /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.todayUpdates }}</div>
              <div class="stat-label">今日更新</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 分类展示区 -->
    <section class="categories-section">
      <div class="container">
        <!-- 工具栏 -->
        <div class="toolbar">
          <div class="result-info">
            共找到 <strong>{{ filteredCategories.length }}</strong> 个分类
          </div>
          <div class="view-controls">
            <el-radio-group v-model="viewMode" size="small">
              <el-radio-button value="grid">
                <el-icon><Grid /></el-icon>
                网格
              </el-radio-button>
              <el-radio-button value="list">
                <el-icon><List /></el-icon>
                列表
              </el-radio-button>
              <el-radio-button value="card">
                <el-icon><Postcard /></el-icon>
                卡片
              </el-radio-button>
            </el-radio-group>
          </div>
        </div>

        <!-- 加载状态 -->
        <div v-if="loading" class="loading-wrapper">
          <el-skeleton :rows="6" animated />
        </div>

        <!-- 分类内容 - 网格视图 (使用CategoryCard) -->
        <div v-else-if="viewMode === 'grid'" class="grid-view">
          <CategoryCard
            v-for="category in displayCategories"
            :key="category.id"
            :category="category"
            mode="grid"
            theme="default"
            :show-actions="true"
            @click="goToCategory"
            @view="goToCategory"
          />
        </div>

        <!-- 分类内容 - 列表视图 -->
        <div v-else-if="viewMode === 'list'" class="list-view">
          <el-table :data="displayCategories" stripe @row-click="goToCategory">
            <el-table-column width="80" align="center">
              <template #default>
                <el-icon :size="32" color="#409eff"><Folder /></el-icon>
              </template>
            </el-table-column>
            <el-table-column prop="name" label="分类名称" min-width="150" />
            <el-table-column prop="description" label="描述" min-width="250" show-overflow-tooltip>
              <template #default="{ row }">
                {{ row.description || '暂无描述' }}
              </template>
            </el-table-column>
            <el-table-column label="文章数" width="120" align="center">
              <template #default="{ row }">
                <el-tag type="primary" size="small">{{ row.article_count || 0 }} 篇</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="更新时间" width="180">
              <template #default="{ row }">
                {{ formatDate(row.updated_at) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" link @click.stop="goToCategory(row)">
                  查看
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 分类内容 - 卡片视图 (使用CategoryCard) -->
        <div v-else-if="viewMode === 'card'" class="card-view">
          <CategoryCard
            v-for="category in displayCategories"
            :key="category.id"
            :category="category"
            mode="card"
            theme="gradient"
            :show-actions="true"
            :show-decoration="true"
            @click="goToCategory"
            @view="goToCategory"
          />
        </div>

        <!-- 空状态 -->
        <el-empty v-if="!loading && filteredCategories.length === 0" description="暂无分类数据">
          <el-button type="primary" @click="resetFilters">重置筛选</el-button>
        </el-empty>

        <!-- 分页 -->
        <div v-if="totalPages > 1" class="pagination">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :total="filteredCategories.length"
            :page-sizes="[12, 24, 36, 48]"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handlePageSizeChange"
            @current-change="handlePageChange"
          />
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Collection,
  Search,
  FolderOpened,
  Document,
  View,
  TrendCharts,
  Grid,
  List,
  Postcard,
  Folder,
  ArrowRight,
} from '@element-plus/icons-vue'
import { categoryApi } from '@/api'
import type { Category } from '@/types'
import dayjs from 'dayjs'
import CategoryCard from '@/components/category/CategoryCard.vue'

const router = useRouter()

// 响应式状态
const loading = ref(false)
const categories = ref<Category[]>([])
const searchQuery = ref('')
const sortBy = ref('default')
const viewMode = ref<'grid' | 'list' | 'card'>('grid')
const currentPage = ref(1)
const pageSize = ref(12)

// 统计数据
const stats = ref({
  totalCategories: 0,
  totalArticles: 0,
  totalViews: 0,
  todayUpdates: 0,
})

// 计算属性
const filteredCategories = computed(() => {
  let result = [...categories.value]

  // 搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(
      (cat) =>
        cat.name.toLowerCase().includes(query) ||
        cat.description?.toLowerCase().includes(query)
    )
  }

  // 排序
  switch (sortBy.value) {
    case 'count':
      result.sort((a, b) => (b.article_count || 0) - (a.article_count || 0))
      break
    case 'time':
      result.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      break
    case 'name':
      result.sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'))
      break
    default:
      result.sort((a, b) => a.sort_order - b.sort_order)
      break
  }

  return result
})

const displayCategories = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredCategories.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(filteredCategories.value.length / pageSize.value)
})

// 方法
const loadCategories = async () => {
  loading.value = true
  try {
    const data = await categoryApi.getCategories()
    categories.value = data
    updateStats()
  } catch (error) {
    console.error('加载分类失败:', error)
    ElMessage.error('加载分类失败')
  } finally {
    loading.value = false
  }
}

const updateStats = () => {
  stats.value = {
    totalCategories: categories.value.length,
    totalArticles: categories.value.reduce((sum, cat) => sum + (cat.article_count || 0), 0),
    totalViews: categories.value.length * 1234, // 模拟数据
    todayUpdates: categories.value.filter((cat) => {
      const updateDate = new Date(cat.updated_at)
      const today = new Date()
      return updateDate.toDateString() === today.toDateString()
    }).length,
  }
}

let searchTimer: number | null = null
const handleSearchInput = () => {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = window.setTimeout(() => {
    currentPage.value = 1
  }, 300)
}

const handleSort = () => {
  currentPage.value = 1
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const handlePageSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
}

const resetFilters = () => {
  searchQuery.value = ''
  sortBy.value = 'default'
  currentPage.value = 1
}

const goToCategory = (category: Category) => {
  router.push({
    path: '/article',
    query: { category: category.id },
  })
}

const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD')
}

const formatNumber = (num: number) => {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + 'w'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k'
  }
  return num.toString()
}

// 生命周期
onMounted(() => {
  // 恢复视图模式
  const savedMode = localStorage.getItem('category-view-mode')
  if (savedMode) {
    viewMode.value = savedMode as 'grid' | 'list' | 'card'
  }

  loadCategories()
})

// 监听视图模式变化
watch(viewMode, (newMode) => {
  localStorage.setItem('category-view-mode', newMode)
})
</script>

<style scoped lang="scss">
.categories-page {
  min-height: 100vh;
  background: #f8f9fa;
}

/* 页面头部 - 微妙渐变设计 */
.page-header {
  background: linear-gradient(to bottom, #ffffff 0%, #f9fafb 100%);
  padding: 80px 20px 60px;
  color: #1f2937;
  text-align: center;
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: 
    background 0.8s cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 0.6s cubic-bezier(0.4, 0, 0.2, 1);

  .header-content {
    max-width: 800px;
    margin: 0 auto;
  }

  .page-title {
    font-size: 48px;
    font-weight: 700;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    // 标题使用渐变色
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;

    .el-icon {
      font-size: 48px;
      // 图标也使用渐变
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
  }

  .page-subtitle {
    font-size: 18px;
    color: #6b7280;
    margin-bottom: 40px;
  }

  .search-bar {
    display: flex;
    gap: 12px;
    max-width: 600px;
    margin: 0 auto;

    .el-input {
      flex: 1;
    }

    // 输入框样式
    :deep(.el-input__wrapper) {
      background: #ffffff;
      border: 1px solid #e5e7eb;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

      &:hover {
        border-color: #667eea;
      }

      &.is-focus {
        border-color: #667eea;
        box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
      }
    }

    :deep(.el-select .el-input__wrapper) {
      background: #ffffff;
      border: 1px solid #e5e7eb;
    }

    // 按钮样式
    :deep(.el-button) {
      background: #667eea;
      border-color: #667eea;
      color: white;

      &:hover {
        background: #5568d3;
        border-color: #5568d3;
      }
    }
  }
}

/* 统计区 */
.stats-section {
  margin-top: -30px;
  padding: 0 20px 40px;
  position: relative;
  z-index: 10;

  .container {
    max-width: 1200px;
    margin: 0 auto;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;

    .stat-card {
      background: rgba(255, 255, 255, 0.85);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.8);
      border-radius: 12px;
      padding: 24px;
      display: flex;
      align-items: center;
      gap: 20px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04);
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-4px);
        background: rgba(255, 255, 255, 0.95);
        box-shadow: 0 8px 28px rgba(0, 0, 0, 0.12), 0 4px 12px rgba(0, 0, 0, 0.08);
        border-color: rgba(255, 255, 255, 0.9);
      }

      .stat-icon {
        width: 56px;
        height: 56px;
        border-radius: 12px;
        background: linear-gradient(135deg, #667eea, #764ba2);
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        font-size: 28px;
      }

      .stat-content {
        flex: 1;

        .stat-value {
          font-size: 32px;
          font-weight: 700;
          color: #303133;
          line-height: 1;
          margin-bottom: 8px;
        }

        .stat-label {
          font-size: 14px;
          color: #909399;
        }
      }
    }
  }
}

/* 分类展示区 */
.categories-section {
  padding: 40px 20px 80px;

  .container {
    max-width: 1200px;
    margin: 0 auto;
  }

  .toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    padding: 16px 0;

    .result-info {
      color: #606266;
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 12px;
      position: relative;

      &::before {
        content: '';
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 25%, #4facfe 50%, #00f2fe 75%, #43e97b 100%);
        box-shadow: 
          0 0 0 0 rgba(240, 147, 251, 0.7),
          0 0 15px rgba(240, 147, 251, 0.6),
          0 0 30px rgba(79, 172, 254, 0.4),
          0 0 45px rgba(67, 233, 123, 0.3);
        animation: colorfulPulse 2s ease-in-out infinite;
        position: relative;
        z-index: 1;
      }

      &::after {
        content: '';
        position: absolute;
        left: 0;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(240, 147, 251, 0.4) 0%, transparent 70%);
        animation: glowRing 2s ease-in-out infinite;
      }

      strong {
        color: #409eff;
        font-size: 18px;
        font-weight: 600;
      }
    }
  }

  .loading-wrapper {
    background: #fff;
    border-radius: 12px;
    padding: 40px;
  }

  /* 网格视图 - 使用CategoryCard组件 */
  .grid-view {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 24px;
  }
  /* 列表视图 */
  .list-view {
    background: #fff;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

    :deep(.el-table) {
      .el-table__row {
        cursor: pointer;

        &:hover {
          background-color: #f5f7fa;
        }
      }
    }
  }

  /* 卡片视图 - 使用CategoryCard组件 */
  .card-view {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 24px;
  }

  /* 分页 */
  .pagination {
    margin-top: 40px;
    display: flex;
    justify-content: center;
  }
}

/* 装饰点脉动动画 */
@keyframes colorfulPulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
    box-shadow: 
      0 0 0 0 rgba(240, 147, 251, 0.7),
      0 0 15px rgba(240, 147, 251, 0.6),
      0 0 30px rgba(79, 172, 254, 0.4),
      0 0 45px rgba(67, 233, 123, 0.3);
  }
  50% {
    transform: scale(1.3);
    opacity: 0.9;
    box-shadow: 
      0 0 0 8px rgba(245, 87, 108, 0.3),
      0 0 25px rgba(245, 87, 108, 0.8),
      0 0 50px rgba(79, 172, 254, 0.6),
      0 0 75px rgba(67, 233, 123, 0.4),
      0 0 100px rgba(240, 147, 251, 0.2);
  }
}

/* 光晕环动画 */
@keyframes glowRing {
  0% {
    transform: scale(1);
    opacity: 0.8;
  }
  50% {
    transform: scale(4);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 0;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-header {
    padding: 60px 20px 40px;

    .page-title {
      font-size: 32px;

      .el-icon {
        font-size: 32px;
      }
    }

    .page-subtitle {
      font-size: 16px;
    }

    .search-bar {
      flex-direction: column;

      .el-select {
        width: 100% !important;
      }
    }
  }

  .stats-grid {
    grid-template-columns: 1fr !important;
  }

  .toolbar {
    flex-direction: column;
    align-items: stretch !important;
    gap: 12px;

    .view-controls {
      display: flex;
      justify-content: center;
    }
  }

  .grid-view {
    grid-template-columns: 1fr !important;
  }

  .card-view {
    grid-template-columns: 1fr !important;
  }
}
</style>