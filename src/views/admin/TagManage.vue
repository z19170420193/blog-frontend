<template>
  <div class="tag-management">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h2>标签管理</h2>
        <p class="subtitle">管理博客文章标签</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" :icon="Plus" @click="handleCreate">
          新建标签
        </el-button>
        <el-button :icon="Refresh" @click="fetchTags">
          刷新
        </el-button>
      </div>
    </div>

    <!-- 搜索栏 -->
    <div class="search-bar">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索标签名称..."
        :prefix-icon="Search"
        clearable
        style="width: 300px"
        @input="handleSearch"
      />
      
      <div class="view-switcher">
        <el-radio-group v-model="currentView" size="small">
          <el-radio-button value="table">
            <el-icon><Grid /></el-icon>
            表格
          </el-radio-button>
          <el-radio-button value="card">
            <el-icon><Postcard /></el-icon>
            卡片
          </el-radio-button>
        </el-radio-group>
      </div>
    </div>

    <!-- 批量操作工具栏 -->
    <transition name="el-zoom-in-top">
      <div v-show="selectedIds.length > 0" class="batch-toolbar">
        <div class="batch-info">
          <el-icon><InfoFilled /></el-icon>
          已选择 <strong>{{ selectedIds.length }}</strong> 个标签
        </div>
        <div class="batch-actions">
          <el-button size="small" @click="clearSelection">取消选择</el-button>
          <el-dropdown @command="handleBatchCommand">
            <el-button size="small" type="primary">
              批量操作 <el-icon class="el-icon--right"><arrow-down /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="delete" :icon="Delete">
                  批量删除
                </el-dropdown-item>
                <el-dropdown-item command="merge" :icon="Promotion" divided>
                  合并标签
                </el-dropdown-item>
                <el-dropdown-item command="color" :icon="BrushFilled">
                  修改颜色
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </transition>

    <!-- 表格视图 -->
    <div v-show="currentView === 'table'">
      <el-table
        v-loading="loading"
        :data="filteredTags"
        style="width: 100%"
        stripe
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" />
        
        <el-table-column label="标签名称" min-width="200">
          <template #default="{ row }">
            <div class="tag-info">
              <span
                class="tag-badge"
                :style="{ backgroundColor: row.color || '#409eff' }"
              >
                {{ row.name }}
              </span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="颜色" width="120" align="center">
          <template #default="{ row }">
            <div class="color-preview">
              <div
                class="color-box"
                :style="{ backgroundColor: row.color || '#409eff' }"
              />
              <span class="color-value">{{ row.color || '#409eff' }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="文章数" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getArticleCountType(row.article_count || 0)">
              {{ row.article_count || 0 }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-space>
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
                title="确定要删除这个标签吗？"
                confirm-button-text="确定"
                cancel-button-text="取消"
                @confirm="handleDelete(row.id)"
              >
                <template #reference>
                  <el-button
                    type="danger"
                    size="small"
                    :icon="Delete"
                    link
                    :disabled="(row.article_count || 0) > 0"
                  >
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

    <!-- 卡片视图 -->
    <div v-show="currentView === 'card'" class="card-view">
      <div class="card-grid">
        <div
          v-for="tag in filteredTags"
          :key="tag.id"
          class="tag-card"
        >
          <!-- 顶部颜色条 -->
          <div
            class="color-strip"
            :style="{ backgroundColor: tag.color || '#409eff' }"
          />

          <!-- 卡片内容 -->
          <div class="card-content">
            <div class="card-header">
              <span
                class="tag-badge-large"
                :style="{ backgroundColor: tag.color || '#409eff' }"
              >
                {{ tag.name }}
              </span>
            </div>

            <div class="card-stats">
              <div class="stat-item">
                <el-icon><Document /></el-icon>
                <span>{{ tag.article_count || 0 }} 篇文章</span>
              </div>
              <div class="stat-item">
                <el-icon><Clock /></el-icon>
                <span>{{ formatDateShort(tag.created_at) }}</span>
              </div>
            </div>

            <div class="card-actions">
              <el-button
                size="small"
                type="primary"
                :icon="Edit"
                @click="handleEdit(tag)"
              >
                编辑
              </el-button>
              <el-button
                size="small"
                type="danger"
                :icon="Delete"
                @click="handleDelete(tag.id)"
                :disabled="(tag.article_count || 0) > 0"
              >
                删除
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.limit"
          :page-sizes="[12, 24, 48, 96]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </div>

    <!-- 创建/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
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
        <el-form-item label="标签名称" prop="name" required>
          <el-input
            v-model="formData.name"
            placeholder="请输入标签名称"
            maxlength="50"
            show-word-limit
            clearable
          />
        </el-form-item>

        <el-form-item label="标签颜色">
          <el-color-picker
            v-model="formData.color"
            :predefine="presetColors"
            show-alpha
          />
          <span class="form-tip">选择一个主题颜色</span>
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
            {{ isEdit ? '保存' : '创建' }}
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 批量合并对话框 -->
    <el-dialog
      v-model="showMergeDialog"
      title="批量合并标签"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-alert
        type="info"
        :closable="false"
        style="margin-bottom: 16px"
      >
        将 {{ selectedIds.length }} 个选中标签合并到目标标签，关联的文章将更新为目标标签
      </el-alert>
      
      <el-form label-width="100px">
        <el-form-item label="目标标签" required>
          <el-select 
            v-model="mergeTargetId" 
            placeholder="选择要合并到的标签"
            filterable
            style="width: 100%"
          >
            <el-option
              v-for="tag in availableMergeTargets"
              :key="tag.id"
              :label="tag.name"
              :value="tag.id"
            >
              <span :style="{ color: tag.color || '#409eff' }">●</span>
              {{ tag.name }}
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showMergeDialog = false">取消</el-button>
          <el-button type="primary" @click="confirmMerge">
            确认合并
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 批量更新颜色对话框 -->
    <el-dialog
      v-model="showColorDialog"
      title="批量更新颜色"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-alert
        type="info"
        :closable="false"
        style="margin-bottom: 16px"
      >
        为 {{ selectedIds.length }} 个选中标签设置相同的颜色
      </el-alert>
      
      <el-form label-width="100px">
        <el-form-item label="标签颜色" required>
          <el-color-picker
            v-model="batchColor"
            :predefine="presetColors"
            show-alpha
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showColorDialog = false">取消</el-button>
          <el-button type="primary" @click="confirmColorUpdate">
            确认更新
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus, Refresh, Search, Edit, Delete, Grid, Postcard, Document, Clock, InfoFilled, ArrowDown, Promotion, BrushFilled
} from '@element-plus/icons-vue'
import { 
  getTags, 
  getTagById, 
  createTag, 
  updateTag, 
  deleteTag,
  batchDeleteTags,
  batchMergeTags,
  batchUpdateTagColor
} from '@/api/tag'
import type { Tag, TagFormData } from '@/types'

// 响应式数据
const loading = ref(false)
const tags = ref<Tag[]>([])
const selectedIds = ref<number[]>([])
const searchKeyword = ref('')
const currentView = ref('table')
const dialogVisible = ref(false)
const isEdit = ref(false)
const submitting = ref(false)
const showMergeDialog = ref(false)
const showColorDialog = ref(false)
const mergeTargetId = ref<number | undefined>(undefined)
const batchColor = ref('')

// 分页
const pagination = reactive({
  page: 1,
  limit: 20,
  total: 0
})

// 表单
const formRef = ref()
const formData = ref<TagFormData>({
  name: '',
  color: '#409eff'
})

// 预设颜色
const presetColors = [
  '#409eff', '#67c23a', '#e6a23c', '#f56c6c',
  '#909399', '#c71585', '#ff1493', '#00bfff',
  '#00ced1', '#ff8c00', '#9370db', '#3cb371'
]

// 表单验证规则
const formRules = {
  name: [
    { required: true, message: '请输入标签名称', trigger: 'blur' },
    { min: 1, max: 50, message: '标签名称长度在 1 到 50 个字符', trigger: 'blur' }
  ]
}

// 计算属性
const dialogTitle = computed(() => isEdit.value ? '编辑标签' : '新建标签')

const filteredTags = computed(() => {
  let result = [...tags.value]
  
  // 搜索筛选
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(tag =>
      tag.name.toLowerCase().includes(keyword)
    )
  }
  
  pagination.total = result.length
  
  // 分页
  const start = (pagination.page - 1) * pagination.limit
  const end = start + pagination.limit
  return result.slice(start, end)
})

const availableMergeTargets = computed(() => {
  return tags.value.filter(tag => !selectedIds.value.includes(tag.id))
})

// 方法
const loadTags = async () => {
  loading.value = true
  try {
    const data = await getTags()
    tags.value = data as Tag[]
  } catch (error) {
    ElMessage.error('获取标签列表失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.page = 1
}

const handleCreate = () => {
  isEdit.value = false
  dialogVisible.value = true
}

const handleEdit = async (row: Tag) => {
  try {
    const data = await getTagById(row.id)
    formData.value = {
      name: data.name,
      color: data.color || '#409eff'
    }
    isEdit.value = true
    dialogVisible.value = true
    // 保存当前编辑的ID
    ;(formData.value as any).id = row.id
  } catch (error) {
    ElMessage.error('获取标签详情失败')
    console.error(error)
  }
}

const handleDelete = async (id: number) => {
  try {
    await deleteTag(id)
    ElMessage.success('删除成功')
    await loadTags()
  } catch (error) {
    ElMessage.error('删除失败')
    console.error(error)
  }
}

const handleSubmit = async () => {
  try {
    await formRef.value?.validate()
    submitting.value = true
    
    if (isEdit.value) {
      const id = (formData.value as any).id
      await updateTag(id, formData.value)
      ElMessage.success('更新成功')
    } else {
      await createTag(formData.value)
      ElMessage.success('创建成功')
    }
    
    dialogVisible.value = false
    await loadTags()
  } catch (error: any) {
    if (error !== false) {
      ElMessage.error(isEdit.value ? '更新失败' : '创建失败')
      console.error(error)
    }
  } finally {
    submitting.value = false
  }
}

const resetForm = () => {
  formData.value = {
    name: '',
    color: '#409eff'
  }
  formRef.value?.clearValidate()
}

const handleSizeChange = (size: number) => {
  pagination.limit = size
  pagination.page = 1
}

const handlePageChange = (page: number) => {
  pagination.page = page
}

const handleBatchCommand = (command: string) => {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请至少选择一个标签')
    return
  }
  
  switch (command) {
    case 'delete':
      handleBatchDelete()
      break
    case 'merge':
      showMergeDialog.value = true
      break
    case 'color':
      showColorDialog.value = true
      break
  }
}

const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(
      `确认要删除选中的 ${selectedIds.value.length} 个标签吗？`, 
      '批量删除',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const res = await batchDeleteTags({ tagIds: selectedIds.value })
    ElMessage.success(`成功删除 ${res.data.successCount} 个标签`)
    
    if (res.data.failures.length > 0) {
      ElMessage.warning(`${res.data.failures.length} 个标签删除失败`)
    }
    
    selectedIds.value = []
    loadTags()
  } catch (err: any) {
    if (err !== 'cancel') {
      ElMessage.error(err.message || '批量删除失败')
    }
  }
}

const confirmMerge = async () => {
  if (!mergeTargetId.value) {
    ElMessage.warning('请选择目标标签')
    return
  }
  
  try {
    await batchMergeTags({
      sourceTagIds: selectedIds.value,
      targetTagId: mergeTargetId.value
    })
    
    ElMessage.success('标签合并成功')
    showMergeDialog.value = false
    mergeTargetId.value = undefined
    selectedIds.value = []
    loadTags()
  } catch (err: any) {
    ElMessage.error(err.message || '标签合并失败')
  }
}

const confirmColorUpdate = async () => {
  if (!batchColor.value) {
    ElMessage.warning('请选择颜色')
    return
  }
  
  try {
    await batchUpdateTagColor({
      tagIds: selectedIds.value,
      color: batchColor.value
    })
    
    ElMessage.success(`成功更新 ${selectedIds.value.length} 个标签的颜色`)
    showColorDialog.value = false
    batchColor.value = ''
    selectedIds.value = []
    loadTags()
  } catch (err: any) {
    ElMessage.error(err.message || '批量更新颜色失败')
  }
}

const handleSelectionChange = (selection: Tag[]) => {
  selectedIds.value = selection.map(item => item.id)
}

const clearSelection = () => {
  selectedIds.value = []
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

const formatDateShort = (date: string) => {
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

const getArticleCountType = (count: number) => {
  if (count === 0) return 'info'
  if (count < 5) return 'warning'
  if (count < 20) return 'success'
  return 'danger'
}

// 生命周期
onMounted(() => {
  loadTags()
})
</script>

<style scoped lang="scss">
.tag-management {
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
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  .tag-info {
    .tag-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 4px;
      color: #fff;
      font-size: 14px;
      font-weight: 500;
    }
  }

  .color-preview {
    display: flex;
    align-items: center;
    gap: 8px;

    .color-box {
      width: 32px;
      height: 32px;
      border-radius: 4px;
      border: 1px solid #dcdfe6;
    }

    .color-value {
      font-size: 12px;
      color: #909399;
      font-family: monospace;
    }
  }

  .pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }

  // 卡片视图样式
  .card-view {
    .card-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 20px;
      margin-bottom: 20px;
    }

    .tag-card {
      background: #fff;
      border-radius: 8px;
      border: 1px solid #ebeef5;
      overflow: hidden;
      transition: all 0.3s;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }

      .color-strip {
        height: 4px;
      }

      .card-content {
        padding: 20px;

        .card-header {
          margin-bottom: 16px;

          .tag-badge-large {
            display: inline-block;
            padding: 6px 16px;
            border-radius: 6px;
            color: #fff;
            font-size: 16px;
            font-weight: 600;
          }
        }

        .card-stats {
          display: flex;
          gap: 16px;
          margin-bottom: 16px;
          padding: 12px 0;
          border-top: 1px solid #ebeef5;
          border-bottom: 1px solid #ebeef5;

          .stat-item {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 14px;
            color: #606266;

            .el-icon {
              color: #909399;
            }
          }
        }

        .card-actions {
          display: flex;
          gap: 8px;
        }
      }
    }
  }

  .form-tip {
    margin-left: 10px;
    font-size: 12px;
    color: #909399;
  }
}
</style>