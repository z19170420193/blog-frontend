<template>
  <div class="project-detail-page">
    <!-- 加载状态 -->
    <div v-if="projectStore.loading" class="loading-container">
      <el-skeleton :rows="15" animated />
    </div>

    <!-- 项目内容 -->
    <div v-else-if="project" class="project-container">
      <!-- Hero 头部区域 -->
      <div class="project-hero">
        <div class="hero-background">
          <el-image
            :src="project.cover_image || defaultCover"
            fit="cover"
            style="width: 100%; height: 100%"
          />
          <div class="hero-overlay"></div>
        </div>

        <div class="hero-content container">
          <div class="hero-tags">
            <el-tag
              v-if="project.is_featured"
              type="danger"
              effect="dark"
              size="large"
            >
              <el-icon><Star /></el-icon>
              精选项目
            </el-tag>
            <el-tag
              :type="getTypeColor(project.project_type)"
              effect="dark"
              size="large"
            >
              {{ PROJECT_TYPE_MAP[project.project_type] }}
            </el-tag>
            <el-tag
              v-if="project.is_open_source"
              type="success"
              effect="dark"
              size="large"
            >
              <Icon icon="mdi:open-source-initiative" :width="16" />
              开源项目
            </el-tag>
          </div>

          <h1 class="hero-title">{{ project.title }}</h1>
          <p v-if="project.subtitle" class="hero-subtitle">{{ project.subtitle }}</p>

          <div class="hero-actions">
            <el-button
              v-if="project.demo_url"
              type="primary"
              size="large"
              @click="openLink(project.demo_url)"
            >
              <el-icon><Link /></el-icon>
              在线演示
            </el-button>
            <el-button
              v-if="project.github_url"
              size="large"
              @click="openLink(project.github_url)"
            >
              <Icon icon="mdi:github" :width="20" />
              GitHub 仓库
            </el-button>
            <el-button
              v-if="project.documentation_url"
              size="large"
              @click="openLink(project.documentation_url)"
            >
              <el-icon><Document /></el-icon>
              文档
            </el-button>
          </div>
        </div>
      </div>

      <!-- 主要内容区域 -->
      <div class="container">
        <el-row :gutter="32">
          <!-- 左侧主内容 -->
          <el-col :xs="24" :lg="16">
            <div class="project-main-content">
              <!-- 项目简介 -->
              <div class="content-section">
                <h2 class="section-title">
                  <el-icon><InfoFilled /></el-icon>
                  项目简介
                </h2>
                <p class="project-description">{{ project.description }}</p>
              </div>

              <!-- 技术栈 -->
              <div class="content-section">
                <h2 class="section-title">
                  <el-icon><Tools /></el-icon>
                  技术栈
                </h2>
                <div class="tech-stack-list">
                  <el-tag
                    v-for="(tech, index) in project.tech_stack"
                    :key="index"
                    size="large"
                    class="tech-item"
                  >
                    {{ tech }}
                  </el-tag>
                </div>
              </div>

              <!-- 项目详情（Markdown） -->
              <div v-if="project.content" class="content-section">
                <h2 class="section-title">
                  <el-icon><Reading /></el-icon>
                  详细介绍
                </h2>
                <div class="markdown-body" v-html="renderedContent"></div>
              </div>

              <!-- 项目截图 -->
              <div v-if="project.images && project.images.length > 0" class="content-section">
                <h2 class="section-title">
                  <el-icon><Picture /></el-icon>
                  项目截图
                </h2>
                <div class="project-screenshots">
                  <el-image
                    v-for="(image, index) in project.images"
                    :key="index"
                    :src="image"
                    :preview-src-list="project.images"
                    :initial-index="index"
                    fit="cover"
                    class="screenshot-item"
                    lazy
                  >
                    <template #error>
                      <div class="image-error">
                        <el-icon><Picture /></el-icon>
                      </div>
                    </template>
                  </el-image>
                </div>
              </div>

              <!-- 演示视频 -->
              <div v-if="project.demo_video" class="content-section">
                <h2 class="section-title">
                  <el-icon><VideoPlay /></el-icon>
                  演示视频
                </h2>
                <div class="video-container">
                  <iframe
                    :src="getVideoEmbedUrl(project.demo_video)"
                    frameborder="0"
                    allowfullscreen
                  ></iframe>
                </div>
              </div>
            </div>
          </el-col>

          <!-- 右侧信息栏 -->
          <el-col :xs="24" :lg="8">
            <div class="project-sidebar">
              <!-- 项目信息卡片 -->
              <el-card class="info-card">
                <template #header>
                  <div class="card-header">
                    <el-icon><DataLine /></el-icon>
                    <span>项目信息</span>
                  </div>
                </template>

                <div class="info-list">
                  <div class="info-item">
                    <span class="info-label">状态</span>
                    <el-tag
                      :type="getStatusType(project.status)"
                      size="small"
                    >
                      {{ PROJECT_STATUS_MAP[project.status] }}
                    </el-tag>
                  </div>

                  <div v-if="project.start_date" class="info-item">
                    <span class="info-label">开始时间</span>
                    <span class="info-value">{{ formatDate(project.start_date) }}</span>
                  </div>

                  <div v-if="project.end_date" class="info-item">
                    <span class="info-label">结束时间</span>
                    <span class="info-value">{{ formatDate(project.end_date) }}</span>
                  </div>

                  <div v-if="project.duration" class="info-item">
                    <span class="info-label">开发周期</span>
                    <span class="info-value">{{ project.duration }} 天</span>
                  </div>

                  <div class="info-item">
                    <span class="info-label">团队规模</span>
                    <span class="info-value">{{ project.team_size }} 人</span>
                  </div>

                  <div class="info-item">
                    <span class="info-label">浏览量</span>
                    <span class="info-value">
                      <el-icon><View /></el-icon>
                      {{ project.view_count }}
                    </span>
                  </div>

                  <div v-if="project.category" class="info-item">
                    <span class="info-label">分类</span>
                    <el-tag size="small" type="info">{{ project.category }}</el-tag>
                  </div>
                </div>
              </el-card>

              <!-- 作者信息 -->
              <el-card v-if="project.author" class="info-card author-card">
                <template #header>
                  <div class="card-header">
                    <el-icon><User /></el-icon>
                    <span>作者信息</span>
                  </div>
                </template>

                <div class="author-info">
                  <el-avatar :size="60" :src="project.author.avatar">
                    {{ project.author.username?.charAt(0).toUpperCase() }}
                  </el-avatar>
                  <div class="author-details">
                    <h4>{{ project.author.username }}</h4>
                    <p>{{ project.author.email }}</p>
                  </div>
                </div>
              </el-card>

              <!-- 项目标签 -->
              <el-card v-if="project.tags && project.tags.length > 0" class="info-card">
                <template #header>
                  <div class="card-header">
                    <el-icon><CollectionTag /></el-icon>
                    <span>项目标签</span>
                  </div>
                </template>

                <div class="tags-list">
                  <el-tag
                    v-for="(tag, index) in project.tags"
                    :key="index"
                    size="small"
                  >
                    {{ tag }}
                  </el-tag>
                </div>
              </el-card>
            </div>
          </el-col>
        </el-row>
      </div>
    </div>

    <!-- 错误状态 -->
    <el-result
      v-else
      icon="error"
      title="项目不存在"
      sub-title="抱歉，您访问的项目不存在或已被删除"
    >
      <template #extra>
        <el-button type="primary" @click="goBack">返回</el-button>
      </template>
    </el-result>

    <!-- 返回顶部按钮 -->
    <BackToTop />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import { marked } from 'marked'
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css'
import dayjs from 'dayjs'
import {
  Star,
  Link,
  Document,
  InfoFilled,
  Tools,
  Reading,
  Picture,
  VideoPlay,
  DataLine,
  View,
  User,
  CollectionTag,
} from '@element-plus/icons-vue'
import { useProjectStore } from '@/stores/project'
import BackToTop from '@/components/common/BackToTop.vue'
import { PROJECT_TYPE_MAP, PROJECT_STATUS_MAP } from '@/types'
import type { ProjectType, ProjectStatus } from '@/types'

const route = useRoute()
const router = useRouter()
const projectStore = useProjectStore()

const defaultCover = 'https://via.placeholder.com/1920x600/667eea/ffffff?text=Project+Cover'

// 计算属性
const project = computed(() => projectStore.currentProject)

const renderedContent = computed(() => {
  if (!project.value?.content) return ''
  
  // 配置 marked
  marked.setOptions({
    highlight: (code, lang) => {
      if (lang && hljs.getLanguage(lang)) {
        return hljs.highlight(code, { language: lang }).value
      }
      return hljs.highlightAuto(code).value
    },
    breaks: true,
    gfm: true,
  })
  
  return marked(project.value.content)
})

// 方法
const openLink = (url: string) => {
  window.open(url, '_blank')
}

const formatDate = (date: string | null) => {
  if (!date) return '-'
  return dayjs(date).format('YYYY年MM月DD日')
}

const getTypeColor = (type: ProjectType) => {
  const colorMap: Record<ProjectType, any> = {
    web: 'primary',
    mobile: 'success',
    desktop: 'warning',
    backend: 'info',
    fullstack: 'danger',
    other: '',
  }
  return colorMap[type] || ''
}

const getStatusType = (status: ProjectStatus) => {
  const typeMap: Record<ProjectStatus, any> = {
    completed: 'success',
    in_progress: 'primary',
    archived: 'info',
    draft: 'warning',
  }
  return typeMap[status] || ''
}

const getVideoEmbedUrl = (url: string) => {
  // 支持 B站、YouTube 等视频平台的嵌入链接转换
  if (url.includes('bilibili.com')) {
    const bvMatch = url.match(/BV\w+/)
    if (bvMatch) {
      return `https://player.bilibili.com/player.html?bvid=${bvMatch[0]}&high_quality=1`
    }
  }
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    const videoId = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1]
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`
    }
  }
  return url
}

const goBack = () => {
  router.push('/projects')
}

// 生命周期
onMounted(async () => {
  const id = Number(route.params.id)
  if (id) {
    try {
      await projectStore.fetchProjectById(id)
      // 增加浏览量
      await projectStore.incrementView(id)
    } catch (error) {
      console.error('获取项目详情失败:', error)
    }
  }
})
</script>

<style scoped lang="scss">
.project-detail-page {
  min-height: calc(100vh - 60px);
  background: var(--el-bg-color-page);
}

// 加载状态
.loading-container {
  max-width: 1200px;
  margin: 40px auto;
  padding: 0 20px;
}

// Hero 头部
.project-hero {
  position: relative;
  height: 500px;
  margin-bottom: 40px;
  overflow: hidden;

  .hero-background {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1;

    :deep(.el-image) {
      filter: brightness(0.6);
    }
  }

  .hero-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      180deg,
      rgba(0, 0, 0, 0.3) 0%,
      rgba(0, 0, 0, 0.7) 100%
    );
    z-index: 2;
  }

  .hero-content {
    position: relative;
    z-index: 3;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    color: white;
  }

  .hero-tags {
    display: flex;
    gap: 12px;
    margin-bottom: 24px;
    flex-wrap: wrap;
  }

  .hero-title {
    font-size: 48px;
    font-weight: 700;
    margin: 0 0 16px 0;
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }

  .hero-subtitle {
    font-size: 20px;
    opacity: 0.95;
    margin: 0 0 32px 0;
    line-height: 1.6;
  }

  .hero-actions {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
  }
}

// 主内容区域
.project-main-content {
  background: var(--el-bg-color);
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 24px;
}

.content-section {
  margin-bottom: 48px;

  &:last-child {
    margin-bottom: 0;
  }

  .section-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 24px;
    font-weight: 600;
    margin: 0 0 24px 0;
    color: var(--el-text-color-primary);
    padding-bottom: 12px;
    border-bottom: 2px solid var(--el-border-color);

    .el-icon {
      color: var(--el-color-primary);
    }
  }
}

.project-description {
  font-size: 16px;
  line-height: 1.8;
  color: var(--el-text-color-regular);
  margin: 0;
}

.tech-stack-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;

  .tech-item {
    font-size: 14px;
    padding: 8px 16px;
    background: var(--el-fill-color-light);
    border: 1px solid var(--el-border-color-lighter);
  }
}

// Markdown 样式
.markdown-body {
  font-size: 16px;
  line-height: 1.8;
  color: var(--el-text-color-regular);

  :deep(h1), :deep(h2), :deep(h3), :deep(h4), :deep(h5), :deep(h6) {
    margin-top: 24px;
    margin-bottom: 16px;
    font-weight: 600;
    line-height: 1.4;
    color: var(--el-text-color-primary);
  }

  :deep(p) {
    margin-bottom: 16px;
  }

  :deep(pre) {
    background: var(--el-fill-color-light);
    border-radius: 8px;
    padding: 16px;
    overflow-x: auto;
    margin-bottom: 16px;
  }

  :deep(code) {
    background: var(--el-fill-color-light);
    padding: 2px 6px;
    border-radius: 4px;
    font-family: 'Consolas', 'Monaco', monospace;
  }

  :deep(img) {
    max-width: 100%;
    border-radius: 8px;
    margin: 16px 0;
  }
}

// 项目截图
.project-screenshots {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;

  .screenshot-item {
    width: 100%;
    height: 200px;
    border-radius: 8px;
    overflow: hidden;
    cursor: pointer;
    transition: transform 0.3s ease;

    &:hover {
      transform: scale(1.05);
    }

    .image-error {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      background: var(--el-fill-color-light);
      font-size: 48px;
      color: var(--el-text-color-placeholder);
    }
  }
}

// 视频容器
.video-container {
  position: relative;
  padding-bottom: 56.25%; // 16:9 比例
  height: 0;
  overflow: hidden;
  border-radius: 12px;

  iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
}

// 侧边栏
.project-sidebar {
  .info-card {
    margin-bottom: 24px;

    .card-header {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
      color: var(--el-text-color-primary);

      .el-icon {
        color: var(--el-color-primary);
      }
    }
  }

  .info-list {
    display: flex;
    flex-direction: column;
    gap: 16px;

    .info-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid var(--el-border-color-lighter);

      &:last-child {
        border-bottom: none;
      }

      .info-label {
        font-size: 14px;
        color: var(--el-text-color-secondary);
      }

      .info-value {
        font-size: 14px;
        font-weight: 500;
        color: var(--el-text-color-primary);
        display: flex;
        align-items: center;
        gap: 4px;
      }
    }
  }

  .author-info {
    display: flex;
    align-items: center;
    gap: 16px;

    .author-details {
      flex: 1;

      h4 {
        margin: 0 0 4px 0;
        font-size: 16px;
        font-weight: 600;
        color: var(--el-text-color-primary);
      }

      p {
        margin: 0;
        font-size: 13px;
        color: var(--el-text-color-secondary);
      }
    }
  }

  .tags-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .back-to-top {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
}

// 响应式
@media (max-width: 768px) {
  .project-hero {
    height: 400px;

    .hero-title {
      font-size: 32px;
    }

    .hero-subtitle {
      font-size: 16px;
    }
  }

  .project-main-content {
    padding: 24px 20px;
  }

  .content-section .section-title {
    font-size: 20px;
  }

  .project-screenshots {
    grid-template-columns: 1fr;
  }
}
</style>
