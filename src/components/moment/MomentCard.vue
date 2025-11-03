<template>
  <el-card class="moment-card" :body-style="{ padding: '20px' }">
    <!-- 置顶标签 -->
    <div v-if="moment.is_pinned" class="pinned-badge">
      <el-tag type="danger" size="small">
        <el-icon><Star /></el-icon>
        置顶
      </el-tag>
    </div>

    <!-- 用户信息 -->
    <div class="moment-header">
      <div class="user-info">
        <el-avatar
          :size="45"
          :src="moment.user?.avatar || defaultAvatar"
          @error="handleAvatarError"
        >
          {{ moment.user?.username?.charAt(0).toUpperCase() }}
        </el-avatar>
        <div class="user-details">
          <div class="username">{{ moment.user?.username || '未知用户' }}</div>
          <div class="time-location">
            <span class="time">{{ formatTime(moment.published_at) }}</span>
            <span v-if="moment.location" class="location">
              <el-icon><Location /></el-icon>
              {{ moment.location }}
            </span>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <el-dropdown v-if="showActions" trigger="click" @command="handleCommand">
        <el-button :icon="MoreFilled" circle />
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
              command="pin"
              :icon="Star"
            >
              {{ moment.is_pinned ? '取消置顶' : '置顶' }}
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

    <!-- 说说内容 -->
    <div class="moment-content">
      <p :class="{ 'content-collapsed': !isExpanded && isLongContent }">
        {{ moment.content }}
      </p>
      <el-button
        v-if="isLongContent"
        text
        type="primary"
        size="small"
        @click="isExpanded = !isExpanded"
      >
        {{ isExpanded ? '收起' : '展开' }}
      </el-button>
    </div>

    <!-- 图片九宫格 -->
    <div v-if="moment.images && moment.images.length > 0" class="moment-images">
      <div :class="['images-grid', `grid-${moment.images.length}`]">
        <el-image
          v-for="(image, index) in moment.images"
          :key="index"
          :src="image"
          :preview-src-list="moment.images"
          :initial-index="index"
          fit="cover"
          class="grid-image"
          lazy
        />
      </div>
    </div>

    <!-- 底部信息 -->
    <div class="moment-footer">
      <div class="visibility-tag">
        <el-tag v-if="moment.visibility === 'private'" size="small" type="info">
          <el-icon><Lock /></el-icon>
          私密
        </el-tag>
        <el-tag v-else-if="moment.visibility === 'friends'" size="small" type="warning">
          <el-icon><User /></el-icon>
          好友可见
        </el-tag>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import {
  MoreFilled,
  Edit,
  Delete,
  Star,
  Location,
  Lock,
  User
} from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'
import type { Moment } from '@/types/moment'
import { useUserStore } from '@/stores/user'
import { useMomentStore } from '@/stores/moment'

dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

interface Props {
  moment: Moment
  showActions?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showActions: true
})

const emit = defineEmits<{
  edit: [moment: Moment]
  delete: [id: number]
  pin: [id: number, isPinned: boolean]
}>()

const userStore = useUserStore()
const momentStore = useMomentStore()

const isExpanded = ref(false)
const defaultAvatar = new URL('@/assets/avatar.jpg', import.meta.url).href

// 是否为长内容
const isLongContent = computed(() => props.moment.content.length > 200)

// 是否可以编辑
const canEdit = computed(() => {
  if (!userStore.isLoggedIn) return false
  return (
    userStore.user?.id === props.moment.user_id ||
    userStore.user?.role === 'admin'
  )
})

// 格式化时间
const formatTime = (time: string) => {
  const now = dayjs()
  const publishTime = dayjs(time)
  const diffDays = now.diff(publishTime, 'day')

  if (diffDays < 7) {
    return publishTime.fromNow()
  }
  return publishTime.format('YYYY-MM-DD HH:mm')
}

// 头像加载失败处理
const handleAvatarError = () => true

// 操作命令处理
const handleCommand = async (command: string) => {
  switch (command) {
    case 'edit':
      emit('edit', props.moment)
      break

    case 'pin':
      try {
        await ElMessageBox.confirm(
          `确定${props.moment.is_pinned ? '取消置顶' : '置顶'}这条说说吗？`,
          '提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )
        await momentStore.togglePin(props.moment.id, !props.moment.is_pinned)
        emit('pin', props.moment.id, !props.moment.is_pinned)
      } catch (error) {
        // 用户取消操作
      }
      break

    case 'delete':
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
        await momentStore.deleteMoment(props.moment.id)
        emit('delete', props.moment.id)
      } catch (error) {
        // 用户取消操作
      }
      break
  }
}
</script>

<style scoped lang="scss">
.moment-card {
  margin-bottom: 20px;
  position: relative;
  transition: all 0.3s;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .pinned-badge {
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 1;
  }

  .moment-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 15px;

    .user-info {
      display: flex;
      gap: 12px;
      flex: 1;

      .user-details {
        flex: 1;

        .username {
          font-weight: 600;
          font-size: 15px;
          color: #303133;
          margin-bottom: 4px;
        }

        .time-location {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 13px;
          color: #909399;

          .location {
            display: flex;
            align-items: center;
            gap: 4px;
          }
        }
      }
    }
  }

  .moment-content {
    margin-bottom: 15px;
    font-size: 15px;
    line-height: 1.6;
    color: #303133;
    word-break: break-word;

    p {
      margin: 0;
      white-space: pre-wrap;

      &.content-collapsed {
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
    }
  }

  .moment-images {
    margin-bottom: 15px;

    .images-grid {
      display: grid;
      gap: 8px;

      // 1张图片
      &.grid-1 {
        grid-template-columns: 1fr;
        max-width: 400px;

        .grid-image {
          height: 300px;
        }
      }

      // 2张图片
      &.grid-2 {
        grid-template-columns: repeat(2, 1fr);

        .grid-image {
          height: 200px;
        }
      }

      // 3张图片
      &.grid-3 {
        grid-template-columns: repeat(3, 1fr);

        .grid-image {
          height: 150px;
        }
      }

      // 4张图片
      &.grid-4 {
        grid-template-columns: repeat(2, 1fr);

        .grid-image {
          height: 150px;
        }
      }

      // 5-9张图片
      &.grid-5,
      &.grid-6,
      &.grid-7,
      &.grid-8,
      &.grid-9 {
        grid-template-columns: repeat(3, 1fr);

        .grid-image {
          height: 120px;
        }
      }

      .grid-image {
        width: 100%;
        border-radius: 8px;
        cursor: pointer;
        overflow: hidden;

        :deep(img) {
          transition: transform 0.3s;

          &:hover {
            transform: scale(1.05);
          }
        }
      }
    }
  }

  .moment-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 10px;
    border-top: 1px solid #f0f0f0;

    .visibility-tag {
      display: flex;
      gap: 8px;
    }
  }
}

// 响应式布局
@media (max-width: 768px) {
  .moment-card {
    .moment-images {
      .images-grid {
        &.grid-1 {
          max-width: 100%;

          .grid-image {
            height: 250px;
          }
        }

        &.grid-2,
        &.grid-3,
        &.grid-4,
        &.grid-5,
        &.grid-6,
        &.grid-7,
        &.grid-8,
        &.grid-9 {
          .grid-image {
            height: 100px;
          }
        }
      }
    }
  }
}
</style>
