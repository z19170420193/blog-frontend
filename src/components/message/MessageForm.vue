<template>
  <el-card class="message-form-card" shadow="hover">
    <template #header>
      <div class="form-header">
        <el-icon class="header-icon"><Edit /></el-icon>
        <span>{{ replyTo ? '回复留言' : '发表留言' }}</span>
      </div>
    </template>

    <!-- 回复提示 -->
    <el-alert
      v-if="replyTo"
      :title="`回复给 ${replyTo.nickname}`"
      type="info"
      closable
      @close="handleCancelReply"
      class="reply-alert"
    >
      <template #default>
        <div class="reply-content">{{ replyTo.content }}</div>
      </template>
    </el-alert>

    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="80px"
    >
      <!-- 访客信息（未登录用户） -->
      <template v-if="!userStore.isLoggedIn">
        <el-form-item label="昵称" prop="nickname">
          <el-input
            v-model="formData.nickname"
            placeholder="请输入昵称"
            :prefix-icon="User"
            clearable
          />
        </el-form-item>

        <el-form-item label="邮箱" prop="email">
          <el-input
            v-model="formData.email"
            placeholder="邮箱(可选)"
            :prefix-icon="Message"
            clearable
          />
        </el-form-item>
      </template>

      <!-- 留言内容 -->
      <el-form-item label="留言内容" prop="content">
        <el-input
          v-model="formData.content"
          type="textarea"
          :rows="4"
          :maxlength="500"
          show-word-limit
          placeholder="分享你的想法..."
        />
      </el-form-item>

      <!-- 心情选择 -->
      <el-form-item label="当前心情">
        <el-radio-group v-model="formData.mood" class="mood-group">
          <el-radio label="happy">
            <el-icon><Sunny /></el-icon>
            开心
          </el-radio>
          <el-radio label="sad">
            <el-icon><Drizzling /></el-icon>
            难过
          </el-radio>
          <el-radio label="angry">
            <el-icon><Lightning /></el-icon>
            生气
          </el-radio>
          <el-radio label="excited">
            <el-icon><Cloudy /></el-icon>
            兴奋
          </el-radio>
          <el-radio label="thinking">
            <el-icon><PartlyCloudy /></el-icon>
            思考中
          </el-radio>
        </el-radio-group>
      </el-form-item>

      <!-- 提交按钮 -->
      <el-form-item>
        <el-button
          type="primary"
          :loading="loading"
          :icon="Position"
          @click="handleSubmit"
        >
          {{ replyTo ? '发送回复' : '发表留言' }}
        </el-button>
        <el-button @click="handleReset">重置</el-button>
        <el-button v-if="replyTo" @click="handleCancelReply">取消回复</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script setup lang="ts">
import { ref, reactive, watch, nextTick } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import {
  Edit,
  User,
  Message as MessageIcon,
  Position,
  Sunny,
  Cloudy,
  Drizzling,
  Lightning,
  PartlyCloudy
} from '@element-plus/icons-vue'
import { useMessageStore } from '@/stores/message'
import { useUserStore } from '@/stores/user'
import type { Message, CreateMessageParams } from '@/types/message'

interface Props {
  replyTo?: Message | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  success: []
  cancelReply: []
}>()

const messageStore = useMessageStore()
const userStore = useUserStore()

const formRef = ref<FormInstance>()
const loading = ref(false)

// 表单数据
const formData = reactive<CreateMessageParams>({
  content: '',
  nickname: '',
  email: '',
  mood: 'happy',
  reply_to_id: undefined
})

// 表单验证规则
const rules: FormRules = {
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { min: 1, max: 50, message: '昵称长度在 1 到 50 个字符', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入留言内容', trigger: 'blur' },
    { min: 1, max: 500, message: '内容长度在 1 到 500 个字符', trigger: 'blur' }
  ]
}

// 监听回复目标
watch(
  () => props.replyTo,
  (newVal) => {
    if (newVal) {
      formData.reply_to_id = newVal.id
      nextTick(() => {
        // 滚动到表单
        formRef.value?.$el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      })
    } else {
      formData.reply_to_id = undefined
    }
  },
  { immediate: true }
)

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    loading.value = true
    try {
      // 如果用户已登录，不发送 nickname 和 email
      const submitData: CreateMessageParams = {
        content: formData.content,
        mood: formData.mood,
        reply_to_id: formData.reply_to_id
      }

      // 只有未登录用户才发送 nickname 和 email
      if (!userStore.isLoggedIn) {
        submitData.nickname = formData.nickname
        // 只有邮箱非空时才发送
        if (formData.email && formData.email.trim()) {
          submitData.email = formData.email
        }
      }

      await messageStore.createMessage(submitData)
      ElMessage.success(props.replyTo ? '回复成功' : '留言发表成功')
      emit('success')
      handleReset()
    } catch (error) {
      console.error('提交失败:', error)
    } finally {
      loading.value = false
    }
  })
}

// 重置表单
const handleReset = () => {
  formRef.value?.resetFields()
  formData.content = ''
  formData.nickname = ''
  formData.email = ''
  formData.mood = 'happy'
  if (!props.replyTo) {
    formData.reply_to_id = undefined
  }
}

// 取消回复
const handleCancelReply = () => {
  formData.reply_to_id = undefined
  emit('cancelReply')
}
</script>

<style scoped lang="scss">
.message-form-card {
  margin-bottom: 24px;

  .form-header {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 16px;
    font-weight: 600;

    .header-icon {
      font-size: 20px;
      color: #409eff;
    }
  }

  .reply-alert {
    margin-bottom: 16px;

    .reply-content {
      margin-top: 8px;
      font-size: 14px;
      color: #606266;
      padding: 8px;
      background: #f5f7fa;
      border-radius: 4px;
      max-height: 60px;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  .mood-group {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;

    :deep(.el-radio) {
      margin-right: 0;

      .el-radio__label {
        display: flex;
        align-items: center;
        gap: 4px;
      }
    }
  }

  :deep(.el-form-item__label) {
    font-weight: 500;
  }
}

// 响应式
@media (max-width: 768px) {
  .message-form-card {
    :deep(.el-form-item) {
      .el-form-item__label {
        width: 70px !important;
      }
    }

    .mood-group {
      :deep(.el-radio) {
        .el-radio__label {
          font-size: 13px;
        }
      }
    }
  }
}
</style>
