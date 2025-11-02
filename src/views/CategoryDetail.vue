<template>
  <div class="category-detail-page">
    <!-- 分类信息头部 -->
    <div class="category-header" v-if="categoryInfo">
      <div class="header-background"></div>
      <div class="header-content container">
        <div class="category-badge">
          <el-icon class="badge-icon"><Folder /></el-icon>
          <span class="badge-text">{{ categoryInfo.name }}</span>
        </div>
        <p class="category-description" v-if="categoryInfo.description">
          {{ categoryInfo.description }}
        </p>
        <div class="category-stats">
          <span class="stat-item">
            <el-icon><Document /></el-icon>
            {{ categoryInfo.article_count || 0 }} 篇文章
          </span>
          <span class="stat-item">
            <el-icon><Calendar /></el-icon>
            创建于 {{ formatDate(categoryInfo.created_at) }}
          </span>
        </div>
      </div>
    </div>

    <!-- 文章筛选栏 -->
    <div class="filter-section container">
      <div class="filter-left">
        <h2 class="section-title">分类文章</h2>
        <p class="section-desc">共找到 {{ total }} 篇相关文章</p>
      </div>
      <div class="filter-right">
        <el-radio-group v-model="viewMode" size="default">
          <el-radio-button value="grid">
            <el-icon><Grid /></el-icon>
            网格
          </el-radio-button>
          <el-radio-button value="list">
            <el-icon><List /></el-icon>
            列表
          </el-radio-button>
        </el-radio-group>
        <el-select
          v-model="sortBy"
          placeholder="排序方式"
          style="width: 140px"
          @change="handleSortChange"
        >
          <el-option label="最新发布" value="published_at" />
          <el-option label="最多浏览" value="views" />
          <el-option label="最多评论" value="comment_count" />
        </el-select>
      </div>
    </div>

    <!-- 文章列表 -->
    <div class="articles-container container" v-loading="loading">
      <!-- 网格模式 -->
      <el-row :gutter="20" v-if="articles.length > 0 && viewMode === 'grid'">
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
              <div class="article-badges">
                <el-tag v-if="article.is_top" type="danger" size="small" effect="dark">
                  <el-icon><Top /></el-icon>
                  置顶
                </el-tag>
              </div>
            </div>

            <!-- 文章信息 -->
            <div class="article-body">
              <h3 class="article-title">{{ article.title }}</h3>
              <p class="article-summary">
                {{ article.summary || article.content.substring(0, 100) }}...
              </p>

              <!-- 文章标签 -->
              <div class="article-tags" v-if="article.tags && article.tags.length > 0">
                <el-tag
                  v-for="tag in article.tags.slice(0, 3)"
                  :key="tag.id"
                  size="small"
                  :color="tag.color"
                  effect="plain"
                  @click.stop="goToTag(tag)"
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

      <!-- 列表模式 -->
      <div class="list-view" v-if="articles.length > 0 && viewMode === 'list'">
        <article
          v-for="article in articles"
          :key="article.id"
          class="article-list-item"
          @click="goToArticle(article)"
        >
          <div class="list-item-image" v-if="article.cover_image">
            <el-image :src="article.cover_image" fit="cover" lazy>
              <template #error>
                <div class="image-placeholder">
                  <el-icon><Picture /></el-icon>
                </div>
              </template>
            </el-image>
            <el-tag v-if="article.is_top" class="top-badge" type="danger" size="small">
              <el-icon><Top /></el-icon>
              置顶
            </el-tag>
          </div>
          <div class="list-item-content">
            <h3 class="list-item-title">{{ article.title }}</h3>
            <p class="list-item-summary">
              {{ article.summary || article.content.substring(0, 150) }}...
            </p>
            <div class="list-item-tags" v-if="article.tags && article.tags.length > 0">
              <el-tag
                v-for="tag in article.tags.slice(0, 4)"
                :key="tag.id"
                size="small"
                :color="tag.color"
                effect="plain"
                @click.stop="goToTag(tag)"
              >
                {{ tag.name }}
              </el-tag>
            </div>
            <div class="list-item-meta">
              <div class="meta-left">
                <el-avatar :src="article.author?.avatar" :size="24">
                  {{ article.author?.username?.charAt(0) }}
                </el-avatar>
                <span class="author-name">{{ article.author?.username }}</span>
                <span class="meta-divider">·</span>
                <span class="publish-date">{{ formatDate(article.published_at) }}</span>
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
      </div>

      <!-- 空状态 -->
      <el-empty
        v-if="!loading && articles.length === 0"
        description="该分类暂无文章"
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

    <!-- 其他分类推荐 -->
    <div class="related-categories container" v-if="relatedCategories.length > 0">
      <h3 class="section-title">其他分类</h3>
      <div class="categories-list">
        <div
          v-for="category in relatedCategories"
          :key="category.id"
          class="category-item"
          @click="goToCategory(category)"
        >
          <div class="category-icon">
            <el-icon><Folder /></el-icon>
          </div>
          <div class="category-info">
            <h4 class="category-name">{{ category.name }}</h4>
            <p class="category-desc" v-if="category.description">
              {{ category.description }}
            </p>
            <div class="category-count">
              <el-tag size="small" type="info">{{ category.article_count || 0 }} 篇文章</el-tag>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Folder,
  Document,
  Calendar,
  View,
  ChatLineRound,
  Picture,
  Grid,
  List,
  Top,
} from '@element-plus/icons-vue'
import { categoryApi, articleApi } from '@/api'
import type { Category, Article, Tag } from '@/types'
import dayjs from 'dayjs'

const route = useRoute()
const router = useRouter()

// 响应式数据
const loading = ref(false)
const categoryInfo = ref<Category | null>(null)
const articles = ref<Article[]>([])
const relatedCategories = ref<Category[]>([])
const currentPage = ref(1)
const pageSize = ref(12)
const total = ref(0)
const sortBy = ref('published_at')
const viewMode = ref<'grid' | 'list'>('grid')

// 获取分类详情
const fetchCategoryInfo = async (categoryId: number) => {
  try {
    const data = await categoryApi.getCategoryById(categoryId)
    categoryInfo.value = data
    document.title = `${data.name} - 分类`
  } catch (error) {
    console.error('获取分类信息失败:', error)
    ElMessage.error('获取分类信息失败')
  }
}

// 获取分类下的文章
const fetchArticles = async () => {
  loading.value = true
  try {
    const categoryId = parseInt(route.params.id as string)
    const response = await articleApi.getArticles({
      category_id: categoryId,
      page: currentPage.value,
      limit: pageSize.value,
      sort_by: sortBy.value,
      sort_order: 'desc',
      status: 'published',
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

// 获取相关分类
const fetchRelatedCategories = async () => {
  try {
    const allCategories = await categoryApi.getCategories()
    const currentId = parseInt(route.params.id as string)
    // 排除当前分类，按文章数量降序排序，取前6个
    relatedCategories.value = allCategories
      .filter((cat) => cat.id !== currentId)
      .sort((a, b) => (b.article_count || 0) - (a.article_count || 0))
      .slice(0, 6)
  } catch (error) {
    console.error('获取相关分类失败:', error)
  }
}

// 格式化日期
const formatDate = (date: string | null) => {
  if (!date) return ''
  return dayjs(date).format('YYYY-MM-DD')
}

// 跳转到文章详情
const goToArticle = (article: Article) => {
  router.push({
    name: 'ArticleDetail',
    params: { id: article.id },
  })
}

// 跳转到标签页
const goToTag = (tag: Tag) => {
  router.push({
    name: 'TagList',
    params: { id: tag.id },
  })
}

// 跳转到其他分类
const goToCategory = (category: Category) => {
  router.push({
    name: 'CategoryList',
    params: { id: category.id },
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
watch(
  () => route.params.id,
  (newId) => {
    if (newId && route.name === 'CategoryList') {
      const categoryId = parseInt(newId as string)
      fetchCategoryInfo(categoryId)
      currentPage.value = 1
      fetchArticles()
      fetchRelatedCategories()
    }
  }
)

onMounted(() => {
  const categoryId = parseInt(route.params.id as string)
  if (categoryId) {
    fetchCategoryInfo(categoryId)
    fetchArticles()
    fetchRelatedCategories()
  }
})
</script>

<style scoped lang="scss">
.category-detail-page {
  min-height: calc(100vh - 60px);
  background: #f8f9fa;

  // 分类信息头部
  .category-header {
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

      .category-badge {
        display: inline-flex;
        align-items: center;
        gap: 12px;
        padding: 16px 32px;
        background: rgba(255, 255, 255, 0.15);
        backdrop-filter: blur(10px);
        border-radius: 50px;
        margin-bottom: 20px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);

        .badge-icon {
          font-size: 28px;
        }

        .badge-text {
          font-size: 28px;
          font-weight: 700;
          letter-spacing: 0.5px;
        }
      }

      .category-description {
        font-size: 16px;
        line-height: 1.6;
        margin: 0 auto 24px;
        max-width: 600px;
        opacity: 0.95;
      }

      .category-stats {
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
    flex-wrap: wrap;
    gap: 16px;

    .filter-left {
      .section-title {
        font-size: 24px;
        font-weight: 600;
        margin: 0 0 4px 0;
        color: #1f2937;
      }

      .section-desc {
        font-size: 14px;
        color: #6b7280;
        margin: 0;
      }
    }

    .filter-right {
      display: flex;
      gap: 12px;
      align-items: center;
    }
  }

  // 文章容器
  .articles-container {
    min-height: 400px;

    // 网格模式
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

        .article-badges {
          position: absolute;
          top: 12px;
          right: 12px;
          display: flex;
          gap: 8px;
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
          flex-wrap: wrap;

          .el-tag {
            cursor: pointer;
            transition: all 0.2s;

            &:hover {
              transform: scale(1.05);
            }
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

    // 列表模式
    .list-view {
      display: flex;
      flex-direction: column;
      gap: 20px;

      .article-list-item {
        display: flex;
        gap: 20px;
        background: white;
        border-radius: 12px;
        overflow: hidden;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);

          .list-item-image img {
            transform: scale(1.05);
          }
        }

        .list-item-image {
          position: relative;
          width: 280px;
          height: 200px;
          flex-shrink: 0;
          overflow: hidden;
          background: #f3f4f6;

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.3s ease;
          }

          .image-placeholder {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #9ca3af;
            font-size: 48px;
          }

          .top-badge {
            position: absolute;
            top: 12px;
            right: 12px;
          }
        }

        .list-item-content {
          flex: 1;
          padding: 20px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;

          .list-item-title {
            font-size: 20px;
            font-weight: 600;
            color: #1f2937;
            margin: 0 0 12px 0;
            line-height: 1.4;
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
          }

          .list-item-summary {
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

          .list-item-tags {
            display: flex;
            gap: 8px;
            margin-bottom: 16px;
            flex-wrap: wrap;

            .el-tag {
              cursor: pointer;
              transition: all 0.2s;

              &:hover {
                transform: scale(1.05);
              }
            }
          }

          .list-item-meta {
            display: flex;
            justify-content: space-between;
            align-items: center;

            .meta-left {
              display: flex;
              align-items: center;
              gap: 8px;
              font-size: 13px;
              color: #6b7280;

              .author-name {
                font-weight: 500;
              }

              .meta-divider {
                opacity: 0.5;
              }

              .publish-date {
                opacity: 0.8;
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

  // 相关分类
  .related-categories {
    margin: 60px auto 40px;
    padding: 40px;
    background: white;
    border-radius: 16px;

    .section-title {
      font-size: 20px;
      font-weight: 600;
      margin: 0 0 24px 0;
      color: #1f2937;
    }

    .categories-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 20px;

      .category-item {
        display: flex;
        gap: 16px;
        padding: 20px;
        background: #f9fafb;
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.3s ease;
        border: 2px solid transparent;

        &:hover {
          background: #ffffff;
          border-color: #667eea;
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(102, 126, 234, 0.1);

          .category-icon {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
          }
        }

        .category-icon {
          width: 48px;
          height: 48px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #e5e7eb;
          color: #667eea;
          border-radius: 10px;
          font-size: 24px;
          transition: all 0.3s ease;
        }

        .category-info {
          flex: 1;

          .category-name {
            font-size: 16px;
            font-weight: 600;
            margin: 0 0 6px 0;
            color: #1f2937;
          }

          .category-desc {
            font-size: 13px;
            color: #6b7280;
            margin: 0 0 8px 0;
            line-height: 1.4;
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
          }

          .category-count {
            .el-tag {
              font-size: 12px;
            }
          }
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
@media (max-width: 992px) {
  .category-detail-page {
    .articles-container {
      .list-view {
        .article-list-item {
          .list-item-image {
            width: 200px;
            height: 150px;
          }
        }
      }
    }

    .related-categories {
      .categories-list {
        grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      }
    }
  }
}

@media (max-width: 768px) {
  .category-detail-page {
    .category-header {
      padding: 60px 16px 40px;

      .header-content {
        .category-badge {
          padding: 12px 24px;

          .badge-icon {
            font-size: 24px;
          }

          .badge-text {
            font-size: 24px;
          }
        }

        .category-description {
          font-size: 14px;
        }

        .category-stats {
          flex-direction: column;
          gap: 8px;
        }
      }
    }

    .filter-section {
      flex-direction: column;
      align-items: flex-start;

      .filter-left {
        .section-title {
          font-size: 20px;
        }
      }

      .filter-right {
        width: 100%;
        justify-content: space-between;
      }
    }

    .articles-container {
      .list-view {
        .article-list-item {
          flex-direction: column;

          .list-item-image {
            width: 100%;
            height: 200px;
          }

          .list-item-content {
            .list-item-meta {
              flex-direction: column;
              align-items: flex-start;
              gap: 12px;
            }
          }
        }
      }
    }

    .related-categories {
      padding: 24px 16px;
      margin: 40px 16px;

      .categories-list {
        grid-template-columns: 1fr;
      }
    }
  }
}
</style>
