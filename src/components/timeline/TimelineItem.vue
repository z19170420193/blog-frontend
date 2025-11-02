<template>
  <div 
    class="timeline-item" 
    :class="[
      `timeline-item--${type}`,
      { 'is-highlight': highlight, 'is-animated': isVisible }
    ]"
    ref="itemRef"
  >
    <!-- 时间轴节点 -->
    <div class="timeline-node">
<div class="node-dot" :class="`node-dot--${dotSize}`">
        <el-icon v-if="iconComponent" :size="iconSize">
          <component :is="iconComponent" />
        </el-icon>
        <Icon v-else-if="iconifyIcon" :icon="iconifyIcon" :width="iconSize" :height="iconSize" />
        <span v-else class="node-marker"></span>
      </div>
    </div>

    <!-- 内容卡片 -->
    <div class="timeline-content">
      <!-- 日期时间 -->
      <div class="content-date">
        <el-icon><Clock /></el-icon>
        {{ formattedDate }}
      </div>

      <!-- 主体内容 -->
      <div class="content-card">
        <!-- 标题区域 -->
        <div class="card-header">
          <h3 class="card-title">
            {{ item.title }}
          </h3>
          <!-- 标签 -->
          <div v-if="item.tags && item.tags.length > 0" class="card-tags">
            <el-tag
              v-for="(tag, index) in item.tags"
              :key="index"
              :type="type"
              size="small"
              effect="plain"
            >
              {{ tag }}
            </el-tag>
          </div>
        </div>

        <!-- 描述文本 -->
        <p v-if="item.description" class="card-description">
          {{ item.description }}
        </p>

        <!-- 详细内容 -->
        <div v-if="item.content" class="card-content" v-html="sanitizeHtml(item.content)"></div>

        <!-- 配图 -->
        <div v-if="item.image" class="card-image">
          <el-image
            :src="item.image"
            fit="cover"
            :preview-src-list="[item.image]"
            preview-teleported
          >
            <template #error>
              <div class="image-error">
                <el-icon><Picture /></el-icon>
              </div>
            </template>
          </el-image>
        </div>

        <!-- 链接按钮 -->
        <div v-if="item.link" class="card-footer">
          <el-link :href="item.link" :type="type" :icon="Link" target="_blank">
            查看详情
          </el-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import { Clock, Picture, Link } from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import DOMPurify from 'dompurify'
import type { TimelineItem, TimelineType, TimelineSize } from '@/types/timeline'

interface Props {
  item: TimelineItem
  type?: TimelineType
  dotSize?: TimelineSize
  showAnimation?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'primary',
  dotSize: 'medium',
  showAnimation: true,
})

const itemRef = ref<HTMLElement | null>(null)
const isVisible = ref(false)

// 图标组件 (Element Plus 图标)
const iconComponent = computed(() => {
  if (typeof props.item.icon === 'string') {
    return null
  }
  return props.item.icon
})

// Iconify 图标名称（如 'mdi:trophy'）
const iconifyIcon = computed(() => {
  return typeof props.item.icon === 'string' ? (props.item.icon as string) : ''
})

// 图标大小映射
const iconSize = computed(() => {
  const sizeMap = {
    small: 14,
    medium: 18,
    large: 22,
  }
  return sizeMap[props.dotSize]
})

// 是否高亮
const highlight = computed(() => props.item.highlight || false)

// 格式化日期
const formattedDate = computed(() => {
  return dayjs(props.item.date).format('YYYY年MM月DD日 HH:mm')
})

// 清理 HTML 内容(防止 XSS 攻击)
const sanitizeHtml = (html: string) => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li', 'code', 'pre'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
  })
}

// Intersection Observer 实现滚动动画
onMounted(() => {
  if (!props.showAnimation || !itemRef.value) return

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          isVisible.value = true
          observer.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.1 }
  )

  observer.observe(itemRef.value)
})
</script>

<style scoped lang="scss">
.timeline-item {
  position: relative;
  display: flex;
  gap: 24px;
  padding-bottom: 40px;
  opacity: 0;
  transform: translateX(-30px);
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);

  &.is-animated {
    opacity: 1;
    transform: translateX(0);
  }

  &:last-child {
    padding-bottom: 0;

    .timeline-node::after {
      display: none;
    }
  }

  // 高亮样式
  &.is-highlight {
    .node-dot {
      animation: pulse 2s ease-in-out infinite;
      box-shadow: 0 0 0 8px rgba(64, 158, 255, 0.2);
    }

    .content-card {
      border-color: var(--el-color-primary);
      box-shadow: 0 4px 20px rgba(64, 158, 255, 0.3);
    }
  }
}

/* ==================== 时间轴节点 ==================== */
.timeline-node {
  position: relative;
  flex-shrink: 0;
  padding-top: 4px;

  // 连接线
  &::after {
    content: '';
    position: absolute;
    left: 50%;
    top: 32px;
    bottom: -40px;
    width: 2px;
    background: linear-gradient(
      to bottom,
      rgba(102, 126, 234, 0.3) 0%,
      rgba(118, 75, 162, 0.3) 100%
    );
    transform: translateX(-50%);
    opacity: 0.6;
  }

  .node-dot {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #fff;
    border: 3px solid var(--el-color-primary);
    color: var(--el-color-primary);
    transition: all 0.3s;
    position: relative;
    z-index: 2;

    &--small {
      width: 24px;
      height: 24px;
      border-width: 2px;
    }

    &--large {
      width: 40px;
      height: 40px;
      border-width: 4px;
    }

    .node-marker {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--el-color-primary);
    }
  }
}

// 不同类型的节点颜色
.timeline-item--primary .node-dot {
  border-color: var(--el-color-primary);
  color: var(--el-color-primary);
  
  .node-marker {
    background: var(--el-color-primary);
  }
}

.timeline-item--success .node-dot {
  border-color: var(--el-color-success);
  color: var(--el-color-success);
  
  .node-marker {
    background: var(--el-color-success);
  }
}

.timeline-item--warning .node-dot {
  border-color: var(--el-color-warning);
  color: var(--el-color-warning);
  
  .node-marker {
    background: var(--el-color-warning);
  }
}

.timeline-item--danger .node-dot {
  border-color: var(--el-color-danger);
  color: var(--el-color-danger);
  
  .node-marker {
    background: var(--el-color-danger);
  }
}

.timeline-item--info .node-dot {
  border-color: var(--el-color-info);
  color: var(--el-color-info);
  
  .node-marker {
    background: var(--el-color-info);
  }
}

/* ==================== 内容区域 ==================== */
.timeline-content {
  flex: 1;
  min-width: 0;
}

.content-date {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #909399;
  margin-bottom: 12px;
  padding: 4px 12px;
  background: #f5f7fa;
  border-radius: 12px;
}

.content-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e4e7ed;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

  &:hover {
    border-color: var(--el-color-primary-light-5);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
    transform: translateY(-2px);
  }
}

.card-header {
  margin-bottom: 12px;

  .card-title {
    font-size: 18px;
    font-weight: 600;
    color: #303133;
    margin: 0 0 12px 0;
    line-height: 1.4;
  }

  .card-tags {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
}

.card-description {
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
  margin: 0 0 16px 0;
}

.card-content {
  font-size: 14px;
  color: #606266;
  line-height: 1.8;
  margin-bottom: 16px;

  :deep(p) {
    margin: 8px 0;
  }

  :deep(a) {
    color: var(--el-color-primary);
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }

  :deep(code) {
    padding: 2px 6px;
    background: #f5f7fa;
    border-radius: 4px;
    font-family: 'Courier New', monospace;
    font-size: 13px;
  }
}

.card-image {
  margin-bottom: 16px;
  border-radius: 8px;
  overflow: hidden;

  :deep(.el-image) {
    width: 100%;
    max-height: 300px;
    display: block;
  }

  .image-error {
    width: 100%;
    height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f5f7fa;
    color: #909399;
    font-size: 32px;
  }
}

.card-footer {
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

/* ==================== 动画效果 ==================== */
@keyframes pulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(64, 158, 255, 0.4);
  }
  50% {
    box-shadow: 0 0 0 12px rgba(64, 158, 255, 0);
  }
}

/* ==================== 响应式设计 ==================== */
@media (max-width: 768px) {
  .timeline-item {
    gap: 16px;
    padding-bottom: 32px;
  }

  .timeline-node {
    .node-dot {
      width: 28px;
      height: 28px;

      &--small {
        width: 20px;
        height: 20px;
      }

      &--large {
        width: 32px;
        height: 32px;
      }
    }

    &::after {
      top: 28px;
    }
  }

  .content-card {
    padding: 16px;

    .card-title {
      font-size: 16px;
    }
  }
}

@media (max-width: 480px) {
  .timeline-item {
    gap: 12px;
  }

  .content-date {
    font-size: 12px;
    padding: 3px 10px;
  }

  .content-card {
    padding: 14px;
  }

  .card-header .card-title {
    font-size: 15px;
  }

  .card-description,
  .card-content {
    font-size: 13px;
  }
}
</style>
