<template>
  <el-dialog
    v-model="dialogVisible"
    :title="isEdit ? '编辑说说' : '发布说说'"
    width="600px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="80px"
    >
      <!-- 说说内容 -->
      <el-form-item label="说说内容" prop="content">
        <el-input
          v-model="formData.content"
          type="textarea"
          :rows="6"
          :maxlength="1000"
          show-word-limit
          placeholder="分享此刻的想法..."
        />
      </el-form-item>

      <!-- 图片上传 -->
      <el-form-item label="图片">
        <div class="image-upload-wrapper">
          <!-- 已上传图片 -->
          <div v-if="formData.images.length > 0" class="uploaded-images">
            <div
              v-for="(image, index) in formData.images"
              :key="index"
              class="image-item"
            >
              <el-image
                :src="image"
                fit="cover"
                :preview-src-list="formData.images"
                :initial-index="index"
              />
              <el-button
                :icon="Close"
                circle
                size="small"
                type="danger"
                class="delete-btn"
                @click="handleRemoveImage(index)"
              />
            </div>
          </div>

          <!-- 添加图片按钮 -->
          <el-button
            v-if="formData.images.length < 9"
            :icon="Plus"
            class="add-image-btn"
            @click="handleOpenMediaSelector"
          >
            添加图片 ({{ formData.images.length }}/9)
          </el-button>
        </div>
      </el-form-item>

      <!-- 位置 -->
      <el-form-item label="位置">
        <el-input
          v-model="formData.location"
          placeholder="添加位置（可选）"
          :prefix-icon="Location"
          clearable
        />
      </el-form-item>

      <!-- 可见性 -->
      <el-form-item label="可见性" prop="visibility">
        <el-radio-group v-model="formData.visibility">
          <el-radio label="public">
            <el-icon><View /></el-icon>
            公开
          </el-radio>
          <el-radio label="friends">
            <el-icon><User /></el-icon>
            好友可见
          </el-radio>
          <el-radio label="private">
            <el-icon><Lock /></el-icon>
            私密
          </el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button
        type="primary"
        :loading="loading"
        @click="handleSubmit"
      >
        {{ isEdit ? '保存' : '发布' }}
      </el-button>
    </template>

    <!-- 媒体选择器 -->
    <MediaSelector
      ref="mediaSelectorRef"
      mode="multiple"
      :max-count="9 - formData.images.length"
      return-type="url"
      dialog-title="选择图片"
      @select="handleMediaSelect"
    />
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch, nextTick } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { Plus, Close, Location, View, User, Lock } from '@element-plus/icons-vue'
import { useMomentStore } from '@/stores/moment'
import type { Moment, CreateMomentParams } from '@/types/moment'
import MediaSelector from '@/components/media/MediaSelector.vue'

interface Props {
  editMoment?: Moment | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  success: []
}>()

const momentStore = useMomentStore()

const dialogVisible = ref(false)
const formRef = ref<FormInstance>()
const mediaSelectorRef = ref()
const loading = ref(false)
const isEdit = ref(false)

// 表单数据
const formData = reactive<CreateMomentParams>({
  content: '',
  images: [],
  location: '',
  visibility: 'public'
})

// 表单验证规则
const rules: FormRules = {
  content: [
    { required: true, message: '请输入说说内容', trigger: 'blur' },
    { min: 1, max: 1000, message: '内容长度在 1 到 1000 个字符', trigger: 'blur' }
  ],
  visibility: [
    { required: true, message: '请选择可见性', trigger: 'change' }
  ]
}

// 监听编辑数据
watch(
  () => props.editMoment,
  (moment) => {
    if (moment) {
      isEdit.value = true
      formData.content = moment.content
      formData.images = [...(moment.images || [])]
      formData.location = moment.location || ''
      formData.visibility = moment.visibility
    }
  },
  { immediate: true }
)

// 打开对话框
const open = () => {
  dialogVisible.value = true
}

// 关闭对话框
const handleClose = () => {
  dialogVisible.value = false
  nextTick(() => {
    resetForm()
  })
}

// 重置表单
const resetForm = () => {
  formRef.value?.resetFields()
  formData.content = ''
  formData.images = []
  formData.location = ''
  formData.visibility = 'public'
  isEdit.value = false
  loading.value = false
}

// 打开媒体选择器
const handleOpenMediaSelector = () => {
  mediaSelectorRef.value?.open()
}

// 媒体选择回调
const handleMediaSelect = (urls: string | string[]) => {
  const urlArray = Array.isArray(urls) ? urls : [urls]
  
  // 限制最多9张图片
  const remainingSlots = 9 - formData.images.length
  const newImages = urlArray.slice(0, remainingSlots)
  
  formData.images.push(...newImages)
  
  if (urlArray.length > remainingSlots) {
    ElMessage.warning(`最多只能上传9张图片，已添加 ${newImages.length} 张`)
  } else {
    ElMessage.success(`已添加 ${newImages.length} 张图片`)
  }
}

// 移除图片
const handleRemoveImage = (index: number) => {
  formData.images.splice(index, 1)
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    
    loading.value = true

    if (isEdit.value && props.editMoment) {
      // 更新说说
      await momentStore.updateMoment(props.editMoment.id, formData)
    } else {
      // 创建说说
      await momentStore.createMoment(formData)
    }

    emit('success')
    handleClose()
  } catch (error) {
    console.error('表单验证失败或提交失败:', error)
  } finally {
    loading.value = false
  }
}

// 暴露方法给父组件
defineExpose({
  open
})
</script>

<style scoped lang="scss">
.image-upload-wrapper {
  width: 100%;

  .uploaded-images {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    margin-bottom: 10px;

    .image-item {
      position: relative;
      width: 100%;
      height: 120px;
      border-radius: 8px;
      overflow: hidden;

      :deep(.el-image) {
        width: 100%;
        height: 100%;
      }

      .delete-btn {
        position: absolute;
        top: 5px;
        right: 5px;
        opacity: 0;
        transition: opacity 0.3s;
      }

      &:hover .delete-btn {
        opacity: 1;
      }
    }
  }

  .add-image-btn {
    width: 100%;
  }
}

:deep(.el-radio) {
  margin-right: 20px;

  .el-icon {
    margin-right: 4px;
  }
}
</style>
