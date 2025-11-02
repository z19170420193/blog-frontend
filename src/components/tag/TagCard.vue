<template>
  <div 
    class="tag-card"
    :class="[
      `mode-${mode}`,
      `theme-${theme}`,
      { 
        'is-active': isActive, 
        'is-disabled': disabled,
        'is-hot': isHotTag
      }
    ]"
    @click="handleClick"
  >
    <!-- 卡片装饰背景 -->
    <div v-if="showDecoration" class="card-decoration">
      <div class="decoration-pattern"></div>
    </div>

    <!-- 热门标签角标 -->
    <div v-if="showHotBadge && isHotTag" class="hot-badge">
      <el-icon><TrendCharts /></el-icon>
      HOT
    </div>

    <!-- 标签徽章区域 -->
    <div class="tag-badge" :style="tagBadgeStyle">
      <el-tag
        :color="tag.color || defaultColor"
        effect="dark"
        :size="badgeSize"
        class="main-tag"
      >
        <el-icon><PriceTag /></el-icon>
        {{ tag.name }}
      </el-tag>
    </div>

    <!-- 内容区域 -->
    <div class="card-content">
      <!-- 标签描述 (如果有自定义字段) -->
      <p 
        v-if="showDescription && tag.description" 
        class="card-description"
        :title="tag.description"
      >
        {{ truncateText(tag.description, descriptionMaxLength) }}
      </p>

      <!-- 统计信息 -->
      <div v-if="showStats" class="card-stats">
        <!-- 文章数量 -->
        <div class="stat-item primary">
          <el-icon><Document /></el-icon>
          <span class="stat-value">{{ formatNumber(tag.article_count || 0) }}</span>
          <span class="stat-label">篇文章</span>
        </div>

        <!-- 热度评分 -->
        <div v-if="showPopularity" class="stat-item secondary">
          <el-icon><Star /></el-icon>
          <span class="stat-value">{{ popularityScore }}</span>
          <span class="stat-label">热度</span>
        </div>
      </div>

      <!-- 热度进度条 -->
      <div v-if="showPopularityBar" class="popularity-bar-container">
        <div class="bar-label">
          <span>热度指数</span>
          <span class="bar-value">{{ popularityScore }}%</span>
        </div>
        <div class="popularity-bar">
          <div 
            class="bar-fill" 
            :style="popularityBarStyle"
          ></div>
        </div>
      </div>

      <!-- 时间信息 -->
      <div v-if="showTime" class="card-meta">
        <el-icon><Clock /></el-icon>
        <span>{{ formatDate(tag.created_at) }}</span>
        <el-tag 
          v-if="isNew" 
          type="success" 
          size="small" 
          effect="plain"
          class="new-tag"
        >
          NEW
        </el-tag>
      </div>

      <!-- 自定义底部插槽 -->
      <div v-if="$slots.footer" class="card-footer">
        <slot name="footer" :tag="tag"></slot>
      </div>
    </div>

    <!-- 悬浮操作按钮 -->
    <div v-if="showActions" class="card-actions">
      <el-button 
        type="primary" 
        size="small" 
        text
        @click.stop="$emit('view', tag)"
      >
        查看文章
        <el-icon><ArrowRight /></el-icon>
      </el-button>
    </div>

    <!-- 文章数量角标 -->
    <div v-if="showCornerBadge && (tag.article_count || 0) > 0" class="corner-badge">
      {{ tag.article_count }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { 
  PriceTag,
  Document, 
  Star,
  Clock, 
  ArrowRight,
  TrendCharts
} from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'
import type { Tag } from '@/types/tag'

dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

export interface TagCardProps {
  tag: Tag
  mode?: 'card' | 'grid' | 'list' | 'minimal'
  theme?: 'default' | 'gradient' | 'flat' | 'outlined'
  badgeSize?: 'large' | 'default' | 'small'
  defaultColor?: string
  showDescription?: boolean
  showStats?: boolean
  showPopularity?: boolean
  showPopularityBar?: boolean
  showTime?: boolean
  showActions?: boolean
  showHotBadge?: boolean
  showCornerBadge?: boolean
  showDecoration?: boolean
  descriptionMaxLength?: number
  hotThreshold?: number
  disabled?: boolean
  isActive?: boolean
}

const props = withDefaults(defineProps<TagCardProps>(), {
  mode: 'card',
  theme: 'default',
  badgeSize: 'large',
  defaultColor: '#409eff',
  showDescription: false,
  showStats: true,
  showPopularity: true,
  showPopularityBar: false,
  showTime: true,
  showActions: false,
  showHotBadge: true,
  showCornerBadge: false,
  showDecoration: true,
  descriptionMaxLength: 60,
  hotThreshold: 10,
  disabled: false,
  isActive: false,
})

const emit = defineEmits<{
  click: [tag: Tag]
  view: [tag: Tag]
}>()

// 标签徽章样式
const tagBadgeStyle = computed(() => ({
  '--tag-color': props.tag.color || props.defaultColor,
}))

// 是否为热门标签
const isHotTag = computed(() => {
  return (props.tag.article_count || 0) >= props.hotThreshold
})

// 是否为新标签(7天内创建)
const isNew = computed(() => {
  return dayjs().diff(dayjs(props.tag.created_at), 'day') <= 7
})

// 热度评分 (0-100)
const popularityScore = computed(() => {
  const count = props.tag.article_count || 0
  // 简单的对数计算,让热度增长更平滑
  if (count === 0) return 0
  const score = Math.min(100, Math.floor(20 * Math.log10(count + 1) + 10))
  return Math.max(0, score)
})

// 热度进度条样式
const popularityBarStyle = computed(() => {
  const color = props.tag.color || props.defaultColor
  const score = popularityScore.value
  
  let gradient
  if (score >= 80) {
    gradient = `linear-gradient(90deg, ${color}, ${color}DD)`
  } else if (score >= 50) {
    gradient = `linear-gradient(90deg, ${color}CC, ${color}99)`
  } else {
    gradient = `linear-gradient(90deg, ${color}99, ${color}66)`
  }
  
  return {
    background: gradient,
    width: `${Math.max(5, score)}%`
  }
})

// 截断文本
const truncateText = (text: string, maxLength: number) => {
  if (!text || text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

// 格式化数字
const formatNumber = (num: number) => {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + 'w'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k'
  }
  return num.toString()
}

// 格式化日期
const formatDate = (date: string) => {
  const d = dayjs(date)
  const now = dayjs()
  
  if (now.diff(d, 'day') < 7) {
    return d.fromNow()
  }
  
  return d.format('YYYY-MM-DD')
}

// 点击处理
const handleClick = () => {
  if (!props.disabled) {
    emit('click', props.tag)
  }
}
</script>

<style scoped lang="scss">
.tag-card {
  position: relative;
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  height: 100%;
  display: flex;
  flex-direction: column;
  
  &:hover:not(.is-disabled) {
    transform: translateY(-8px);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
    
    .card-actions {
      opacity: 1;
      transform: translateY(0);
    }
    
    .tag-badge .main-tag {
      transform: scale(1.05);
    }

    .popularity-bar .bar-fill {
      width: 100% !important;
    }
  }

  &.is-active {
    border: 2px solid var(--tag-color, #409eff);
    box-shadow: 0 0 0 4px rgba(64, 158, 255, 0.1);
  }

  &.is-disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &.is-hot {
    .tag-badge::after {
      content: '';
      position: absolute;
      inset: -2px;
      border-radius: 16px;
      padding: 2px;
      background: linear-gradient(135deg, #ff6b6b, #feca57);
      -webkit-mask: 
        linear-gradient(#fff 0 0) content-box, 
        linear-gradient(#fff 0 0);
      -webkit-mask-composite: xor;
      mask-composite: exclude;
      animation: rotate-border 3s linear infinite;
    }
  }
}

/* ==================== 模式样式 ==================== */
// 卡片模式 (默认)
.tag-card.mode-card {
  padding: 24px;

  .tag-badge {
    margin: 0 auto 20px;
    text-align: center;
  }

  .card-content {
    text-align: center;
  }

  .card-stats {
    justify-content: center;
  }
}

// 网格模式 (紧凑)
.tag-card.mode-grid {
  padding: 20px;

  .tag-badge {
    margin: 0 auto 16px;
    text-align: center;
  }

  .card-content {
    text-align: center;
  }

  .card-stats {
    flex-direction: column;
    gap: 8px;
    align-items: center;
  }
}

// 列表模式 (横向)
.tag-card.mode-list {
  flex-direction: row;
  align-items: center;
  padding: 16px 20px;
  gap: 20px;

  .tag-badge {
    flex-shrink: 0;
  }

  .card-content {
    flex: 1;
    text-align: left;
  }

  .card-stats {
    flex-direction: row;
    gap: 16px;
  }

  .card-meta {
    margin-top: 8px;
  }
}

// 极简模式
.tag-card.mode-minimal {
  flex-direction: row;
  align-items: center;
  padding: 12px 16px;
  gap: 12px;

  .tag-badge .main-tag {
    height: 28px;
    font-size: 13px;
  }

  .card-description,
  .popularity-bar-container,
  .card-actions,
  .hot-badge {
    display: none;
  }

  .card-stats {
    gap: 12px;
    font-size: 12px;

    .stat-label {
      display: none;
    }
  }
}

/* ==================== 主题样式 ==================== */
// 默认主题
.tag-card.theme-default {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
}

// 渐变主题
.tag-card.theme-gradient {
  background: linear-gradient(135deg, #f5f7fa 0%, #e8eaf6 100%);
  
  .tag-badge {
    background: linear-gradient(135deg, rgba(255,255,255,0.5), rgba(255,255,255,0.2));
    backdrop-filter: blur(10px);
    padding: 12px;
    border-radius: 12px;
  }
}

// 扁平主题
.tag-card.theme-flat {
  box-shadow: none;
  border: 1px solid #e4e7ed;
  
  &:hover {
    border-color: var(--tag-color, #409eff);
    box-shadow: 0 2px 12px rgba(64, 158, 255, 0.15);
  }
}

// 描边主题
.tag-card.theme-outlined {
  background: transparent;
  border: 2px solid #e4e7ed;
  
  &:hover {
    border-color: var(--tag-color, #409eff);
    background: rgba(64, 158, 255, 0.05);
  }
}

/* ==================== 组件样式 ==================== */
.card-decoration {
  position: absolute;
  top: 0;
  right: 0;
  width: 120px;
  height: 120px;
  opacity: 0.04;
  pointer-events: none;
  overflow: hidden;
  
  .decoration-pattern {
    width: 100%;
    height: 100%;
    background: repeating-linear-gradient(
      45deg,
      var(--tag-color, #409eff),
      var(--tag-color, #409eff) 10px,
      transparent 10px,
      transparent 20px
    );
  }
}

.hot-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: linear-gradient(135deg, #ff6b6b, #feca57);
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(255, 107, 107, 0.3);
  display: flex;
  align-items: center;
  gap: 4px;
  z-index: 3;
  animation: pulse 2s ease-in-out infinite;

  .el-icon {
    font-size: 12px;
  }
}

.tag-badge {
  position: relative;
  z-index: 1;
  
  .main-tag {
    font-size: 16px;
    padding: 10px 20px;
    border-radius: 12px;
    font-weight: 600;
    border: none;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    
    .el-icon {
      margin-right: 6px;
      font-size: 18px;
    }
  }
}

.card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
}

.card-description {
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-stats {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;

  .stat-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
    color: #606266;
    
    &.primary {
      color: var(--tag-color, #409eff);
      font-weight: 600;
    }
    
    &.secondary {
      color: #909399;
    }
    
    .el-icon {
      font-size: 16px;
    }
    
    .stat-value {
      font-weight: 600;
      font-size: 18px;
    }
    
    .stat-label {
      font-size: 12px;
      opacity: 0.8;
    }
  }
}

.popularity-bar-container {
  margin-top: 8px;

  .bar-label {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px;
    font-size: 12px;
    color: #909399;

    .bar-value {
      font-weight: 600;
      color: var(--tag-color, #409eff);
    }
  }

  .popularity-bar {
    height: 6px;
    background: #f0f0f0;
    border-radius: 3px;
    overflow: hidden;
    position: relative;

    .bar-fill {
      height: 100%;
      border-radius: 3px;
      transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      position: relative;

      &::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
        animation: shimmer 2s infinite;
      }
    }
  }
}

.card-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #909399;
  flex-wrap: wrap;

  .new-tag {
    margin-left: auto;
  }
}

.card-footer {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.card-actions {
  position: absolute;
  bottom: 16px;
  right: 16px;
  opacity: 0;
  transform: translateY(8px);
  transition: all 0.3s;
  z-index: 2;
}

.corner-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: var(--tag-color, #409eff);
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 2;
}

/* ==================== 动画 ==================== */
@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.9;
  }
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(200%);
  }
}

@keyframes rotate-border {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* ==================== 响应式 ==================== */
@media (max-width: 768px) {
  .tag-card.mode-card,
  .tag-card.mode-grid {
    padding: 16px;

    .tag-badge .main-tag {
      font-size: 14px;
      padding: 8px 16px;
    }
  }

  .tag-card.mode-list {
    .card-description {
      display: none;
    }

    .card-stats {
      gap: 12px;

      .stat-label {
        display: none;
      }
    }
  }
}

@media (max-width: 480px) {
  .tag-card {
    .card-stats {
      .stat-item {
        font-size: 12px;

        .stat-value {
          font-size: 16px;
        }
      }
    }
  }
}
</style>
