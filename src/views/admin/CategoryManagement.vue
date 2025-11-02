<template>
  <div class="category-management">
    <!-- 页面头部 -->
    <div class="page-header">
        <div class="header-left">
          <h2>分类管理</h2>
          <p class="subtitle">管理博客文章分类</p>
        </div>
        <div class="header-actions">
          <el-button type="primary" :icon="Plus" @click="handleCreate">
            新建分类
          </el-button>
          <el-button :icon="Refresh" @click="fetchCategories">
            刷新
          </el-button>
        </div>
      </div>

    <!-- 搜索栏 -->
    <div class="search-bar">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索分类名称..."
        :prefix-icon="Search"
        clearable
        style="width: 300px"
        @input="handleSearch"
      />
    </div>

    <!-- 批量操作工具栏 -->
    <transition name="el-zoom-in-top">
      <div v-show="selectedIds.length > 0" class="batch-toolbar">
        <div class="batch-info">
          <el-icon><InfoFilled /></el-icon>
          已选择 <strong>{{ selectedIds.length }}</strong> 个分类
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
                  合并分类
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
        :data="filteredCategories"
        style="width: 100%"
        stripe
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" />
        
        <el-table-column label="分类名称" min-width="200">
          <template #default="{ row }">
            <div class="category-info">
              <div 
                v-if="row.color"
                class="category-color" 
                :style="{ backgroundColor: row.color }"
              />
              <span class="category-name">{{ row.name }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="描述" min-width="250" show-overflow-tooltip>
          <template #default="{ row }">
            <span class="text-muted">{{ row.description || '-' }}</span>
          </template>
        </el-table-column>

        <el-table-column label="文章数" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getArticleCountType(row.article_count || 0)">
              {{ row.article_count || 0 }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="sort_order" label="排序" width="100" align="center" />

        <!-- 状态列 - 如果API支持 -->
        <!-- <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-switch
              v-model="row.is_active"
              @change="handleStatusChange(row)"
            />
          </template>
        </el-table-column> -->

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
                title="确定要删除这个分类吗？"
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

    <!-- 批量合并对话框 -->
    <el-dialog
      v-model="mergeDialogVisible"
      title="合并分类"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-alert
        title="合并说明"
        type="info"
        :closable="false"
        style="margin-bottom: 20px"
      >
        将选中的 {{ selectedIds.length }} 个分类合并到目标分类，所有文章将被迁移至目标分类
      </el-alert>
      
      <el-form label-width="100px">
        <el-form-item label="目标分类" required>
          <el-select
            v-model="mergeTargetId"
            placeholder="请选择目标分类"
            style="width: 100%"
            filterable
          >
            <el-option
              v-for="cat in availableMergeTargets"
              :key="cat.id"
              :label="`${cat.name} (已有 ${cat.article_count || 0} 篇文章)`"
              :value="cat.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="选中分类">
          <el-tag
            v-for="id in selectedIds"
            :key="id"
            style="margin-right: 8px; margin-bottom: 8px"
          >
            {{ getCategoryNameById(id) }}
          </el-tag>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="mergeDialogVisible = false">取消</el-button>
          <el-button
            type="primary"
            :loading="submitting"
            :disabled="!mergeTargetId"
            @click="handleMergeConfirm"
          >
            确定合并
          </el-button>
        </div>
      </template>
    </el-dialog>

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
        <el-form-item label="分类名称" prop="name" required>
          <el-input
            v-model="formData.name"
            placeholder="请输入分类名称"
            maxlength="50"
            show-word-limit
            clearable
          />
        </el-form-item>

        <el-form-item label="分类描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="4"
            placeholder="请输入分类描述（选填）"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="排序值" prop="sort_order">
          <el-input-number
            v-model="formData.sort_order"
            :min="0"
            :max="9999"
            :step="1"
            controls-position="right"
            style="width: 200px"
          />
          <span class="form-tip">数值越小排序越靠前</span>
        </el-form-item>

        <!-- 主题颜色 - 如果API支持 -->
        <!-- <el-form-item label="主题颜色">
          <el-color-picker
            v-model="formData.color"
            :predefine="presetColors"
          />
        </el-form-item> -->
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus, Refresh, Search, Edit, Delete, InfoFilled, ArrowDown, Promotion
} from '@element-plus/icons-vue'
import { 
  getCategories, 
  getCategoryById, 
  createCategory, 
  updateCategory, 
  deleteCategory,
  batchDeleteCategories,
  batchUpdateOrder,
  batchMergeCategories
} from '@/api/category'
import type { Category, CategoryFormData } from '@/types'

// 响应式数据
const loading = ref(false)
const categories = ref<Category[]>([])
const selectedIds = ref<number[]>([])
const searchKeyword = ref('')
const dialogVisible = ref(false)
const isEdit = ref(false)
const submitting = ref(false)
const mergeDialogVisible = ref(false)
const mergeTargetId = ref<number | null>(null)

// 分页
const pagination = reactive({
  page: 1,
  limit: 20,
  total: 0
})

// 表单
const formRef = ref()
const formData = ref<CategoryFormData>({
  name: '',
  description: '',
  sort_order: 0
})

// 预设颜色（备用）
// const presetColors = [
//   '#1890ff', '#52c41a', '#faad14', '#f5222d',
//   '#722ed1', '#13c2c2', '#eb2f96', '#fa541c'
// ]

// 表单验证规则
const formRules = {
  name: [
    { required: true, message: '请输入分类名称', trigger: 'blur' },
    { min: 1, max: 50, message: '分类名称长度在 1 到 50 个字符', trigger: 'blur' }
  ]
}

// 计算属性
const dialogTitle = computed(() => isEdit.value ? '编辑分类' : '新建分类')

const filteredCategories = computed(() => {
  let result = [...categories.value]
  
  // 搜索筛选
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(cat =>
      cat.name.toLowerCase().includes(keyword) ||
      (cat.description && cat.description.toLowerCase().includes(keyword))
    )
  }
  
  pagination.total = result.length
  
  // 分页
  const start = (pagination.page - 1) * pagination.limit
  const end = start + pagination.limit
  return result.slice(start, end)
})

const availableMergeTargets = computed(() => {
  // 过滤掉已选中的分类
  return categories.value.filter(cat => !selectedIds.value.includes(cat.id))
})

// 方法
const fetchCategories = async () => {
  loading.value = true
  try {
    const data = await getCategories()
    categories.value = data as Category[]
  } catch (error) {
    ElMessage.error('获取分类列表失败')
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

const handleEdit = async (row: Category) => {
  try {
    const data = await getCategoryById(row.id)
    formData.value = {
      name: data.name,
      description: data.description || '',
      sort_order: data.sort_order
    }
    isEdit.value = true
    dialogVisible.value = true
    // 保存当前编辑的ID
    ;(formData.value as any).id = row.id
  } catch (error) {
    ElMessage.error('获取分类详情失败')
    console.error(error)
  }
}

const handleDelete = async (id: number) => {
  try {
    await deleteCategory(id)
    ElMessage.success('删除成功')
    await fetchCategories()
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
      await updateCategory(id, formData.value)
      ElMessage.success('更新成功')
    } else {
      await createCategory(formData.value)
      ElMessage.success('创建成功')
    }
    
    dialogVisible.value = false
    await fetchCategories()
  } catch (error: any) {
    if (error !== false) { // 排除表单验证失败
      ElMessage.error(isEdit.value ? '更新失败' : '创建失败')
      console.error(error)
    }
  } finally {
    submitting.value = false
  }
}

// 状态切换 - 如果API支持
// const handleStatusChange = async (row: Category) => {
//   try {
//     await updateCategory(row.id, { is_active: row.is_active })
//     ElMessage.success(`分类已${row.is_active ? '启用' : '禁用'}`)
//   } catch (error) {
//     ElMessage.error('状态更新失败')
//     row.is_active = !row.is_active
//   }
// }

const resetForm = () => {
  formData.value = {
    name: '',
    description: '',
    sort_order: 0
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

const handleSelectionChange = (selection: Category[]) => {
  selectedIds.value = selection.map(item => item.id)
}

const clearSelection = () => {
  selectedIds.value = []
}

const handleBatchCommand = async (command: string) => {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请选择要操作的分类')
    return
  }

  switch (command) {
    case 'delete':
      await handleBatchDelete()
      break
    case 'merge':
      await showMergeDialog()
      break
  }
}

const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedIds.value.length} 个分类吗？<br>
      <span style="color: #f56c6c; font-size: 12px;">注意：包含文章的分类将被跳过</span>`,
      '批量删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        dangerouslyUseHTMLString: true
      }
    )

    loading.value = true
    const response: any = await batchDeleteCategories({ ids: selectedIds.value })
    
    if (response.data?.errors && response.data.errors.length > 0) {
      ElMessageBox.alert(
        response.data.errors.join('\n'),
        '部分分类删除失败',
        { type: 'warning' }
      )
    } else {
      ElMessage.success(`成功删除 ${response.data.deleted_count} 个分类`)
    }
    
    selectedIds.value = []
    await fetchCategories()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('批量删除失败')
      console.error(error)
    }
  } finally {
    loading.value = false
  }
}

const showMergeDialog = () => {
  if (selectedIds.value.length < 2) {
    ElMessage.warning('请至少选择两个分类进行合并')
    return
  }
  
  if (availableMergeTargets.value.length === 0) {
    ElMessage.warning('没有可用的目标分类')
    return
  }
  
  mergeTargetId.value = null
  mergeDialogVisible.value = true
}

const handleMergeConfirm = async () => {
  if (!mergeTargetId.value) {
    ElMessage.warning('请选择目标分类')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要将 ${selectedIds.value.length} 个分类合并到 "${getCategoryNameById(mergeTargetId.value)}" 吗？<br>
      <span style="color: #f56c6c; font-size: 12px;">此操作不可逆，所有文章将被迁移至目标分类</span>`,
      '确认合并',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        dangerouslyUseHTMLString: true
      }
    )

    submitting.value = true
    const response: any = await batchMergeCategories({
      source_ids: selectedIds.value,
      target_id: mergeTargetId.value
    })
    
    ElMessage.success(
      `成功合并 ${response.data.merged_categories} 个分类，` +
      `迁移了 ${response.data.migrated_articles} 篇文章`
    )
    
    mergeDialogVisible.value = false
    selectedIds.value = []
    await fetchCategories()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('合并分类失败')
      console.error(error)
    }
  } finally {
    submitting.value = false
  }
}

const getCategoryNameById = (id: number) => {
  const category = categories.value.find(cat => cat.id === id)
  return category ? category.name : `ID: ${id}`
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

const getArticleCountType = (count: number) => {
  if (count === 0) return 'info'
  if (count < 5) return 'warning'
  if (count < 20) return 'success'
  return 'danger'
}

// 生命周期
onMounted(() => {
  fetchCategories()
})
</script>

<style scoped lang="scss">
.category-management {
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
    margin-bottom: 20px;
  }

  .category-info {
    display: flex;
    align-items: center;
    gap: 10px;

    .category-color {
      width: 16px;
      height: 16px;
      border-radius: 4px;
      flex-shrink: 0;
    }

    .category-name {
      font-weight: 500;
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

  .form-tip {
    margin-left: 10px;
    font-size: 12px;
    color: #909399;
  }
}
</style>
