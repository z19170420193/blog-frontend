<template>
  <div class="media-management">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h2>媒体管理</h2>
        <p class="subtitle">管理上传的图片和文件</p>
      </div>
      <div class="header-actions">
        <el-upload
          :action="uploadAction"
          :headers="uploadHeaders"
          :show-file-list="false"
          :on-success="handleUploadSuccess"
          :on-error="handleUploadError"
          :before-upload="beforeUpload"
          multiple
        >
          <el-button type="primary" :icon="Upload">
            上传文件
          </el-button>
        </el-upload>
        <el-button :icon="Refresh" @click="fetchMedia">
          刷新
        </el-button>
      </div>
    </div>

    <!-- 搜索和筛选栏 -->
    <div class="search-bar">
      <div class="search-left">
        <el-input
          v-model="searchParams.keyword"
          placeholder="搜索文件名..."
          :prefix-icon="Search"
          clearable
          style="width: 300px"
          @input="handleSearch"
        />
        
        <el-select
          v-model="searchParams.mime_type"
          placeholder="文件类型"
          clearable
          style="width: 150px"
          @change="handleSearch"
        >
          <el-option label="全部" value="" />
          <el-option label="图片" value="image" />
          <el-option label="视频" value="video" />
          <el-option label="文档" value="document" />
        </el-select>
      </div>

      <div class="search-right">
        <el-radio-group v-model="currentView" size="small">
          <el-radio-button value="grid">
            <el-icon><Grid /></el-icon>
            网格
          </el-radio-button>
          <el-radio-button value="list">
            <el-icon><List /></el-icon>
            列表
          </el-radio-button>
        </el-radio-group>
      </div>
    </div>

    <!-- 批量操作工具栏 -->
    <transition name="el-zoom-in-top">
      <div v-show="selectedIds.length > 0" class="batch-toolbar">
        <div class="batch-info">
          <el-icon><InfoFilled /></el-icon>
          已选择 <strong>{{ selectedIds.length }}</strong> 个文件
        </div>
        <div class="batch-actions">
          <el-button size="small" @click="clearSelection">取消选择</el-button>
          <el-button size="small" type="danger" :icon="Delete" @click="handleBatchDelete">
            批量删除
          </el-button>
        </div>
      </div>
    </transition>

    <!-- 网格视图 -->
    <div v-show="currentView === 'grid'" class="grid-view">
      <div class="media-grid">
        <div
          v-for="item in mediaList"
          :key="item.id"
          class="media-card"
          :class="{ selected: selectedIds.includes(item.id) }"
          @click="toggleSelect(item.id)"
        >
          <!-- 选中框 -->
          <div class="card-checkbox">
            <el-checkbox
              :model-value="selectedIds.includes(item.id)"
              @click.stop
              @change="toggleSelect(item.id)"
            />
          </div>

          <!-- 媒体预览 -->
          <div class="media-preview" @click.stop="handlePreview(item)">
            <img
              v-if="isImage(item.mime_type)"
              :src="item.file_url"
              :alt="item.filename"
              class="preview-image"
            />
            <div v-else class="preview-icon">
              <el-icon :size="48"><Document /></el-icon>
              <span class="file-type">{{ getFileExtension(item.filename) }}</span>
            </div>
          </div>

          <!-- 媒体信息 -->
          <div class="media-info">
            <div class="filename" :title="item.filename">
              {{ item.filename }}
            </div>
            <div class="file-meta">
              <span>{{ formatFileSize(item.file_size) }}</span>
              <span v-if="item.width && item.height">
                {{ item.width }} x {{ item.height }}
              </span>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="card-actions">
            <el-button
              size="small"
              :icon="Edit"
              @click.stop="handleEdit(item)"
            >
              编辑
            </el-button>
            <el-button
              size="small"
              type="danger"
              :icon="Delete"
              @click.stop="handleDelete(item.id)"
            >
              删除
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 列表视图 -->
    <div v-show="currentView === 'list'" class="list-view">
      <el-table
        v-loading="loading"
        :data="mediaList"
        style="width: 100%"
        stripe
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        
        <el-table-column label="预览" width="100">
          <template #default="{ row }">
            <div class="list-preview" @click="handlePreview(row)">
              <img
                v-if="isImage(row.mime_type)"
                :src="row.file_url"
                :alt="row.filename"
                class="preview-thumb"
              />
              <div v-else class="preview-icon-small">
                <el-icon><Document /></el-icon>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="文件名" min-width="250" show-overflow-tooltip>
          <template #default="{ row }">
            <div class="filename-cell">
              <span class="filename-text">{{ row.filename }}</span>
              <el-button
                size="small"
                link
                :icon="CopyDocument"
                @click="copyUrl(row.file_url)"
                title="复制链接"
              />
            </div>
          </template>
        </el-table-column>

        <el-table-column label="类型" width="120">
          <template #default="{ row }">
            <el-tag size="small">
              {{ getMimeTypeLabel(row.mime_type) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="大小" width="100">
          <template #default="{ row }">
            {{ formatFileSize(row.file_size) }}
          </template>
        </el-table-column>

        <el-table-column label="尺寸" width="120">
          <template #default="{ row }">
            <span v-if="row.width && row.height">
              {{ row.width }} x {{ row.height }}
            </span>
            <span v-else class="text-muted">-</span>
          </template>
        </el-table-column>

        <el-table-column label="上传时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-space>
              <el-button
                type="primary"
                size="small"
                :icon="Edit"
                link
                @click="handleEdit(row)"
              >
                编辑
              </el-button>
              <el-popconfirm
                title="确定要删除这个文件吗？"
                confirm-button-text="确定"
                cancel-button-text="取消"
                @confirm="handleDelete(row.id)"
              >
                <template #reference>
                  <el-button type="danger" size="small" :icon="Delete" link>
                    删除
                  </el-button>
                </template>
              </el-popconfirm>
            </el-space>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页 -->
    <div class="pagination">
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.limit"
        :page-sizes="currentView === 'grid' ? [12, 24, 48, 96] : [10, 20, 50, 100]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />
    </div>

    <!-- 编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="编辑媒体信息"
      width="600px"
      :close-on-click-modal="false"
      @closed="resetForm"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="文件名" prop="filename" required>
          <el-input
            v-model="formData.filename"
            placeholder="请输入文件名"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="文件URL">
          <el-input
            v-model="currentMedia.file_url"
            readonly
          >
            <template #append>
              <el-button :icon="CopyDocument" @click="copyUrl(currentMedia.file_url)">
                复制
              </el-button>
            </template>
          </el-input>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button
            type="primary"
            :loading="submitting"
            @click="handleSubmit"
          >
            保存
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 预览对话框 -->
    <el-dialog
      v-model="previewVisible"
      :title="previewMedia?.filename"
      width="800px"
    >
      <div class="preview-container">
        <img
          v-if="previewMedia && isImage(previewMedia.mime_type)"
          :src="previewMedia.file_url"
          :alt="previewMedia.filename"
          class="preview-full-image"
        />
        <div v-else class="preview-file-info">
          <el-icon :size="80"><Document /></el-icon>
          <p>{{ previewMedia?.filename }}</p>
          <p class="text-muted">{{ getMimeTypeLabel(previewMedia?.mime_type || '') }}</p>
        </div>
      </div>
      <template #footer>
        <el-button type="primary" @click="downloadFile(previewMedia)">
          <el-icon><Download /></el-icon>
          下载
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Upload, Refresh, Search, Edit, Delete, Document, Grid, List,
  CopyDocument, Download, InfoFilled
} from '@element-plus/icons-vue'
import { getMediaList, updateMedia, deleteMedia, batchDeleteMedia } from '@/api/media'
import type { Media, MediaQueryParams } from '@/types'

// 响应式数据
const loading = ref(false)
const mediaList = ref<Media[]>([])
const selectedIds = ref<number[]>([])
const currentView = ref<'grid' | 'list'>('grid')
const dialogVisible = ref(false)
const previewVisible = ref(false)
const submitting = ref(false)
const currentMedia = ref<any>({})
const previewMedia = ref<Media | null>(null)

// 上传配置
const uploadAction = import.meta.env.VITE_API_BASE_URL + '/media/upload'
const uploadHeaders = {
  'Authorization': `Bearer ${localStorage.getItem('token')}`
}

// 搜索参数
const searchParams = reactive<MediaQueryParams>({
  keyword: '',
  mime_type: '',
  page: 1,
  limit: 24
})

// 分页
const pagination = reactive({
  page: 1,
  limit: 24,
  total: 0
})

// 表单
const formRef = ref()
const formData = ref({
  filename: ''
})

// 表单验证规则
const formRules = {
  filename: [
    { required: true, message: '请输入文件名', trigger: 'blur' }
  ]
}

// 方法
const fetchMedia = async () => {
  loading.value = true
  try {
    const params: MediaQueryParams = {
      ...searchParams,
      page: pagination.page,
      limit: pagination.limit
    }
    
    const response = await getMediaList(params)
    mediaList.value = response.items || []
    pagination.total = response.total || 0
  } catch (error) {
    ElMessage.error('获取媒体列表失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.page = 1
  fetchMedia()
}

const handleUploadSuccess = (response: any) => {
  ElMessage.success('上传成功')
  fetchMedia()
}

const handleUploadError = () => {
  ElMessage.error('上传失败')
}

const beforeUpload = (file: File) => {
  const maxSize = 10 * 1024 * 1024 // 10MB
  if (file.size > maxSize) {
    ElMessage.error('文件大小不能超过 10MB')
    return false
  }
  return true
}

const handleEdit = (item: Media) => {
  currentMedia.value = item
  formData.value.filename = item.filename
  dialogVisible.value = true
}

const handleDelete = async (id: number) => {
  try {
    await deleteMedia(id)
    ElMessage.success('删除成功')
    await fetchMedia()
  } catch (error) {
    ElMessage.error('删除失败')
    console.error(error)
  }
}

const handleSubmit = async () => {
  try {
    await formRef.value?.validate()
    submitting.value = true
    
    await updateMedia(currentMedia.value.id, {
      filename: formData.value.filename
    })
    
    ElMessage.success('更新成功')
    dialogVisible.value = false
    await fetchMedia()
  } catch (error: any) {
    if (error !== false) {
      ElMessage.error('更新失败')
      console.error(error)
    }
  } finally {
    submitting.value = false
  }
}

const handlePreview = (item: Media) => {
  previewMedia.value = item
  previewVisible.value = true
}

const toggleSelect = (id: number) => {
  const index = selectedIds.value.indexOf(id)
  if (index > -1) {
    selectedIds.value.splice(index, 1)
  } else {
    selectedIds.value.push(id)
  }
}

const handleSelectionChange = (selection: Media[]) => {
  selectedIds.value = selection.map(item => item.id)
}

const clearSelection = () => {
  selectedIds.value = []
}

const handleBatchDelete = async () => {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请选择要删除的文件')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedIds.value.length} 个文件吗？`,
      '批量删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    loading.value = true
    await batchDeleteMedia(selectedIds.value)
    
    ElMessage.success(`成功删除 ${selectedIds.value.length} 个文件`)
    selectedIds.value = []
    await fetchMedia()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('批量删除失败')
      console.error(error)
    }
  } finally {
    loading.value = false
  }
}

const copyUrl = async (url: string) => {
  try {
    await navigator.clipboard.writeText(url)
    ElMessage.success('链接已复制')
  } catch {
    ElMessage.error('复制失败')
  }
}

const downloadFile = (media: Media | null) => {
  if (!media) return
  window.open(media.file_url, '_blank')
}

const resetForm = () => {
  formData.value.filename = ''
  formRef.value?.clearValidate()
}

const handleSizeChange = (size: number) => {
  pagination.limit = size
  pagination.page = 1
  fetchMedia()
}

const handlePageChange = (page: number) => {
  pagination.page = page
  fetchMedia()
}

// 工具方法
const isImage = (mimeType: string) => {
  return mimeType && mimeType.startsWith('image/')
}

const getFileExtension = (filename: string) => {
  const parts = filename.split('.')
  return parts.length > 1 ? parts[parts.length - 1].toUpperCase() : 'FILE'
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i]
}

const getMimeTypeLabel = (mimeType: string) => {
  if (!mimeType) return '未知'
  if (mimeType.startsWith('image/')) return '图片'
  if (mimeType.startsWith('video/')) return '视频'
  if (mimeType.startsWith('audio/')) return '音频'
  if (mimeType.includes('pdf')) return 'PDF'
  if (mimeType.includes('word') || mimeType.includes('document')) return '文档'
  return '文件'
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 生命周期
onMounted(() => {
  fetchMedia()
})
</script>

<style scoped lang="scss">
.media-management {
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    .header-left {
      h2 {
        margin: 0;
        font-size: 24px;
        font-weight: 600;
        color: #303133;
      }

      .subtitle {
        margin: 8px 0 0;
        font-size: 14px;
        color: #909399;
      }
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }
  }

  .search-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    .search-left {
      display: flex;
      gap: 12px;
      align-items: center;
    }
  }

  .batch-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background: #ecf5ff;
    border: 1px solid #d9ecff;
    border-radius: 4px;
    margin-bottom: 16px;

    .batch-info {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #409eff;
      font-size: 14px;

      .el-icon {
        font-size: 16px;
      }

      strong {
        color: #409eff;
        margin: 0 4px;
      }
    }

    .batch-actions {
      display: flex;
      gap: 8px;
    }
  }

  // 网格视图
  .grid-view {
    .media-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 16px;

      .media-card {
        background: #fff;
        border: 2px solid #ebeef5;
        border-radius: 8px;
        overflow: hidden;
        cursor: pointer;
        transition: all 0.3s;
        position: relative;

        &:hover {
          transform: translateY(-4px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        &.selected {
          border-color: #409eff;
          background: #ecf5ff;
        }

        .card-checkbox {
          position: absolute;
          top: 8px;
          left: 8px;
          z-index: 10;
        }

        .media-preview {
          height: 160px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f5f7fa;
          overflow: hidden;

          .preview-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .preview-icon {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
            color: #909399;

            .file-type {
              font-size: 14px;
              font-weight: 600;
            }
          }
        }

        .media-info {
          padding: 12px;

          .filename {
            font-size: 14px;
            font-weight: 500;
            color: #303133;
            margin-bottom: 8px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .file-meta {
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            color: #909399;
          }
        }

        .card-actions {
          padding: 0 12px 12px;
          display: flex;
          gap: 8px;
        }
      }
    }
  }

  // 列表视图
  .list-view {
    .list-preview {
      cursor: pointer;

      .preview-thumb {
        width: 60px;
        height: 60px;
        object-fit: cover;
        border-radius: 4px;
      }

      .preview-icon-small {
        width: 60px;
        height: 60px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #f5f7fa;
        border-radius: 4px;
        color: #909399;
        font-size: 24px;
      }
    }

    .filename-cell {
      display: flex;
      align-items: center;
      gap: 8px;

      .filename-text {
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }

  .text-muted {
    color: #909399;
  }

  .pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }

  // 预览对话框
  .preview-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 300px;

    .preview-full-image {
      max-width: 100%;
      max-height: 600px;
      border-radius: 4px;
    }

    .preview-file-info {
      text-align: center;
      color: #606266;

      p {
        margin: 12px 0;
      }
    }
  }
}
</style>