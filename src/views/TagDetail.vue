<template>
  <div class="tag-detail-page">
    <!-- 标签信息头部 -->
    <div class="tag-header" v-if="tagInfo">
      <div class="header-background"></div>
      <div class="header-content container">
        <el-tag
          :color="tagInfo.color || '#409eff'"
          effect="dark"
          size="large"
          class="tag-badge"
        >
          {{ tagInfo.name }}
        </el-tag>
        <div class="tag-stats">
          <span class="stat-item">
            <el-icon><Document /></el-icon>
            {{ tagInfo.article_count || 0 }} 篇文章
          </span>
          <span class="stat-item">
            <el-icon><Calendar /></el-icon>
            创建于 {{ formatDate(tagInfo.created_at) }}
          </span>
        </div>
      </div>
    </div>

    <!-- 文章筛选栏 -->
    <div class="filter-section container">
      <div class="filter-left">
        <h2 class="section-title">相关文章</h2>
      </div>
      <div class="filter-right">
        <el-select
          v-model="sortBy"
          placeholder="排序方式"
          @change="handleSortChange"
        >
          <el-option label="最新发布" value="created_at" />
          <el-option label="最多浏览" value="views" />
        </el-select>
      </div>
    </div>

    <!-- 文章列表 -->
    <div class="articles-container container" v-loading="loading">
      <el-row :gutter="20" v-if="articles.length > 0">
        <el-col
          v-for="article in articles"
          :key="article.id"
          :xs="24"
          :sm="12"
          :lg="8"
        >
          <article class="article-card" @click="goToArticle(article)">
            <!-- 文章封面 -->
            <div class="article-cover" v-if="article.cover_image">
              <el-image
                :src="article.cover_image"
                fit="cover"
                lazy
                class="cover-image"
              >
                <template #error>
                  <div class="image-placeholder">
                    <el-icon><Picture /></el-icon>
                  </div>
                </template>
              </el-image>
              <div class="article-category" v-if="article.category">
                {{ article.category.name }}
              </div>
            </div>

            <!-- 文章信息 -->
            <div class="article-body">
              <h3 class="article-title">{{ article.title }}</h3>
              <p class="article-summary">{{ article.summary || article.content.substring(0, 100) }}...</p>
              
              <!-- 文章标签 -->
              <div class="article-tags" v-if="article.tags && article.tags.length > 0">
                <el-tag
                  v-for="tag in article.tags.slice(0, 3)"
                  :key="tag.id"
                  size="small"
                  :color="tag.color"
                  effect="plain"
                >
                  {{ tag.name }}
                </el-tag>
                <span v-if="article.tags.length > 3" class="more-tags">
                  +{{ article.tags.length - 3 }}
                </span>
              </div>

              <!-- 文章元信息 -->
              <div class="article-meta">
                <div class="meta-left">
                  <el-avatar
                    :src="article.author?.avatar"
                    :size="24"
                    class="author-avatar"
                  >
                    {{ article.author?.username?.charAt(0) }}
                  </el-avatar>
                  <span class="author-name">{{ article.author?.username }}</span>
                </div>
                <div class="meta-right">
                  <span class="meta-item">
                    <el-icon><View /></el-icon>
                    {{ article.views || 0 }}
                  </span>
                  <span class="meta-item">
                    <el-icon><ChatLineRound /></el-icon>
                    {{ article.comment_count || 0 }}
                  </span>
                </div>
              </div>
            </div>
          </article>
        </el-col>
      </el-row>

      <!-- 空状态 -->
      <el-empty
        v-else-if="!loading"
        description="暂无相关文章"
        :image-size="200"
      >
        <el-button type="primary" @click="$router.push('/article')">
          浏览所有文章
        </el-button>
      </el-empty>
    </div>

    <!-- 分页 -->
    <div class="pagination-wrapper" v-if="total > pageSize">
      <el-pagination
        v-model:current-page="currentPage"
        :page-size="pageSize"
        :total="total"
        layout="prev, pager, next, jumper"
        background
        @current-change="handlePageChange"
      />
    </div>

    <!-- 相关标签推荐 -->
    <div class="related-tags container" v-if="relatedTags.length > 0">
      <h3 class="section-title">相关标签</h3>
      <div class="tags-list">
        <el-tag
          v-for="tag in relatedTags"
          :key="tag.id"
          :color="tag.color || '#409eff'"
          effect="dark"
          size="large"
          class="related-tag"
          @click="goToTag(tag)"
        >
          {{ tag.name }}
          <span class="tag-count">({{ tag.article_count || 0 }})</span>
        </el-tag>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Document,
  Calendar,
  View,
  ChatLineRound,
  Picture
} from '@element-plus/icons-vue'
import { tagApi, articleApi } from '@/api'
import type { Tag, Article } from '@/types'
import dayjs from 'dayjs'

const route = useRoute()
const router = useRouter()

// 响应式数据
const loading = ref(false)
const tagInfo = ref<Tag | null>(null)
const articles = ref<Article[]>([])
const relatedTags = ref<Tag[]>([])
const currentPage = ref(1)
const pageSize = ref(12)
const total = ref(0)
const sortBy = ref('created_at')

// 获取标签详情
const fetchTagInfo = async (tagId: number) => {
  try {
    const data = await tagApi.getTagById(tagId)
    tagInfo.value = data
    document.title = `${data.name} - 标签`
  } catch (error) {
    console.error('获取标签信息失败:', error)
    ElMessage.error('获取标签信息失败')
  }
}

// 获取标签下的文章
const fetchArticles = async () => {
  loading.value = true
  try {
    const tagId = parseInt(route.params.id as string)
    const response = await articleApi.getArticles({
      tag_id: tagId,
      page: currentPage.value,
      limit: pageSize.value,
      sort_by: sortBy.value,
      sort_order: 'desc',
      status: 'published'
    })
    
    articles.value = response.articles || response.items || []
    total.value = response.total || 0
  } catch (error) {
    console.error('获取文章列表失败:', error)
    ElMessage.error('获取文章列表失败')
  } finally {
    loading.value = false
  }
}

// 获取相关标签
const fetchRelatedTags = async () => {
  try {
    const allTags = await tagApi.getTags()
    const currentId = parseInt(route.params.id as string)
    // 排除当前标签，按文章数量降序排序，取前8个
    relatedTags.value = allTags
      .filter(tag => tag.id !== currentId)
      .sort((a, b) => (b.article_count || 0) - (a.article_count || 0))
      .slice(0, 8)
  } catch (error) {
    console.error('获取相关标签失败:', error)
  }
}

// 格式化日期
const formatDate = (date: string) => {
  if (!date) return ''
  return dayjs(date).format('YYYY-MM-DD')
}

// 跳转到文章详情
const goToArticle = (article: Article) => {
  router.push({
    name: 'ArticleDetail',
    params: { id: article.id }
  })
}

// 跳转到其他标签
const goToTag = (tag: Tag) => {
  router.push({
    name: 'TagList',
    params: { id: tag.id }
  })
}

// 处理排序变化
const handleSortChange = () => {
  currentPage.value = 1
  fetchArticles()
}

// 处理分页变化
const handlePageChange = (page: number) => {
  currentPage.value = page
  fetchArticles()
  // 滚动到顶部
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// 监听路由变化
watch(() => route.params.id, (newId) => {
  if (newId && route.name === 'TagList') {
    const tagId = parseInt(newId as string)
    fetchTagInfo(tagId)
    currentPage.value = 1
    fetchArticles()
    fetchRelatedTags()
  }
})

onMounted(() => {
  const tagId = parseInt(route.params.id as string)
  if (tagId) {
    fetchTagInfo(tagId)
    fetchArticles()
    fetchRelatedTags()
  }
})
</script>

<style scoped lang="scss">
.tag-detail-page {
  min-height: calc(100vh - 60px);
  background: #f8f9fa;

  // 标签信息头部
  .tag-header {
    position: relative;
    padding: 80px 20px 60px;
    margin-bottom: 40px;
    overflow: hidden;
    
    .header-background {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      opacity: 0.9;
      z-index: 0;
    }
    
    .header-content {
      position: relative;
      z-index: 1;
      text-align: center;
      color: white;
      
      .tag-badge {
        font-size: 24px;
        padding: 12px 24px;
        margin-bottom: 20px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      }
      
      .tag-stats {
        display: flex;
        justify-content: center;
        gap: 32px;
        
        .stat-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          opacity: 0.9;
          
          .el-icon {
            font-size: 16px;
          }
        }
      }
    }
  }

  // 筛选栏
  .filter-section {
    margin: 0 0 32px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .section-title {
      font-size: 24px;
      font-weight: 600;
      margin: 0;
      color: #1f2937;
    }
    
    .filter-right {
      :deep(.el-select) {
        width: 140px;
      }
    }
  }

  // 文章容器
  .articles-container {
    min-height: 400px;
    
    .article-card {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      margin-bottom: 24px;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      
      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
        
        .cover-image {
          transform: scale(1.05);
        }
      }
      
      .article-cover {
        position: relative;
        width: 100%;
        height: 200px;
        overflow: hidden;
        
        .cover-image {
          width: 100%;
          height: 100%;
          transition: transform 0.3s ease;
        }
        
        .image-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f3f4f6;
          color: #9ca3af;
          font-size: 48px;
        }
        
        .article-category {
          position: absolute;
          top: 12px;
          left: 12px;
          padding: 4px 12px;
          background: rgba(255, 255, 255, 0.95);
          border-radius: 16px;
          font-size: 12px;
          font-weight: 500;
          color: #667eea;
        }
      }
      
      .article-body {
        padding: 20px;
        
        .article-title {
          font-size: 18px;
          font-weight: 600;
          margin: 0 0 12px 0;
          color: #1f2937;
          line-height: 1.4;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
        
        .article-summary {
          font-size: 14px;
          color: #6b7280;
          line-height: 1.6;
          margin: 0 0 16px 0;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
        }
        
        .article-tags {
          display: flex;
          gap: 8px;
          margin-bottom: 16px;
          align-items: center;
          
          .el-tag {
            cursor: pointer;
          }
          
          .more-tags {
            font-size: 12px;
            color: #9ca3af;
          }
        }
        
        .article-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          
          .meta-left {
            display: flex;
            align-items: center;
            gap: 8px;
            
            .author-avatar {
              border: 2px solid #e5e7eb;
            }
            
            .author-name {
              font-size: 13px;
              color: #6b7280;
            }
          }
          
          .meta-right {
            display: flex;
            gap: 12px;
            
            .meta-item {
              display: flex;
              align-items: center;
              gap: 4px;
              font-size: 12px;
              color: #9ca3af;
              
              .el-icon {
                font-size: 14px;
              }
            }
          }
        }
      }
    }
  }

  // 分页
  .pagination-wrapper {
    display: flex;
    justify-content: center;
    margin: 60px 0 40px;
    
    :deep(.el-pagination) {
      .el-pager li.is-active {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
      }
    }
  }

  // 相关标签
  .related-tags {
    margin: 60px 0 40px;
    padding: 40px;
    background: white;
    border-radius: 16px;
    
    .section-title {
      font-size: 20px;
      font-weight: 600;
      margin: 0 0 24px 0;
      color: #1f2937;
    }
    
    .tags-list {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      
      .related-tag {
        cursor: pointer;
        transition: all 0.3s ease;
        
        &:hover {
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        
        .tag-count {
          margin-left: 4px;
          opacity: 0.8;
        }
      }
    }
  }
}

// 容器样式
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

// 响应式设计
@media (max-width: 768px) {
  .tag-detail-page {
    .tag-header {
      padding: 60px 16px 40px;
      
      .header-content {
        .tag-badge {
          font-size: 20px;
        }
        
        .tag-stats {
          flex-direction: column;
          gap: 8px;
        }
      }
    }
    
    .filter-section {
      flex-direction: column;
      align-items: flex-start;
      gap: 16px;
      
      .section-title {
        font-size: 20px;
      }
    }
    
    .related-tags {
      padding: 24px 16px;
      margin: 40px 16px;
    }
  }
}
</style>