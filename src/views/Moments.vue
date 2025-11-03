<template>
  <div class="moments-page">
      <!-- 页面标题 -->
      <div class="page-header">
        <h1 class="page-title">
          <el-icon><ChatDotRound /></el-icon>
          说说
        </h1>
        <el-button
          v-if="userStore.isLoggedIn"
          type="primary"
          :icon="Edit"
          @click="handlePublish"
        >
          发布说说
        </el-button>
      </div>

      <!-- 说说列表 -->
      <div v-loading="momentStore.loading" class="moments-list">
        <el-empty
          v-if="!momentStore.loading && momentStore.moments.length === 0"
          description="暂无说说"
        />

        <MomentCard
          v-for="moment in momentStore.moments"
          :key="moment.id"
          :moment="moment"
          @edit="handleEdit"
          @delete="handleDelete"
        />
      </div>

      <!-- 分页 -->
      <div v-if="momentStore.pagination.total > 0" class="pagination-wrapper">
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

      <!-- 发布说说对话框 -->
      <MomentPublish
        ref="publishDialogRef"
        :edit-moment="editMoment"
        @success="handlePublishSuccess"
      />
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ChatDotRound, Edit } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import MomentCard from '@/components/moment/MomentCard.vue'
import MomentPublish from '@/components/moment/MomentPublish.vue'
import { useMomentStore } from '@/stores/moment'
import { useUserStore } from '@/stores/user'
import type { Moment } from '@/types/moment'

const momentStore = useMomentStore()
const userStore = useUserStore()

const publishDialogRef = ref()
const editMoment = ref<Moment | null>(null)
// 与 store 分页联动
const currentPage = computed({
  get: () => momentStore.pagination.page,
  set: (val: number) => momentStore.setPage(val)
})
const pageSize = computed({
  get: () => momentStore.pagination.limit,
  set: (val: number) => momentStore.setLimit(val)
})

// 加载说说列表
const loadMoments = async () => {
  await momentStore.fetchMoments()
}

// 发布说说
const handlePublish = () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    return
  }
  editMoment.value = null
  publishDialogRef.value?.open()
}

// 编辑说说
const handleEdit = (moment: Moment) => {
  editMoment.value = moment
  publishDialogRef.value?.open()
}

// 删除说说（由卡片组件内部处理）
const handleDelete = () => {
  // 删除成功后刷新列表
  loadMoments()
}

// 发布成功回调
const handlePublishSuccess = () => {
  editMoment.value = null
  loadMoments()
}

// 分页变化
const handlePageChange = (page: number) => {
  momentStore.setPage(page)
  loadMoments()
  // 滚动到顶部
  window.scrollTo({ top: 0, behavior: 'smooth' })
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
.moments-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
    padding-bottom: 20px;
    border-bottom: 2px solid #e4e7ed;

    .page-title {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 28px;
      font-weight: 600;
      color: #303133;
      margin: 0;

      .el-icon {
        font-size: 32px;
        color: #409eff;
      }
    }
  }

  .moments-list {
    min-height: 400px;
  }

  .pagination-wrapper {
    display: flex;
    justify-content: center;
    margin-top: 40px;
    padding: 20px 0;
  }
}

// 响应式布局
@media (max-width: 768px) {
  .moments-page {
    padding: 15px;

    .page-header {
      .page-title {
        font-size: 22px;

        .el-icon {
          font-size: 26px;
        }
      }
    }

    .pagination-wrapper {
      :deep(.el-pagination) {
        .el-pagination__sizes,
        .el-pagination__jump {
          display: none;
        }
      }
    }
  }
}
</style>
