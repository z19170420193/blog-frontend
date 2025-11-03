<template>
  <div class="message-management">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h2>留言管理</h2>
        <p class="subtitle">管理全站留言墙</p>
      </div>
      <div class="header-actions">
        <el-button :icon="Refresh" @click="fetchMessages">
          刷新
        </el-button>
        <el-button :icon="PieChart" @click="showStats">
          统计
        </el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon total">
              <el-icon><ChatLineRound /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.total }}</div>
              <div class="stat-label">总留言数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon approved">
              <el-icon><Select /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.approved }}</div>
              <div class="stat-label">已审核</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon pending">
              <el-icon><Clock /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.pending }}</div>
              <div class="stat-label">待审核</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon rejected">
              <el-icon><Close /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.rejected }}</div>
              <div class="stat-label">已拒绝</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 搜索和筛选栏 -->
    <div class="search-bar">
      <el-input
        v-model="searchParams.keyword"
        placeholder="搜索留言内容、昵称..."
        :prefix-icon="Search"
        clearable
        style="width: 300px"
        @input="handleSearch"
      />
      
      <el-select
        v-model="searchParams.status"
        placeholder="选择状态"
        clearable
        style="width: 140px"
        @change="handleSearch"
      >
        <el-option label="全部" value="all" />
        <el-option label="已审核" value="approved" />
        <el-option label="待审核" value="pending" />
        <el-option label="已拒绝" value="rejected" />
      </el-select>

      <el-select
        v-model="searchParams.mood"
        placeholder="选择心情"
        clearable
        style="width: 140px"
        @change="handleSearch"
      >
        <el-option label="全部" value="" />
        <el-option label="😊 开心" value="happy" />
        <el-option label="😢 难过" value="sad" />
        <el-option label="😠 生气" value="angry" />
        <el-option label="🤩 兴奋" value="excited" />
        <el-option label="🤔 思考" value="thinking" />
      </el-select>
    </div>

    <!-- 批量操作工具栏 -->
    <transition name="el-zoom-in-top">
      <div v-show="selectedIds.length > 0" class="batch-toolbar">
        <div class="batch-info">
          <el-icon><InfoFilled /></el-icon>
          已选择 <strong>{{ selectedIds.length }}</strong> 条留言
        </div>
        <div class="batch-actions">
          <el-button size="small" @click="clearSelection">取消选择</el-button>
          <el-button size="small" type="success" :icon="Select" @click="handleBatchApprove('approved')">
            批量通过
          </el-button>
          <el-button size="small" type="warning" :icon="Warning" @click="handleBatchApprove('rejected')">
            批量拒绝
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
      :data="messages"
      style="width: 100%"
      stripe
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      
      <el-table-column prop="id" label="ID" width="80" />

      <el-table-column label="留言信息" min-width="400">
        <template #default="{ row }">
          <div class="message-info">
            <div class="message-header">
              <el-avatar :size="32" :src="row.avatar || row.user?.avatar">
                {{ (row.nickname || '匿名')[0] }}
              </el-avatar>
              <span class="nickname">{{ row.nickname }}</span>
              <el-tag
                v-if="row.mood"
                size="small"
                :type="getMoodType(row.mood)"
                class="mood-tag"
              >
                {{ getMoodText(row.mood) }}
              </el-tag>
            </div>
            <div class="message-content">
              {{ row.content }}
            </div>
            <div class="message-meta">
              <span v-if="row.email" class="meta-item">
                <el-icon><Message /></el-icon>
                {{ row.email }}
              </span>
              <span v-if="row.ip" class="meta-item">
                <el-icon><Location /></el-icon>
                {{ row.ip }}
              </span>
              <span class="meta-item">
                <el-icon><Timer /></el-icon>
                {{ formatDate(row.created_at) }}
              </span>
              <span v-if="row.likes > 0" class="meta-item">
                <el-icon><Select /></el-icon>
                {{ row.likes }} 个赞
              </span>
            </div>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag
            :type="getStatusType(row.status)"
            size="small"
          >
            {{ getStatusText(row.status) }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="回复" width="80" align="center">
        <template #default="{ row }">
          <el-tag v-if="row.reply_to_id" type="info" size="small">
            回复
          </el-tag>
          <el-tag v-else-if="row.replies && row.replies.length > 0" type="success" size="small">
            {{ row.replies.length }}
          </el-tag>
          <span v-else class="text-secondary">-</span>
        </template>
      </el-table-column>

      <el-table-column label="操作" width="320" fixed="right">
        <template #default="{ row }">
          <el-space>
            <el-button
              v-if="row.status === 'pending'"
              type="success"
              size="small"
              :icon="Select"
              link
              @click="handleApprove(row.id, 'approved')"
            >
              通过
            </el-button>
            <el-button
              v-if="row.status === 'pending'"
              type="warning"
              size="small"
              :icon="Warning"
              link
              @click="handleApprove(row.id, 'rejected')"
            >
              拒绝
            </el-button>
            <el-button
              v-if="row.status !== 'pending'"
              type="info"
              size="small"
              link
              @click="handleApprove(row.id, 'pending')"
            >
              待审核
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
              title="确定要删除这条留言吗？"
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
      title="编辑留言"
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
        <el-form-item label="留言内容" prop="content" required>
          <el-input
            v-model="formData.content"
            type="textarea"
            :rows="6"
            placeholder="请输入留言内容"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="心情">
          <el-radio-group v-model="formData.mood">
            <el-radio label="happy">😊 开心</el-radio>
            <el-radio label="sad">😢 难过</el-radio>
            <el-radio label="angry">😠 生气</el-radio>
            <el-radio label="excited">🤩 兴奋</el-radio>
            <el-radio label="thinking">🤔 思考</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="审核状态">
          <el-radio-group v-model="formData.status">
            <el-radio label="approved">已审核</el-radio>
            <el-radio label="pending">待审核</el-radio>
            <el-radio label="rejected">已拒绝</el-radio>
          </el-radio-group>
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
  Refresh, Search, Edit, Delete, Select, Message as MessageIcon,
  Clock, InfoFilled, Location, Timer, Warning, Close,
  ChatLineRound, PieChart
} from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import { 
  getAdminMessages,
  updateMessage,
  deleteMessage,
  updateMessageStatus,
  batchDeleteMessages,
  batchApproveMessages,
  getMessageStats
} from '@/api/message'
import type { Message, MessageStatus, MessageMood } from '@/types'

// 响应式数据
const loading = ref(false)
const messages = ref<Message[]>([])
const selectedIds = ref<number[]>([])
const dialogVisible = ref(false)
const submitting = ref(false)
const currentEditId = ref<number>(0)

// 统计数据
const stats = reactive({
  total: 0,
  approved: 0,
  pending: 0,
  rejected: 0
})

// 搜索参数
const searchParams = reactive({
  keyword: '',
  status: 'all' as MessageStatus | 'all',
  mood: '' as MessageMood | ''
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
  mood: 'happy' as MessageMood,
  status: 'approved' as MessageStatus
})

// 表单验证规则
const formRules = {
  content: [
    { required: true, message: '请输入留言内容', trigger: 'blur' },
    { min: 1, max: 500, message: '留言内容长度在 1 到 500 个字符', trigger: 'blur' }
  ]
}

// 心情映射
const getMoodText = (mood: MessageMood) => {
  const moodMap: Record<MessageMood, string> = {
    happy: '😊 开心',
    sad: '😢 难过',
    angry: '😠 生气',
    excited: '🤩 兴奋',
    thinking: '🤔 思考'
  }
  return moodMap[mood] || ''
}

const getMoodType = (mood: MessageMood) => {
  const typeMap: Record<MessageMood, any> = {
    happy: 'success',
    sad: 'info',
    angry: 'danger',
    excited: 'warning',
    thinking: ''
  }
  return typeMap[mood] || ''
}

// 状态映射
const getStatusText = (status: MessageStatus) => {
  const statusMap: Record<MessageStatus, string> = {
    approved: '已审核',
    pending: '待审核',
    rejected: '已拒绝'
  }
  return statusMap[status]
}

const getStatusType = (status: MessageStatus) => {
  const typeMap: Record<MessageStatus, any> = {
    approved: 'success',
    pending: 'warning',
    rejected: 'danger'
  }
  return typeMap[status]
}

// 格式化日期
const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

// 获取统计数据
const fetchStats = async () => {
  try {
    const data = await getMessageStats()
    Object.assign(stats, data)
  } catch (error) {
    console.error('获取统计失败:', error)
  }
}

// 获取留言列表
const fetchMessages = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      limit: pagination.limit,
      keyword: searchParams.keyword || undefined,
      status: searchParams.status !== 'all' ? searchParams.status : undefined
    }
    
    const response = await getAdminMessages(params)
    messages.value = response.messages || []
    pagination.total = response.total || 0
    
    // 刷新统计
    await fetchStats()
  } catch (error) {
    ElMessage.error('获取留言列表失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.page = 1
  fetchMessages()
}

// 审核留言
const handleApprove = async (id: number, status: MessageStatus) => {
  try {
    await updateMessageStatus(id, { status })
    ElMessage.success('操作成功')
    fetchMessages()
  } catch (error) {
    ElMessage.error('操作失败')
    console.error(error)
  }
}

// 编辑留言
const handleEdit = (row: Message) => {
  currentEditId.value = row.id
  formData.value = {
    content: row.content,
    mood: row.mood,
    status: row.status
  }
  dialogVisible.value = true
}

// 删除留言
const handleDelete = async (id: number) => {
  try {
    await deleteMessage(id)
    ElMessage.success('删除成功')
    fetchMessages()
  } catch (error) {
    ElMessage.error('删除失败')
    console.error(error)
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid: boolean) => {
    if (!valid) return

    submitting.value = true
    try {
      await updateMessage(currentEditId.value, formData.value)
      await updateMessageStatus(currentEditId.value, { status: formData.value.status })
      ElMessage.success('保存成功')
      dialogVisible.value = false
      fetchMessages()
    } catch (error) {
      ElMessage.error('保存失败')
      console.error(error)
    } finally {
      submitting.value = false
    }
  })
}

// 重置表单
const resetForm = () => {
  formRef.value?.resetFields()
  currentEditId.value = 0
}

// 表格选择变化
const handleSelectionChange = (selection: Message[]) => {
  selectedIds.value = selection.map((item) => item.id)
}

// 清空选择
const clearSelection = () => {
  selectedIds.value = []
}

// 批量审核
const handleBatchApprove = async (status: MessageStatus) => {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请先选择要操作的留言')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要${status === 'approved' ? '通过' : '拒绝'}选中的 ${selectedIds.value.length} 条留言吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await batchApproveMessages({ messageIds: selectedIds.value, status })
    ElMessage.success('操作成功')
    clearSelection()
    fetchMessages()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败')
      console.error(error)
    }
  }
}

// 批量删除
const handleBatchDelete = async () => {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请先选择要删除的留言')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedIds.value.length} 条留言吗？删除后将无法恢复。`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'error'
      }
    )

    await batchDeleteMessages({ messageIds: selectedIds.value })
    ElMessage.success('删除成功')
    clearSelection()
    fetchMessages()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
      console.error(error)
    }
  }
}

// 显示统计
const showStats = () => {
  ElMessageBox.alert(
    `<div style="line-height: 2;">
      <p><strong>总留言数：</strong>${stats.total}</p>
      <p><strong>已审核：</strong>${stats.approved}</p>
      <p><strong>待审核：</strong>${stats.pending}</p>
      <p><strong>已拒绝：</strong>${stats.rejected}</p>
    </div>`,
    '留言统计',
    {
      dangerouslyUseHTMLString: true,
      confirmButtonText: '关闭'
    }
  )
}

// 分页变化
const handlePageChange = () => {
  fetchMessages()
}

const handleSizeChange = () => {
  pagination.page = 1
  fetchMessages()
}

// 初始化
onMounted(() => {
  fetchMessages()
  fetchStats()
})
</script>

<style scoped lang="scss">
.message-management {
  padding: 20px;

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    .header-left {
      h2 {
        margin: 0 0 8px 0;
        font-size: 24px;
        font-weight: 600;
        color: #303133;
      }

      .subtitle {
        margin: 0;
        font-size: 14px;
        color: #909399;
      }
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }
  }

  .stats-row {
    margin-bottom: 24px;

    .stat-card {
      :deep(.el-card__body) {
        padding: 20px;
      }

      .stat-content {
        display: flex;
        align-items: center;
        gap: 16px;

        .stat-icon {
          width: 56px;
          height: 56px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          color: white;

          &.total {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }

          &.approved {
            background: linear-gradient(135deg, #67C23A 0%, #85CE61 100%);
          }

          &.pending {
            background: linear-gradient(135deg, #E6A23C 0%, #F56C6C 100%);
          }

          &.rejected {
            background: linear-gradient(135deg, #F56C6C 0%, #F78989 100%);
          }
        }

        .stat-info {
          flex: 1;

          .stat-value {
            font-size: 28px;
            font-weight: 700;
            color: #303133;
            line-height: 1;
            margin-bottom: 8px;
          }

          .stat-label {
            font-size: 14px;
            color: #909399;
          }
        }
      }
    }
  }

  .search-bar {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;
  }

  .batch-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    margin-bottom: 16px;
    background: #ecf5ff;
    border: 1px solid #d9ecff;
    border-radius: 4px;

    .batch-info {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      color: #409eff;

      .el-icon {
        font-size: 16px;
      }

      strong {
        color: #303133;
      }
    }

    .batch-actions {
      display: flex;
      gap: 8px;
    }
  }

  .message-info {
    .message-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;

      .nickname {
        font-weight: 600;
        color: #303133;
      }

      .mood-tag {
        margin-left: 4px;
      }
    }

    .message-content {
      margin: 8px 0;
      line-height: 1.6;
      color: #606266;
      word-break: break-word;
    }

    .message-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      font-size: 13px;
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

  .text-secondary {
    color: #909399;
  }

  .pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }
}
</style>
