<template>
  <div class="tags-page">
    <!-- 页面头部 -->
    <section class="page-header">
      <div class="header-bg">
        <div class="pattern-overlay"></div>
      </div>
      <div class="header-content">
        <h1 class="page-title">
          <el-icon class="title-icon"><PriceTag /></el-icon>
          标签云
        </h1>
        <p class="page-subtitle">探索不同主题的精彩内容</p>
        
        <!-- 搜索和筛选工具栏 -->
        <div class="header-toolbar">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索标签..."
            size="large"
            clearable
            @input="handleSearchInput"
            @keyup.enter="handleSearch"
            class="toolbar-item search-input"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>

          <el-select
            v-model="sortBy"
            placeholder="排序方式"
            size="large"
            class="toolbar-item sort-select"
            @change="handleSortChange"
          >
            <el-option label="热门优先" value="useCount" />
            <el-option label="名称 A-Z" value="name" />
            <el-option label="最新创建" value="createdAt" />
          </el-select>

          <el-button 
            class="toolbar-item advanced-btn" 
            type="primary" 
            plain 
            size="large" 
            @click="advancedVisible = true"
          >
            高级筛选
          </el-button>
        </div>
      </div>
    </section>

    <!-- 高级筛选抽屉 -->
    <el-drawer
      v-model="advancedVisible"
      direction="rtl"
      title="高级筛选"
      :size="420"
    >
      <el-form label-width="100px" class="advanced-form">
        <!-- 时间范围 -->
        <el-form-item label="创建时间">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            unlink-panels
          />
        </el-form-item>

        <!-- 使用次数 -->
        <el-form-item label="使用次数 ≥">
          <el-slider v-model="minUseCount" :min="0" :max="maxUseCount" show-input />
        </el-form-item>

        <!-- 颜色筛选 -->
        <el-form-item label="颜色">
          <div class="color-row">
            <el-checkbox v-model="hasColor">仅有颜色</el-checkbox>
            <el-button 
              v-if="colorPick" 
              link 
              type="primary" 
              class="clear-color" 
              @click="colorPick = null"
            >
              清除选择
            </el-button>
          </div>
          <div class="color-swatches">
            <button
              v-for="opt in colorOptions"
              :key="opt"
              type="button"
              class="swatch"
              :class="{ selected: colorPick === opt }"
              :style="{ background: opt }"
              @click="selectColor(opt)"
              :title="opt"
            />
          </div>
        </el-form-item>

        <!-- 热门标签 -->
        <el-form-item label="热门">
          <el-checkbox v-model="onlyPopular">仅热门（>5篇）</el-checkbox>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="applyAdvancedFilters">应用</el-button>
          <el-button @click="resetAdvancedFilters">重置</el-button>
        </el-form-item>
      </el-form>
    </el-drawer>

    <!-- 统计概览 -->
    <section class="stats-overview" v-if="stats">
      <div class="container">
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">
              <el-icon><Collection /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.total }}</div>
              <div class="stat-label">全部标签</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">
              <el-icon><Document /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.articles }}</div>
              <div class="stat-label">相关文章</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">
              <el-icon><TrendCharts /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.popular }}</div>
              <div class="stat-label">热门标签</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <div class="container">
      <!-- 列表工具条 -->
      <div class="list-toolbar">
        <div class="result-count">
          共找到 <strong>{{ displayTags.length }}</strong> 个标签
        </div>
        <div class="view-switcher">
          <el-radio-group v-model="viewMode" size="default">
            <el-radio-button value="cloud">
              <el-icon><Cloudy /></el-icon>
              标签云
            </el-radio-button>
            <el-radio-button value="card">
              <el-icon><Grid /></el-icon>
              卡片
            </el-radio-button>
          </el-radio-group>

          <!-- 视图配置 -->
          <div class="view-config">
            <el-dropdown trigger="click" placement="bottom-end">
              <el-button size="small" type="primary" text>
                <el-icon><Setting /></el-icon>
                {{ viewMode === 'cloud' ? '云图配置' : '卡片配置' }}
              </el-button>
              <template #dropdown>
                <el-dropdown-menu class="view-config-menu">
                  <!-- 标签云配置 -->
                  <div v-if="viewMode === 'cloud'">
                    <div class="config-section preset-section">
                      <div class="config-label">快速预设</div>
                      <div class="preset-buttons">
                        <el-button size="small" @click="applyPreset('classic')">经典</el-button>
                        <el-button size="small" @click="applyPreset('minimal')">简约</el-button>
                        <el-button size="small" @click="applyPreset('colorful')">多彩</el-button>
                        <el-button size="small" @click="applyPreset('professional')">专业</el-button>
                      </div>
                    </div>

                    <el-divider style="margin: 12px 0;" />

                    <div class="config-section">
                      <div class="config-label">布局模式</div>
                      <el-radio-group v-model="cloudConfig.layout" size="small">
                        <el-radio-button value="balanced">平衡</el-radio-button>
                        <el-radio-button value="compact">紧凑</el-radio-button>
                        <el-radio-button value="sparse">稀疏</el-radio-button>
                      </el-radio-group>
                    </div>

                    <div class="config-section">
                      <div class="config-label">颜色方案</div>
                      <el-radio-group v-model="cloudConfig.colorScheme" size="small">
                        <el-radio-button value="dynamic">动态</el-radio-button>
                        <el-radio-button value="rainbow">彩虹</el-radio-button>
                        <el-radio-button value="monochrome">单色</el-radio-button>
                      </el-radio-group>
                    </div>

                    <div class="config-section">
                      <div class="config-label">动画效果</div>
                      <el-radio-group v-model="cloudConfig.animation" size="small">
                        <el-radio-button value="none">无</el-radio-button>
                        <el-radio-button value="gentle">轻柔</el-radio-button>
                        <el-radio-button value="lively">活泼</el-radio-button>
                      </el-radio-group>
                    </div>
                  </div>

                  <!-- 卡片视图配置 -->
                  <div v-else-if="viewMode === 'card'">
                    <div class="config-section">
                      <div class="config-label">卡片主题</div>
                      <el-radio-group v-model="cardConfig.theme" size="small">
                        <el-radio-button value="colorful">多彩</el-radio-button>
                        <el-radio-button value="minimal">简约</el-radio-button>
                        <el-radio-button value="elegant">优雅</el-radio-button>
                      </el-radio-group>
                    </div>

                    <div class="config-section">
                      <div class="config-label">卡片尺寸</div>
                      <el-radio-group v-model="cardConfig.size" size="small">
                        <el-radio-button value="compact">紧凑</el-radio-button>
                        <el-radio-button value="normal">标准</el-radio-button>
                        <el-radio-button value="large">宽松</el-radio-button>
                      </el-radio-group>
                    </div>

                    <div class="config-section">
                      <div class="config-label">动画强度</div>
                      <el-radio-group v-model="cardConfig.animation" size="small">
                        <el-radio-button value="none">无</el-radio-button>
                        <el-radio-button value="subtle">轻微</el-radio-button>
                        <el-radio-button value="normal">标准</el-radio-button>
                        <el-radio-button value="strong">强烈</el-radio-button>
                      </el-radio-group>
                    </div>
                  </div>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </div>

      <!-- 标签展示区域 -->
      <div class="tags-container" v-loading="loading">
        <!-- 标签云视图 -->
        <div v-if="viewMode === 'cloud'" class="cloud-view">
          <transition-group
            :name="cloudConfig.animation !== 'none' ? 'tag-fade' : ''"
            tag="div"
            class="tag-cloud"
            :class="`layout-${cloudConfig.layout} scheme-${cloudConfig.colorScheme}`"
          >
            <span
              v-for="(tag, index) in displayTags"
              :key="tag.id"
              class="cloud-tag"
              :class="`animation-${cloudConfig.animation}`"
              :style="getTagCloudStyle(tag, index)"
              @click="goToTagDetail(tag)"
            >
              {{ tag.name }}
              <span class="tag-count">({{ tag.article_count || 0 }})</span>
            </span>
          </transition-group>
        </div>

        <!-- 卡片视图 -->
        <div v-else-if="viewMode === 'card'" class="card-view">
          <transition-group
            name="card-fade"
            tag="div"
            class="cards-container"
            :class="`size-${cardConfig.size} animation-${cardConfig.animation}`"
          >
            <TagCard
              v-for="tag in displayTags"
              :key="tag.id"
              :tag="tag"
              :mode="getCardMode()"
              :theme="getCardTheme()"
              :show-actions="cardConfig.size !== 'compact'"
              :show-popularity-bar="cardConfig.size === 'large'"
              @click="goToTagDetail(tag)"
              @view="goToTagDetail(tag)"
            />
          </transition-group>
        </div>

        <!-- 空状态 -->
        <el-empty
          v-if="!loading && displayTags.length === 0"
          description="暂无标签"
          :image-size="200"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  Search,
  PriceTag,
  Cloudy,
  Grid,
  Collection,
  Document,
  TrendCharts,
  ArrowRight,
  Setting
} from '@element-plus/icons-vue'
import { tagApi } from '@/api'
import type { Tag } from '@/types'
import dayjs from 'dayjs'
import TagCard from '@/components/tag/TagCard.vue'

const router = useRouter()

// 响应式数据
const loading = ref(false)
const tags = ref<Tag[]>([])
const searchKeyword = ref('')
const sortBy = ref('useCount')
const viewMode = ref<'cloud' | 'card'>('cloud')
const stats = ref({
  total: 0,
  articles: 0,
  popular: 0
})

// 高级筛选状态
const advancedVisible = ref(false)
const dateRange = ref<string[] | []>([])
const minUseCount = ref(0)
const hasColor = ref(false)
const colorPick = ref<string | null>(null)
const onlyPopular = ref(false)

// 衍生数据
const maxUseCount = computed(() => Math.max(0, ...tags.value.map(t => t.article_count || 0)))
const colorOptions = computed(() => Array.from(new Set(tags.value.map(t => t.color).filter(Boolean))) as string[])

// 计算属性：过滤和排序标签
const displayTags = computed(() => {
  let result = [...tags.value]

  // 搜索过滤
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(tag =>
      tag.name.toLowerCase().includes(keyword)
    )
  }

  // 高级筛选
  if (minUseCount.value > 0) {
    result = result.filter(tag => (tag.article_count || 0) >= minUseCount.value)
  }
  if (hasColor.value) {
    result = result.filter(tag => !!tag.color)
  }
  if (colorPick.value) {
    result = result.filter(tag => tag.color === colorPick.value)
  }
  if (onlyPopular.value) {
    result = result.filter(tag => (tag.article_count || 0) > 5)
  }
  if (Array.isArray(dateRange.value) && dateRange.value.length === 2) {
    const [start, end] = dateRange.value
    const s = new Date(start + 'T00:00:00')
    const e = new Date(end + 'T23:59:59')
    result = result.filter(tag => {
      const d = new Date(tag.created_at || tag.updated_at || 0)
      return isFinite(d.getTime()) ? (d >= s && d <= e) : true
    })
  }

  // 排序
  result.sort((a, b) => {
    switch (sortBy.value) {
      case 'useCount':
        return (b.article_count || 0) - (a.article_count || 0)
      case 'name':
        return a.name.localeCompare(b.name)
      case 'createdAt':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      default:
        return 0
    }
  })

  return result
})

// 标签云配置
const cloudConfig = ref({
  layout: 'balanced' as 'balanced' | 'compact' | 'sparse',
  colorScheme: 'dynamic' as 'dynamic' | 'monochrome' | 'rainbow',
  animation: 'gentle' as 'none' | 'gentle' | 'lively'
})

// 卡片视图配置
const cardConfig = ref({
  theme: 'colorful' as 'colorful' | 'minimal' | 'elegant',
  size: 'normal' as 'compact' | 'normal' | 'large',
  animation: 'normal' as 'none' | 'subtle' | 'normal' | 'strong'
})

// 映射卡片模式
const getCardMode = () => {
  if (cardConfig.value.size === 'compact') return 'grid'
  if (cardConfig.value.size === 'large') return 'card'
  return 'card'
}

// 映射卡片主题
const getCardTheme = () => {
  const themeMap: Record<string, 'default' | 'gradient' | 'flat' | 'outlined'> = {
    colorful: 'default',
    minimal: 'flat',
    elegant: 'gradient'
  }
  return themeMap[cardConfig.value.theme] || 'default'
}

// 预设配置
const presetConfigs = {
  classic: {
    layout: 'balanced' as const,
    colorScheme: 'dynamic' as const,
    animation: 'gentle' as const
  },
  minimal: {
    layout: 'compact' as const,
    colorScheme: 'monochrome' as const,
    animation: 'none' as const
  },
  colorful: {
    layout: 'sparse' as const,
    colorScheme: 'rainbow' as const,
    animation: 'lively' as const
  },
  professional: {
    layout: 'balanced' as const,
    colorScheme: 'dynamic' as const,
    animation: 'gentle' as const
  }
}

// 应用预设配置
const applyPreset = (presetName: keyof typeof presetConfigs) => {
  cloudConfig.value = { ...presetConfigs[presetName] }
}

// 颜色方案
const colorSchemes = {
  dynamic: [
    '#667eea', '#764ba2', '#f093fb', '#f5576c',
    '#4facfe', '#00f2fe', '#43e97b', '#38f9d7',
    '#ffecd2', '#fcb69f', '#a8edea', '#fed6e3'
  ],
  monochrome: [
    '#1f2937', '#374151', '#4b5563', '#6b7280',
    '#9ca3af', '#d1d5db', '#e5e7eb', '#f3f4f6'
  ],
  rainbow: [
    '#ef4444', '#f97316', '#f59e0b', '#eab308',
    '#84cc16', '#22c55e', '#10b981', '#14b8a6',
    '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
    '#8b5cf6', '#a855f7', '#d946ef', '#ec4899'
  ]
}

// 获取标签云样式
const getTagCloudStyle = (tag: Tag, index: number) => {
  const maxCount = Math.max(...tags.value.map(t => t.article_count || 0))
  const minCount = Math.min(...tags.value.map(t => t.article_count || 0))
  const useCount = tag.article_count || 0

  // 智能尺寸计算
  const baseMin = 14, baseMax = 48
  const normalized = maxCount > minCount
    ? Math.log(useCount + 1) / Math.log(maxCount + 1)
    : 0.5
  const size = baseMin + normalized * (baseMax - baseMin)

  // 颜色选择
  let color = tag.color
  if (!color || cloudConfig.value.colorScheme !== 'dynamic') {
    const colors = colorSchemes[cloudConfig.value.colorScheme]
    color = colors[index % colors.length]
  }

  // 透明度和权重
  const popularity = maxCount > 0 ? useCount / maxCount : 0
  const opacity = 0.7 + popularity * 0.3
  const fontWeight = 400 + Math.floor(popularity * 300)

  // 布局相关样式
  const padding = `${Math.max(4, size / 10)}px ${Math.max(8, size / 5)}px`
  const margin = `${Math.max(2, size / 16)}px ${Math.max(4, size / 8)}px`

  // 动画配置
  let transition = 'none'
  if (cloudConfig.value.animation === 'gentle') {
    transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
  } else if (cloudConfig.value.animation === 'lively') {
    transition = 'all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
  }

  return {
    fontSize: `${size}px`,
    fontWeight,
    color,
    opacity,
    padding,
    margin,
    cursor: 'pointer',
    transition,
    display: 'inline-block',
    borderRadius: `${Math.max(4, size / 8)}px`,
    background: `linear-gradient(135deg, ${color}15, ${color}08)`,
    border: `1px solid ${color}08`,
    backdropFilter: 'blur(5px)',
    position: 'relative',
    '--hover-border-color': `${color}35`
  }
}

// 获取标签列表
const fetchTags = async () => {
  loading.value = true
  try {
    const data = await tagApi.getTags()
    tags.value = data
    updateStats()
  } catch (error) {
    console.error('获取标签列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 更新统计信息
const updateStats = () => {
  stats.value = {
    total: tags.value.length,
    articles: tags.value.reduce((sum, tag) => sum + (tag.article_count || 0), 0),
    popular: tags.value.filter(tag => (tag.article_count || 0) > 5).length
  }
}

// 搜索处理
const handleSearch = () => {
  // 搜索已通过计算属性实现
}

let typingTimer: any = null
const handleSearchInput = () => {
  if (typingTimer) clearTimeout(typingTimer)
  typingTimer = setTimeout(() => {}, 300)
}

// 排序处理
const handleSortChange = () => {
  // 排序已通过计算属性实现
}

// 选择颜色
const selectColor = (c: string) => {
  colorPick.value = colorPick.value === c ? null : c
}

// 高级筛选应用/重置
const applyAdvancedFilters = () => {
  advancedVisible.value = false
}

const resetAdvancedFilters = () => {
  dateRange.value = []
  minUseCount.value = 0
  hasColor.value = false
  colorPick.value = null
  onlyPopular.value = false
}

// 格式化日期方法（仅用于标签云）
const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD')
}

// 跳转到标签详情页
const goToTagDetail = (tag: Tag) => {
  router.push({
    path: '/tag/' + tag.id
  })
}

onMounted(() => {
  // 恢复视图模式
  const savedMode = localStorage.getItem('tag-view-mode')
  if (savedMode === 'cloud' || savedMode === 'card') {
    viewMode.value = savedMode
  }

  fetchTags()
})

onUnmounted(() => {
  if (typingTimer) clearTimeout(typingTimer)
})
</script>

<style scoped lang="scss">
.tags-page {
  min-height: 100vh;
  padding: 0;

  // 容器样式
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
  }

  // 页面头部 - 微妙渐变设计
  .page-header {
    position: relative;
    padding: 120px 0 80px;
    background: linear-gradient(to bottom, #ffffff 0%, #f9fafb 100%);
    color: #1f2937;
    overflow: hidden;
    border-bottom: 1px solid #e5e7eb;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    transition: 
      background 0.8s cubic-bezier(0.4, 0, 0.2, 1),
      box-shadow 0.6s cubic-bezier(0.4, 0, 0.2, 1);

    .header-bg {
      position: absolute;
      inset: 0;
      opacity: 0.3;

      .pattern-overlay {
        position: absolute;
        width: 100%;
        height: 100%;
        background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23667eea' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
      }
    }

    .header-content {
      position: relative;
      z-index: 1;
      max-width: 800px;
      margin: 0 auto;
      text-align: center;
      padding: 0 20px;

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

        .title-icon { 
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

      .header-toolbar {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        flex-wrap: nowrap;
        margin-top: 12px;

        .search-input { 
          flex: 0 1 auto; 
          width: clamp(320px, 42vw, 560px); 
          min-width: 280px; 
        }
        
        .sort-select { 
          width: 160px; 
        }
        
        .advanced-btn { 
          background-color: #667eea !important; 
          color: white !important; 
          border: none !important;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

          &:hover, &:focus { 
            background-color: #5568d3 !important;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
          }
        }
      }
    }
  }

  // 统计概览
  .stats-overview {
    margin-top: -40px;
    margin-bottom: 40px;
    position: relative;
    z-index: 10;

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 24px;
    }

    .stat-card {
      background: rgba(255, 255, 255, 0.85);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.8);
      border-radius: 16px;
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
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        background: linear-gradient(135deg, var(--el-color-primary-light-3), var(--el-color-primary));
        color: #fff;
      }

      .stat-info {
        .stat-value {
          font-size: 28px;
          font-weight: 700;
          color: var(--el-text-color-primary);
          line-height: 1;
          margin-bottom: 6px;
        }
        .stat-label {
          font-size: 14px;
          color: var(--el-text-color-secondary);
        }
      }
    }
  }

  .list-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 8px 0 24px;
    flex-wrap: wrap;
    gap: 12px;

    .result-count { 
      color: var(--el-text-color-regular);
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
        color: var(--el-color-primary); 
        font-weight: 600; 
      }
    }

    .view-config {
      margin-left: 16px;
    }
  }

  // 标签容器
  .tags-container {
    min-height: 400px;
    
    // 标签云视图
    .cloud-view {
      background: linear-gradient(135deg, #f8f9ff 0%, #ffffff 100%);
      border-radius: 24px;
      padding: 60px 40px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      position: relative;
      overflow: hidden;

      &::before {
        content: '';
        position: absolute;
        top: -20px;
        left: -20px;
        right: -20px;
        bottom: -20px;
        background: radial-gradient(circle at 30% 20%, rgba(102, 126, 234, 0.05) 0%, transparent 50%),
                    radial-gradient(circle at 70% 80%, rgba(118, 75, 162, 0.05) 0%, transparent 50%);
        pointer-events: none;
        z-index: 0;
      }

      .tag-cloud {
        position: relative;
        z-index: 1;
        text-align: center;

        &.layout-balanced {
          line-height: 1.8;
        }

        &.layout-compact {
          line-height: 1.4;
        }

        &.layout-sparse {
          line-height: 2.4;
        }

        .cloud-tag {
          white-space: nowrap;
          position: relative;

          &.animation-none {
            transition: none;

            &:hover {
              transform: scale(1.05);
              border-color: var(--hover-border-color) !important;
            }
          }

          &.animation-gentle {
            &:hover {
              transform: scale(1.1) rotate(-1deg);
              filter: brightness(1.1);
              z-index: 10;
              border-color: var(--hover-border-color) !important;
            }
          }

          &.animation-lively {
            &:hover {
              transform: scale(1.15) rotate(-3deg);
              filter: brightness(1.2) saturate(1.1);
              z-index: 10;
              box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
              border-color: var(--hover-border-color) !important;
            }
          }

          .tag-count {
            font-size: 0.75em;
            opacity: 0.8;
            margin-left: 4px;
          }
        }
      }
    }
    
    // 卡片视图
    .card-view {
      .cards-container {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 24px;

        &.size-compact {
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 16px;
        }

        &.size-large {
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 32px;
        }

        @media (max-width: 768px) {
          grid-template-columns: 1fr;
          gap: 16px;

          &.size-large {
            gap: 20px;
          }
        }
      }
    }
  }
}

// 视图配置菜单
:deep(.view-config-menu) {
  padding: 16px;
  min-width: 300px;

  .config-section {
    margin-bottom: 16px;

    &:last-child {
      margin-bottom: 0;
    }

    .config-label {
      font-size: 13px;
      font-weight: 600;
      color: var(--el-text-color-primary);
      margin-bottom: 8px;
    }

    &.preset-section {
      .preset-buttons {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;

        .el-button {
          font-size: 12px;
          padding: 6px 12px;
          border-radius: 6px;

          &:hover {
            transform: translateY(-1px);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          }
        }
      }
    }

    .el-radio-group {
      width: 100%;

      .el-radio-button {
        flex: 1;

        :deep(.el-radio-button__inner) {
          width: 100%;
          font-size: 12px;
          padding: 6px 8px;
        }
      }
    }
  }
}

// 高级筛选表单
:deep(.advanced-form) {
  .color-row { 
    display: flex; 
    align-items: center; 
    gap: 8px; 
    margin-bottom: 6px; 
  }
  
  .color-swatches { 
    display: flex; 
    flex-wrap: wrap; 
    gap: 8px; 
  }
  
  .color-swatches .swatch { 
    width: 24px; 
    height: 24px; 
    border-radius: 50%; 
    border: 2px solid transparent; 
    cursor: pointer; 
    outline: none; 
    transition: transform .15s ease, box-shadow .15s ease, border-color .15s ease; 

    &:hover { 
      transform: scale(1.08); 
    }

    &.selected { 
      border-color: var(--el-color-primary); 
      box-shadow: 0 0 0 2px var(--el-color-primary-light-8); 
    }
  }
  
  .clear-color { 
    padding: 0 4px; 
  }
}

// 动画
.tag-fade-enter-active,
.tag-fade-leave-active {
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.tag-fade-enter-from,
.tag-fade-leave-to {
  opacity: 0;
  transform: scale(0.8) rotate(5deg);
}

.card-fade-enter-active,
.card-fade-leave-active {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.card-fade-enter-from,
.card-fade-leave-to {
  opacity: 0;
  transform: translateY(30px) scale(0.9);
}

.card-fade-move {
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

// 装饰点脉动动画
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

// 光晕环动画
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

// 响应式设计
@media (max-width: 768px) {
  .tags-page {
    padding: 0;

    .container {
      padding: 0 16px;
    }
    
    .page-header {
      margin-bottom: 24px;
      
      .header-content {
        .page-title { font-size: 28px; }
        .page-subtitle { font-size: 14px; }

        .header-toolbar {
          flex-direction: column;
          width: 100%;

          .search-input,
          .sort-select {
            width: 100%;
          }
        }
      }
    }

    .list-toolbar { 
      flex-direction: column; 
      align-items: flex-start; 
      gap: 8px; 
    }
    
    .stats-overview {
      .stats-grid { 
        grid-template-columns: 1fr; 
        gap: 12px; 
      }
      .stat-card { 
        padding: 16px; 
      }
    }
    
    .tags-container {
      .cloud-view { 
        padding: 32px 20px; 
      }
    }
  }
}
</style>