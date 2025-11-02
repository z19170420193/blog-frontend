<template>
  <div class="dashboard">
    <h2 class="page-title">控制台</h2>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon article-icon">
              <el-icon :size="32"><Document /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-label">文章总数</div>
              <div class="stat-value">{{ stats.articleCount }}</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon category-icon">
              <el-icon :size="32"><Folder /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-label">分类数量</div>
              <div class="stat-value">{{ stats.categoryCount }}</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon tag-icon">
              <el-icon :size="32"><Collection /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-label">标签数量</div>
              <div class="stat-value">{{ stats.tagCount }}</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon comment-icon">
              <el-icon :size="32"><ChatDotRound /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-label">评论总数</div>
              <div class="stat-value">{{ stats.commentCount }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 快捷操作 -->
    <el-card class="quick-actions" shadow="hover">
      <template #header>
        <span>快捷操作</span>
      </template>
      <div class="actions-grid">
        <el-button type="primary" :icon="Edit" @click="router.push('/admin/articles/create')">
          创建文章
        </el-button>
        <el-button type="success" :icon="Folder" @click="router.push('/admin/categories')">
          管理分类
        </el-button>
        <el-button type="warning" :icon="Collection" @click="router.push('/admin/tags')">
          管理标签
        </el-button>
        <el-button type="info" :icon="Picture" @click="router.push('/admin/media')">
          媒体库
        </el-button>
      </div>
    </el-card>

    <!-- 最近文章 -->
    <el-row :gutter="20" class="content-row">
      <el-col :xs="24" :md="16">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>最近文章</span>
              <el-button text type="primary" @click="router.push('/admin/articles')">
                查看全部
              </el-button>
            </div>
          </template>
          <el-table :data="recentArticles" v-loading="loading">
            <el-table-column prop="title" label="标题" min-width="200" />
            <el-table-column prop="category.name" label="分类" width="100" />
            <el-table-column prop="views" label="浏览" width="80" align="center" />
            <el-table-column label="状态" width="80" align="center">
              <template #default="{ row }">
                <el-tag :type="row.status === 'published' ? 'success' : 'info'" size="small">
                  {{ row.status === 'published' ? '已发布' : '草稿' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="created_at" label="创建时间" width="160">
              <template #default="{ row }">
                {{ formatDate(row.created_at) }}
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <el-col :xs="24" :md="8">
        <el-card shadow="hover">
          <template #header>
            <span>系统信息</span>
          </template>
          <div class="system-info">
            <div class="info-item">
              <span class="label">系统版本</span>
              <span class="value">v1.0.0</span>
            </div>
            <div class="info-item">
              <span class="label">Node 版本</span>
              <span class="value">18.x</span>
            </div>
            <div class="info-item">
              <span class="label">数据库</span>
              <span class="value">MySQL 8.0</span>
            </div>
            <div class="info-item">
              <span class="label">运行时间</span>
              <span class="value">3天12小时</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { articleApi, categoryApi, tagApi, commentApi } from '@/api'
import { Document, Folder, Collection, ChatDotRound, Edit, Picture } from '@element-plus/icons-vue'
import dayjs from 'dayjs'

const router = useRouter()
const loading = ref(false)

// 统计数据
const stats = ref({
  articleCount: 0,
  categoryCount: 0,
  tagCount: 0,
  commentCount: 0,
})

// 最近文章
const recentArticles = ref<any[]>([])

// 格式化日期
const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

// 加载统计数据
const loadStats = async () => {
  try {
    const [articles, categories, tags] = await Promise.all([
      articleApi.getArticles({ page: 1, limit: 1 }),
      categoryApi.getCategories(),
      tagApi.getTags(),
    ])

    stats.value = {
      articleCount: articles.total || 0,
      categoryCount: categories.length || 0,
      tagCount: tags.length || 0,
      commentCount: 0, // 待实现
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

// 加载最近文章
const loadRecentArticles = async () => {
  loading.value = true
  try {
    const res = await articleApi.getArticles({ page: 1, limit: 5 })
    recentArticles.value = res.articles || res.items || []
  } catch (error) {
    console.error('加载最近文章失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadStats()
  loadRecentArticles()
})
</script>

<style scoped lang="scss">
.dashboard {
  .page-title {
    margin-bottom: 20px;
    font-size: 24px;
    font-weight: 500;
    color: #333;
  }

  .stats-row {
    margin-bottom: 20px;
  }

  .stat-card {
    margin-bottom: 20px;

    .stat-content {
      display: flex;
      align-items: center;
      gap: 20px;

      .stat-icon {
        width: 60px;
        height: 60px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 8px;
        color: #fff;

        &.article-icon {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        &.category-icon {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        }

        &.tag-icon {
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
        }

        &.comment-icon {
          background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
        }
      }

      .stat-info {
        flex: 1;

        .stat-label {
          font-size: 14px;
          color: #999;
          margin-bottom: 8px;
        }

        .stat-value {
          font-size: 28px;
          font-weight: bold;
          color: #333;
        }
      }
    }
  }

  .quick-actions {
    margin-bottom: 20px;

    .actions-grid {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }
  }

  .content-row {
    margin-top: 20px;
  }

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .system-info {
    .info-item {
      display: flex;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid #f0f0f0;

      &:last-child {
        border-bottom: none;
      }

      .label {
        color: #666;
        font-size: 14px;
      }

      .value {
        color: #333;
        font-weight: 500;
        font-size: 14px;
      }
    }
  }
}
</style>
