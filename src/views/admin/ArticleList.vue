<template>
  <div class="article-management">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h2>文章管理</h2>
        <p class="subtitle">管理博客文章内容</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" :icon="Plus" @click="handleCreate">
          创建文章
        </el-button>
        <el-button :icon="Refresh" @click="fetchArticles">
          刷新
        </el-button>
      </div>
    </div>

    <!-- 搜索和筛选栏 -->
    <div class="search-bar">
      <el-input
        v-model="searchParams.keyword"
        placeholder="搜索文章标题..."
        :prefix-icon="Search"
        clearable
        style="width: 300px"
        @input="handleSearch"
      />
      
      <el-select
        v-model="searchParams.category_id"
        placeholder="选择分类"
        clearable
        style="width: 150px"
        @change="handleSearch"
      >
        <el-option
          v-for="cat in categories"
          :key="cat.id"
          :label="cat.name"
          :value="cat.id"
        />
      </el-select>

      <el-select
        v-model="searchParams.tag_id"
        placeholder="选择标签"
        clearable
        style="width: 150px"
        @change="handleSearch"
      >
        <el-option
          v-for="tag in tags"
          :key="tag.id"
          :label="tag.name"
          :value="tag.id"
        >
          <span :style="{ color: tag.color || '#606266', fontWeight: tag.color ? '500' : 'normal' }">
            {{ tag.name }}
          </span>
        </el-option>
      </el-select>

      <el-select
        v-model="searchParams.status"
        placeholder="选择状态"
        clearable
        style="width: 120px"
        @change="handleSearch"
      >
        <el-option label="已发布" value="published" />
        <el-option label="草稿" value="draft" />
      </el-select>
    </div>

    <!-- 批量操作工具栏 -->
    <transition name="el-zoom-in-top">
      <div v-show="selectedIds.length > 0" class="batch-toolbar">
        <div class="batch-info">
          <el-icon><InfoFilled /></el-icon>
          已选择 <strong>{{ selectedIds.length }}</strong> 篇文章
        </div>
        <div class="batch-actions">
          <el-button size="small" @click="clearSelection">取消选择</el-button>
          <el-dropdown @command="handleBatchCommand">
            <el-button size="small" type="primary">
              批量操作 <el-icon class="el-icon--right"><arrow-down /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="publish">
                  <el-icon><Upload /></el-icon> 批量发布
                </el-dropdown-item>
                <el-dropdown-item command="draft">
                  <el-icon><Document /></el-icon> 转为草稿
                </el-dropdown-item>
                <el-dropdown-item command="top" divided>
                  <el-icon><Top /></el-icon> 批量置顶
                </el-dropdown-item>
                <el-dropdown-item command="untop">
                  <el-icon><Bottom /></el-icon> 取消置顶
                </el-dropdown-item>
                <el-dropdown-item command="delete" divided>
                  <el-icon><Delete /></el-icon> 批量删除
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </transition>

    <!-- 数据表格 -->
    <el-table
      v-loading="loading"
      :data="articles"
      style="width: 100%"
      stripe
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      
      <el-table-column label="文章信息" min-width="350">
        <template #default="{ row }">
          <div class="article-info">
            <img
              v-if="row.cover_image"
              :src="row.cover_image"
              class="article-cover"
              alt="封面"
            />
            <div class="article-details">
              <div class="article-title">
                <el-tag v-if="row.is_top" type="danger" size="small" style="margin-right: 8px">
                  置顶
                </el-tag>
                <span>{{ row.title }}</span>
              </div>
              <div v-if="row.summary" class="article-summary">
                {{ row.summary }}
              </div>
              <div class="article-meta">
                <span v-if="row.author" class="meta-item">
                  <el-icon><User /></el-icon>
                  {{ row.author.username }}
                </span>
                <span class="meta-item">
                  <el-icon><View /></el-icon>
                  {{ row.views || 0 }}
                </span>
                <!-- <span v-if="row.comment_count" class="meta-item">
                  <el-icon><ChatDotRound /></el-icon>
                  {{ row.comment_count }}
                </span> -->
              </div>
            </div>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="分类" width="120" align="center">
        <template #default="{ row }">
          <el-tag v-if="row.category" size="small">
            {{ row.category.name }}
          </el-tag>
          <span v-else class="text-muted">-</span>
        </template>
      </el-table-column>

      <el-table-column label="标签" width="200">
        <template #default="{ row }">
          <el-tag
            v-for="tag in (row.tags || []).slice(0, 3)"
            :key="tag.id"
            size="small"
            :style="{ backgroundColor: tag.color || '#409eff', color: '#fff', marginRight: '5px' }"
          >
            {{ tag.name }}
          </el-tag>
          <el-tag v-if="row.tags && row.tags.length > 3" size="small" type="info">
            +{{ row.tags.length - 3 }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="row.status === 'published' ? 'success' : 'info'" size="small">
            {{ row.status === 'published' ? '已发布' : '草稿' }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="创建时间" width="180">
        <template #default="{ row }">
          {{ formatDate(row.created_at) }}
        </template>
      </el-table-column>

      <el-table-column label="操作" width="240" fixed="right">
        <template #default="{ row }">
          <el-space>
            <el-button
              type="primary"
              size="small"
              :icon="Edit"
              link
              @click="handleEdit(row.id)"
            >
              编辑
            </el-button>
            <el-button
              :type="row.is_top ? 'warning' : 'default'"
              size="small"
              link
              @click="handleToggleTop(row)"
            >
              {{ row.is_top ? '取消置顶' : '置顶' }}
            </el-button>
            <el-popconfirm
              title="确定要删除这篇文章吗？"
              confirm-button-text="确定"
              cancel-button-text="取消"
              @confirm="handleDelete(row.id)"
            >
              <template #reference>
                <el-button type="danger" size="small" :icon="Delete" link>
                  删除
                </el-button>
              </template>
            </el-popconfirm>
          </el-space>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination">
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.limit"
        :page-sizes="[10, 20, 50, 100]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus, Refresh, Search, Edit, Delete, User, View, InfoFilled,
  ArrowDown, Upload, Document, Top, Bottom, Folder, CollectionTag
} from '@element-plus/icons-vue'
import { 
  getArticles, 
  deleteArticle, 
  updateArticle, 
  batchDeleteArticles,
  batchUpdateArticleStatus,
  batchUpdateArticleTop
} from '@/api/article'
import { getCategories } from '@/api/category'
import { getTags } from '@/api/tag'
import type { Article, ArticleQueryParams } from '@/types'
import type { Category } from '@/types'
import type { Tag } from '@/types'

const router = useRouter()

// 响应式数据
const loading = ref(false)
const articles = ref<Article[]>([])
const categories = ref<Category[]>([])
const tags = ref<Tag[]>([])
const selectedIds = ref<number[]>([])

// 搜索参数
const searchParams = reactive<ArticleQueryParams>({
  keyword: '',
  category_id: undefined,
  tag_id: undefined,
  status: undefined,
  page: 1,
  limit: 20
})

// 分页
const pagination = reactive({
  page: 1,
  limit: 20,
  total: 0
})

// 方法
const fetchArticles = async () => {
  loading.value = true
  try {
    const params: ArticleQueryParams = {
      ...searchParams,
      page: pagination.page,
      limit: pagination.limit
    }
    
    const response = await getArticles(params)
    
    // 兼容两种响应格式
    articles.value = (response.articles || response.items || []) as Article[]
    pagination.total = response.total || 0
  } catch (error) {
    ElMessage.error('获取文章列表失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

const fetchCategories = async () => {
  try {
    const data = await getCategories()
    categories.value = data as Category[]
  } catch (error) {
    console.error('获取分类列表失败:', error)
  }
}

const fetchTags = async () => {
  try {
    const data = await getTags()
    tags.value = data as Tag[]
  } catch (error) {
    console.error('获取标签列表失败:', error)
  }
}

const handleSearch = () => {
  pagination.page = 1
  fetchArticles()
}

const handleCreate = () => {
  router.push('/admin/articles/create')
}

const handleEdit = (id: number) => {
  router.push(`/admin/articles/edit/${id}`)
}

const handleToggleTop = async (row: Article) => {
  try {
    await updateArticle(row.id, { 
      title: row.title,
      content: row.content,
      status: row.status,
      is_top: !row.is_top 
    })
    ElMessage.success(row.is_top ? '已取消置顶' : '已置顶')
    await fetchArticles()
  } catch (error) {
    ElMessage.error('操作失败')
    console.error(error)
  }
}

const handleDelete = async (id: number) => {
  try {
    await deleteArticle(id)
    ElMessage.success('删除成功')
    await fetchArticles()
  } catch (error) {
    ElMessage.error('删除失败')
    console.error(error)
  }
}

const handleSelectionChange = (selection: Article[]) => {
  selectedIds.value = selection.map(item => item.id)
}

const clearSelection = () => {
  selectedIds.value = []
}

const handleBatchCommand = async (command: string) => {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请选择要操作的文章')
    return
  }

  switch (command) {
    case 'publish':
      await handleBatchUpdateStatus('published')
      break
    case 'draft':
      await handleBatchUpdateStatus('draft')
      break
    case 'top':
      await handleBatchUpdateTop(true)
      break
    case 'untop':
      await handleBatchUpdateTop(false)
      break
    case 'delete':
      await handleBatchDelete()
      break
  }
}

const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedIds.value.length} 篇文章吗？`,
      '批量删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    loading.value = true
    const response: any = await batchDeleteArticles(selectedIds.value)
    
    if (response.data?.errors && response.data.errors.length > 0) {
      ElMessageBox.alert(
        response.data.errors.join('\n'),
        '部分文章删除失败',
        { type: 'warning' }
      )
    } else {
      ElMessage.success(`成功删除 ${response.data.deleted_count} 篇文章`)
    }
    
    selectedIds.value = []
    await fetchArticles()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('批量删除失败')
      console.error(error)
    }
  } finally {
    loading.value = false
  }
}

const handleBatchUpdateStatus = async (status: 'draft' | 'published') => {
  const statusText = status === 'published' ? '发布' : '转为草稿'
  
  try {
    await ElMessageBox.confirm(
      `确定要将选中的 ${selectedIds.value.length} 篇文章${statusText}吗？`,
      `批量${statusText}`,
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      }
    )

    loading.value = true
    const response: any = await batchUpdateArticleStatus(selectedIds.value, status)
    
    if (response.data?.errors && response.data.errors.length > 0) {
      ElMessageBox.alert(
        response.data.errors.join('\n'),
        `部分文章${statusText}失败`,
        { type: 'warning' }
      )
    } else {
      ElMessage.success(`成功${statusText} ${response.data.affected_count} 篇文章`)
    }
    
    selectedIds.value = []
    await fetchArticles()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(`批量${statusText}失败`)
      console.error(error)
    }
  } finally {
    loading.value = false
  }
}

const handleBatchUpdateTop = async (is_top: boolean) => {
  const actionText = is_top ? '置顶' : '取消置顶'
  
  try {
    await ElMessageBox.confirm(
      `确定要将选中的 ${selectedIds.value.length} 篇文章${actionText}吗？`,
      `批量${actionText}`,
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      }
    )

    loading.value = true
    const response: any = await batchUpdateArticleTop(selectedIds.value, is_top)
    
    if (response.data?.errors && response.data.errors.length > 0) {
      ElMessageBox.alert(
        response.data.errors.join('\n'),
        `部分文章${actionText}失败`,
        { type: 'warning' }
      )
    } else {
      ElMessage.success(`成功${actionText} ${response.data.affected_count} 篇文章`)
    }
    
    selectedIds.value = []
    await fetchArticles()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(`批量${actionText}失败`)
      console.error(error)
    }
  } finally {
    loading.value = false
  }
}

const handleSizeChange = (size: number) => {
  pagination.limit = size
  pagination.page = 1
  fetchArticles()
}

const handlePageChange = (page: number) => {
  pagination.page = page
  fetchArticles()
}

// 工具方法
const formatDate = (date: string) => {
  return new Date(date).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 生命周期
onMounted(() => {
  fetchCategories()
  fetchTags()
  fetchArticles()
})
</script>

<style scoped lang="scss">
.article-management {
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    .header-left {
      h2 {
        margin: 0;
        font-size: 24px;
        font-weight: 600;
        color: #303133;
      }

      .subtitle {
        margin: 8px 0 0;
        font-size: 14px;
        color: #909399;
      }
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }
  }

  .search-bar {
    display: flex;
    gap: 12px;
    align-items: center;
    margin-bottom: 16px;
  }

  .batch-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background: #ecf5ff;
    border: 1px solid #d9ecff;
    border-radius: 4px;
    margin-bottom: 16px;

    .batch-info {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #409eff;
      font-size: 14px;

      .el-icon {
        font-size: 16px;
      }

      strong {
        color: #409eff;
        margin: 0 4px;
      }
    }

    .batch-actions {
      display: flex;
      gap: 8px;
    }
  }

  .article-info {
    display: flex;
    gap: 12px;

    .article-cover {
      width: 80px;
      height: 60px;
      object-fit: cover;
      border-radius: 4px;
      flex-shrink: 0;
    }

    .article-details {
      flex: 1;
      min-width: 0;

      .article-title {
        font-size: 14px;
        font-weight: 600;
        color: #303133;
        margin-bottom: 4px;
        display: flex;
        align-items: center;
      }

      .article-summary {
        font-size: 12px;
        color: #909399;
        margin-bottom: 8px;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        line-height: 1.4;
      }

      .article-meta {
        display: flex;
        gap: 16px;
        font-size: 12px;
        color: #909399;

        .meta-item {
          display: flex;
          align-items: center;
          gap: 4px;

          .el-icon {
            font-size: 14px;
          }
        }
      }
    }
  }

  .text-muted {
    color: #909399;
  }

  .pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>