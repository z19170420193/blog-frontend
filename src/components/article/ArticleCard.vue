<template>
  <div 
    class="article-card"
    :class="[`mode-${mode}`, { 'is-top': article.is_top }]"
    @click="goToDetail"
  >
    <!-- 封面图片 -->
    <div class="card-cover">
      <el-image
        :src="article.cover_image || defaultCover"
        :alt="article.title"
        fit="cover"
        lazy
      >
        <template #error>
          <div class="image-error">
            <el-icon><Picture /></el-icon>
          </div>
        </template>
      </el-image>
      
      <!-- 封面遮罩层 -->
      <div class="cover-overlay"></div>
      
      <!-- 置顶角标 -->
      <el-tag
        v-if="article.is_top"
        class="top-badge"
        type="danger"
        effect="dark"
        size="small"
      >
        <el-icon><Top /></el-icon>
        置顶
      </el-tag>
      
      <!-- 分类标签(仅网格模式) -->
      <el-tag
        v-if="mode === 'grid' && article.category"
        class="category-badge"
        :type="getCategoryType(article.category.id)"
        effect="plain"
        size="small"
      >
        {{ article.category.name }}
      </el-tag>
    </div>

    <!-- 卡片内容 -->
    <div class="card-content">
      <!-- 头部元数据 -->
      <div class="card-meta">
        <!-- 分类(仅列表模式) -->
        <el-tag
          v-if="mode === 'list' && article.category"
          :type="getCategoryType(article.category.id)"
          effect="plain"
          size="small"
        >
          <el-icon><Folder /></el-icon>
          {{ article.category.name }}
        </el-tag>
        
        <!-- 发布日期 -->
        <span class="meta-date">
          <el-icon><Clock /></el-icon>
          {{ formatDate(article.published_at || article.created_at) }}
        </span>
      </div>

      <!-- 文章标题 -->
      <h3 class="card-title">{{ article.title }}</h3>

      <!-- 文章摘要 -->
      <p v-if="article.summary" class="card-summary">
        {{ article.summary }}
      </p>

      <!-- 标签列表 -->
      <div v-if="article.tags && article.tags.length > 0" class="card-tags">
        <el-tag
          v-for="tag in displayTags"
          :key="tag.id"
          :color="tag.color || '#409EFF'"
          effect="plain"
          size="small"
          class="tag-item"
        >
          <el-icon><CollectionTag /></el-icon>
          {{ tag.name }}
        </el-tag>
        <span v-if="article.tags.length > maxTags" class="more-tags">
          +{{ article.tags.length - maxTags }}
        </span>
      </div>

      <!-- 底部信息栏 -->
      <div class="card-footer">
        <!-- 作者信息 -->
        <div class="author-info">
          <el-avatar :size="24" :src="article.author?.avatar">
            <el-icon><User /></el-icon>
          </el-avatar>
          <span class="author-name">{{ article.author?.username || '匿名' }}</span>
        </div>

        <!-- 统计信息 -->
        <div class="card-stats">
          <!-- 阅读时长 -->
          <el-tooltip :content="`预计阅读 ${readingTime} 分钟`" placement="top">
            <span class="stat-item">
              <el-icon><Reading /></el-icon>
              {{ readingTime }}分钟
            </span>
          </el-tooltip>
          
          <!-- 浏览量 -->
          <el-tooltip content="浏览量" placement="top">
            <span class="stat-item">
              <el-icon><View /></el-icon>
              {{ formatNumber(article.views) }}
            </span>
          </el-tooltip>
          
          <!-- 评论数 -->
          <el-tooltip v-if="article.comment_count" content="评论数" placement="top">
            <span class="stat-item">
              <el-icon><ChatDotRound /></el-icon>
              {{ formatNumber(article.comment_count) }}
            </span>
          </el-tooltip>
          
          <!-- 点赞数 -->
          <el-tooltip v-if="article.like_count" content="点赞数" placement="top">
            <span class="stat-item stat-like">
              <el-icon><Star /></el-icon>
              {{ formatNumber(article.like_count) }}
            </span>
          </el-tooltip>
          
          <!-- 收藏数 -->
          <el-tooltip v-if="article.favorite_count" content="收藏数" placement="top">
            <span class="stat-item stat-favorite">
              <el-icon><Star /></el-icon>
              {{ formatNumber(article.favorite_count) }}
            </span>
          </el-tooltip>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'
import {
  Picture,
  Top,
  Folder,
  Clock,
  CollectionTag,
  User,
  View,
  ChatDotRound,
  Star,
  Reading,
} from '@element-plus/icons-vue'
import type { Article } from '@/types/article'

dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

interface Props {
  article: Article
  mode?: 'grid' | 'list'
  maxTags?: number
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'grid',
  maxTags: 3,
})

const router = useRouter()

// 默认封面图
const defaultCover = 'https://via.placeholder.com/800x450/667eea/ffffff?text=Article+Cover'

// 显示的标签(限制数量)
const displayTags = computed(() => {
  return props.article.tags?.slice(0, props.maxTags) || []
})

// 计算阅读时长(根据内容长度估算)
const readingTime = computed(() => {
  if (!props.article.content) return 0
  // 假设每分钟阅读300个字
  const wordsPerMinute = 300
  const words = props.article.content.length
  const minutes = Math.ceil(words / wordsPerMinute)
  return Math.max(1, minutes) // 最少显示1分钟
})

// 格式化日期
const formatDate = (date: string) => {
  const d = dayjs(date)
  const now = dayjs()
  
  // 7天内显示相对时间
  if (now.diff(d, 'day') < 7) {
    return d.fromNow()
  }
  
  return d.format('YYYY-MM-DD')
}

// 格式化数字(大于1000显示K)
const formatNumber = (num: number) => {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

// 根据分类ID获取标签类型
const getCategoryType = (categoryId: number) => {
  const types = ['', 'success', 'warning', 'info', 'danger']
  return types[categoryId % types.length]
}

// 跳转到文章详情
const goToDetail = () => {
  router.push(`/article/${props.article.id}`)
}
</script>

<style scoped lang="scss">
.article-card {
  display: flex;
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  height: 100%;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);

    .card-cover {
      :deep(.el-image__inner) {
        transform: scale(1.1);
      }

      .cover-overlay {
        opacity: 0.3;
      }
    }

    .card-title {
      color: #667eea;
    }
  }

  &.is-top {
    border: 2px solid #f56c6c;
    box-shadow: 0 2px 16px rgba(245, 108, 108, 0.2);
  }
}

/* ==================== 网格模式 ==================== */
.article-card.mode-grid {
  flex-direction: column;

  .card-cover {
    width: 100%;
    height: 240px;
    flex-shrink: 0;
  }

  .card-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 20px;
  }

  .card-title {
    font-size: 18px;
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  .card-summary {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
}

/* ==================== 列表模式 ==================== */
.article-card.mode-list {
  flex-direction: row;
  min-height: 200px;

  .card-cover {
    width: 300px;
    flex-shrink: 0;
  }

  .card-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 24px;
  }

  .card-title {
    font-size: 22px;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  .card-summary {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
  }

  .category-badge {
    display: none; // 列表模式不在封面上显示分类
  }
}

/* ==================== 封面区域 ==================== */
.card-cover {
  position: relative;
  overflow: hidden;
  background: #f5f7fa;

  :deep(.el-image) {
    width: 100%;
    height: 100%;
  }

  :deep(.el-image__inner) {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .image-error {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    font-size: 48px;
  }

  .cover-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      to bottom,
      transparent 0%,
      rgba(0, 0, 0, 0.1) 50%,
      rgba(0, 0, 0, 0.3) 100%
    );
    opacity: 0.1;
    transition: opacity 0.3s;
  }

  .top-badge {
    position: absolute;
    top: 12px;
    left: 12px;
    z-index: 2;
    font-weight: 600;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }

  .category-badge {
    position: absolute;
    bottom: 12px;
    left: 12px;
    z-index: 2;
    backdrop-filter: blur(8px);
    background: rgba(255, 255, 255, 0.9) !important;
    font-weight: 500;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }
}

/* ==================== 内容区域 ==================== */
.card-content {
  overflow: hidden;
}

.card-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  font-size: 13px;
  color: #909399;
  flex-wrap: wrap;

  .meta-date {
    display: flex;
    align-items: center;
    gap: 4px;
  }
}

.card-title {
  font-weight: 600;
  color: #303133;
  margin: 0 0 12px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.3s;
}

.card-summary {
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
  margin: 0 0 16px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

.card-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 16px;
  align-items: center;

  .tag-item {
    font-size: 12px;
    padding: 0 8px;
    height: 24px;
    line-height: 22px;
    border-radius: 4px;
    transition: all 0.3s;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    }
  }

  .more-tags {
    font-size: 12px;
    color: #909399;
    font-weight: 500;
  }
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
  margin-top: auto;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 8px;

  .author-name {
    font-size: 13px;
    color: #606266;
    font-weight: 500;
  }
}

.card-stats {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;

  .stat-item {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: #909399;
    transition: all 0.3s;
    cursor: help;

    &:hover {
      color: #409eff;
      transform: translateY(-1px);
    }

    .el-icon {
      font-size: 14px;
    }
  }
  
  // 点赞数特殊样式
  .stat-like {
    &:hover {
      color: #f56c6c;
      
      .el-icon {
        animation: heartbeat 0.6s ease-in-out;
      }
    }
  }
  
  // 收藏数特殊样式
  .stat-favorite {
    &:hover {
      color: #e6a23c;
      
      .el-icon {
        animation: bounce-small 0.5s ease;
      }
    }
  }
}

/* ==================== 响应式设计 ==================== */
@media (max-width: 768px) {
  .article-card.mode-list {
    flex-direction: column;

    .card-cover {
      width: 100%;
      height: 200px;
    }

    .card-content {
      padding: 16px;
    }

    .card-title {
      font-size: 18px;
    }

    .card-summary {
      -webkit-line-clamp: 2;
    }
  }

  .article-card.mode-grid {
    .card-cover {
      height: 180px;
    }

    .card-content {
      padding: 16px;
    }

    .card-title {
      font-size: 16px;
    }
  }
}

@media (max-width: 480px) {
  .card-footer {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .card-stats {
    gap: 8px;
    
    .stat-item {
      font-size: 11px;
    }
  }
}

/* ==================== 动画效果 ==================== */
@keyframes heartbeat {
  0%, 100% {
    transform: scale(1);
  }
  25% {
    transform: scale(1.3);
  }
  50% {
    transform: scale(1.1);
  }
  75% {
    transform: scale(1.25);
  }
}

@keyframes bounce-small {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}
</style>
