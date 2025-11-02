<template>
  <div class="article-edit-page">
    <!-- 顶部操作栏 -->
    <div class="top-bar">
      <div class="left">
        <el-button @click="handleBack" :icon="ArrowLeft">返回</el-button>
        <span class="page-title">{{ isEdit ? '编辑文章' : '创建文章' }}</span>
      </div>
      <div class="right">
        <el-button @click="handleSaveDraft" :loading="saving">保存草稿</el-button>
        <el-button type="primary" @click="handlePublish" :loading="publishing">
          {{ formData.status === 'published' ? '更新' : '发布' }}
        </el-button>
      </div>
    </div>

    <!-- 主要内容区 -->
    <div class="content-wrapper">
      <!-- 左侧：Markdown编辑器 -->
      <div class="editor-section">
        <MarkdownEditor v-model="formData.content" :height="editorHeight" />
      </div>

      <!-- 右侧：操作面板 -->
      <div class="settings-panel" :class="{ collapsed: isPanelCollapsed }">
        <!-- 折叠按钮 -->
        <div class="collapse-trigger" @click="togglePanel">
          <el-icon>
            <DArrowRight v-if="isPanelCollapsed" />
            <DArrowLeft v-else />
          </el-icon>
        </div>

        <!-- 面板内容 -->
        <div v-show="!isPanelCollapsed" class="panel-content">
          <el-scrollbar>
            <div class="panel-inner">
              <el-form :model="formData" :rules="rules" ref="formRef" label-position="top">
                <!-- 文章标题 -->
                <el-form-item label="标题" prop="title">
                  <el-input
                    v-model="formData.title"
                    placeholder="请输入文章标题"
                    maxlength="100"
                    show-word-limit
                  />
                </el-form-item>

                <!-- 文章摘要 -->
                <el-form-item label="摘要">
                  <el-input
                    v-model="formData.summary"
                    type="textarea"
                    :rows="4"
                    placeholder="请输入文章摘要（选填）"
                    maxlength="300"
                    show-word-limit
                  />
                </el-form-item>

                <!-- 封面图片 -->
                <el-form-item label="封面图片">
                  <div class="cover-upload">
                    <el-input
                      v-model="formData.cover_image"
                      placeholder="请输入封面图片URL"
                    >
                      <template #append>
                        <el-button @click="handleSelectImage" :icon="Picture">
                          选择
                        </el-button>
                      </template>
                    </el-input>
                    <div v-if="formData.cover_image" class="cover-preview">
                      <el-image
                        :src="formData.cover_image"
                        fit="cover"
                        :preview-src-list="[formData.cover_image]"
                      >
                        <template #error>
                          <div class="image-error">
                            <el-icon><PictureFilled /></el-icon>
                            <span>加载失败</span>
                          </div>
                        </template>
                      </el-image>
                      <el-button
                        class="remove-btn"
                        circle
                        size="small"
                        @click="formData.cover_image = ''"
                      >
                        <el-icon><Close /></el-icon>
                      </el-button>
                    </div>
                  </div>
                </el-form-item>

                <!-- 分类 -->
                <el-form-item label="分类">
                  <el-select
                    v-model="formData.category_id"
                    placeholder="请选择分类"
                    clearable
                    style="width: 100%"
                  >
                    <el-option
                      v-for="category in categories"
                      :key="category.id"
                      :label="category.name"
                      :value="category.id"
                    />
                  </el-select>
                </el-form-item>

                <!-- 标签 -->
                <el-form-item label="标签">
                  <el-select
                    v-model="formData.tag_ids"
                    multiple
                    placeholder="请选择标签"
                    style="width: 100%"
                  >
                    <el-option
                      v-for="tag in tags"
                      :key="tag.id"
                      :label="tag.name"
                      :value="tag.id"
                    >
                      <span>{{ tag.name }}</span>
                      <el-tag
                        v-if="tag.color"
                        :color="tag.color"
                        size="small"
                        style="margin-left: 8px"
                      />
                    </el-option>
                  </el-select>
                </el-form-item>

                <!-- 文章设置 -->
                <el-divider />
                <div class="settings-section">
                  <h4>文章设置</h4>

                  <!-- 置顶 -->
                  <el-form-item>
                    <div class="setting-item">
                      <span>置顶文章</span>
                      <el-switch v-model="formData.is_top" />
                    </div>
                  </el-form-item>

                  <!-- 发布状态 -->
                  <el-form-item label="发布状态">
                    <el-radio-group v-model="formData.status">
                      <el-radio value="draft">草稿</el-radio>
                      <el-radio value="published">已发布</el-radio>
                    </el-radio-group>
                  </el-form-item>
                </div>

                <!-- 文章信息 -->
                <el-divider />
                <div v-if="isEdit && articleInfo" class="article-info">
                  <h4>文章信息</h4>
                  <div class="info-item">
                    <span class="label">创建时间：</span>
                    <span class="value">{{ formatDate(articleInfo.created_at) }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">更新时间：</span>
                    <span class="value">{{ formatDate(articleInfo.updated_at) }}</span>
                  </div>
                  <div v-if="articleInfo.published_at" class="info-item">
                    <span class="label">发布时间：</span>
                    <span class="value">{{ formatDate(articleInfo.published_at) }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">浏览次数：</span>
                    <span class="value">{{ articleInfo.views || 0 }}</span>
                  </div>
                </div>
              </el-form>
            </div>
          </el-scrollbar>
        </div>
      </div>
    </div>

    <!-- 媒体选择器 -->
    <MediaSelector
      ref="mediaSelectorRef"
      mode="single"
      return-type="url"
      dialog-title="选择封面图片"
      @select="handleCoverSelect"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import {
  ArrowLeft,
  DArrowLeft,
  DArrowRight,
  Picture,
  PictureFilled,
  Close,
} from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import MarkdownEditor from '@/components/editor/MarkdownEditor.vue'
import MediaSelector from '@/components/media/MediaSelector.vue'
import { getArticleById, createArticle, updateArticle } from '@/api/article'
import { getCategories } from '@/api/category'
import { getTags } from '@/api/tag'
import type { Article, ArticleFormData } from '@/types/article'
import type { Category } from '@/types/category'
import type { Tag } from '@/types/tag'

const route = useRoute()
const router = useRouter()

// 状态
const isEdit = computed(() => !!route.params.id)
const articleId = computed(() => Number(route.params.id))
const isPanelCollapsed = ref(false)
const saving = ref(false)
const publishing = ref(false)
const formRef = ref<FormInstance>()
const mediaSelectorRef = ref()

// 表单数据
const formData = reactive<ArticleFormData>({
  title: '',
  summary: '',
  content: '',
  cover_image: '',
  category_id: undefined,
  tag_ids: [],
  status: 'draft',
  is_top: false,
})

// 文章信息（编辑模式）
const articleInfo = ref<Article | null>(null)

// 分类和标签数据
const categories = ref<Category[]>([])
const tags = ref<Tag[]>([])

// 表单验证规则
const rules: FormRules = {
  title: [
    { required: true, message: '请输入文章标题', trigger: 'blur' },
    { min: 1, max: 100, message: '标题长度在 1 到 100 个字符', trigger: 'blur' },
  ],
}

// 编辑器高度
const editorHeight = computed(() => {
  return 'calc(100vh - 140px)'
})

// 加载分类和标签
const loadCategoriesAndTags = async () => {
  try {
    const [categoriesRes, tagsRes] = await Promise.all([getCategories(), getTags()])
    categories.value = categoriesRes
    tags.value = tagsRes
  } catch (error) {
    console.error('加载分类和标签失败:', error)
    ElMessage.error('加载分类和标签失败')
  }
}

// 加载文章数据（编辑模式）
const loadArticle = async () => {
  if (!isEdit.value) return

  try {
    const article = await getArticleById(articleId.value)

    articleInfo.value = article

    // 填充表单
    formData.title = article.title
    formData.summary = article.summary || ''
    formData.content = article.content
    formData.cover_image = article.cover_image || ''
    formData.category_id = article.category_id || undefined
    formData.tag_ids = article.tags?.map((tag) => tag.id) || []
    formData.status = article.status
    formData.is_top = article.is_top
  } catch (error) {
    console.error('加载文章失败:', error)
    ElMessage.error('加载文章失败')
    router.push('/admin/articles')
  }
}

// 返回
const handleBack = () => {
  router.push('/admin/articles')
}

// 切换面板折叠
const togglePanel = () => {
  isPanelCollapsed.value = !isPanelCollapsed.value
}

// 选择图片
const handleSelectImage = () => {
  mediaSelectorRef.value?.open()
}

// 封面选择完成
const handleCoverSelect = (url: string) => {
  formData.cover_image = url
  ElMessage.success('封面图片已选择')
}

// 保存草稿
const handleSaveDraft = async () => {
  if (!formData.title.trim()) {
    ElMessage.warning('请输入文章标题')
    return
  }

  saving.value = true
  try {
    const data: ArticleFormData = {
      ...formData,
      status: 'draft',
    }

    if (isEdit.value) {
      await updateArticle(articleId.value, data)
      ElMessage.success('保存草稿成功')
      await loadArticle() // 重新加载文章数据
    } else {
      const res = await createArticle(data)
      ElMessage.success('保存草稿成功')
      // 跳转到编辑页面
      router.replace(`/admin/articles/edit/${res.id}`)
    }
  } catch (error) {
    console.error('保存草稿失败:', error)
    ElMessage.error('保存草稿失败')
  } finally {
    saving.value = false
  }
}

// 发布文章
const handlePublish = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
  } catch {
    ElMessage.warning('请完善文章信息')
    return
  }

  if (!formData.content.trim()) {
    ElMessage.warning('请输入文章内容')
    return
  }

  publishing.value = true
  try {
    const data: ArticleFormData = {
      ...formData,
      status: 'published',
    }

    if (isEdit.value) {
      await updateArticle(articleId.value, data)
      ElMessage.success('文章更新成功')
      await loadArticle()
    } else {
      const res = await createArticle(data)
      ElMessage.success('文章发布成功')
      router.replace(`/admin/articles/edit/${res.id}`)
    }
  } catch (error) {
    console.error('发布失败:', error)
    ElMessage.error('发布失败')
  } finally {
    publishing.value = false
  }
}

// 格式化日期
const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

// 初始化
onMounted(async () => {
  await loadCategoriesAndTags()
  await loadArticle()
})
</script>

<style scoped lang="scss">
.article-edit-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 4px;
  overflow: hidden;

  .top-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    border-bottom: 1px solid #e8e8e8;
    background: #fff;

    .left {
      display: flex;
      align-items: center;
      gap: 12px;

      .page-title {
        font-size: 16px;
        font-weight: 500;
        color: #303133;
      }
    }

    .right {
      display: flex;
      gap: 12px;
    }
  }

  .content-wrapper {
    flex: 1;
    display: flex;
    overflow: hidden;

    .editor-section {
      flex: 1;
      padding: 20px;
      overflow: hidden;
    }

    .settings-panel {
      position: relative;
      width: 380px;
      border-left: 1px solid #e8e8e8;
      background: #fafafa;
      transition: all 0.3s ease;

      &.collapsed {
        width: 40px;
      }

      .collapse-trigger {
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 40px;
        height: 60px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #fff;
        border: 1px solid #e8e8e8;
        border-left: none;
        border-radius: 0 8px 8px 0;
        cursor: pointer;
        transition: all 0.3s ease;
        z-index: 10;

        &:hover {
          background: #f5f7fa;
          color: #409eff;
        }

        .el-icon {
          font-size: 16px;
        }
      }

      .panel-content {
        height: 100%;
        padding-left: 40px;

        .panel-inner {
          padding: 20px;
        }
      }
    }
  }
}

// 表单样式
.cover-upload {
  width: 100%;

  .cover-preview {
    position: relative;
    margin-top: 12px;
    width: 100%;
    height: 180px;
    border-radius: 4px;
    overflow: hidden;
    border: 1px solid #dcdfe6;

    .el-image {
      width: 100%;
      height: 100%;
    }

    .image-error {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      background: #f5f7fa;
      color: #909399;

      .el-icon {
        font-size: 40px;
        margin-bottom: 8px;
      }
    }

    .remove-btn {
      position: absolute;
      top: 8px;
      right: 8px;
      background: rgba(0, 0, 0, 0.5);
      color: #fff;
      border: none;

      &:hover {
        background: rgba(0, 0, 0, 0.7);
      }
    }
  }
}

.settings-section {
  h4 {
    margin: 0 0 16px 0;
    font-size: 14px;
    font-weight: 500;
    color: #303133;
  }

  .setting-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 0;
  }
}

.article-info {
  h4 {
    margin: 0 0 16px 0;
    font-size: 14px;
    font-weight: 500;
    color: #303133;
  }

  .info-item {
    display: flex;
    padding: 8px 0;
    font-size: 13px;

    .label {
      color: #909399;
      min-width: 80px;
    }

    .value {
      color: #606266;
      flex: 1;
    }
  }
}

// 滚动条样式
:deep(.el-scrollbar__wrap) {
  overflow-x: hidden;
}
</style>