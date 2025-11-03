<template>
  <div class="moment-manage">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h2>说说管理</h2>
        <p class="subtitle">管理用户动态说说</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" :icon="Plus" @click="handleAdd">发布说说</el-button>
        <el-button :icon="Refresh" @click="handleRefresh">刷新</el-button>

        <el-dropdown v-if="selectedIds.length > 0" trigger="click" @command="handleBatchCommand">
          <el-button type="warning">
            批量操作 ({{ selectedIds.length }})
            <el-icon class="el-icon--right"><ArrowDown /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="delete" :icon="Delete">
                批量删除
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <!-- 筛选栏 -->
    <div class="search-bar">
      <el-select v-model="filterVisibility" placeholder="可见性" clearable style="width: 140px" @change="applyFilters">
        <el-option label="全部" :value="undefined" />
        <el-option label="公开" value="public" />
        <el-option label="好友可见" value="friends" />
        <el-option label="私密" value="private" />
      </el-select>

      <el-select v-model="filterPinned" placeholder="置顶" clearable style="width: 140px" @change="applyFilters">
        <el-option label="全部" :value="undefined" />
        <el-option label="仅置顶" :value="true" />
        <el-option label="非置顶" :value="false" />
      </el-select>
    </div>

    <el-card>
      <!-- 数据表格 -->
      <el-table
        v-loading="momentStore.loading"
        :data="displayMoments"
        style="width: 100%"
        stripe
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        
        <el-table-column prop="id" label="ID" width="80" />
        
        <el-table-column label="内容" min-width="300">
          <template #default="{ row }">
            <div class="content-preview">
              {{ row.content.substring(0, 100) }}
              {{ row.content.length > 100 ? '...' : '' }}
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="图片" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.images && row.images.length > 0" type="info">
              {{ row.images.length }} 张
            </el-tag>
            <span v-else class="text-secondary">无</span>
          </template>
        </el-table-column>
        
        <el-table-column label="用户" width="120">
          <template #default="{ row }">
            {{ row.user?.username || '未知' }}
          </template>
        </el-table-column>
        
        <el-table-column label="可见性" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.visibility === 'public'" type="success" size="small">公开</el-tag>
            <el-tag v-else-if="row.visibility === 'private'" type="info" size="small">私密</el-tag>
            <el-tag v-else type="warning" size="small">好友</el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label="置顶" width="80">
          <template #default="{ row }">
            <el-tag v-if="row.is_pinned" type="danger" size="small">是</el-tag>
            <span v-else class="text-secondary">否</span>
          </template>
        </el-table-column>
        
        <el-table-column label="发布时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.published_at) }}
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-space>
              <el-button link type="primary" size="small" :icon="Edit" @click="handleEdit(row)">编辑</el-button>
              <el-button link :type="row.is_pinned ? 'warning' : 'default'" size="small" :icon="Star" @click="handleTogglePin(row)">
                {{ row.is_pinned ? '取消置顶' : '置顶' }}
              </el-button>
              <el-popconfirm title="确定要删除这条说说吗？" confirm-button-text="确定" cancel-button-text="取消" @confirm="handleDelete(row)">
                <template #reference>
                  <el-button link type="danger" size="small" :icon="Delete">删除</el-button>
                </template>
              </el-popconfirm>
            </el-space>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="momentStore.pagination.total"
          :page-sizes="[10, 20, 30, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </div>
    </el-card>

    <!-- 发布/编辑对话框 -->
    <MomentPublish ref="publishDialogRef" :edit-moment="editMoment" @success="handleSuccess" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus,
  Edit,
  Delete,
  Star,
  ArrowDown,
  Refresh
} from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import { useMomentStore } from '@/stores/moment'
import MomentPublish from '@/components/moment/MomentPublish.vue'
import type { Moment, MomentVisibility } from '@/types/moment'

const momentStore = useMomentStore()

const publishDialogRef = ref()
const editMoment = ref<Moment | null>(null)
const selectedIds = ref<number[]>([])

// 与 store 分页联动
const currentPage = computed({
  get: () => momentStore.pagination.page,
  set: (val: number) => momentStore.setPage(val)
})
const pageSize = computed({
  get: () => momentStore.pagination.limit,
  set: (val: number) => momentStore.setLimit(val)
})

// 筛选条件
const filterVisibility = ref<MomentVisibility | undefined>(undefined)
const filterPinned = ref<boolean | undefined>(undefined)

const displayMoments = computed(() => {
  let rows = momentStore.moments
  if (filterVisibility.value) {
    rows = rows.filter(m => m.visibility === filterVisibility.value)
  }
  if (filterPinned.value !== undefined) {
    rows = rows.filter(m => m.is_pinned === filterPinned.value)
  }
  return rows
})

const applyFilters = () => {
  // 若仅改可见性，直接触发后端筛选；置顶筛选本地处理
  momentStore.fetchMoments({ visibility: filterVisibility.value })
}

// 格式化日期
const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

// 加载说说列表
const loadMoments = async () => {
  await momentStore.fetchMoments({ visibility: filterVisibility.value })
}

const handleRefresh = () => {
  loadMoments()
}

// 新增说说
const handleAdd = () => {
  editMoment.value = null
  publishDialogRef.value?.open()
}

// 编辑说说
const handleEdit = (moment: Moment) => {
  editMoment.value = moment
  publishDialogRef.value?.open()
}

// 删除说说
const handleDelete = async (moment: Moment) => {
  try {
    await ElMessageBox.confirm(
      '删除后将无法恢复，确定删除这条说说吗？',
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'error'
      }
    )

    await momentStore.deleteMoment(moment.id)
    loadMoments()
  } catch (error) {
    // 用户取消操作
  }
}

// 置顶/取消置顶
const handleTogglePin = async (moment: Moment) => {
  try {
    await ElMessageBox.confirm(
      `确定${moment.is_pinned ? '取消置顶' : '置顶'}这条说说吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await momentStore.togglePin(moment.id, !moment.is_pinned)
    loadMoments()
  } catch (error) {
    // 用户取消操作
  }
}

// 表格选择变化
const handleSelectionChange = (selection: Moment[]) => {
  selectedIds.value = selection.map((item) => item.id)
}

// 批量操作
const handleBatchCommand = async (command: string) => {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请先选择要操作的说说')
    return
  }

  switch (command) {
    case 'delete':
      await handleBatchDelete()
      break
  }
}

// 批量删除
const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(
      `确定删除选中的 ${selectedIds.value.length} 条说说吗？删除后将无法恢复。`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'error'
      }
    )

    await momentStore.batchDelete(selectedIds.value)
    selectedIds.value = []
    loadMoments()
  } catch (error) {
    // 用户取消操作
  }
}

// 发布/编辑成功回调
const handleSuccess = () => {
  editMoment.value = null
  loadMoments()
}

// 分页变化
const handlePageChange = (page: number) => {
  momentStore.setPage(page)
  loadMoments()
}

// 每页数量变化
const handleSizeChange = (size: number) => {
  momentStore.setLimit(size)
  momentStore.setPage(1)
  loadMoments()
}

// 初始化
onMounted(() => {
  loadMoments()
})
</script>

<style scoped lang="scss">
.moment-manage {
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    .header-left {
      h2 {
        margin: 0;
        font-size: 20px;
        font-weight: 600;
      }
      .subtitle {
        margin-top: 6px;
        font-size: 13px;
        color: #909399;
      }
    }
    .header-actions {
      display: flex;
      gap: 10px;
    }
  }

  .search-bar {
    display: flex;
    gap: 12px;
    margin-bottom: 12px;
  }

  .content-preview {
    line-height: 1.5;
    color: #606266;
    word-break: break-word;
  }

  .text-secondary {
    color: #909399;
  }

  .pagination-wrapper {
    display: flex;
    justify-content: flex-end;
    margin-top: 16px;
  }
}
</style>
