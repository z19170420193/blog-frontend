<template>
  <div 
    class="category-card"
    :class="[
      `mode-${mode}`,
      `theme-${theme}`,
      { 'is-active': isActive, 'is-disabled': disabled }
    ]"
    @click="handleClick"
  >
    <!-- 卡片装饰背景 -->
    <div v-if="showDecoration" class="card-decoration">
      <div class="decoration-pattern"></div>
    </div>

    <!-- 图标区域 -->
    <div class="card-icon" :style="iconStyle">
      <component 
        v-if="iconComponent" 
        :is="iconComponent" 
        class="icon-svg"
      />
      <el-icon v-else :size="iconSize">
        <Folder />
      </el-icon>
    </div>

    <!-- 内容区域 -->
    <div class="card-content">
      <div class="content-header">
        <h3 class="card-title" :title="category.name">
          {{ category.name }}
        </h3>
        
        <!-- 标签/徽章 -->
        <div v-if="showBadge" class="card-badges">
          <el-tag 
            v-if="category.is_featured" 
            type="danger" 
            size="small" 
            effect="dark"
          >
            精选
          </el-tag>
          <el-tag 
            v-if="isNew" 
            type="success" 
            size="small"
          >
            NEW
          </el-tag>
        </div>
      </div>

      <!-- 描述 -->
      <p 
        v-if="showDescription && category.description" 
        class="card-description"
        :title="category.description"
      >
        {{ truncateText(category.description, descriptionMaxLength) }}
      </p>

      <!-- 统计信息 -->
      <div v-if="showStats" class="card-stats">
        <div class="stat-item">
          <el-icon><Document /></el-icon>
          <span>{{ formatNumber(category.article_count || 0) }} 篇</span>
        </div>
        <div v-if="showViews" class="stat-item">
          <el-icon><View /></el-icon>
          <span>{{ formatNumber(totalViews) }}</span>
        </div>
        <div v-if="showUpdateTime" class="stat-item stat-time">
          <el-icon><Clock /></el-icon>
          <span>{{ formatDate(category.updated_at) }}</span>
        </div>
      </div>

      <!-- 自定义底部插槽 -->
      <div v-if="$slots.footer" class="card-footer">
        <slot name="footer" :category="category"></slot>
      </div>
    </div>

    <!-- 悬浮操作按钮 -->
    <div v-if="showActions" class="card-actions">
      <el-button 
        type="primary" 
        size="small" 
        text
        @click.stop="$emit('view', category)"
      >
        查看详情
        <el-icon><ArrowRight /></el-icon>
      </el-button>
    </div>

    <!-- 角标计数 -->
    <div v-if="showCornerBadge && (category.article_count || 0) > 0" class="corner-badge">
      {{ category.article_count }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { 
  Folder, 
  Document, 
  View, 
  Clock, 
  ArrowRight 
} from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'
import type { Category } from '@/types/category'

dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

export interface CategoryCardProps {
  category: Category
  mode?: 'card' | 'grid' | 'list' | 'minimal'
  theme?: 'default' | 'gradient' | 'flat' | 'outlined'
  iconComponent?: any
  iconColor?: string
  iconSize?: number
  showDescription?: boolean
  showStats?: boolean
  showViews?: boolean
  showUpdateTime?: boolean
  showActions?: boolean
  showBadge?: boolean
  showCornerBadge?: boolean
  showDecoration?: boolean
  descriptionMaxLength?: number
  disabled?: boolean
  isActive?: boolean
}

const props = withDefaults(defineProps<CategoryCardProps>(), {
  mode: 'card',
  theme: 'default',
  iconSize: 40,
  iconColor: '#409eff',
  showDescription: true,
  showStats: true,
  showViews: false,
  showUpdateTime: true,
  showActions: false,
  showBadge: true,
  showCornerBadge: false,
  showDecoration: true,
  descriptionMaxLength: 60,
  disabled: false,
  isActive: false,
})

const emit = defineEmits<{
  click: [category: Category]
  view: [category: Category]
}>()

// 图标样式
const iconStyle = computed(() => ({
  '--icon-color': props.iconColor,
}))

// 总浏览量(示例数据,实际应从API获取)
const totalViews = computed(() => {
  return (props.category.article_count || 0) * 120
})

// 是否为新分类(7天内创建)
const isNew = computed(() => {
  return dayjs().diff(dayjs(props.category.created_at), 'day') <= 7
})

// 截断文本
const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text
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
    emit('click', props.category)
  }
}
</script>

<style scoped lang="scss">
.category-card {
  position: relative;
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  height: 100%;
  display: flex;
  
  &:hover:not(.is-disabled) {
    transform: translateY(-8px);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
    
    .card-actions {
      opacity: 1;
      transform: translateY(0);
    }
    
    .card-icon {
      transform: scale(1.1) rotate(5deg);
    }
  }

  &.is-active {
    border: 2px solid #409eff;
    box-shadow: 0 0 0 4px rgba(64, 158, 255, 0.1);
  }

  &.is-disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

/* ==================== 模式样式 ==================== */
// 卡片模式 (默认)
.category-card.mode-card {
  flex-direction: column;
  padding: 24px;

  .card-icon {
    width: 80px;
    height: 80px;
    margin: 0 auto 20px;
  }

  .card-content {
    text-align: center;
  }

  .content-header {
    justify-content: center;
  }

  .card-stats {
    justify-content: center;
  }
}

// 网格模式 (紧凑)
.category-card.mode-grid {
  flex-direction: column;
  padding: 20px;

  .card-icon {
    width: 60px;
    height: 60px;
    margin: 0 auto 16px;
  }

  .card-content {
    text-align: center;
  }

  .card-description {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
}

// 列表模式 (横向)
.category-card.mode-list {
  flex-direction: row;
  align-items: center;
  padding: 16px 20px;
  gap: 16px;

  .card-icon {
    width: 50px;
    height: 50px;
    flex-shrink: 0;
  }

  .card-content {
    flex: 1;
    text-align: left;
  }

  .content-header {
    margin-bottom: 8px;
  }

  .card-description {
    font-size: 13px;
    margin-bottom: 8px;
  }

  .card-stats {
    gap: 16px;
  }
}

// 极简模式
.category-card.mode-minimal {
  flex-direction: row;
  align-items: center;
  padding: 12px 16px;
  gap: 12px;

  .card-icon {
    width: 36px;
    height: 36px;
    flex-shrink: 0;
  }

  .card-title {
    font-size: 14px;
    margin: 0;
  }

  .card-description,
  .card-badges,
  .card-actions {
    display: none;
  }

  .card-stats {
    gap: 8px;
    font-size: 12px;
  }
}

/* ==================== 主题样式 ==================== */
// 默认主题
.category-card.theme-default {
  .card-icon {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
  }
}

// 渐变主题
.category-card.theme-gradient {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  
  .card-icon {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
  }
}

// 扁平主题
.category-card.theme-flat {
  box-shadow: none;
  border: 1px solid #e4e7ed;
  
  &:hover {
    border-color: #409eff;
    box-shadow: 0 2px 12px rgba(64, 158, 255, 0.15);
  }
  
  .card-icon {
    background: var(--icon-color, #409eff);
    color: #fff;
  }
}

// 描边主题
.category-card.theme-outlined {
  background: transparent;
  border: 2px solid #e4e7ed;
  
  &:hover {
    border-color: #409eff;
    background: rgba(64, 158, 255, 0.05);
  }
  
  .card-icon {
    background: transparent;
    border: 2px solid var(--icon-color, #409eff);
    color: var(--icon-color, #409eff);
  }
}

/* ==================== 组件样式 ==================== */
.card-decoration {
  position: absolute;
  top: 0;
  right: 0;
  width: 120px;
  height: 120px;
  opacity: 0.05;
  pointer-events: none;
  overflow: hidden;
  
  .decoration-pattern {
    width: 100%;
    height: 100%;
    background: repeating-linear-gradient(
      45deg,
      currentColor,
      currentColor 10px,
      transparent 10px,
      transparent 20px
    );
  }
}

.card-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;

  .icon-svg,
  .el-icon {
    font-size: inherit;
  }
}

.card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
}

.content-header {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  min-width: 0;
  transition: color 0.3s;
  
  .category-card:hover & {
    color: #409eff;
  }
}

.card-badges {
  display: flex;
  gap: 4px;
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
  gap: 12px;
  flex-wrap: wrap;
  margin-top: auto;

  .stat-item {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 13px;
    color: #909399;
    
    .el-icon {
      font-size: 14px;
    }
    
    &.stat-time {
      color: #c0c4cc;
    }
  }
}

.card-footer {
  margin-top: 8px;
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
}

.corner-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 2;
}

/* ==================== 响应式 ==================== */
@media (max-width: 768px) {
  .category-card.mode-card,
  .category-card.mode-grid {
    .card-icon {
      width: 60px;
      height: 60px;
    }
  }

  .category-card.mode-list {
    .card-description {
      display: none;
    }
  }
}
</style>
