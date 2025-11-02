<template>
  <div class="timeline-wrapper">
    <!-- 时间线标题(可选) -->
    <div v-if="title" class="timeline-header">
      <h2 class="timeline-title">{{ title }}</h2>
      <p v-if="description" class="timeline-description">{{ description }}</p>
    </div>

    <!-- 时间线主体 -->
    <div 
      class="timeline" 
      :class="{ 'timeline--reverse': reverse }"
      :style="{ '--line-color': lineColor }"
    >
      <!-- 空状态 -->
      <el-empty 
        v-if="!displayItems || displayItems.length === 0" 
        description="暂无时间线数据"
        :image-size="120"
      />

      <!-- 时间线列表 -->
      <template v-else>
        <TimelineItem
          v-for="(item, index) in displayItems"
          :key="item.id"
          :item="item"
          :type="item.type || 'primary'"
          :dot-size="dotSize"
          :show-animation="showAnimation"
          :style="{ '--animation-delay': `${index * 0.1}s` }"
        />
      </template>
    </div>

    <!-- 加载更多按钮(可选) -->
    <div v-if="hasMore" class="timeline-footer">
      <el-button 
        type="primary" 
        :loading="loading" 
        @click="handleLoadMore"
        plain
      >
        {{ loading ? '加载中...' : '加载更多' }}
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import TimelineItem from './TimelineItem.vue'
import type { TimelineItem as TimelineItemType, TimelineSize } from '@/types/timeline'

interface Props {
  items: TimelineItemType[]
  title?: string
  description?: string
  reverse?: boolean
  showAnimation?: boolean
  lineColor?: string
  dotSize?: TimelineSize
  hasMore?: boolean
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  reverse: false,
  showAnimation: true,
  lineColor: '#dcdfe6',
  dotSize: 'medium',
  hasMore: false,
  loading: false,
})

const emit = defineEmits<{
  loadMore: []
}>()

// 显示的时间线数据(支持倒序)
const displayItems = computed(() => {
  if (props.reverse) {
    return [...props.items].reverse()
  }
  return props.items
})

// 加载更多处理
const handleLoadMore = () => {
  emit('loadMore')
}
</script>

<style scoped lang="scss">
.timeline-wrapper {
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

/* ==================== 时间线头部 ==================== */
.timeline-header {
  text-align: center;
  margin-bottom: 40px;

  .timeline-title {
    font-size: 2rem;
    font-weight: 700;
    color: #ffffff;
    margin: 0 0 12px 0;
    text-shadow: 0 3px 8px rgba(0, 0, 0, 0.4), 0 1px 3px rgba(0, 0, 0, 0.3);
  }

  .timeline-description {
    font-size: 16px;
    color: #e0e7ff;
    line-height: 1.6;
    margin: 0;
    max-width: 600px;
    margin: 0 auto;
    text-shadow: 0 2px 6px rgba(0, 0, 0, 0.35), 0 1px 2px rgba(0, 0, 0, 0.25);
  }
}

/* ==================== 时间线主体 ==================== */
.timeline {
  position: relative;
}

/* 倒序模式 */
.timeline--reverse {
  display: flex;
  flex-direction: column-reverse;
}

/* ==================== 时间线底部 ==================== */
.timeline-footer {
  display: flex;
  justify-content: center;
  margin-top: 32px;
  padding-top: 32px;
  border-top: 1px dashed #e4e7ed;
}

/* ==================== 响应式设计 ==================== */
@media (max-width: 768px) {
  .timeline-wrapper {
    padding: 16px;
  }

  .timeline-header {
    margin-bottom: 32px;

    .timeline-title {
      font-size: 24px;
    }

    .timeline-description {
      font-size: 14px;
    }
  }

  .timeline-footer {
    margin-top: 24px;
    padding-top: 24px;
  }
}

@media (max-width: 480px) {
  .timeline-wrapper {
    padding: 12px;
  }

  .timeline-header {
    margin-bottom: 24px;

    .timeline-title {
      font-size: 20px;
    }

    .timeline-description {
      font-size: 13px;
    }
  }
}
</style>
