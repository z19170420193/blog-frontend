<template>
  <div class="home-page">
    <!-- Hero 英雄区 - 全屏展示 -->
    <section class="hero-section">
      <div class="hero-content">
        <div class="hero-text">
          <h1 class="hero-title">
            <span class="title-line">欢迎来到</span>
            <span class="title-main">我的博客世界</span>
          </h1>
          <p class="hero-subtitle">
            记录技术成长 · 分享编程心得 · 探索数字未来
          </p>
          <div class="hero-tags">
            <el-tag effect="plain" size="large">Vue 3</el-tag>
            <el-tag effect="plain" size="large" type="success">Node.js</el-tag>
            <el-tag effect="plain" size="large" type="warning">TypeScript</el-tag>
            <el-tag effect="plain" size="large" type="danger">前端开发</el-tag>
          </div>
          <div class="hero-actions">
            <el-button type="primary" size="large" @click="scrollToArticles">
              <el-icon><Reading /></el-icon>
              开始阅读
            </el-button>
            <el-button size="large" @click="router.push('/about')">
              <el-icon><User /></el-icon>
              关于我
            </el-button>
          </div>
        </div>
      </div>
      
      <!-- 向下滚动提示 -->
      <div class="scroll-indicator" @click="scrollToArticles">
        <el-icon class="scroll-icon"><ArrowDown /></el-icon>
        <span>向下滚动</span>
      </div>
      
      <!-- 背景装饰 -->
      <div class="hero-background">
        <div class="gradient-orb orb-1"></div>
        <div class="gradient-orb orb-2"></div>
        <div class="gradient-orb orb-3"></div>
      </div>
    </section>

    <!-- 杂志式文章展示区 -->
    <section class="magazine-section" ref="articlesRef">
      <div class="section-container">
        <!-- 区域标题 -->
        <div class="section-header">
          <h2 class="section-title">
            <el-icon><Collection /></el-icon>
            精选文章
          </h2>
          <p class="section-subtitle">Magazine Style Layout</p>
        </div>

        <!-- 加载状态 -->
        <div v-if="loading" class="loading-skeleton">
          <el-skeleton :rows="8" animated />
        </div>

        <!-- 杂志式网格布局 -->
        <div v-else-if="featuredArticles.length > 0" class="magazine-grid">
          <!-- 主文章 - 大卡片 -->
          <article
            v-if="featuredArticles[0]"
            class="magazine-card main-card"
            @click="goToArticle(featuredArticles[0].id)"
          >
            <div class="card-image">
              <img
                :src="featuredArticles[0].cover_image || '/placeholder.jpg'"
                :alt="featuredArticles[0].title"
              />
              <div class="image-overlay"></div>
              <el-tag v-if="featuredArticles[0].is_top" class="top-badge" type="danger">
                <el-icon><Star /></el-icon>
                置顶
              </el-tag>
            </div>
            <div class="card-content">
              <div class="card-meta">
                <el-tag size="small" effect="plain">{{ featuredArticles[0].category?.name || '未分类' }}</el-tag>
                <span class="meta-divider">·</span>
                <span class="meta-date">{{ formatDate(featuredArticles[0].published_at) }}</span>
              </div>
              <h3 class="card-title">{{ featuredArticles[0].title }}</h3>
              <p class="card-summary">{{ featuredArticles[0].summary }}</p>
              <div class="card-footer">
                <div class="card-tags">
                  <el-tag
                    v-for="tag in featuredArticles[0].tags?.slice(0, 3)"
                    :key="tag.id"
                    size="small"
                    effect="plain"
                    :color="tag.color"
                  >
                    {{ tag.name }}
                  </el-tag>
                </div>
                <div class="card-stats">
                  <span class="stat-item">
                    <el-icon><View /></el-icon>
                    {{ featuredArticles[0].views }}
                  </span>
                </div>
              </div>
            </div>
          </article>

          <!-- 次要文章 - 中等卡片 -->
          <article
            v-for="article in featuredArticles.slice(1, 3)"
            :key="article.id"
            class="magazine-card medium-card"
            @click="goToArticle(article.id)"
          >
            <div class="card-image">
              <img :src="article.cover_image || '/placeholder.jpg'" :alt="article.title" />
              <div class="image-overlay"></div>
              <el-tag v-if="article.is_top" class="top-badge" type="danger" size="small">
                <el-icon><Star /></el-icon>
                置顶
              </el-tag>
            </div>
            <div class="card-content">
              <div class="card-meta">
                <el-tag size="small" effect="plain">{{ article.category?.name || '未分类' }}</el-tag>
                <span class="meta-divider">·</span>
                <span class="meta-date">{{ formatDate(article.published_at) }}</span>
              </div>
              <h3 class="card-title">{{ article.title }}</h3>
              <p class="card-summary">{{ article.summary }}</p>
              <div class="card-stats">
                <span class="stat-item">
                  <el-icon><View /></el-icon>
                  {{ article.views }}
                </span>
              </div>
            </div>
          </article>

          <!-- 小卡片列表 -->
          <div class="small-cards-group">
            <article
              v-for="article in featuredArticles.slice(3, 6)"
              :key="article.id"
              class="magazine-card small-card"
              @click="goToArticle(article.id)"
            >
              <div class="card-image">
                <img :src="article.cover_image || '/placeholder.jpg'" :alt="article.title" />
                <div class="image-overlay"></div>
              </div>
              <div class="card-content">
                <el-tag size="small" effect="plain">{{ article.category?.name || '未分类' }}</el-tag>
                <h4 class="card-title">{{ article.title }}</h4>
                <div class="card-meta">
                  <span class="meta-date">{{ formatDate(article.published_at) }}</span>
                  <span class="stat-item">
                    <el-icon><View /></el-icon>
                    {{ article.views }}
                  </span>
                </div>
              </div>
            </article>
          </div>
        </div>

        <!-- 空状态 -->
        <el-empty v-else description="暂无文章" :image-size="200" />

        <!-- 查看更多按钮 -->
        <div class="more-articles">
          <el-button type="primary" size="large" @click="router.push('/article')">
            查看所有文章
            <el-icon><ArrowRight /></el-icon>
          </el-button>
        </div>
      </div>
    </section>

    <!-- 统计数据区 -->
    <section class="stats-section">
      <div class="section-container">
        <div class="stats-grid">
          <div class="stat-card">
            <el-icon class="stat-icon" :size="40"><Document /></el-icon>
            <div class="stat-content">
              <div class="stat-number">{{ stats.articleCount }}</div>
              <div class="stat-label">文章总数</div>
            </div>
          </div>
          <div class="stat-card">
            <el-icon class="stat-icon" :size="40"><Folder /></el-icon>
            <div class="stat-content">
              <div class="stat-number">{{ stats.categoryCount }}</div>
              <div class="stat-label">分类数量</div>
            </div>
          </div>
          <div class="stat-card">
            <el-icon class="stat-icon" :size="40"><CollectionTag /></el-icon>
            <div class="stat-content">
              <div class="stat-number">{{ stats.tagCount }}</div>
              <div class="stat-label">标签数量</div>
            </div>
          </div>
          <div class="stat-card">
            <el-icon class="stat-icon" :size="40"><View /></el-icon>
            <div class="stat-content">
              <div class="stat-number">{{ formatNumber(stats.totalViews) }}</div>
              <div class="stat-label">总浏览量</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { articleApi, categoryApi, tagApi } from '@/api'
import type { Article } from '@/types'
import dayjs from 'dayjs'
import {
  Reading,
  User,
  ArrowDown,
  Collection,
  Star,
  View,
  ArrowRight,
  Document,
  Folder,
  CollectionTag,
} from '@element-plus/icons-vue'

const router = useRouter()
const articlesRef = ref<HTMLElement>()
const loading = ref(false)
const featuredArticles = ref<Article[]>([])
const stats = ref({
  articleCount: 0,
  categoryCount: 0,
  tagCount: 0,
  totalViews: 0,
})

// 滚动到文章区域
const scrollToArticles = () => {
  articlesRef.value?.scrollIntoView({ behavior: 'smooth' })
}

// 格式化日期
const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD')
}

// 格式化数字
const formatNumber = (num: number) => {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + 'w'
  }
  return num.toString()
}

// 跳转文章详情
const goToArticle = (id: number) => {
  router.push(`/article/${id}`)
}

// 获取精选文章
const fetchFeaturedArticles = async () => {
  loading.value = true
  try {
    // 并行请求文章、分类和标签数据
    const [articlesData, categories, tags] = await Promise.all([
      articleApi.getArticles({
        page: 1,
        limit: 6,
        status: 'published',
      }),
      categoryApi.getCategories(),
      tagApi.getTags(),
    ])
    
    featuredArticles.value = articlesData.articles || articlesData.items || []
    
    // 使用真实数据统计
    stats.value = {
      articleCount: articlesData.total || 0,
      categoryCount: categories.length || 0,
      tagCount: tags.length || 0,
      totalViews: featuredArticles.value.reduce((sum, article) => sum + article.views, 0),
    }
  } catch (error) {
    console.error('获取数据失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchFeaturedArticles()
})
</script>

<style scoped lang="scss">
.home-page {
  min-height: 100vh;
}

/* ==================== Hero 英雄区 ==================== */
.hero-section {
  position: relative;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.hero-content {
  position: relative;
  z-index: 10;
  text-align: center;
  color: #fff;
  padding: 0 20px;
  animation: fadeInUp 1s ease-out;
}

.hero-title {
  margin-bottom: 20px;
  
  .title-line {
    display: block;
    font-size: 24px;
    font-weight: 400;
    opacity: 0.9;
    margin-bottom: 12px;
    animation: fadeInUp 1s ease-out 0.2s backwards;
  }
  
  .title-main {
    display: block;
    font-size: 64px;
    font-weight: 800;
    line-height: 1.2;
    background: linear-gradient(to right, #fff, #f0f0f0);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: fadeInUp 1s ease-out 0.4s backwards;
  }
}

.hero-subtitle {
  font-size: 20px;
  opacity: 0.95;
  margin-bottom: 32px;
  font-weight: 300;
  letter-spacing: 1px;
  animation: fadeInUp 1s ease-out 0.6s backwards;
}

.hero-tags {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-bottom: 40px;
  flex-wrap: wrap;
  animation: fadeInUp 1s ease-out 0.8s backwards;
  
  :deep(.el-tag) {
    font-size: 14px;
    background: rgba(255, 255, 255, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.3);
    color: #fff;
    backdrop-filter: blur(10px);
  }
}

.hero-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  animation: fadeInUp 1s ease-out 1s backwards;
  
  :deep(.el-button) {
    padding: 16px 32px;
    font-size: 16px;
    border-radius: 8px;
    
    &.el-button--primary {
      background: #fff;
      color: #667eea;
      border: none;
      
      &:hover {
        background: #f0f0f0;
        transform: translateY(-2px);
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
      }
    }
    
    &:not(.el-button--primary) {
      background: rgba(255, 255, 255, 0.2);
      color: #fff;
      border: 1px solid rgba(255, 255, 255, 0.3);
      backdrop-filter: blur(10px);
      
      &:hover {
        background: rgba(255, 255, 255, 0.3);
        transform: translateY(-2px);
      }
    }
  }
}

.scroll-indicator {
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #fff;
  cursor: pointer;
  opacity: 0.8;
  transition: all 0.3s;
  z-index: 10;
  animation: bounce 2s infinite;
  
  &:hover {
    opacity: 1;
  }
  
  .scroll-icon {
    font-size: 24px;
  }
  
  span {
    font-size: 14px;
  }
}

.hero-background {
  position: absolute;
  inset: 0;
  overflow: hidden;
  
  .gradient-orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    opacity: 0.6;
    animation: float 20s infinite ease-in-out;
    
    &.orb-1 {
      width: 500px;
      height: 500px;
      background: radial-gradient(circle, rgba(255, 255, 255, 0.3), transparent);
      top: -10%;
      left: -10%;
      animation-delay: 0s;
    }
    
    &.orb-2 {
      width: 400px;
      height: 400px;
      background: radial-gradient(circle, rgba(255, 255, 255, 0.2), transparent);
      bottom: -10%;
      right: -10%;
      animation-delay: 7s;
    }
    
    &.orb-3 {
      width: 300px;
      height: 300px;
      background: radial-gradient(circle, rgba(255, 255, 255, 0.25), transparent);
      top: 50%;
      left: 50%;
      animation-delay: 14s;
    }
  }
}

/* ==================== 杂志式文章区 ==================== */
.magazine-section {
  padding: 80px 0;
  background: #f8f9fa;
}

.section-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.section-header {
  text-align: center;
  margin-bottom: 60px;
  
  .section-title {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    font-size: 36px;
    font-weight: 700;
    color: #303133;
    margin-bottom: 12px;
  }
  
  .section-subtitle {
    font-size: 16px;
    color: #909399;
    font-weight: 300;
    letter-spacing: 2px;
    text-transform: uppercase;
  }
}

.magazine-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-auto-rows: 280px;
  gap: 20px;
  margin-bottom: 60px;
}

.magazine-card {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  
  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
    
    .card-image img {
      transform: scale(1.1);
    }
    
    .image-overlay {
      opacity: 0.4;
    }
  }
}

.main-card {
  grid-column: span 2;
  grid-row: span 2;
  
  .card-image {
    height: 60%;
  }
  
  .card-content {
    height: 40%;
    padding: 24px;
  }
  
  .card-title {
    font-size: 24px;
    margin-bottom: 12px;
    line-height: 1.4;
  }
  
  .card-summary {
    font-size: 15px;
    color: #606266;
    line-height: 1.6;
    margin-bottom: 16px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
}

.medium-card {
  grid-column: span 2;
  grid-row: span 1;
  display: flex;
  
  .card-image {
    width: 45%;
    flex-shrink: 0;
  }
  
  .card-content {
    flex: 1;
    padding: 20px;
  }
  
  .card-title {
    font-size: 18px;
    margin-bottom: 8px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  .card-summary {
    font-size: 14px;
    color: #909399;
    line-height: 1.6;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
}

.small-cards-group {
  grid-column: span 4;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.small-card {
  display: flex;
  flex-direction: column;
  
  .card-image {
    height: 160px;
  }
  
  .card-content {
    flex: 1;
    padding: 16px;
  }
  
  .card-title {
    font-size: 16px;
    margin: 8px 0 12px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    line-height: 1.5;
  }
}

.card-image {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.6s ease;
  }
  
  .image-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.3), transparent);
    opacity: 0.2;
    transition: opacity 0.3s;
  }
  
  .top-badge {
    position: absolute;
    top: 12px;
    right: 12px;
    z-index: 5;
  }
}

.card-content {
  display: flex;
  flex-direction: column;
}

.card-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-size: 13px;
  color: #909399;
  
  .meta-divider {
    opacity: 0.5;
  }
}

.card-title {
  font-weight: 600;
  color: #303133;
  transition: color 0.3s;
  
  &:hover {
    color: #409eff;
  }
}

.card-footer {
  margin-top: auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.card-stats {
  display: flex;
  gap: 16px;
  
  .stat-item {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 13px;
    color: #909399;
  }
}

.more-articles {
  text-align: center;
  
  :deep(.el-button) {
    padding: 16px 48px;
    font-size: 16px;
  }
}

/* ==================== 统计数据区 ==================== */
.stats-section {
  padding: 80px 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 30px;
}

.stat-card {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 32px;
  text-align: center;
  color: #fff;
  transition: all 0.3s;
  
  &:hover {
    background: rgba(255, 255, 255, 0.25);
    transform: translateY(-8px);
  }
  
  .stat-icon {
    margin-bottom: 16px;
    opacity: 0.9;
  }
  
  .stat-number {
    font-size: 48px;
    font-weight: 700;
    margin-bottom: 8px;
    line-height: 1;
  }
  
  .stat-label {
    font-size: 16px;
    opacity: 0.9;
    font-weight: 300;
  }
}

/* ==================== 动画 ==================== */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes bounce {
  0%, 100% {
    transform: translateX(-50%) translateY(0);
  }
  50% {
    transform: translateX(-50%) translateY(-10px);
  }
}

@keyframes float {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(30px, -30px) scale(1.1);
  }
  66% {
    transform: translate(-30px, 30px) scale(0.9);
  }
}

/* ==================== 响应式设计 ==================== */
@media (max-width: 1024px) {
  .magazine-grid {
    grid-template-columns: repeat(2, 1fr);
    grid-auto-rows: 250px;
  }
  
  .main-card {
    grid-column: span 2;
    grid-row: span 2;
  }
  
  .medium-card {
    grid-column: span 2;
  }
  
  .small-cards-group {
    grid-column: span 2;
    grid-template-columns: repeat(2, 1fr);
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .hero-title .title-main {
    font-size: 42px;
  }
  
  .hero-subtitle {
    font-size: 16px;
  }
  
  .hero-actions {
    flex-direction: column;
    
    :deep(.el-button) {
      width: 100%;
    }
  }
  
  .magazine-grid {
    grid-template-columns: 1fr;
    grid-auto-rows: auto;
  }
  
  .main-card,
  .medium-card {
    grid-column: span 1;
    grid-row: span 1;
    display: flex;
    flex-direction: column;
    
    .card-image {
      width: 100%;
      height: 200px;
    }
    
    .card-content {
      height: auto;
    }
  }
  
  .small-cards-group {
    grid-column: span 1;
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .section-header .section-title {
    font-size: 28px;
  }
}

.loading-skeleton {
  padding: 40px 0;
}
</style>