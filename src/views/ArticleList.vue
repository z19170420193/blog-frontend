<template>
  <div class="article-list-page">
    <!-- 页面头部（合并筛选） -->
    <div class="page-header full-bleed combined">
      <div class="container">
        <h1 class="page-title">文章列表</h1>
        <p class="page-description">探索知识的海洋，分享技术的力量</p>

        <div class="header-toolbar">
          <el-input
            v-model="filters.keyword"
            placeholder="搜索文章标题/内容…"
            clearable
            @input="onKeywordInput"
            class="toolbar-item search-input"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          <el-select v-model="filters.sortBy" class="toolbar-item sort-select" @change="applyFilters">
            <el-option label="最新" value="latest" />
            <el-option label="最热" value="popular" />
          </el-select>
          <el-button
            class="toolbar-item advanced-btn"
            type="primary"
            plain
            @click="advancedVisible = !advancedVisible"
          >
            高级筛选
          </el-button>
        </div>

        <div v-if="activeChips.length" class="active-chips">
          <el-tag
            v-for="chip in activeChips"
            :key="chip.key"
            closable
            @close="removeChip(chip)"
            effect="dark"
            type="info"
          >
            {{ chip.label }}
          </el-tag>
          <el-button link type="primary" @click="handleResetFilters">清空全部</el-button>
        </div>

        <!-- 高级筛选抽屉 -->
        <el-drawer
          v-model="advancedVisible"
          direction="rtl"
          title="高级筛选"
          :size="360"
        >
          <div class="filter-content">
            <!-- 分类筛选 -->
            <div class="filter-section">
              <h4>分类</h4>
              <el-radio-group v-model="filters.categoryId" @change="applyFilters">
                <el-radio :label="undefined">全部</el-radio>
                <el-radio v-for="cat in categories" :key="cat.id" :label="cat.id">
                  {{ cat.name }}
                </el-radio>
              </el-radio-group>
            </div>

            <!-- 标签筛选 -->
            <div class="filter-section">
              <h4>标签</h4>
              <el-checkbox-group v-model="filters.tagIds" @change="applyFilters">
                <el-checkbox v-for="tag in tags" :key="tag.id" :label="tag.id">
                  {{ tag.name }}
                </el-checkbox>
              </el-checkbox-group>
            </div>

            <!-- 日期筛选 -->
            <div class="filter-section">
              <h4>发布日期</h4>
              <el-date-picker
                v-model="dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                @change="handleDateChange"
                style="width: 100%"
              />
            </div>

            <!-- 特殊筛选 -->
            <div class="filter-section">
              <h4>特殊标记</h4>
              <el-checkbox v-model="filters.isTop" @change="applyFilters">置顶文章</el-checkbox>
            </div>

            <div class="filter-actions">
              <el-button @click="handleResetFilters">重置</el-button>
              <el-button type="primary" @click="advancedVisible = false">确定</el-button>
            </div>
          </div>
        </el-drawer>
      </div>
    </div>

    <!-- Sticky 工具条（滚动后出现） -->
    <div class="sticky-toolbar" v-show="isSticky">
      <div class="container">
        <div class="sticky-inner">
          <el-input
            v-model="filters.keyword"
            placeholder="搜索…"
            clearable
            @input="onKeywordInput"
            class="sticky-search-input"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          <el-select
            v-model="filters.sortBy"
            @change="applyFilters"
            class="hide-mobile sticky-sort-select"
          >
            <el-option label="最新" value="latest" />
            <el-option label="最热" value="popular" />
          </el-select>
          <el-button class="advanced-btn" type="primary" plain @click="advancedVisible = true">
            筛选
          </el-button>
          <div class="chips" v-if="activeChips.length">
            <el-tag
              v-for="chip in activeChips"
              :key="chip.key"
              closable
              @close="removeChip(chip)"
              size="small"
            >
              {{ chip.label }}
            </el-tag>
          </div>
        </div>
      </div>
    </div>

    <!-- 页面主要内容容器 -->
    <div class="container">
      <!-- 文章统计 -->
      <div class="article-stats">
        <span>共找到 <strong>{{ total }}</strong> 篇文章</span>
        <div class="view-modes">
          <el-button-group>
            <el-button
              :type="viewMode === 'grid' ? 'primary' : 'default'"
              @click="viewMode = 'grid'"
            >
              <el-icon><Grid /></el-icon>
              网格
            </el-button>
            <el-button
              :type="viewMode === 'list' ? 'primary' : 'default'"
              @click="viewMode = 'list'"
            >
              <el-icon><List /></el-icon>
              列表
            </el-button>
          </el-button-group>
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="6" animated />
      </div>

      <!-- 文章列表 -->
      <div v-else-if="articles.length > 0" class="article-container" :class="`view-${viewMode}`">
        <transition-group name="fade-slide">
          <div
            v-for="article in articles"
            :key="article.id"
            class="article-item"
          >
            <ArticleCard :article="article" :mode="viewMode" />
          </div>
        </transition-group>
      </div>

      <!-- 空状态 -->
      <div v-else class="empty-container">
        <el-empty description="暂无文章">
          <el-button type="primary" @click="handleResetFilters">重置筛选条件</el-button>
        </el-empty>
      </div>

      <!-- 分页 -->
      <div v-if="total > 0" class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 30, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          background
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Grid, List, Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'
import ArticleCard from '@/components/article/ArticleCard.vue'
import { getArticles } from '@/api/article'
import { getCategories } from '@/api/category'
import { getTags } from '@/api/tag'
import type { Article, ArticleListResponse } from '@/types/article'
import type { Category } from '@/types/category'
import type { Tag } from '@/types/tag'

const route = useRoute()
const router = useRouter()

// 响应式数据
const loading = ref(false)
const articles = ref<Article[]>([])
const categories = ref<Category[]>([])
const tags = ref<Tag[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)
const viewMode = ref<'grid' | 'list'>('grid')
const dateRange = ref<[Date, Date] | null>(null)

// 合并页头/Sticky 工具条相关
const advancedVisible = ref(false)
const isSticky = ref(false)
let typingTimer: ReturnType<typeof setTimeout> | null = null

// 筛选条件
const filters = ref<{
  keyword: string
  categoryId: number | undefined
  tagIds: number[]
  sortBy: string
  isTop: boolean | undefined
  startDate: string | undefined
  endDate: string | undefined
}>({
  keyword: '',
  categoryId: undefined,
  tagIds: [],
  sortBy: 'latest',
  isTop: undefined,
  startDate: undefined,
  endDate: undefined,
})

// 获取文章列表
const fetchArticles = async () => {
  loading.value = true
  try {
    const params: any = {
      page: currentPage.value,
      limit: pageSize.value,
      status: 'published', // 只显示已发布的文章
    }

    if (filters.value.keyword) params.keyword = filters.value.keyword
    if (filters.value.categoryId) params.category_id = filters.value.categoryId
    if (filters.value.tagIds.length > 0) params.tag_id = filters.value.tagIds[0]
    if (filters.value.sortBy === 'popular') {
      params.sort = 'views'
      params.order = 'DESC'
    } else {
      params.sort = 'published_at'
      params.order = 'DESC'
    }
    if (filters.value.isTop !== undefined) params.is_top = filters.value.isTop
    if (filters.value.startDate) params.start_date = filters.value.startDate
    if (filters.value.endDate) params.end_date = filters.value.endDate

    const response = await getArticles(params) as ArticleListResponse
    
    // 兼容不同的后端响应格式
    articles.value = response.articles || response.items || []
    total.value = response.total || 0
  } catch (error) {
    console.error('获取文章列表失败:', error)
    ElMessage.error('获取文章列表失败')
    articles.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

// 获取分类列表
const fetchCategories = async () => {
  try {
    const response = await getCategories()
    categories.value = Array.isArray(response) ? response : []
  } catch (error) {
    console.error('获取分类列表失败:', error)
    categories.value = []
  }
}

// 获取标签列表
const fetchTags = async () => {
  try {
    const response = await getTags()
    tags.value = Array.isArray(response) ? response : []
  } catch (error) {
    console.error('获取标签列表失败:', error)
    tags.value = []
  }
}

// 处理日期范围变化
const handleDateChange = (value: [Date, Date] | null) => {
  if (value && value.length === 2) {
    filters.value.startDate = dayjs(value[0]).format('YYYY-MM-DD')
    filters.value.endDate = dayjs(value[1]).format('YYYY-MM-DD')
  } else {
    filters.value.startDate = undefined
    filters.value.endDate = undefined
  }
  applyFilters()
}

// 处理分页变化
const handlePageChange = (page: number) => {
  currentPage.value = page
  fetchArticles()
  // 滚动到顶部
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  fetchArticles()
}

// 重置筛选条件
const handleResetFilters = () => {
  filters.value = {
    keyword: '',
    categoryId: undefined,
    tagIds: [],
    sortBy: 'latest',
    isTop: undefined,
    startDate: undefined,
    endDate: undefined,
  }
  dateRange.value = null
  currentPage.value = 1
  fetchArticles()
  router.push('/article')
}

// 更新URL查询参数
const updateQueryParams = () => {
  const query: any = {}
  if (filters.value.keyword) query.keyword = filters.value.keyword
  if (filters.value.categoryId) query.category = filters.value.categoryId
  if (filters.value.tagIds.length > 0) query.tags = filters.value.tagIds.join(',')
  if (filters.value.sortBy !== 'latest') query.sort = filters.value.sortBy
  if (currentPage.value > 1) query.page = currentPage.value

  router.push({ path: '/article', query })
}

// 工具函数
const findCategoryName = (id?: number) => {
  if (!id) return ''
  const c = categories.value.find((x) => x.id === id)
  return c?.name || `#${id}`
}

const findTagName = (id?: number) => {
  if (!id) return ''
  const t = tags.value.find((x) => x.id === id)
  return t?.name || `#${id}`
}

const onKeywordInput = () => {
  if (typingTimer) clearTimeout(typingTimer)
  typingTimer = setTimeout(() => applyFilters(), 300)
}

const applyFilters = () => {
  currentPage.value = 1
  fetchArticles()
  updateQueryParams()
}

// 活跃的筛选标签
const activeChips = computed(() => {
  const chips: { key: string; label: string; remove: () => void }[] = []
  
  if (filters.value.categoryId) {
    chips.push({
      key: 'category',
      label: `分类: ${findCategoryName(filters.value.categoryId)}`,
      remove: () => {
        filters.value.categoryId = undefined
        applyFilters()
      },
    })
  }
  
  if (filters.value.tagIds && filters.value.tagIds.length > 0) {
    const names = filters.value.tagIds.map((id) => findTagName(id)).filter(Boolean)
    const label =
      names.length <= 3
        ? `标签: ${names.join('、')}`
        : `标签: ${names.slice(0, 3).join('、')} 等${names.length}个`
    chips.push({
      key: 'tags',
      label,
      remove: () => {
        filters.value.tagIds = []
        applyFilters()
      },
    })
  }
  
  if (filters.value.keyword) {
    chips.push({
      key: 'kw',
      label: `关键词: ${filters.value.keyword}`,
      remove: () => {
        filters.value.keyword = ''
        applyFilters()
      },
    })
  }
  
  if (filters.value.sortBy && filters.value.sortBy !== 'latest') {
    chips.push({
      key: 'sort',
      label: `排序: ${filters.value.sortBy === 'popular' ? '最热' : filters.value.sortBy}`,
      remove: () => {
        filters.value.sortBy = 'latest'
        applyFilters()
      },
    })
  }
  
  return chips
})

const removeChip = (chip: { remove: () => void }) => chip.remove()

const handleScroll = () => {
  const top = window.pageYOffset || document.documentElement.scrollTop
  isSticky.value = top > 140
}

// 从URL查询参数初始化筛选条件
const initFromQuery = () => {
  const query = route.query
  if (query.keyword) filters.value.keyword = query.keyword as string
  if (query.category) filters.value.categoryId = Number(query.category)
  if (query.tags) {
    filters.value.tagIds = (query.tags as string).split(',').map(Number)
  }
  if (query.sort) filters.value.sortBy = query.sort as string
  if (query.page) currentPage.value = Number(query.page)
}

// 监听路由变化
watch(
  () => route.query,
  () => {
    if (route.path === '/article') {
      initFromQuery()
      fetchArticles()
    }
  }
)

// 页面初始化
onMounted(() => {
  initFromQuery()
  fetchArticles()
  fetchCategories()
  fetchTags()

  window.addEventListener('scroll', handleScroll)
  handleScroll()

  // 从localStorage恢复视图模式
  const savedViewMode = localStorage.getItem('articleViewMode')
  if (savedViewMode === 'list' || savedViewMode === 'grid') {
    viewMode.value = savedViewMode
  }
})

// 监听视图模式变化
watch(viewMode, (newMode) => {
  localStorage.setItem('articleViewMode', newMode)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  if (typingTimer) clearTimeout(typingTimer)
})
</script>

<style scoped lang="scss">
.article-list-page {
  min-height: 100vh;
  padding: 0;
  background: #f5f7fa;

  // 内容容器：居中 + 左右边距
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
  }

  .page-header {
    text-align: center;
    margin-bottom: 40px;
    padding: 60px 20px;
    // 微妙渐变：白色到浅灰
    background: linear-gradient(to bottom, #ffffff 0%, #f9fafb 100%);
    color: #1f2937;
    border-bottom: 1px solid #e5e7eb;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    // 平滑过渡
    transition: 
      background 0.8s cubic-bezier(0.4, 0, 0.2, 1),
      box-shadow 0.6s cubic-bezier(0.4, 0, 0.2, 1);

    .page-title {
      margin: 0 0 10px;
      font-size: 36px;
      font-weight: 700;
      // 标题保留渐变色，更精致
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .page-description {
      margin: 0;
      font-size: 16px;
      color: #6b7280;
    }
  }

  .article-stats {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding: 0 10px;

    strong {
      color: var(--el-color-primary);
      font-size: 18px;
    }
  }

  .loading-container {
    background: #fff;
    padding: 20px;
    border-radius: 8px;
  }

  .article-container {
    &.view-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 24px; // 从 20px 增加到 24px，更舒适的间距

      .article-item {
        height: 520px; // 固定高度，保证网格整齐
      }
    }

    &.view-list {
      .article-item {
        margin-bottom: 20px;
      }
    }
  }

  .empty-container {
    background: #fff;
    padding: 60px 20px;
    border-radius: 8px;
    text-align: center;
  }

  .pagination-container {
    display: flex;
    justify-content: center;
    margin-top: 40px;
    padding-bottom: 40px;
  }
}

// 动画效果
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

// 页面头部样式
.page-header.combined {
  padding-bottom: 20px;
}

.header-toolbar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  flex-wrap: nowrap;
  margin-top: 16px;
}

.header-toolbar .search-input {
  flex: 0 1 auto;
  width: clamp(320px, 42vw, 560px);
  min-width: 280px;
}

.header-toolbar .sort-select {
  width: 160px;
}

.header-toolbar .advanced-btn {
  white-space: nowrap;
}

.advanced-btn {
  // 使用品牌色作为按钮主色
  background-color: #667eea !important;
  color: white !important;
  border: none !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.advanced-btn:hover,
.advanced-btn:focus {
  background-color: #5568d3 !important;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.active-chips {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-top: 12px;
  flex-wrap: wrap;
  justify-content: center;
}

// Sticky 工具条样式
.sticky-toolbar {
  position: sticky;
  top: 64px;
  z-index: 900;
  background: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color-lighter);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.sticky-toolbar .sticky-inner {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: center;
  padding: 10px 0;
  flex-wrap: nowrap;
}

.sticky-toolbar .sticky-search-input {
  flex: 0 1 auto;
  width: clamp(280px, 38vw, 500px);
  min-width: 240px;
}

.sticky-toolbar .sticky-sort-select {
  width: 140px;
}

.sticky-toolbar .chips {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.sticky-toolbar .advanced-btn {
  background-color: #667eea !important;
  color: white !important;
  border: none !important;
}

.sticky-toolbar .advanced-btn:hover,
.sticky-toolbar .advanced-btn:focus {
  background-color: #5568d3 !important;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

// 高级筛选抽屉内容
.filter-content {
  padding: 20px;

  .filter-section {
    margin-bottom: 30px;

    h4 {
      margin: 0 0 12px;
      font-size: 14px;
      font-weight: 600;
      color: #303133;
    }

    :deep(.el-radio-group) {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    :deep(.el-checkbox-group) {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
  }

  .filter-actions {
    display: flex;
    gap: 12px;
    margin-top: 30px;

    .el-button {
      flex: 1;
    }
  }
}

// 响应式设计
@media (max-width: 1200px) {
  .article-list-page {
    .article-container.view-grid {
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    }
  }
}

@media (max-width: 768px) {
  .article-list-page {
    padding: 0;

    // 移动端调整左右边距
    .container {
      padding: 0 16px;
    }

    // 移动端使用自适应高度
    .article-container.view-grid .article-item {
      height: auto;
    }

    .page-header {
      padding: 30px 15px;

      .page-title {
        font-size: 28px;
      }

      .page-description {
        font-size: 14px;
      }
    }

    .article-stats {
      flex-direction: column;
      gap: 10px;
      align-items: flex-start;
    }

    .article-container.view-grid {
      grid-template-columns: 1fr;
    }
  }

  .hide-mobile {
    display: none;
  }

  .header-toolbar {
    flex-wrap: wrap;
    justify-content: center;

    .search-input {
      flex-basis: 100%;
      min-width: 0;
      width: 100%;
    }
  }

  .sticky-toolbar .sticky-inner {
    flex-wrap: wrap;
    justify-content: center;

    .sticky-search-input {
      flex-basis: 100%;
      min-width: 0;
      width: 100%;
    }
  }
}
</style>