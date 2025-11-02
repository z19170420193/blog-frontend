<template>
  <div class="comment-form" :class="{ 'is-expanded': isExpanded }">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-position="top"
      @submit.prevent="handleSubmit"
    >
      <!-- 已登录用户显示信息 -->
      <div v-if="isLoggedIn" class="user-info-display">
        <el-alert
          type="info"
          :closable="false"
          show-icon
        >
          <template #title>
            <div class="logged-user-info">
              <span>以 <strong>{{ userStore.user?.username }}</strong> 的身份评论</span>
            </div>
          </template>
        </el-alert>
      </div>

      <!-- 未登录用户 - 渐进式表单 -->
      <template v-else>
        <transition name="slide-down">
          <div v-show="isExpanded" class="user-fields">
            <el-form-item label="昵称" prop="nickname" required>
              <el-input
                v-model="formData.nickname"
                placeholder="请输入您的昵称"
                maxlength="50"
                show-word-limit
                clearable
              >
                <template #prefix>
                  <el-icon><User /></el-icon>
                </template>
              </el-input>
            </el-form-item>

            <el-form-item label="邮箱（选填）" prop="email">
              <el-input
                v-model="formData.email"
                placeholder="邮箱地址不会公开显示"
                maxlength="100"
                clearable
              >
                <template #prefix>
                  <el-icon><Message /></el-icon>
                </template>
              </el-input>
            </el-form-item>
          </div>
        </transition>
      </template>

      <!-- 评论输入区 - 带预览功能 -->
      <el-form-item label="评论内容" prop="content" required>
        <div class="comment-editor">
          <!-- 标签页切换 -->
          <div class="editor-tabs">
            <div 
              class="tab-item" 
              :class="{ active: activeTab === 'edit' }"
              @click="activeTab = 'edit'"
            >
              <el-icon><Edit /></el-icon>
              <span>编写</span>
            </div>
            <div 
              class="tab-item" 
              :class="{ active: activeTab === 'preview' }"
              @click="activeTab = 'preview'"
            >
              <el-icon><View /></el-icon>
              <span>预览</span>
            </div>
            <!-- 字数统计 -->
            <div class="char-counter" :class="getCounterClass()">
              <span class="count">{{ formData.content.length }}</span>
              <span class="separator">/</span>
              <span class="total">1000</span>
            </div>
          </div>

          <!-- Markdown 工具栏 -->
          <transition name="fade">
            <div v-show="activeTab === 'edit'" class="markdown-toolbar">
              <el-tooltip content="粗体 (Ctrl+B)" placement="top" :show-after="500">
                <button 
                  type="button"
                  class="toolbar-btn"
                  @click="insertMarkdown('**', '**', '粗体文字')"
                >
                  <strong>B</strong>
                </button>
              </el-tooltip>
              
              <el-tooltip content="斜体 (Ctrl+I)" placement="top" :show-after="500">
                <button 
                  type="button"
                  class="toolbar-btn"
                  @click="insertMarkdown('*', '*', '斜体文字')"
                >
                  <em>I</em>
                </button>
              </el-tooltip>
              
              <el-tooltip content="代码 (Ctrl+K)" placement="top" :show-after="500">
                <button 
                  type="button"
                  class="toolbar-btn"
                  @click="insertMarkdown('`', '`', '代码')"
                >
                  <span class="code-icon">&lt;/&gt;</span>
                </button>
              </el-tooltip>
              
              <div class="toolbar-divider"></div>
              
              <el-tooltip content="插入链接 (Ctrl+L)" placement="top" :show-after="500">
                <button 
                  type="button"
                  class="toolbar-btn"
                  @click="insertLink()"
                >
                  <el-icon><Link /></el-icon>
                </button>
              </el-tooltip>
              
              <el-tooltip content="插入列表" placement="top" :show-after="500">
                <button 
                  type="button"
                  class="toolbar-btn"
                  @click="insertList()"
                >
                  <el-icon><List /></el-icon>
                </button>
              </el-tooltip>
              
              <div class="toolbar-divider"></div>
              
              <el-tooltip content="代码块" placement="top" :show-after="500">
                <button 
                  type="button"
                  class="toolbar-btn"
                  @click="insertCodeBlock()"
                >
                  <el-icon><DocumentCopy /></el-icon>
                </button>
              </el-tooltip>
            </div>
          </transition>

          <!-- 编辑模式 -->
          <div v-show="activeTab === 'edit'" class="editor-content">
            <el-input
              ref="textareaRef"
              v-model="formData.content"
              type="textarea"
              :rows="6"
              :placeholder="getPlaceholder()"
              maxlength="1000"
              resize="none"
              @focus="handleEditorFocus"
              @keydown="handleEditorKeydown"
            />
          </div>

          <!-- 预览模式 -->
          <div v-show="activeTab === 'preview'" class="preview-content">
            <div v-if="formData.content" class="preview-html" v-html="renderPreview()"></div>
            <div v-else class="preview-empty">
              <el-icon><Document /></el-icon>
              <p>暂无内容可预览</p>
              <el-button link type="primary" @click="activeTab = 'edit'">开始编写</el-button>
            </div>
          </div>
        </div>
      </el-form-item>

      <!-- 内联错误提示 -->
      <transition name="slide-down">
        <el-alert
          v-if="errorMessage"
          type="error"
          :title="errorMessage"
          :closable="true"
          show-icon
          class="error-alert"
          @close="errorMessage = ''"
        />
      </transition>

      <!-- 操作按钮 -->
      <transition name="slide-down">
        <el-form-item v-show="isExpanded || isLoggedIn" class="action-buttons">
          <el-button
            type="primary"
            :loading="submitting"
            :disabled="!canSubmit"
            @click="handleSubmit"
          >
            <template v-if="!submitting">
              <el-icon><Promotion /></el-icon>
              <span>发表评论</span>
            </template>
            <template v-else>
              <el-icon class="rotating"><Loading /></el-icon>
              <span>提交中<span class="dots">...</span></span>
            </template>
          </el-button>
          <el-button @click="handleReset">
            重置
          </el-button>
        </el-form-item>
      </transition>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { 
  User, Message, Edit, InfoFilled, View, Promotion, Loading, Document,
  Link, List, DocumentCopy
} from '@element-plus/icons-vue'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import { commentApi } from '@/api'
import type { CommentFormData } from '@/types'
import { useUserStore } from '@/stores/user'

interface Props {
  articleId: number
  parentId?: number
  replyToUsername?: string
}

interface Emits {
  (e: 'submitted'): void
  (e: 'cancel'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 用户状态
const userStore = useUserStore()

// 是否已登录
const isLoggedIn = computed(() => !!userStore.user)

// 表单引用
const formRef = ref<FormInstance>()
const textareaRef = ref()

// 表单数据
const formData = reactive<Omit<CommentFormData, 'article_id'>>({
  nickname: '',
  email: '',
  content: '',
  parent_id: props.parentId,
})

// 提交状态
const submitting = ref(false)

// 渐进式表单展开状态
const isExpanded = ref(false)

// 预览/编辑切换
const activeTab = ref<'edit' | 'preview'>('edit')

// 错误消息
const errorMessage = ref('')

// 验证规则 (动态根据登录状态调整)
const rules = computed<FormRules>(() => {
  const baseRules: FormRules = {
    content: [
      { required: true, message: '请输入评论内容', trigger: 'blur' },
      { min: 5, max: 1000, message: '评论内容在 5 到 1000 个字符之间', trigger: 'blur' },
    ],
  }

  // 未登录用户需要填写昵称和邮箱
  if (!isLoggedIn.value) {
    baseRules.nickname = [
      { required: true, message: '请输入昵称', trigger: 'blur' },
      { min: 2, max: 50, message: '昵称长度在 2 到 50 个字符', trigger: 'blur' },
    ]
    baseRules.email = [
      {
        type: 'email',
        message: '请输入正确的邮箱地址',
        trigger: ['blur', 'change'],
      },
    ]
  }

  return baseRules
})

// 提交评论
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    
    submitting.value = true
    
    // 调用API
    const result = await commentApi.createComment(props.articleId, {
      nickname: formData.nickname,
      email: formData.email || undefined,
      content: formData.content,
      parent_id: formData.parent_id,
    })

    // 根据登录状态和审核状态显示不同消息
    if (isLoggedIn.value) {
      // 已登录用户，自动审核通过
      ElMessage.success('🎉 评论发表成功！')
    } else {
      // 未登录用户，需要审核
      ElMessage.success('✅ 诅论提交成功，等待审核后显示')
    }
    
    // 清除错误信息
    errorMessage.value = ''
    
    // 重置表单
    handleReset()
    
    // 触发提交事件
    emit('submitted')
    
    // 仅为未登录用户保存信息到本地存储
    if (!isLoggedIn.value) {
      localStorage.setItem('comment_nickname', formData.nickname)
      if (formData.email) {
        localStorage.setItem('comment_email', formData.email)
      }
    }
  } catch (error: any) {
    console.error('提交评论失败:', error)
    // 使用内联错误提示
    errorMessage.value = error.message || '提交评论失败，请稍后重试'
  } finally {
    submitting.value = false
  }
}

// 重置表单
const handleReset = () => {
  formRef.value?.resetFields()
  formData.content = ''
  isExpanded.value = false
  activeTab.value = 'edit'
}

// 处理编辑器焦点
const handleEditorFocus = () => {
  if (!isLoggedIn.value && !isExpanded.value) {
    isExpanded.value = true
  }
}

// 获取占位符文本
const getPlaceholder = () => {
  if (!isExpanded.value && !isLoggedIn.value) {
    return '💭 分享你的想法、疑问或建议... 点击展开更多选项'
  }
  return '支持 Markdown 语法，让你的评论更精彩～'
}

// 渲染预览内容
const renderPreview = () => {
  if (!formData.content) return ''
  
  try {
    const html = marked.parse(formData.content, {
      breaks: true,
      gfm: true,
    })
    
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'code', 'pre', 'a', 'ul', 'ol', 'li', 'h1', 'h2', 'h3'],
      ALLOWED_ATTR: ['href', 'title', 'target'],
    })
  } catch (error) {
    console.error('渲染预览失败:', error)
    return formData.content
  }
}

// 字数统计样式
const getCounterClass = () => {
  const len = formData.content.length
  if (len < 5) return 'warning'
  if (len > 900) return 'danger'
  return 'normal'
}

// 是否可以提交
const canSubmit = computed(() => {
  const hasContent = formData.content.length >= 5
  if (isLoggedIn.value) {
    return hasContent
  }
  return hasContent && formData.nickname.length >= 2
})

// 快捷键处理
const handleKeydown = (e: KeyboardEvent) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    const target = e.target as HTMLElement
    if (target?.closest('.comment-form')) {
      e.preventDefault()
      if (canSubmit.value && !submitting.value) {
        handleSubmit()
      }
    }
  }
}

// 编辑器快捷键处理
const handleEditorKeydown = (e: KeyboardEvent) => {
  if (e.ctrlKey || e.metaKey) {
    switch (e.key.toLowerCase()) {
      case 'b':
        e.preventDefault()
        insertMarkdown('**', '**', '粗体文字')
        break
      case 'i':
        e.preventDefault()
        insertMarkdown('*', '*', '斜体文字')
        break
      case 'k':
        e.preventDefault()
        insertMarkdown('`', '`', '代码')
        break
      case 'l':
        e.preventDefault()
        insertLink()
        break
    }
  }
}

// 插入 Markdown 格式
const insertMarkdown = (before: string, after: string, placeholder: string = '') => {
  const textarea = textareaRef.value?.$el?.querySelector('textarea')
  if (!textarea) return
  
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const selectedText = formData.content.substring(start, end)
  const textToInsert = selectedText || placeholder
  
  const newText = 
    formData.content.substring(0, start) +
    before + textToInsert + after +
    formData.content.substring(end)
  
  formData.content = newText
  
  // 重新设置焦点和选中范围
  setTimeout(() => {
    textarea.focus()
    const newStart = start + before.length
    const newEnd = newStart + textToInsert.length
    textarea.setSelectionRange(newStart, newEnd)
  }, 0)
}

// 插入链接
const insertLink = () => {
  const textarea = textareaRef.value?.$el?.querySelector('textarea')
  if (!textarea) return
  
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const selectedText = formData.content.substring(start, end)
  
  const linkText = selectedText || '链接文字'
  const linkUrl = 'https://example.com'
  const markdown = `[${linkText}](${linkUrl})`
  
  const newText = 
    formData.content.substring(0, start) +
    markdown +
    formData.content.substring(end)
  
  formData.content = newText
  
  // 选中 URL 部分便于编辑
  setTimeout(() => {
    textarea.focus()
    const urlStart = start + linkText.length + 3 // [文字](
    const urlEnd = urlStart + linkUrl.length
    textarea.setSelectionRange(urlStart, urlEnd)
  }, 0)
}

// 插入列表
const insertList = () => {
  const textarea = textareaRef.value?.$el?.querySelector('textarea')
  if (!textarea) return
  
  const start = textarea.selectionStart
  const listItem = '- 列表项\n'
  
  const newText = 
    formData.content.substring(0, start) +
    listItem +
    formData.content.substring(start)
  
  formData.content = newText
  
  setTimeout(() => {
    textarea.focus()
    textarea.setSelectionRange(start + 2, start + listItem.length - 1)
  }, 0)
}

// 插入代码块
const insertCodeBlock = () => {
  const textarea = textareaRef.value?.$el?.querySelector('textarea')
  if (!textarea) return
  
  const start = textarea.selectionStart
  const codeBlock = '```\n代码\n```\n'
  
  const newText = 
    formData.content.substring(0, start) +
    codeBlock +
    formData.content.substring(start)
  
  formData.content = newText
  
  setTimeout(() => {
    textarea.focus()
    textarea.setSelectionRange(start + 4, start + 6)
  }, 0)
}

// 从本地存储恢复昵称和邮箱 (仅未登录用户)
const restoreFromLocalStorage = () => {
  if (isLoggedIn.value) return
  
  const savedNickname = localStorage.getItem('comment_nickname')
  const savedEmail = localStorage.getItem('comment_email')
  
  if (savedNickname) {
    formData.nickname = savedNickname
  }
  if (savedEmail) {
    formData.email = savedEmail
  }
}

// 初始化用户信息
const initUserInfo = () => {
  if (isLoggedIn.value && userStore.user) {
    // 已登录用户自动填充信息
    formData.nickname = userStore.user.username
    formData.email = userStore.user.email || ''
  } else {
    // 未登录用户从本地存储恢复
    restoreFromLocalStorage()
  }
}

// 监听登录状态变化
watch(() => userStore.user, () => {
  initUserInfo()
}, { immediate: true })

// 初始化
initUserInfo()

// 已登录用户自动展开
if (isLoggedIn.value) {
  isExpanded.value = true
}

// 生命周期
onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.comment-form {
  padding: 20px;
  background: #ffffff;
  border-radius: 12px;
  margin-bottom: 32px;
  transition: all 0.3s ease;
}

.comment-form.is-expanded {
  background: #ffffff;
}


:deep(.el-form-item__label) {
  font-weight: 500;
  color: #606266;
}

:deep(.el-textarea__inner) {
  font-family: inherit;
  line-height: 1.6;
}

.markdown-tip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  margin-bottom: 16px;
  background: linear-gradient(135deg, #f0f7ff 0%, #e8f4ff 100%);
  border-radius: 6px;
  border-left: 3px solid #409eff;
  font-size: 12px;
  color: #409eff;
}

.markdown-tip .el-icon {
  font-size: 14px;
  flex-shrink: 0;
}

.markdown-tip code {
  padding: 2px 6px;
  background: rgba(64, 158, 255, 0.1);
  border-radius: 3px;
  font-size: 11px;
  margin: 0 2px;
}

/* 登录用户信息展示 */
.user-info-display {
  margin-bottom: 20px;
}

.logged-user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.logged-user-info strong {
  color: #409eff;
  font-weight: 600;
}

:deep(.el-alert) {
  border-radius: 8px;
}

:deep(.el-alert__title) {
  font-size: 14px;
}

:deep(.el-form-item:last-child) {
  margin-bottom: 0;
}

/* 渐进式表单动画 */
.slide-down-enter-active {
  animation: slideDown 0.3s ease-out;
}

.slide-down-leave-active {
  animation: slideDown 0.3s ease-in reverse;
}

@keyframes slideDown {
  from {
    opacity: 0;
    max-height: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    max-height: 300px;
    transform: translateY(0);
  }
}

.user-fields {
  overflow: hidden;
}

/* 评论编辑器 */
.comment-editor {
  width: 100%;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.comment-editor:hover {
  border-color: #c0c4cc;
}

.comment-editor:focus-within {
  border-color: #409eff;
  box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.1);
}

/* 标签页 */
.editor-tabs {
  display: flex;
  align-items: center;
  background: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
  padding: 0 12px;
}

.tab-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  cursor: pointer;
  font-size: 14px;
  color: #606266;
  border-bottom: 2px solid transparent;
  transition: all 0.3s;
  user-select: none;
}

.tab-item:hover {
  color: #409eff;
  background: rgba(64, 158, 255, 0.05);
}

.tab-item.active {
  color: #409eff;
  font-weight: 600;
  border-bottom-color: #409eff;
}

.tab-item .el-icon {
  font-size: 16px;
}

/* 字数统计 */
.char-counter {
  margin-left: auto;
  font-size: 13px;
  padding: 4px 12px;
  border-radius: 12px;
  transition: all 0.3s;
}

.char-counter.normal {
  color: #909399;
  background: transparent;
}

.char-counter.warning {
  color: #e6a23c;
  background: rgba(230, 162, 60, 0.1);
  font-weight: 600;
}

.char-counter.danger {
  color: #f56c6c;
  background: rgba(245, 108, 108, 0.1);
  font-weight: 600;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.char-counter .count {
  font-weight: 600;
}

.char-counter .separator {
  margin: 0 2px;
}

/* 编辑器内容 */
.editor-content {
  position: relative;
  min-height: 160px;
}

.editor-content :deep(.el-textarea) {
  border: none;
}

.editor-content :deep(.el-textarea__inner) {
  border: none;
  border-radius: 0;
  box-shadow: none;
  padding: 16px;
  min-height: 160px;
  font-size: 14px;
  line-height: 1.6;
}

.editor-content :deep(.el-textarea__inner):focus {
  box-shadow: none;
}


/* 预览内容 */
.preview-content {
  min-height: 160px;
  padding: 16px;
  background: #ffffff;
}

.preview-html {
  color: #606266;
  font-size: 14px;
  line-height: 1.8;
  word-break: break-word;
}

.preview-html :deep(p) {
  margin: 8px 0;
}

.preview-html :deep(code) {
  padding: 2px 6px;
  background: #f5f7fa;
  border-radius: 4px;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 13px;
  color: #e96900;
}

.preview-html :deep(pre) {
  margin: 12px 0;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 6px;
  overflow-x: auto;
}

.preview-html :deep(pre code) {
  padding: 0;
  background: transparent;
  color: #303133;
}

.preview-html :deep(a) {
  color: #409eff;
  text-decoration: none;
}

.preview-html :deep(a:hover) {
  text-decoration: underline;
}

.preview-html :deep(strong) {
  font-weight: 600;
  color: #303133;
}

.preview-html :deep(em) {
  font-style: italic;
}

.preview-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 160px;
  color: #909399;
}

.preview-empty .el-icon {
  font-size: 48px;
  color: #dcdfe6;
  margin-bottom: 12px;
}

.preview-empty p {
  margin: 0 0 12px 0;
  font-size: 14px;
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  align-items: center;
  gap: 12px;
}

.action-buttons :deep(.el-form-item__content) {
  display: flex;
  align-items: center;
  gap: 12px;
}

.action-buttons .el-button {
  display: flex;
  align-items: center;
  gap: 6px;
}

.rotating {
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.dots {
  display: inline-block;
  animation: dots 1.5s steps(3, end) infinite;
}

@keyframes dots {
  0%, 20% { content: '.'; }
  40% { content: '..'; }
  60%, 100% { content: '...'; }
}

.shortcut-hint {
  font-size: 12px;
  color: #909399;
  margin-left: 8px;
}

/* Markdown 工具栏 */
.markdown-toolbar {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  background: #fafbfc;
  border-bottom: 1px solid #e4e7ed;
}

.toolbar-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  color: #606266;
  font-size: 14px;
  transition: all 0.2s;
  padding: 0;
}

.toolbar-btn:hover {
  background: #e1e4e8;
  color: #409eff;
}

.toolbar-btn:active {
  transform: scale(0.95);
}

.toolbar-btn strong,
.toolbar-btn em {
  font-size: 15px;
  font-weight: 600;
}

.toolbar-btn em {
  font-style: italic;
}

.code-icon {
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 13px;
  font-weight: 600;
}

.toolbar-btn .el-icon {
  font-size: 16px;
}

.toolbar-divider {
  width: 1px;
  height: 20px;
  background: #dcdfe6;
  margin: 0 4px;
}

/* 淡入淡出动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* 错误提示 */
.error-alert {
  margin-bottom: 16px;
  border-radius: 8px;
  animation: shake 0.5s;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
}

.error-alert :deep(.el-alert__title) {
  font-size: 13px;
}

/* 响应式 */
@media (max-width: 768px) {
  .comment-form {
    padding: 16px;
  }

  .editor-tabs {
    padding: 0 8px;
  }

  .tab-item {
    padding: 8px 12px;
    font-size: 13px;
  }

  .char-counter {
    font-size: 11px;
    padding: 2px 8px;
  }

  .editor-content :deep(.el-textarea__inner) {
    font-size: 16px; /* 防止iOS自动缩放 */
    padding: 12px;
  }

  .shortcut-hint {
    display: none;
  }
  
  .markdown-toolbar {
    padding: 6px 8px;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
  
  .toolbar-btn {
    width: 36px;
    height: 36px;
    flex-shrink: 0;
  }

  .action-buttons {
    flex-direction: column;
    align-items: stretch;
  }

  .action-buttons :deep(.el-form-item__content) {
    flex-direction: column;
    align-items: stretch;
  }

  .action-buttons .el-button {
    width: 100%;
    margin-left: 0 !important;
    justify-content: center;
  }
}
</style>
