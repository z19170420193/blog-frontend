<template>
  <div class="guestbook-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1 class="page-title">
        <el-icon><ChatLineRound /></el-icon>
        留言板
      </h1>
      <p class="page-desc">欢迎在这里留下你的足迹~</p>
    </div>

    <!-- 留言表单 -->
    <MessageForm
      ref="messageFormRef"
      :reply-to="replyToMessage"
      @success="handleMessageSuccess"
      @cancel-reply="handleCancelReply"
    />

    <!-- 留言列表 -->
    <div v-loading="messageStore.loading" class="messages-section">
      <div class="section-header">
        <h2 class="section-title">
          全部留言
          <el-tag type="info" size="large">{{ messageStore.pagination.total }}</el-tag>
        </h2>
        
        <!-- 心情筛选 -->
        <el-radio-group
          v-model="filterMood"
          size="small"
          @change="handleFilterChange"
        >
          <el-radio-button label="">全部</el-radio-button>
          <el-radio-button label="happy">
            <el-icon><Sunny /></el-icon>
            开心
          </el-radio-button>
          <el-radio-button label="sad">
            <el-icon><Drizzling /></el-icon>
            难过
          </el-radio-button>
          <el-radio-button label="angry">
            <el-icon><Lightning /></el-icon>
            生气
          </el-radio-button>
          <el-radio-button label="excited">
            <el-icon><Cloudy /></el-icon>
            兴奋
          </el-radio-button>
          <el-radio-button label="thinking">
            <el-icon><PartlyCloudy /></el-icon>
            思考
          </el-radio-button>
        </el-radio-group>
      </div>

      <!-- 空状态 -->
      <el-empty
        v-if="!messageStore.loading && messageStore.messages.length === 0"
        description="还没有留言,快来抢沙发吧~"
        :image-size="200"
      />

      <!-- 留言列表 - 瀑布流 -->
      <div v-else class="messages-grid">
        <MessageCard
          v-for="message in messageStore.messages"
          :key="message.id"
          :message="message"
          @edit="handleEdit"
          @delete="handleDelete"
          @like="handleLike"
          @reply="handleReply"
        />
      </div>
    </div>

    <!-- 分页 -->
    <div v-if="messageStore.pagination.total > 0" class="pagination-wrapper">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="messageStore.pagination.total"
        :page-sizes="[10, 20, 30, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  ChatLineRound,
  Sunny,
  Cloudy,
  Drizzling,
  Lightning,
  PartlyCloudy
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import MessageCard from '@/components/message/MessageCard.vue'
import MessageForm from '@/components/message/MessageForm.vue'
import { useMessageStore } from '@/stores/message'
import type { Message } from '@/types/message'

const messageStore = useMessageStore()

const messageFormRef = ref()
const replyToMessage = ref<Message | null>(null)
const filterMood = ref('')

// 分页
const currentPage = computed({
  get: () => messageStore.pagination.page,
  set: (val: number) => messageStore.setPage(val)
})

const pageSize = computed({
  get: () => messageStore.pagination.limit,
  set: (val: number) => messageStore.setLimit(val)
})

// 加载留言列表
const loadMessages = async () => {
  await messageStore.fetchMessages({
    mood: filterMood.value || undefined
  })
}

// 留言发表成功
const handleMessageSuccess = () => {
  replyToMessage.value = null
  loadMessages()
  // 滚动到顶部
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// 编辑留言
const handleEdit = (message: Message) => {
  // TODO: 实现编辑功能
  ElMessage.info('编辑功能开发中...')
}

// 删除留言
const handleDelete = (id: number) => {
  loadMessages()
}

// 点赞留言
const handleLike = (id: number) => {
  // 已在store中处理
}

// 回复留言
const handleReply = (message: Message) => {
  replyToMessage.value = message
  // 滚动到表单
  messageFormRef.value?.$el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

// 取消回复
const handleCancelReply = () => {
  replyToMessage.value = null
}

// 心情筛选变化
const handleFilterChange = () => {
  messageStore.setPage(1)
  loadMessages()
}

// 分页变化
const handlePageChange = (page: number) => {
  messageStore.setPage(page)
  loadMessages()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// 每页数量变化
const handleSizeChange = (size: number) => {
  messageStore.setLimit(size)
  messageStore.setPage(1)
  loadMessages()
}

// 初始化
onMounted(() => {
  loadMessages()
})
</script>

<style scoped lang="scss">
.guestbook-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;

  .page-header {
    text-align: center;
    margin-bottom: 40px;
    padding: 40px 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 16px;
    color: white;

    .page-title {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      font-size: 36px;
      font-weight: 700;
      margin: 0 0 12px 0;

      .el-icon {
        font-size: 40px;
      }
    }

    .page-desc {
      font-size: 16px;
      opacity: 0.9;
      margin: 0;
    }
  }

  .messages-section {
    min-height: 400px;

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 2px solid #e4e7ed;

      .section-title {
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 24px;
        font-weight: 600;
        color: #303133;
        margin: 0;
      }

      .el-radio-group {
        :deep(.el-radio-button__inner) {
          display: flex;
          align-items: center;
          gap: 4px;
        }
      }
    }

    .messages-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
  }

  .pagination-wrapper {
    display: flex;
    justify-content: center;
    margin-top: 40px;
    padding: 20px 0;
  }
}

// 响应式
@media (max-width: 1200px) {
  .guestbook-page {
    .messages-section .messages-grid {
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    }
  }
}

@media (max-width: 768px) {
  .guestbook-page {
    padding: 15px;

    .page-header {
      padding: 30px 15px;

      .page-title {
        font-size: 28px;

        .el-icon {
          font-size: 32px;
        }
      }

      .page-desc {
        font-size: 14px;
      }
    }

    .messages-section {
      .section-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;

        .section-title {
          font-size: 20px;
        }

        .el-radio-group {
          width: 100%;
          overflow-x: auto;

          :deep(.el-radio-button) {
            flex-shrink: 0;
          }
        }
      }

      .messages-grid {
        grid-template-columns: 1fr;
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
