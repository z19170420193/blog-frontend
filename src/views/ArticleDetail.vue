<template>
  <div class="article-detail-page">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="15" animated />
    </div>

    <!-- 文章内容 -->
    <div v-else-if="article" class="article-container">
      <!-- 文章主卡片 -->
      <div class="article-main-card">
        <!-- 封面图 -->
        <div v-if="article.cover_image" class="article-cover">
          <el-image
            :src="article.cover_image"
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
        </div>

        <!-- 文章内容 -->
        <div class="article-content-wrapper">
          <!-- 文章头部信息 -->
          <div class="article-header">
            <!-- 标题 -->
            <h1 class="article-title">{{ article.title }}</h1>

            <!-- 元数据 -->
            <div class="article-meta">
              <!-- 作者 -->
              <div class="meta-item">
                <el-avatar :size="32" :src="article.author?.avatar">
                  <el-icon><User /></el-icon>
                </el-avatar>
                <span class="author-name">{{ article.author?.username || '匿名' }}</span>
              </div>

              <!-- 发布时间 -->
              <div class="meta-item">
                <el-icon><Clock /></el-icon>
                <span>{{ formatDate(article.published_at || article.created_at) }}</span>
              </div>

              <!-- 浏览量 -->
              <div class="meta-item">
                <el-icon><View /></el-icon>
                <span>{{ article.views }} 次浏览</span>
              </div>

              <!-- 评论数 -->
              <div class="meta-item">
                <el-icon><ChatDotRound /></el-icon>
                <span>{{ comments.length }} 条评论</span>
              </div>
            </div>

            <!-- 分类和标签 -->
            <div class="article-tags">
              <!-- 置顶标签 -->
              <el-tag
                v-if="article.is_top"
                type="danger"
                effect="plain"
                size="large"
                class="top-tag"
              >
                <el-icon><Top /></el-icon>
                置顶
              </el-tag>

              <!-- 分类 -->
              <el-tag
                v-if="article.category"
                type="primary"
                effect="plain"
                size="large"
                class="category-tag"
                @click="goToCategory(article.category.id)"
              >
                <el-icon><Folder /></el-icon>
                {{ article.category.name }}
              </el-tag>

              <!-- 标签 -->
              <el-tag
                v-for="tag in article.tags"
                :key="tag.id"
                :color="tag.color || '#409EFF'"
                effect="plain"
                size="large"
                class="tag-item"
                @click="goToTag(tag.id)"
              >
                <el-icon><CollectionTag /></el-icon>
                {{ tag.name }}
              </el-tag>
            </div>
          </div>

          <!-- 分割线 -->
          <el-divider />

          <!-- 文章正文 -->
          <div class="article-body">
        <!-- 摘要 -->
        <div v-if="article.summary" class="article-summary">
          <el-icon class="summary-icon"><Reading /></el-icon>
          <p>{{ article.summary }}</p>
        </div>

        <!-- Markdown 内容 -->
        <div
          class="markdown-body"
          v-html="renderedContent"
        ></div>

        <!-- 文章底部信息 -->
        <div class="article-footer">
          <el-divider />
          
          <!-- 互动按钮 -->
          <div class="article-actions">
            <div class="action-inline">
              <LikeButton
                :id="article.id"
                :like-count="likeCount"
                @like="handleLike"
              />
              <span v-if="likeCount > 0" class="btn-count">{{ formatCount(likeCount) }}</span>
            </div>
            <div class="action-inline">
              <FavoriteButton
                :id="article.id"
                :favorited="isFavorited"
                @toggle="handleFavorite"
              />
              <span v-if="favoriteCount > 0" class="btn-count">{{ formatCount(favoriteCount) }}</span>
            </div>
            <div class="action-inline">
              <ShareButton
                :title="article.title"
                :text="article.summary || ''"
                :url="shareUrl"
                @success="onShareSuccess"
                @error="onShareError"
              />
              <span v-if="shareCount > 0" class="btn-count">{{ formatCount(shareCount) }}</span>
            </div>

            <!-- 文章信息 -->
            <div class="article-update-time">
              <span>最后更新：{{ formatDate(article.updated_at) }}</span>
            </div>
          </div>
        </div>
          </div>
        </div>
      </div>

      <!-- 相关文章推荐 -->
      <div v-if="relatedArticles.length > 0" class="related-section">
        <h3 class="section-title">
          <el-icon><Document /></el-icon>
          相关推荐
        </h3>
        <div class="related-articles">
          <div
            v-for="item in relatedArticles"
            :key="item.id"
            class="related-item"
            @click="goToArticle(item.id)"
          >
            <div class="related-cover" v-if="item.cover_image">
              <el-image :src="item.cover_image" fit="cover" />
            </div>
            <div class="related-info">
              <h4 class="related-title">{{ item.title }}</h4>
              <p class="related-meta">
                <span>{{ formatDate(item.published_at || item.created_at) }}</span>
                <span>{{ item.views }} 浏览</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- 评论区域 -->
      <div class="comment-section">
        <h3 class="section-title">
          <el-icon><ChatDotRound /></el-icon>
          评论 ({{ comments.length }})
        </h3>

        <!-- 评论表单 -->
        <CommentForm
          :article-id="article.id"
          @submitted="handleCommentSubmitted"
        />

        <!-- 评论列表 -->
        <CommentList
          :comments="comments"
          :article-id="article.id"
          @refresh="fetchComments"
        />
      </div>
    </div>

    <!-- 错误状态 -->
    <el-result
      v-else
      icon="error"
      title="文章不存在"
      sub-title="抱歉,您访问的文章不存在或已被删除"
    >
      <template #extra>
        <el-button type="primary" @click="goBack">返回</el-button>
      </template>
    </el-result>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  User,
  Clock,
  View,
  ChatDotRound,
  Folder,
  CollectionTag,
  Reading,
  Share,
  Star,
  Promotion,
  Document,
  Picture,
  Top,
} from '@element-plus/icons-vue'
import { marked } from 'marked'
import hljs from 'highlight.js'
import 'highlight.js/styles/github-dark.css'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'

import CommentForm from '@/components/comment/CommentForm.vue'
import CommentList from '@/components/comment/CommentList.vue'
import LikeButton from '@/components/common/LikeButton.vue'
import FavoriteButton from '@/components/common/FavoriteButton.vue'
import ShareButton from '@/components/common/ShareButton.vue'
import { articleApi, commentApi } from '@/api'
import type { Article, Comment } from '@/types'

dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

const route = useRoute()
const router = useRouter()

// 数据
const loading = ref(true)
const article = ref<Article | null>(null)
const comments = ref<Comment[]>([])
const relatedArticles = ref<Article[]>([])

// 互动数据
const likeCount = ref(0)
const favoriteCount = ref(0)
const shareCount = ref(0)
const isFavorited = ref(false)

// 配置 marked
marked.setOptions({
  highlight: (code, lang) => {
    const language = hljs.getLanguage(lang) ? lang : 'plaintext'
    return hljs.highlight(code, { language }).value
  },
  langPrefix: 'hljs language-',
  breaks: true,
  gfm: true,
})

// 渲染 Markdown 内容
const renderedContent = computed(() => {
  if (!article.value?.content) return ''
  return marked.parse(article.value.content)
})

const shareUrl = computed(() => window.location.href)

// 格式化计数（千位缩写）
const formatCount = (n: number) => {
  if (n < 1000) return String(n)
  if (n < 1_000_000) return (n / 1000).toFixed(n % 1000 >= 100 ? 1 : 0) + 'k'
  if (n < 1_000_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  return (n / 1_000_000_000).toFixed(1) + 'B'
}

// 格式化日期
const formatDate = (date: string | null) => {
  if (!date) return ''
  const d = dayjs(date)
  const now = dayjs()
  
  // 如果是最近7天内,显示相对时间
  if (now.diff(d, 'day') < 7) {
    return d.fromNow()
  }
  
  return d.format('YYYY-MM-DD HH:mm')
}

// 获取文章详情
const fetchArticle = async () => {
  try {
    loading.value = true
    const id = Number(route.params.id)
    
    if (isNaN(id)) {
      throw new Error('无效的文章ID')
    }

    article.value = await articleApi.getArticleById(id)
    
    // 滚动到顶部
    await nextTick()
    window.scrollTo({ top: 0, behavior: 'smooth' })
    
    // 获取评论和相关文章
    fetchComments()
    fetchRelatedArticles()
    
  } catch (error: any) {
    console.error('获取文章详情失败:', error)
    ElMessage.error(error.message || '获取文章详情失败')
    article.value = null
  } finally {
    loading.value = false
  }
}

// 获取评论列表
const fetchComments = async () => {
  if (!article.value) return
  
  try {
    const result = await commentApi.getCommentsByArticleId(article.value.id)
    comments.value = result.comments || []
  } catch (error) {
    console.error('获取评论失败:', error)
    comments.value = []
  }
}

// 获取相关文章
const fetchRelatedArticles = async () => {
  if (!article.value) return
  
  try {
    // 根据分类获取相关文章
    const res = await articleApi.getArticles({
      category_id: article.value.category_id || undefined,
      limit: 5,
      status: 'published',
    })
    
    // 过滤掉当前文章
    relatedArticles.value = (res.articles || res.items || [])
      .filter(item => item.id !== article.value?.id)
      .slice(0, 4)
  } catch (error) {
    console.error('获取相关文章失败:', error)
  }
}

// 评论提交成功
const handleCommentSubmitted = () => {
  // 不再显示提示，CommentForm 已经显示过了
  fetchComments()
}

// 分享文章（由 ShareButton 触发，父级仅提示）
const onShareSuccess = (p: { method: 'native' | 'copy' }) => {
  shareCount.value++
  ElMessage.success(p.method === 'native' ? '已调起系统分享' : '链接已复制')
}
const onShareError = () => {
  ElMessage.error('分享失败')
}

// 点赞文章
const handleLike = (liked: boolean) => {
  if (liked) {
    likeCount.value++
    ElMessage.success('🎉 点赞成功！')
  } else {
    likeCount.value = Math.max(0, likeCount.value - 1)
    ElMessage.info('已取消点赞')
  }
}

// 收藏文章
const handleFavorite = (favorited: boolean) => {
  isFavorited.value = favorited
  favoriteCount.value = Math.max(0, favoriteCount.value + (favorited ? 1 : -1))
  ElMessage.success(favorited ? '已收藏' : '已取消收藏')
}

// 跳转到分类
const goToCategory = (categoryId: number) => {
  router.push({ name: 'ArticleList', query: { category_id: categoryId } })
}

// 跳转到标签
const goToTag = (tagId: number) => {
  router.push({ name: 'ArticleList', query: { tag_id: tagId } })
}

// 跳转到文章
const goToArticle = (id: number) => {
  router.push({ name: 'ArticleDetail', params: { id } })
}

// 返回列表
const goBack = () => {
  router.back()
}

// 初始化
onMounted(() => {
  fetchArticle()
})
</script>

<style scoped>
.article-detail-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
  background: linear-gradient(180deg, #fafbfc 0%, #ffffff 100%);
  min-height: 100vh;
}

/* 加载状态 */
.loading-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 24px;
}

/* 文章容器 */
.article-container {
  max-width: 1200px;
  margin: 0 auto;
}

/* 文章主卡片 */
.article-main-card {
  margin-bottom: 32px;
}

/* 封面图 */
.article-cover {
  width: 100%;
  height: 400px;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 32px;
}

.article-cover :deep(.el-image) {
  width: 100%;
  height: 100%;
}

.image-error {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: #f5f7fa;
  color: #909399;
  font-size: 48px;
}

/* 文章内容包装器 */
.article-content-wrapper {
  padding: 0;
}

/* 文章头部 */
.article-header {
  margin-bottom: 0;
}

.article-title {
  font-size: 36px;
  font-weight: 700;
  color: #303133;
  line-height: 1.4;
  margin: 0 0 24px 0;
  word-break: break-word;
}

/* 元数据 */
.article-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #ebeef5;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #606266;
  font-size: 14px;
}

.author-name {
  font-weight: 500;
  color: #303133;
}

/* 分类和标签 */
.article-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.top-tag {
  cursor: default;
}

.category-tag,
.tag-item {
  cursor: pointer;
  transition: all 0.3s;
}

.category-tag:hover,
.tag-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12);
}

/* 文章主体 */
.article-body {
  padding: 0;
}

/* 摘要 */
.article-summary {
  display: flex;
  gap: 12px;
  padding: 20px;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border: none;
  border-left: 4px solid #409eff;
  border-radius: 8px;
  margin-bottom: 32px;
  box-shadow: none;
}

.summary-icon {
  font-size: 24px;
  color: #409eff;
  flex-shrink: 0;
}

.article-summary p {
  margin: 0;
  color: #606266;
  font-size: 16px;
  line-height: 1.8;
}

/* Markdown 样式 */
.markdown-body {
  color: #303133;
  font-size: 16px;
  line-height: 1.8;
  word-break: break-word;
}

.markdown-body :deep(h1),
.markdown-body :deep(h2),
.markdown-body :deep(h3),
.markdown-body :deep(h4),
.markdown-body :deep(h5),
.markdown-body :deep(h6) {
  margin: 32px 0 16px;
  font-weight: 600;
  line-height: 1.4;
}

.markdown-body :deep(h1) { font-size: 32px; }
.markdown-body :deep(h2) { font-size: 28px; }
.markdown-body :deep(h3) { font-size: 24px; }
.markdown-body :deep(h4) { font-size: 20px; }

.markdown-body :deep(p) {
  margin: 16px 0;
}

.markdown-body :deep(a) {
  color: #409eff;
  text-decoration: none;
}

.markdown-body :deep(a:hover) {
  text-decoration: underline;
}

.markdown-body :deep(img) {
  max-width: 100%;
  border-radius: 8px;
  margin: 16px 0;
}

.markdown-body :deep(code) {
  padding: 2px 6px;
  background: #f5f7fa;
  border-radius: 4px;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 14px;
  color: #e96900;
}

.markdown-body :deep(pre) {
  margin: 16px 0;
  padding: 16px;
  background: #282c34;
  border-radius: 8px;
  overflow-x: auto;
}

.markdown-body :deep(pre code) {
  padding: 0;
  background: transparent;
  color: #abb2bf;
  font-size: 14px;
  line-height: 1.6;
}

.markdown-body :deep(blockquote) {
  margin: 16px 0;
  padding: 12px 20px;
  border-left: 4px solid #dcdfe6;
  background: #f5f7fa;
  color: #606266;
}

.markdown-body :deep(table) {
  width: 100%;
  margin: 16px 0;
  border-collapse: collapse;
}

.markdown-body :deep(table th),
.markdown-body :deep(table td) {
  padding: 12px;
  border: 1px solid #dcdfe6;
  text-align: left;
}

.markdown-body :deep(table th) {
  background: #f5f7fa;
  font-weight: 600;
}

.markdown-body :deep(ul),
.markdown-body :deep(ol) {
  margin: 16px 0;
  padding-left: 32px;
}

.markdown-body :deep(li) {
  margin: 8px 0;
}

/* 文章底部 */
.article-footer {
  margin-top: 48px;
}

.article-actions {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin: 24px 0;
}

.action-inline {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.btn-count {
  font-size: 12px;
  color: #909399;
}

.article-update-time {
  text-align: center;
  color: #909399;
  font-size: 14px;
}

/* 相关文章 */
.related-section {
  padding: 32px 0;
  margin-bottom: 32px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 22px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 32px 0;
  padding-bottom: 16px;
  border-bottom: 2px solid #f0f0f0;
  position: relative;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 60px;
  height: 2px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.related-articles {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.related-item {
  cursor: pointer;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s;
  border: 1px solid transparent;
  background: #fff;
}

.related-item:hover {
  transform: translateY(-4px);
  border-color: #e4e7ed;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.12);
}

.related-cover {
  width: 100%;
  height: 120px;
  overflow: hidden;
}

.related-cover :deep(.el-image) {
  width: 100%;
  height: 100%;
}

.related-info {
  padding: 12px;
}

.related-title {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin: 0 0 8px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.related-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #909399;
  margin: 0;
}

/* 评论区域 */
.comment-section {
  padding: 32px 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .article-detail-page {
    padding: 16px;
  }

  .article-cover {
    height: 240px;
  }

  .article-content-wrapper {
    padding: 0;
  }

  .article-title {
    font-size: 24px;
  }

  .article-meta {
    gap: 16px;
  }

  .markdown-body {
    font-size: 15px;
  }

  .related-articles {
    grid-template-columns: 1fr;
  }

  .comment-section,
  .related-section {
    padding: 20px;
  }
}
</style>
