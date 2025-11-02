<template>
  <div class="comment-management">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h2>评论管理</h2>
        <p class="subtitle">管理所有文章评论</p>
      </div>
      <div class="header-actions">
        <el-button :icon="Refresh" @click="fetchComments">
          刷新
        </el-button>
      </div>
    </div>

    <!-- 搜索和筛选栏 -->
    <div class="search-bar">
      <el-input
        v-model="searchParams.keyword"
        placeholder="搜索评论内容、昵称..."
        :prefix-icon="Search"
        clearable
        style="width: 300px"
        @input="handleSearch"
      />
      
      <el-select
        v-model="searchParams.status"
        placeholder="选择状态"
        clearable
        style="width: 120px"
        @change="handleSearch"
      >
        <el-option label="全部" value="all" />
        <el-option label="已审核" value="approved" />
        <el-option label="待审核" value="pending" />
      </el-select>
    </div>

    <!-- 批量操作工具栏 -->
    <transition name="el-zoom-in-top">
      <div v-show="selectedIds.length > 0" class="batch-toolbar">
        <div class="batch-info">
          <el-icon><InfoFilled /></el-icon>
          已选择 <strong>{{ selectedIds.length }}</strong> 条评论
        </div>
        <div class="batch-actions">
          <el-button size="small" @click="clearSelection">取消选择</el-button>
          <el-button size="small" type="success" :icon="Select" @click="handleBatchApprove">
            批量审核
          </el-button>
          <el-button size="small" type="danger" :icon="Delete" @click="handleBatchDelete">
            批量删除
          </el-button>
        </div>
      </div>
    </transition>

    <!-- 数据表格 -->
    <el-table
      v-loading="loading"
      :data="comments"
      style="width: 100%"
      stripe
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      
      <el-table-column label="评论信息" min-width="400">
        <template #default="{ row }">
          <div class="comment-info">
            <div class="comment-header">
              <span class="nickname">{{ row.nickname }}</span>
              <el-tag v-if="row.parent_id" type="info" size="small" style="margin-left: 8px">
                回复
              </el-tag>
            </div>
            <div class="comment-content">
              {{ row.content }}
            </div>
            <div class="comment-meta">
              <span v-if="row.email" class="meta-item">
                <el-icon><Message /></el-icon>
                {{ row.email }}
              </span>
              <span class="meta-item">
                <el-icon><Clock /></el-icon>
                {{ formatDate(row.created_at) }}
              </span>
            </div>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="所属文章" width="200" show-overflow-tooltip>
        <template #default="{ row }">
          <span class="article-title">
            文章 ID: {{ row.article_id }}
          </span>
        </template>
      </el-table-column>

      <el-table-column label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="row.is_approved ? 'success' : 'warning'" size="small">
            {{ row.is_approved ? '已审核' : '待审核' }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="操作" width="280" fixed="right">
        <template #default="{ row }">
          <el-space>
            <el-button
              v-if="!row.is_approved"
              type="success"
              size="small"
              :icon="Select"
              link
              @click="handleApprove(row, true)"
            >
              审核通过
            </el-button>
            <el-button
              v-else
              type="warning"
              size="small"
              link
              @click="handleApprove(row, false)"
            >
              取消审核
            </el-button>
            <el-button
              type="primary"
              size="small"
              :icon="Edit"
              link
              @click="handleEdit(row)"
            >
              编辑
            </el-button>
            <el-popconfirm
              title="确定要删除这条评论吗？"
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

    <!-- 编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="编辑评论"
      width="600px"
      :close-on-click-modal="false"
      @closed="resetForm"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="评论内容" prop="content" required>
          <el-input
            v-model="formData.content"
            type="textarea"
            :rows="6"
            placeholder="请输入评论内容"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="审核状态">
          <el-switch
            v-model="formData.is_approved"
            active-text="已审核"
            inactive-text="待审核"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button
            type="primary"
            :loading="submitting"
            @click="handleSubmit"
          >
            保存
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Refresh, Search, Edit, Delete, Select, Message, Clock, InfoFilled
} from '@element-plus/icons-vue'
import { getAllComments, updateComment, deleteComment, approveComment } from '@/api/comment'
import type { Comment, UpdateCommentParams } from '@/types'

// 响应式数据
const loading = ref(false)
const comments = ref<Comment[]>([])
const selectedIds = ref<number[]>([])
const dialogVisible = ref(false)
const submitting = ref(false)
const currentEditId = ref<number>(0)

// 搜索参数
const searchParams = reactive({
  keyword: '',
  status: 'all' as 'approved' | 'pending' | 'all'
})

// 分页
const pagination = reactive({
  page: 1,
  limit: 20,
  total: 0
})

// 表单
const formRef = ref()
const formData = ref({
  content: '',
  is_approved: false
})

// 表单验证规则
const formRules = {
  content: [
    { required: true, message: '请输入评论内容', trigger: 'blur' },
    { min: 1, max: 500, message: '评论内容长度在 1 到 500 个字符', trigger: 'blur' }
  ]
}

// 方法
const fetchComments = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      limit: pagination.limit,
      keyword: searchParams.keyword || undefined,
      status: searchParams.status
    }
    
    const response = await getAllComments(params)
    comments.value = response.comments || []
    pagination.total = response.total || 0
  } catch (error) {
    ElMessage.error('获取评论列表失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.page = 1
  fetchComments()
}

const handleEdit = (row: Comment) => {
  currentEditId.value = row.id
  formData.value = {
    content: row.content,
    is_approved: row.is_approved
  }
  dialogVisible.value = true
}

const handleApprove = async (row: Comment, isApproved: boolean) => {
  try {
    await approveComment(row.id, isApproved)
    ElMessage.success(isApproved ? '审核通过' : '已取消审核')
    await fetchComments()
  } catch (error) {
    ElMessage.error('操作失败')
    console.error(error)
  }
}

const handleDelete = async (id: number) => {
  try {
    await deleteComment(id)
    ElMessage.success('删除成功')
    await fetchComments()
  } catch (error) {
    ElMessage.error('删除失败')
    console.error(error)
  }
}

const handleSubmit = async () => {
  try {
    await formRef.value?.validate()
    submitting.value = true
    
    const updateData: UpdateCommentParams = {
      content: formData.value.content,
      is_approved: formData.value.is_approved
    }
    
    await updateComment(currentEditId.value, updateData)
    ElMessage.success('更新成功')
    dialogVisible.value = false
    await fetchComments()
  } catch (error: any) {
    if (error !== false) {
      ElMessage.error('更新失败')
      console.error(error)
    }
  } finally {
    submitting.value = false
  }
}

const handleSelectionChange = (selection: Comment[]) => {
  selectedIds.value = selection.map(item => item.id)
}

const clearSelection = () => {
  selectedIds.value = []
}

const handleBatchDelete = async () => {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请选择要删除的评论')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedIds.value.length} 条评论吗？`,
      '批量删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    loading.value = true
    const promises = selectedIds.value.map(id => deleteComment(id))
    await Promise.all(promises)
    
    ElMessage.success(`成功删除 ${selectedIds.value.length} 条评论`)
    selectedIds.value = []
    await fetchComments()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('批量删除失败')
      console.error(error)
    }
  } finally {
    loading.value = false
  }
}

const handleBatchApprove = async () => {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请选择要审核的评论')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要审核通过选中的 ${selectedIds.value.length} 条评论吗？`,
      '批量审核',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      }
    )

    loading.value = true
    const promises = selectedIds.value.map(id => approveComment(id, true))
    await Promise.all(promises)
    
    ElMessage.success(`成功审核 ${selectedIds.value.length} 条评论`)
    selectedIds.value = []
    await fetchComments()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('批量审核失败')
      console.error(error)
    }
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  formData.value = {
    content: '',
    is_approved: false
  }
  formRef.value?.clearValidate()
}

const handleSizeChange = (size: number) => {
  pagination.limit = size
  pagination.page = 1
  fetchComments()
}

const handlePageChange = (page: number) => {
  pagination.page = page
  fetchComments()
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
  fetchComments()
})
</script>

<style scoped lang="scss">
.comment-management {
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

  .comment-info {
    .comment-header {
      margin-bottom: 8px;

      .nickname {
        font-size: 14px;
        font-weight: 600;
        color: #303133;
      }
    }

    .comment-content {
      font-size: 13px;
      color: #606266;
      line-height: 1.6;
      margin-bottom: 8px;
      padding: 8px 12px;
      background: #f5f7fa;
      border-radius: 4px;
      word-break: break-word;
    }

    .comment-meta {
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

  .article-title {
    font-size: 13px;
    color: #606266;
  }

  .pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>