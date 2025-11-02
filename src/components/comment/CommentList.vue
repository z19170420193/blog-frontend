<template>
  <div class="comment-list">
    <!-- 空状态 -->
    <el-empty
      v-if="comments.length === 0"
      description="暂无评论，快来发表第一条评论吧~"
      :image-size="120"
    />

    <!-- 评论列表 -->
    <div v-else class="comments">
      <div
        v-for="comment in sortedComments"
        :key="comment.id"
        class="comment-item"
      >
        <!-- 头像 -->
        <div class="comment-avatar">
          <el-avatar :size="48" :src="comment.user?.avatar">
            <el-icon><User /></el-icon>
          </el-avatar>
        </div>

        <!-- 内容区 -->
        <div class="comment-content">
          <!-- 用户信息 -->
          <div class="comment-header">
            <span class="comment-author">{{ comment.nickname }}</span>
            <span class="comment-time">{{ formatTime(comment.created_at) }}</span>
          </div>

          <!-- 评论文本 -->
          <div class="comment-text" v-html="renderContent(comment.content)"></div>

          <!-- 操作按钮 -->
<div class="comment-actions">
            <div class="comment-like">
              <LikeButton
                :id="`c-${comment.id}`"
                :like-count="getLikeCount(comment.id)"
                :liked="isLiked(comment.id)"
                @like="(liked:boolean) => toggleLike(comment.id, liked)"
              />
              <span v-if="getLikeCount(comment.id) > 0" class="like-count">{{ getLikeCount(comment.id) }}</span>
            </div>

            <el-button
              link
              type="primary"
              :icon="ChatDotRound"
              size="small"
              @click="handleReply(comment)"
            >
              回复
            </el-button>
            
            <el-button
              v-if="canDelete(comment)"
              link
              type="danger"
              :icon="Delete"
              size="small"
              @click="handleDelete(comment.id)"
            >
              删除
            </el-button>
          </div>

          <!-- 回复评论 -->
          <div v-if="comment.replies && comment.replies.length > 0" class="replies">
            <div
              v-for="reply in comment.replies"
              :key="reply.id"
              class="reply-item"
            >
              <div class="comment-avatar">
                <el-avatar :size="36" :src="reply.user?.avatar">
                  <el-icon><User /></el-icon>
                </el-avatar>
              </div>

              <div class="comment-content">
                <div class="comment-header">
                  <span class="comment-author">{{ reply.nickname }}</span>
                  <span class="comment-time">{{ formatTime(reply.created_at) }}</span>
                </div>

                <div class="comment-text" v-html="renderContent(reply.content)"></div>

                <div class="comment-actions">
                  <div class="comment-like">
                    <LikeButton
                      :id="`cr-${reply.id}`"
                      :like-count="getLikeCount(reply.id)"
                      :liked="isLiked(reply.id)"
                      @like="(liked:boolean) => toggleLike(reply.id, liked)"
                    />
                    <span v-if="getLikeCount(reply.id) > 0" class="like-count">{{ getLikeCount(reply.id) }}</span>
                  </div>

                  <el-button
                    v-if="canDelete(reply)"
                    link
                    type="danger"
                    :icon="Delete"
                    size="small"
                    @click="handleDelete(reply.id)"
                  >
                    删除
                  </el-button>
                </div>
              </div>
            </div>
          </div>

          <!-- 回复表单 -->
          <div v-if="replyingTo === comment.id" class="reply-form">
            <CommentForm
              :article-id="articleId"
              :parent-id="comment.id"
              :reply-to-username="comment.nickname"
              @submitted="handleReplySubmitted"
              @cancel="replyingTo = null"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { User, ChatDotRound, Delete } from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

import CommentForm from './CommentForm.vue'
import LikeButton from '@/components/common/LikeButton.vue'
import { commentApi } from '@/api'
import type { Comment } from '@/types'
import { useUserStore } from '@/stores/user'

dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

// 本地点赞状态（简单持久化到 localStorage）
const likeCounts = ref<Record<number, number>>({})
const likedIds = ref<Set<number>>(new Set())

const loadLikeState = () => {
  try {
    const c = localStorage.getItem('comment_like_counts')
    const l = localStorage.getItem('comment_liked_ids')
    likeCounts.value = c ? JSON.parse(c) : {}
    likedIds.value = new Set(l ? JSON.parse(l) : [])
  } catch (e) {
    likeCounts.value = {}
    likedIds.value = new Set()
  }
}

const saveLikeState = () => {
  localStorage.setItem('comment_like_counts', JSON.stringify(likeCounts.value))
  localStorage.setItem('comment_liked_ids', JSON.stringify(Array.from(likedIds.value)))
}

const getLikeCount = (id: number) => likeCounts.value[id] || 0
const isLiked = (id: number) => likedIds.value.has(id)

const toggleLike = (id: number, liked: boolean) => {
  const current = likeCounts.value[id] || 0
  if (liked) {
    if (!likedIds.value.has(id)) {
      likeCounts.value[id] = current + 1
      likedIds.value.add(id)
    }
  } else {
    if (likedIds.value.has(id)) {
      likeCounts.value[id] = Math.max(0, current - 1)
      likedIds.value.delete(id)
    }
  }
  saveLikeState()
}

loadLikeState()

interface Props {
  comments: Comment[]
  articleId: number
}

interface Emits {
  (e: 'refresh'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const userStore = useUserStore()

// 正在回复的评论ID
const replyingTo = ref<number | null>(null)

// 排序后的评论（最新的在前面）
const sortedComments = computed(() => {
  if (!props.comments || !Array.isArray(props.comments)) {
    return []
  }
  
  return [...props.comments]
    .filter(c => !c.parent_id) // 只显示顶级评论
    .filter(c => c.is_approved) // 只显示已审核的评论
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
})

// 格式化时间
const formatTime = (time: string) => {
  const d = dayjs(time)
  const now = dayjs()
  
  // 7天内显示相对时间
  if (now.diff(d, 'day') < 7) {
    return d.fromNow()
  }
  
  return d.format('YYYY-MM-DD HH:mm')
}

// 渲染评论内容（支持Markdown并防XSS）
const renderContent = (content: string) => {
  if (!content) return ''
  
  try {
    // 使用marked渲染Markdown
    const html = marked.parse(content, {
      breaks: true,
      gfm: true,
    })
    
    // 使用DOMPurify清理HTML，防止XSS攻击
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'code', 'pre', 'a', 'ul', 'ol', 'li'],
      ALLOWED_ATTR: ['href', 'title', 'target'],
    })
  } catch (error) {
    console.error('渲染评论内容失败:', error)
    return content
  }
}

// 判断是否可以删除评论
const canDelete = (comment: Comment) => {
  // 管理员可以删除所有评论
  if (userStore.isAdmin) {
    return true
  }
  
  // 用户只能删除自己的评论
  if (userStore.user && comment.user_id === userStore.user.id) {
    return true
  }
  
  return false
}

// 处理回复
const handleReply = (comment: Comment) => {
  replyingTo.value = comment.id
}

// 回复提交成功
const handleReplySubmitted = () => {
  replyingTo.value = null
  emit('refresh')
}

// 删除评论
const handleDelete = async (commentId: number) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除这条评论吗？此操作不可恢复。',
      '删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    await commentApi.deleteComment(commentId)
    ElMessage.success('评论已删除')
    emit('refresh')
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除评论失败:', error)
      ElMessage.error(error.message || '删除评论失败')
    }
  }
}
</script>

<style scoped>
.comment-list {
  margin-top: 24px;
}

/* 评论项 */
.comment-item {
  display: flex;
  gap: 16px;
  padding: 24px 0;
  margin-bottom: 0;
  background: transparent;
  border-radius: 0;
  border: none;
  border-bottom: 1px solid #f0f0f0;
  transition: all 0.3s;
}

.comment-item:hover {
  background: rgba(64, 158, 255, 0.02);
  border-bottom-color: #e4e7ed;
}

.comment-item:last-child {
  border-bottom: none;
}

.comment-avatar {
  flex-shrink: 0;
}

.comment-content {
  flex: 1;
  min-width: 0;
}

/* 评论头部 */
.comment-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.comment-author {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  position: relative;
}

.comment-author::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 2px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  transition: width 0.3s;
}

.comment-item:hover .comment-author::after {
  width: 100%;
}

.comment-time {
  font-size: 13px;
  color: #909399;
}

/* 评论文本 */
.comment-text {
  color: #606266;
  font-size: 14px;
  line-height: 1.8;
  word-break: break-word;
  margin-bottom: 12px;
}

.comment-text :deep(p) {
  margin: 8px 0;
}

.comment-text :deep(code) {
  padding: 2px 6px;
  background: #f5f7fa;
  border-radius: 4px;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 13px;
  color: #e96900;
}

.comment-text :deep(pre) {
  margin: 8px 0;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 6px;
  overflow-x: auto;
}

.comment-text :deep(pre code) {
  padding: 0;
  background: transparent;
  color: #303133;
}

.comment-text :deep(a) {
  color: #409eff;
  text-decoration: none;
}

.comment-text :deep(a:hover) {
  text-decoration: underline;
}

.comment-text :deep(strong) {
  font-weight: 600;
}

.comment-text :deep(em) {
  font-style: italic;
}

/* 评论操作 */
.comment-actions {
  display: flex;
  gap: 16px;
  align-items: center;
}

.comment-like {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.like-count {
  font-size: 12px;
  color: #909399;
}

/* 回复区域 */
.replies {
  margin-top: 20px;
  padding-left: 24px;
  border-left: 3px solid #e4e7ed;
  position: relative;
}

.replies::before {
  content: '';
  position: absolute;
  left: -3px;
  top: 0;
  width: 3px;
  height: 30px;
  background: linear-gradient(180deg, #667eea 0%, transparent 100%);
}

.reply-item {
  display: flex;
  gap: 12px;
  padding: 16px 0;
  margin-bottom: 12px;
  background: transparent;
  border-radius: 0;
  border: none;
  border-bottom: 1px dashed #e8e8e8;
  transition: all 0.3s;
}

.reply-item:hover {
  background: rgba(64, 158, 255, 0.01);
  border-bottom-color: #d0d0d0;
}

.reply-item:last-child {
  margin-bottom: 0;
  border-bottom: none;
}

.reply-form {
  margin-top: 16px;
}

/* 空状态 */
:deep(.el-empty) {
  padding: 60px 0 40px;
}

:deep(.el-empty__description) {
  margin-top: 16px;
  color: #909399;
  font-size: 14px;
}

/* 响应式 */
@media (max-width: 768px) {
  .comment-item {
    gap: 12px;
    padding: 16px 0;
  }

  .comment-avatar :deep(.el-avatar) {
    width: 40px;
    height: 40px;
  }

  .comment-author {
    font-size: 14px;
  }

  .comment-text {
    font-size: 13px;
  }

  .replies {
    padding-left: 12px;
  }

  .reply-item .comment-avatar :deep(.el-avatar) {
    width: 32px;
    height: 32px;
  }
}
</style>
