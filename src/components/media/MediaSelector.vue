<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    width="960px"
    :close-on-click-modal="false"
    :destroy-on-close="true"
    class="media-selector-dialog"
  >
    <!-- 工具栏 -->
    <div class="selector-toolbar">
      <!-- 左侧：上传按钮和选择提示 -->
      <div class="toolbar-left">
        <el-upload
          v-if="showUpload"
          :action="uploadAction"
          :headers="uploadHeaders"
          :show-file-list="false"
          :on-success="handleUploadSuccess"
          :on-error="handleUploadError"
          :before-upload="beforeUpload"
          :accept="accept"
          multiple
        >
          <el-button type="primary" :icon="Upload">
            上传图片
          </el-button>
        </el-upload>
        <span v-if="selectedMedia.length > 0" class="selected-count">
          已选择 {{ selectedMedia.length }} 个文件
          <span v-if="mode === 'multiple' && maxCount > 0">
            （最多 {{ maxCount }} 个）
          </span>
        </span>
      </div>

      <!-- 右侧：搜索和筛选 -->
      <div class="toolbar-right">
        <el-input
          v-if="showSearch"
          v-model="searchKeyword"
          placeholder="搜索文件名"
          :prefix-icon="Search"
          clearable
          style="width: 220px"
          @input="handleSearch"
        />
        <el-select
          v-model="filterType"
          placeholder="文件类型"
          clearable
          style="width: 120px"
          @change="handleSearch"
        >
          <el-option label="全部" value="" />
          <el-option label="图片" value="image" />
        </el-select>
      </div>
    </div>

    <!-- 媒体网格 -->
    <el-scrollbar height="480px">
      <div v-loading="loading" class="media-grid">
        <div
          v-for="item in mediaList"
          :key="item.id"
          class="media-item"
          :class="{ selected: isSelected(item.id) }"
          @click="handleSelect(item)"
        >
          <!-- 选中标记 -->
          <div v-if="isSelected(item.id)" class="selected-badge">
            <el-icon><Check /></el-icon>
          </div>

          <!-- 图片预览 -->
          <div class="item-preview">
            <img
              v-if="item.file_url"
              :src="item.file_url"
              :alt="item.filename"
              loading="lazy"
            />
            <div v-else class="preview-placeholder">
              <el-icon :size="40"><Picture /></el-icon>
            </div>
          </div>

          <!-- 文件信息 -->
          <div class="item-info">
            <div class="filename" :title="item.filename">
              {{ item.filename }}
            </div>
            <div class="meta">
              <span>{{ formatSize(item.file_size) }}</span>
              <span v-if="item.width && item.height">
                {{ item.width }}×{{ item.height }}
              </span>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <el-empty
          v-if="mediaList.length === 0 && !loading"
          description="暂无媒体文件"
          :image-size="100"
        />
      </div>
    </el-scrollbar>

    <!-- 分页 -->
    <div v-if="total > 0" class="selector-pagination">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[12, 24, 48]"
        layout="total, sizes, prev, pager, next"
        small
        @current-change="loadMedia"
        @size-change="handleSizeChange"
      />
    </div>

    <!-- 底部按钮 -->
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button
          type="primary"
          :disabled="selectedMedia.length === 0"
          @click="handleConfirm"
        >
          确定选择
          <span v-if="selectedMedia.length > 0">({{ selectedMedia.length }})</span>
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Upload, Search, Check, Picture } from '@element-plus/icons-vue'
import { getMediaList } from '@/api/media'
import type { Media, MediaQueryParams } from '@/types'

// Props 接口
interface MediaSelectorProps {
  // 选择模式
  mode?: 'single' | 'multiple'
  
  // 文件限制
  accept?: string
  maxCount?: number
  maxSize?: number
  
  // 显示控制
  showUpload?: boolean
  showSearch?: boolean
  dialogTitle?: string
  
  // 返回格式
  returnType?: 'url' | 'object'
}

// Props 默认值
const props = withDefaults(defineProps<MediaSelectorProps>(), {
  mode: 'single',
  accept: 'image/*',
  maxCount: 9,
  maxSize: 5,
  showUpload: true,
  showSearch: true,
  dialogTitle: '选择媒体文件',
  returnType: 'url'
})

// Emits
const emit = defineEmits<{
  select: [value: string | string[] | Media | Media[]]
  upload: [media: Media]
  cancel: []
}>()

// 响应式状态
const visible = ref(false)
const loading = ref(false)
const mediaList = ref<Media[]>([])
const selectedMedia = ref<Media[]>([])
const searchKeyword = ref('')
const filterType = ref('')
const currentPage = ref(1)
const pageSize = ref(12)
const total = ref(0)

// 上传配置
const uploadAction = computed(() => 
  import.meta.env.VITE_API_BASE_URL + '/media/upload'
)
const uploadHeaders = computed(() => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`
}))

// 加载媒体列表
const loadMedia = async () => {
  loading.value = true
  try {
    const params: MediaQueryParams = {
      page: currentPage.value,
      limit: pageSize.value
    }
    
    if (searchKeyword.value) {
      params.keyword = searchKeyword.value
    }
    
    if (filterType.value) {
      params.mime_type = `${filterType.value}/*`
    }

    const res = await getMediaList(params)
    mediaList.value = res.media || []
    total.value = res.total || 0
  } catch (error) {
    console.error('加载媒体列表失败:', error)
    ElMessage.error('加载媒体列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索处理（防抖）
let searchTimer: ReturnType<typeof setTimeout>
const handleSearch = () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    currentPage.value = 1
    loadMedia()
  }, 500)
}

// 页大小改变
const handleSizeChange = () => {
  currentPage.value = 1
  loadMedia()
}

// 判断是否选中
const isSelected = (id: number) => {
  return selectedMedia.value.some(item => item.id === id)
}

// 选择/取消选择
const handleSelect = (media: Media) => {
  if (props.mode === 'single') {
    // 单选模式：直接替换
    selectedMedia.value = [media]
  } else {
    // 多选模式：切换选中状态
    const index = selectedMedia.value.findIndex(item => item.id === media.id)
    if (index > -1) {
      // 已选中，取消选择
      selectedMedia.value.splice(index, 1)
    } else {
      // 未选中，添加到选择列表
      if (selectedMedia.value.length >= props.maxCount) {
        ElMessage.warning(`最多只能选择 ${props.maxCount} 个文件`)
        return
      }
      selectedMedia.value.push(media)
    }
  }
}

// 上传前验证
const beforeUpload = (file: File) => {
  // 验证文件大小
  const sizeMB = file.size / 1024 / 1024
  if (sizeMB > props.maxSize) {
    ElMessage.error(`文件大小不能超过 ${props.maxSize}MB`)
    return false
  }
  
  // 验证文件类型
  const accept = props.accept.split(',').map(t => t.trim())
  const isAccepted = accept.some(type => {
    if (type === 'image/*') {
      return file.type.startsWith('image/')
    }
    return file.type === type
  })
  
  if (!isAccepted) {
    ElMessage.error('文件类型不支持')
    return false
  }
  
  return true
}

// 上传成功
const handleUploadSuccess = (response: any) => {
  ElMessage.success('上传成功')
  
  // 刷新列表
  currentPage.value = 1
  loadMedia()
  
  // 触发上传事件
  if (response && response.data) {
    emit('upload', response.data)
  }
}

// 上传失败
const handleUploadError = (error: any) => {
  console.error('上传失败:', error)
  ElMessage.error('上传失败，请重试')
}

// 确认选择
const handleConfirm = () => {
  if (selectedMedia.value.length === 0) {
    ElMessage.warning('请选择文件')
    return
  }

  // 根据返回类型处理数据
  if (props.returnType === 'url') {
    const urls = selectedMedia.value.map(item => item.file_url)
    emit('select', props.mode === 'single' ? urls[0] : urls)
  } else {
    emit('select', props.mode === 'single' ? selectedMedia.value[0] : selectedMedia.value)
  }

  close()
}

// 取消
const handleCancel = () => {
  emit('cancel')
  close()
}

// 格式化文件大小
const formatSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / 1024 / 1024).toFixed(1) + ' MB'
}

// 打开对话框
const open = () => {
  visible.value = true
  selectedMedia.value = []
  currentPage.value = 1
  searchKeyword.value = ''
  filterType.value = ''
  loadMedia()
}

// 关闭对话框
const close = () => {
  visible.value = false
  selectedMedia.value = []
}

// 暴露方法给父组件
defineExpose({
  open,
  close
})
</script>

<style scoped lang="scss">
.media-selector-dialog {
  :deep(.el-dialog__body) {
    padding: 20px 20px 10px;
  }

  .selector-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid #ebeef5;

    .toolbar-left {
      display: flex;
      align-items: center;
      gap: 12px;

      .selected-count {
        font-size: 14px;
        color: #606266;
        
        strong {
          color: #409eff;
        }
      }
    }

    .toolbar-right {
      display: flex;
      gap: 12px;
    }
  }

  .media-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 16px;
    padding: 4px;
    min-height: 300px;

    .media-item {
      position: relative;
      cursor: pointer;
      border: 2px solid transparent;
      border-radius: 8px;
      overflow: hidden;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      background: #fff;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);

      &:hover {
        border-color: #409eff;
        box-shadow: 0 4px 12px rgba(64, 158, 255, 0.2);
        transform: translateY(-2px);
      }

      &.selected {
        border-color: #409eff;
        background: #ecf5ff;
        box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
      }

      .selected-badge {
        position: absolute;
        top: 8px;
        right: 8px;
        width: 28px;
        height: 28px;
        background: #409eff;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        z-index: 10;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        animation: badge-pop 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
      }

      .item-preview {
        width: 100%;
        height: 140px;
        background: #f5f7fa;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s;
        }

        .preview-placeholder {
          display: flex;
          align-items: center;
          justify-content: center;
          color: #c0c4cc;
        }
      }

      &:hover .item-preview img {
        transform: scale(1.05);
      }

      .item-info {
        padding: 8px 12px;
        background: #fff;

        .filename {
          font-size: 13px;
          color: #303133;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin-bottom: 4px;
          line-height: 1.4;
        }

        .meta {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: #909399;

          span {
            white-space: nowrap;
          }
        }
      }
    }
  }

  .selector-pagination {
    display: flex;
    justify-content: center;
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid #ebeef5;
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }
}

// 动画
@keyframes badge-pop {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
