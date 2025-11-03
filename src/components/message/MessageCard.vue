<template>
  <el-card
    class="message-card"
    :style="{ backgroundColor: message.color || '#fff' }"
    :body-style="{ padding: '20px' }"
  >
    <!-- 用户信息头部 -->
    <div class="message-header">
      <div class="user-info">
        <el-avatar
          :size="40"
          :src="message.avatar || message.user?.avatar || defaultAvatar"
        >
          {{ (message.nickname || '匿名')[0].toUpperCase() }}
        </el-avatar>
        <div class="user-details">
          <div class="nickname">{{ message.nickname || '匿名用户' }}</div>
          <div class="time-mood">
            <span class="time">{{ formatTime(message.created_at) }}</span>
            <el-tag v-if="message.mood" size="small" :type="moodTagType" class="mood-tag">
              <el-icon>
                <component :is="moodIcon" />
              </el-icon>
              {{ moodText }}
            </el-tag>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <el-dropdown v-if="showActions" trigger="click" @command="handleCommand">
        <el-button :icon="MoreFilled" circle size="small" />
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item
              v-if="canEdit"
              command="edit"
              :icon="Edit"
            >
              编辑
            </el-dropdown-item>
            <el-dropdown-item
              v-if="canEdit"
              command="delete"
              :icon="Delete"
              divided
            >
              删除
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>

    <!-- 留言内容 -->
    <div class="message-content">
      <p>{{ message.content }}</p>
    </div>

    <!-- 回复列表 -->
    <div v-if="message.replies && message.replies.length > 0" class="replies-section">
      <el-divider content-position="left">
        <span class="replies-title">{{ message.replies.length }} 条回复</span>
      </el-divider>
      <div class="replies-list">
        <div
          v-for="reply in message.replies"
          :key="reply.id"
          class="reply-item"
        >
          <el-avatar :size="24" :src="reply.avatar || reply.user?.avatar">
            {{ (reply.nickname || '匿名')[0] }}
          </el-avatar>
          <div class="reply-content">
            <span class="reply-nickname">{{ reply.nickname }}</span>
            <span class="reply-text">: {{ reply.content }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部操作栏 -->
    <div class="message-footer">
      <div class="action-buttons">
        <el-button
          text
          :icon="Star"
          @click="handleLike"
        >
          {{ message.likes > 0 ? message.likes : '点赞' }}
        </el-button>
        <el-button
          text
          :icon="ChatLineRound"
          @click="handleReply"
        >
          回复
        </el-button>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import {
  MoreFilled,
  Edit,
  Delete,
  Star,
  ChatLineRound,
  Sunny,
  Cloudy,
  Drizzling,
  Lightning,
  PartlyCloudy
} from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'
import type { Message } from '@/types/message'
import { useUserStore } from '@/stores/user'
import { useMessageStore } from '@/stores/message'

dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

interface Props {
  message: Message
  showActions?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showActions: true
})

const emit = defineEmits<{
  edit: [message: Message]
  delete: [id: number]
  like: [id: number]
  reply: [message: Message]
}>()

const userStore = useUserStore()
const messageStore = useMessageStore()

const defaultAvatar = new URL('@/assets/default-avatar.png', import.meta.url).href

// 是否可以编辑
const canEdit = computed(() => {
  if (!userStore.isLoggedIn) return false
  return (
    userStore.user?.id === props.message.user_id ||
    userStore.user?.role === 'admin'
  )
})

// 心情图标
const moodIcon = computed(() => {
  const moodIcons: Record<string, any> = {
    happy: Sunny,
    sad: Drizzling,
    angry: Lightning,
    excited: Cloudy,
    thinking: PartlyCloudy
  }
  return moodIcons[props.message.mood] || Sunny
})

// 心情文本
const moodText = computed(() => {
  const moodTexts: Record<string, string> = {
    happy: '开心',
    sad: '难过',
    angry: '生气',
    excited: '兴奋',
    thinking: '思考中'
  }
  return moodTexts[props.message.mood] || ''
})

// 心情标签类型
const moodTagType = computed(() => {
  const moodTypes: Record<string, any> = {
    happy: 'success',
    sad: 'info',
    angry: 'danger',
    excited: 'warning',
    thinking: ''
  }
  return moodTypes[props.message.mood] || ''
})

// 格式化时间
const formatTime = (time: string) => {
  const now = dayjs()
  const messageTime = dayjs(time)
  const diffDays = now.diff(messageTime, 'day')

  if (diffDays < 7) {
    return messageTime.fromNow()
  }
  return messageTime.format('YYYY-MM-DD HH:mm')
}

// 操作命令处理
const handleCommand = async (command: string) => {
  switch (command) {
    case 'edit':
      emit('edit', props.message)
      break

    case 'delete':
      try {
        await ElMessageBox.confirm(
          '确定删除这条留言吗?删除后无法恢复',
          '删除确认',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )
        await messageStore.deleteMessage(props.message.id)
        emit('delete', props.message.id)
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除失败:', error)
        }
      }
      break
  }
}

// 点赞
const handleLike = async () => {
  try {
    await messageStore.likeMessage(props.message.id)
    emit('like', props.message.id)
  } catch (error) {
    console.error('点赞失败:', error)
  }
}

// 回复
const handleReply = () => {
  emit('reply', props.message)
}
</script>

<style scoped lang="scss">
.message-card {
  margin-bottom: 16px;
  border-radius: 12px;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .message-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 12px;

    .user-info {
      display: flex;
      gap: 12px;
      flex: 1;

      .user-details {
        flex: 1;

        .nickname {
          font-size: 16px;
          font-weight: 600;
          color: #303133;
          margin-bottom: 4px;
        }

        .time-mood {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #909399;

          .mood-tag {
            display: inline-flex;
            align-items: center;
            gap: 4px;
          }
        }
      }
    }
  }

  .message-content {
    margin: 16px 0;
    font-size: 15px;
    line-height: 1.6;
    color: #606266;
    word-break: break-word;

    p {
      margin: 0;
    }
  }

  .replies-section {
    margin-top: 16px;

    .replies-title {
      font-size: 13px;
      color: #909399;
    }

    .replies-list {
      .reply-item {
        display: flex;
        gap: 8px;
        padding: 8px 12px;
        margin: 4px 0;
        background: rgba(0, 0, 0, 0.02);
        border-radius: 8px;

        .reply-content {
          flex: 1;
          font-size: 14px;
          line-height: 24px;

          .reply-nickname {
            font-weight: 600;
            color: #409eff;
          }

          .reply-text {
            color: #606266;
          }
        }
      }
    }
  }

  .message-footer {
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid #ebeef5;

    .action-buttons {
      display: flex;
      gap: 8px;

      .el-button {
        color: #909399;

        &:hover {
          color: #409eff;
        }
      }
    }
  }
}

// 响应式
@media (max-width: 768px) {
  .message-card {
    .message-header .user-info .user-details .nickname {
      font-size: 14px;
    }

    .message-content {
      font-size: 14px;
    }
  }
}
</style>
