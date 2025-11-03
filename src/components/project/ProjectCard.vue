<template>
  <div 
    class="project-card"
    :class="{ 'is-featured': project.is_featured }"
    @click="handleClick"
  >
    <!-- 封面图片 -->
    <div class="card-cover">
      <el-image
        :src="project.cover_image || defaultCover"
        :alt="project.title"
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
      <div class="cover-overlay">
        <div class="overlay-actions">
          <el-button
            v-if="project.demo_url"
            type="primary"
            :icon="Link"
            circle
            @click.stop="openDemo"
          />
          <el-button
            v-if="project.github_url"
            type="info"
            circle
            @click.stop="openGithub"
          >
            <Icon icon="mdi:github" :width="18" />
          </el-button>
        </div>
      </div>
      
      <!-- 精选角标 -->
      <el-tag
        v-if="project.is_featured"
        class="featured-badge"
        type="danger"
        effect="dark"
        size="small"
      >
        <el-icon><Star /></el-icon>
        精选
      </el-tag>
      
      <!-- 项目类型标签 -->
      <el-tag
        class="type-badge"
        :type="getTypeColor(project.project_type)"
        effect="plain"
        size="small"
      >
        {{ PROJECT_TYPE_MAP[project.project_type] }}
      </el-tag>
      
      <!-- 开源标识 -->
      <div v-if="project.is_open_source" class="opensource-badge">
        <Icon icon="mdi:open-source-initiative" :width="24" />
      </div>
    </div>

    <!-- 卡片内容 -->
    <div class="card-content">
      <!-- 项目标题 -->
      <h3 class="card-title">{{ project.title }}</h3>
      
      <!-- 副标题 -->
      <p v-if="project.subtitle" class="card-subtitle">
        {{ project.subtitle }}
      </p>
      
      <!-- 项目简介 -->
      <p class="card-description">
        {{ truncatedDescription }}
      </p>
      
      <!-- 技术栈标签 -->
      <div class="tech-stack">
        <el-tag
          v-for="(tech, index) in displayTechStack"
          :key="index"
          size="small"
          class="tech-tag"
        >
          {{ tech }}
        </el-tag>
        <span v-if="project.tech_stack.length > maxTechDisplay" class="more-tech">
          +{{ project.tech_stack.length - maxTechDisplay }}
        </span>
      </div>
      
      <!-- 底部信息栏 -->
      <div class="card-footer">
        <!-- 项目时间 -->
        <div class="project-meta">
          <el-icon><Calendar /></el-icon>
          <span>{{ formatDate(project.start_date || project.created_at) }}</span>
        </div>
        
        <!-- 统计信息 -->
        <div class="card-stats">
          <!-- 浏览量 -->
          <el-tooltip content="浏览量" placement="top">
            <span class="stat-item">
              <el-icon><View /></el-icon>
              {{ formatNumber(project.view_count) }}
            </span>
          </el-tooltip>
          
          <!-- 团队规模 -->
          <el-tooltip :content="`团队规模: ${project.team_size}人`" placement="top">
            <span class="stat-item">
              <el-icon><User /></el-icon>
              {{ project.team_size }}
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
import { Icon } from '@iconify/vue'
import dayjs from 'dayjs'
import {
  Picture,
  Link,
  Star,
  Calendar,
  View,
  User,
} from '@element-plus/icons-vue'
import type { Project } from '@/types'
import { PROJECT_TYPE_MAP } from '@/types'

interface Props {
  project: Project
  maxTechDisplay?: number
  maxDescLength?: number
}

const props = withDefaults(defineProps<Props>(), {
  maxTechDisplay: 4,
  maxDescLength: 100,
})

const router = useRouter()

// 默认封面图
const defaultCover = 'https://via.placeholder.com/600x400/667eea/ffffff?text=Project+Cover'

// 显示的技术栈(限制数量)
const displayTechStack = computed(() => {
  return props.project.tech_stack.slice(0, props.maxTechDisplay)
})

// 截断的描述
const truncatedDescription = computed(() => {
  const desc = props.project.description
  if (desc.length <= props.maxDescLength) return desc
  return desc.substring(0, props.maxDescLength) + '...'
})

// 格式化日期
const formatDate = (date: string | null) => {
  if (!date) return '未知'
  return dayjs(date).format('YYYY-MM')
}

// 格式化数字
const formatNumber = (num: number) => {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k'
  }
  return num.toString()
}

// 获取项目类型颜色
const getTypeColor = (type: string) => {
  const colorMap: Record<string, string> = {
    web: 'primary',
    mobile: 'success',
    desktop: 'warning',
    backend: 'info',
    fullstack: 'danger',
    other: '',
  }
  return colorMap[type] || ''
}

// 点击卡片
const handleClick = () => {
  router.push(`/projects/${props.project.id}`)
}

// 打开演示
const openDemo = () => {
  if (props.project.demo_url) {
    window.open(props.project.demo_url, '_blank')
  }
}

// 打开 GitHub
const openGithub = () => {
  if (props.project.github_url) {
    window.open(props.project.github_url, '_blank')
  }
}
</script>

<style scoped lang="scss">
.project-card {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  background: var(--el-bg-color);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  cursor: pointer;
  height: 100%;
  display: flex;
  flex-direction: column;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);

    .cover-overlay {
      opacity: 1;
    }
  }

  &.is-featured {
    border: 2px solid var(--el-color-danger);
  }
}

// 封面图片
.card-cover {
  position: relative;
  width: 100%;
  height: 220px;
  overflow: hidden;
  background: var(--el-fill-color-light);

  :deep(.el-image) {
    width: 100%;
    height: 100%;
  }

  .image-error {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    font-size: 48px;
    color: var(--el-text-color-placeholder);
  }
}

// 封面遮罩层
.cover-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0) 0%,
    rgba(0, 0, 0, 0.7) 100%
  );
  opacity: 0;
  transition: opacity 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  .overlay-actions {
    display: flex;
    gap: 12px;

    .el-button {
      --el-button-hover-bg-color: var(--el-color-primary);
      --el-button-hover-border-color: var(--el-color-primary);
    }
  }
}

// 精选角标
.featured-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 600;
}

// 类型标签
.type-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 2;
  backdrop-filter: blur(8px);
}

// 开源标识
.opensource-badge {
  position: absolute;
  bottom: 12px;
  right: 12px;
  z-index: 2;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  color: var(--el-color-success);
  font-size: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

// 卡片内容
.card-content {
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-subtitle {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  margin: 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-style: italic;
}

.card-description {
  font-size: 14px;
  color: var(--el-text-color-regular);
  line-height: 1.6;
  margin: 0;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

// 技术栈
.tech-stack {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;

  .tech-tag {
    background: var(--el-fill-color-light);
    border: none;
    font-size: 12px;
  }

  .more-tech {
    font-size: 12px;
    color: var(--el-text-color-secondary);
    padding: 0 8px;
  }
}

// 底部信息栏
.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 12px;
  border-top: 1px solid var(--el-border-color-lighter);
  font-size: 13px;
}

.project-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--el-text-color-secondary);

  .el-icon {
    font-size: 14px;
  }
}

.card-stats {
  display: flex;
  align-items: center;
  gap: 16px;

  .stat-item {
    display: flex;
    align-items: center;
    gap: 4px;
    color: var(--el-text-color-secondary);
    font-size: 13px;
    transition: color 0.2s;

    .el-icon {
      font-size: 14px;
    }

    &:hover {
      color: var(--el-color-primary);
    }
  }
}

// 响应式
@media (max-width: 768px) {
  .card-cover {
    height: 180px;
  }

  .card-content {
    padding: 16px;
  }

  .card-title {
    font-size: 16px;
  }

  .card-stats {
    gap: 12px;
  }
}
</style>
