<template>
  <div class="project-edit-page">
    <!-- 顶部操作栏 -->
    <div class="top-bar">
      <div class="left">
        <el-button @click="handleBack" :icon="ArrowLeft">返回</el-button>
        <span class="page-title">{{ isEdit ? '编辑项目' : '创建项目' }}</span>
      </div>
      <div class="right">
        <el-button @click="handleSaveDraft" :loading="saving">保存草稿</el-button>
        <el-button type="primary" @click="handlePublish" :loading="publishing">
          {{ formData.status === 'completed' ? '更新' : '发布' }}
        </el-button>
      </div>
    </div>

    <!-- 主要内容区 -->
    <div class="content-wrapper">
      <!-- 左侧：Markdown编辑器 -->
      <div class="editor-section">
        <div class="editor-header">
          <h3>项目详细介绍</h3>
          <span class="tip">支持 Markdown 格式</span>
        </div>
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
                <!-- 基本信息 -->
                <div class="form-section">
                  <h4>基本信息</h4>

                  <!-- 项目标题 -->
                  <el-form-item label="项目标题" prop="title">
                    <el-input
                      v-model="formData.title"
                      placeholder="请输入项目标题"
                      maxlength="100"
                      show-word-limit
                    />
                  </el-form-item>

                  <!-- 副标题 -->
                  <el-form-item label="副标题">
                    <el-input
                      v-model="formData.subtitle"
                      placeholder="一句话描述项目（选填）"
                      maxlength="150"
                      show-word-limit
                    />
                  </el-form-item>

                  <!-- 项目描述 -->
                  <el-form-item label="项目描述" prop="description">
                    <el-input
                      v-model="formData.description"
                      type="textarea"
                      :rows="4"
                      placeholder="请输入项目描述"
                      maxlength="500"
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
                          <el-button @click="handleSelectCoverImage" :icon="Picture">
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
                </div>

                <el-divider />

                <!-- 项目分类 -->
                <div class="form-section">
                  <h4>项目分类</h4>

                  <!-- 项目类型 -->
                  <el-form-item label="项目类型" prop="project_type">
                    <el-select
                      v-model="formData.project_type"
                      placeholder="请选择项目类型"
                      style="width: 100%"
                    >
                      <el-option label="Web应用" value="web" />
                      <el-option label="移动应用" value="mobile" />
                      <el-option label="桌面应用" value="desktop" />
                      <el-option label="后端服务" value="backend" />
                      <el-option label="全栈项目" value="fullstack" />
                      <el-option label="其他" value="other" />
                    </el-select>
                  </el-form-item>

                  <!-- 项目分类 -->
                  <el-form-item label="项目分类">
                    <el-input
                      v-model="formData.category"
                      placeholder="例如：个人项目、商业项目（选填）"
                    />
                  </el-form-item>

                  <!-- 标签 -->
                  <el-form-item label="项目标签">
                    <el-select
                      v-model="formData.tags"
                      multiple
                      filterable
                      allow-create
                      default-first-option
                      placeholder="输入或选择标签"
                      style="width: 100%"
                    >
                      <el-option
                        v-for="tag in commonTags"
                        :key="tag"
                        :label="tag"
                        :value="tag"
                      />
                    </el-select>
                  </el-form-item>

                  <!-- 技术栈 -->
                  <el-form-item label="技术栈" prop="tech_stack">
                    <el-select
                      v-model="formData.tech_stack"
                      multiple
                      filterable
                      allow-create
                      default-first-option
                      placeholder="输入或选择技术栈"
                      style="width: 100%"
                    >
                      <el-option
                        v-for="tech in commonTechs"
                        :key="tech"
                        :label="tech"
                        :value="tech"
                      />
                    </el-select>
                  </el-form-item>
                </div>

                <el-divider />

                <!-- 项目链接 -->
                <div class="form-section">
                  <h4>项目链接</h4>

                  <el-form-item label="在线演示">
                    <el-input
                      v-model="formData.demo_url"
                      placeholder="https://demo.example.com"
                    >
                      <template #prepend>
                        <el-icon><Link /></el-icon>
                      </template>
                    </el-input>
                  </el-form-item>

                  <el-form-item label="GitHub 仓库">
                    <el-input
                      v-model="formData.github_url"
                      placeholder="https://github.com/user/repo"
                    >
                      <template #prepend>
                        <Icon icon="mdi:github" :width="20" />
                      </template>
                    </el-input>
                  </el-form-item>

                  <el-form-item label="项目文档">
                    <el-input
                      v-model="formData.documentation_url"
                      placeholder="https://docs.example.com"
                    >
                      <template #prepend>
                        <el-icon><Document /></el-icon>
                      </template>
                    </el-input>
                  </el-form-item>

                  <el-form-item label="演示视频">
                    <el-input
                      v-model="formData.demo_video"
                      placeholder="支持 B站、YouTube 等视频链接"
                    >
                      <template #prepend>
                        <el-icon><VideoPlay /></el-icon>
                      </template>
                    </el-input>
                  </el-form-item>
                </div>

                <el-divider />

                <!-- 项目详情 -->
                <div class="form-section">
                  <h4>项目详情</h4>

                  <!-- 项目状态 -->
                  <el-form-item label="项目状态" prop="status">
                    <el-select
                      v-model="formData.status"
                      placeholder="请选择项目状态"
                      style="width: 100%"
                    >
                      <el-option label="已完成" value="completed" />
                      <el-option label="进行中" value="in_progress" />
                      <el-option label="已归档" value="archived" />
                      <el-option label="草稿" value="draft" />
                    </el-select>
                  </el-form-item>

                  <el-row :gutter="12">
                    <el-col :span="12">
                      <el-form-item label="开始时间" prop="start_date">
                        <el-date-picker
                          v-model="formData.start_date"
                          type="date"
                          placeholder="选择日期"
                          style="width: 100%"
                          value-format="YYYY-MM-DD"
                        />
                      </el-form-item>
                    </el-col>
                    <el-col :span="12">
                      <el-form-item label="结束时间" prop="end_date">
                        <el-date-picker
                          v-model="formData.end_date"
                          type="date"
                          placeholder="选择日期"
                          style="width: 100%"
                          value-format="YYYY-MM-DD"
                        />
                      </el-form-item>
                    </el-col>
                  </el-row>

                  <el-form-item label="团队规模">
                    <el-input-number
                      v-model="formData.team_size"
                      :min="1"
                      :max="100"
                      style="width: 100%"
                    />
                  </el-form-item>
                </div>

                <el-divider />

                <!-- 项目截图 -->
                <div class="form-section">
                  <h4>项目截图</h4>
                  
                  <el-form-item>
                    <div class="images-manager">
                      <div v-if="formData.images && formData.images.length > 0" class="images-list">
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
                          >
                            <template #error>
                              <div class="image-error-small">
                                <el-icon><Picture /></el-icon>
                              </div>
                            </template>
                          </el-image>
                          <el-button
                            class="remove-btn"
                            circle
                            size="small"
                            @click="removeImage(index)"
                          >
                            <el-icon><Close /></el-icon>
                          </el-button>
                        </div>
                        <div class="add-image-btn" @click="handleSelectProjectImages">
                          <el-icon :size="32"><Plus /></el-icon>
                          <span>添加截图</span>
                        </div>
                      </div>
                      <el-button
                        v-else
                        type="primary"
                        plain
                        @click="handleSelectProjectImages"
                        style="width: 100%"
                      >
                        <el-icon><Plus /></el-icon>
                        添加项目截图
                      </el-button>
                    </div>
                  </el-form-item>
                </div>

                <el-divider />

                <!-- 项目设置 -->
                <div class="form-section">
                  <h4>项目设置</h4>

                  <el-form-item>
                    <div class="setting-item">
                      <div class="setting-label">
                        <span>精选项目</span>
                        <span class="tip">在首页展示</span>
                      </div>
                      <el-switch v-model="formData.is_featured" />
                    </div>
                  </el-form-item>

                  <el-form-item>
                    <div class="setting-item">
                      <div class="setting-label">
                        <span>开源项目</span>
                        <span class="tip">标记为开源</span>
                      </div>
                      <el-switch v-model="formData.is_open_source" />
                    </div>
                  </el-form-item>
                </div>

                <!-- 项目信息 -->
                <el-divider />
                <div v-if="isEdit && projectInfo" class="project-info">
                  <h4>项目信息</h4>
                  <div class="info-item">
                    <span class="label">创建时间：</span>
                    <span class="value">{{ formatDate(projectInfo.created_at) }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">更新时间：</span>
                    <span class="value">{{ formatDate(projectInfo.updated_at) }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">浏览次数：</span>
                    <span class="value">{{ projectInfo.view_count || 0 }}</span>
                  </div>
                </div>
              </el-form>
            </div>
          </el-scrollbar>
        </div>
      </div>
    </div>

    <!-- 媒体选择器 - 封面 -->
    <MediaSelector
      ref="coverSelectorRef"
      mode="single"
      return-type="url"
      dialog-title="选择封面图片"
      @select="handleCoverSelect"
    />

    <!-- 媒体选择器 - 项目截图 -->
    <MediaSelector
      ref="imagesSelectorRef"
      mode="multiple"
      return-type="url"
      dialog-title="选择项目截图"
      @select="handleImagesSelect"
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
  Link,
  Document,
  VideoPlay,
  Plus,
} from '@element-plus/icons-vue'
import { Icon } from '@iconify/vue'
import dayjs from 'dayjs'
import MarkdownEditor from '@/components/editor/MarkdownEditor.vue'
import MediaSelector from '@/components/media/MediaSelector.vue'
import { useProjectStore } from '@/stores/project'
import type { Project, ProjectFormData, ProjectType, ProjectStatus } from '@/types'

const route = useRoute()
const router = useRouter()
const projectStore = useProjectStore()

// 状态
const isEdit = computed(() => !!route.params.id)
const projectId = computed(() => Number(route.params.id))
const isPanelCollapsed = ref(false)
const saving = ref(false)
const publishing = ref(false)
const formRef = ref<FormInstance>()
const coverSelectorRef = ref()
const imagesSelectorRef = ref()

// 常用标签和技术栈
const commonTags = ref([
  '个人项目',
  '商业项目',
  '学习项目',
  '开源贡献',
  '比赛作品',
  '毕业设计',
])

const commonTechs = ref([
  'Vue',
  'React',
  'Angular',
  'TypeScript',
  'JavaScript',
  'Node.js',
  'Python',
  'Java',
  'Go',
  'Spring Boot',
  'Express',
  'FastAPI',
  'Django',
  'MySQL',
  'PostgreSQL',
  'MongoDB',
  'Redis',
  'Docker',
  'Kubernetes',
  'AWS',
  'Azure',
  'Nginx',
  'Git',
])

// 表单数据
const formData = reactive<ProjectFormData>({
  title: '',
  subtitle: '',
  description: '',
  content: '',
  cover_image: '',
  project_type: 'web',
  category: '',
  tags: [],
  tech_stack: [],
  demo_url: '',
  github_url: '',
  documentation_url: '',
  demo_video: '',
  status: 'draft',
  start_date: '',
  end_date: '',
  team_size: 1,
  images: [],
  is_featured: false,
  is_open_source: false,
})

// 项目信息（编辑模式）
const projectInfo = ref<Project | null>(null)

// 表单验证规则
const rules: FormRules = {
  title: [
    { required: true, message: '请输入项目标题', trigger: 'blur' },
    { min: 1, max: 100, message: '标题长度在 1 到 100 个字符', trigger: 'blur' },
  ],
  description: [
    { required: true, message: '请输入项目描述', trigger: 'blur' },
    { min: 10, max: 500, message: '描述长度在 10 到 500 个字符', trigger: 'blur' },
  ],
  project_type: [
    { required: true, message: '请选择项目类型', trigger: 'change' },
  ],
  tech_stack: [
    { type: 'array', min: 1, message: '请至少选择一个技术栈', trigger: 'change' },
  ],
  status: [
    { required: true, message: '请选择项目状态', trigger: 'change' },
  ],
  start_date: [
    { required: true, message: '请选择开始时间', trigger: 'change' },
  ],
  end_date: [
    { required: true, message: '请选择结束时间', trigger: 'change' },
  ],
}

// 编辑器高度
const editorHeight = computed(() => {
  return 'calc(100vh - 200px)'
})

// 加载项目数据（编辑模式）
const loadProject = async () => {
  if (!isEdit.value) return

  try {
    await projectStore.fetchProjectById(projectId.value)
    const project = projectStore.currentProject

    if (!project) {
      throw new Error('项目不存在')
    }

    projectInfo.value = project

    // 填充表单
    formData.title = project.title
    formData.subtitle = project.subtitle || ''
    formData.description = project.description
    formData.content = project.content || ''
    formData.cover_image = project.cover_image || ''
    formData.project_type = project.project_type
    formData.category = project.category || ''
    formData.tags = project.tags || []
    formData.tech_stack = project.tech_stack || []
    formData.demo_url = project.demo_url || ''
    formData.github_url = project.github_url || ''
    formData.documentation_url = project.documentation_url || ''
    formData.demo_video = project.demo_video || ''
    formData.status = project.status
    formData.start_date = project.start_date || null
    formData.end_date = project.end_date || null
    formData.team_size = project.team_size || 1
    formData.images = project.images || []
    formData.is_featured = project.is_featured || false
    formData.is_open_source = project.is_open_source || false
  } catch (error) {
    console.error('加载项目失败:', error)
    ElMessage.error('加载项目失败')
    router.push('/admin/projects')
  }
}

// 返回
const handleBack = () => {
  router.push('/admin/projects')
}

// 切换面板折叠
const togglePanel = () => {
  isPanelCollapsed.value = !isPanelCollapsed.value
}

// 选择封面图片
const handleSelectCoverImage = () => {
  coverSelectorRef.value?.open()
}

// 封面选择完成
const handleCoverSelect = (url: string) => {
  formData.cover_image = url
  ElMessage.success('封面图片已选择')
}

// 选择项目截图
const handleSelectProjectImages = () => {
  imagesSelectorRef.value?.open()
}

// 项目截图选择完成
const handleImagesSelect = (urls: string[]) => {
  if (!formData.images) {
    formData.images = []
  }
  formData.images.push(...urls)
  ElMessage.success(`已添加 ${urls.length} 张截图`)
}

// 移除截图
const removeImage = (index: number) => {
  formData.images?.splice(index, 1)
}

// 保存草稿
const handleSaveDraft = async () => {
  if (!formData.title.trim()) {
    ElMessage.warning('请输入项目标题')
    return
  }

  saving.value = true
  try {
    const data: ProjectFormData = {
      ...formData,
      status: 'draft',
    }

    if (isEdit.value) {
      await projectStore.updateProject(projectId.value, data)
      ElMessage.success('保存草稿成功')
      await loadProject()
    } else {
      const res = await projectStore.createProject(data)
      ElMessage.success('保存草稿成功')
      // 跳转到编辑页面
      router.replace(`/admin/projects/${res.id}/edit`)
    }
  } catch (error) {
    console.error('保存草稿失败:', error)
    ElMessage.error('保存草稿失败')
  } finally {
    saving.value = false
  }
}

// 发布项目
const handlePublish = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
  } catch {
    ElMessage.warning('请完善项目信息')
    return
  }

  publishing.value = true
  try {
    const data: ProjectFormData = {
      ...formData,
      status: 'completed',
    }

    if (isEdit.value) {
      await projectStore.updateProject(projectId.value, data)
      ElMessage.success('项目更新成功')
      await loadProject()
    } else {
      const res = await projectStore.createProject(data)
      ElMessage.success('项目发布成功')
      router.replace(`/admin/projects/${res.id}/edit`)
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
  await loadProject()
})
</script>

<style scoped lang="scss">
.project-edit-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--el-bg-color-page);

  .top-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 20px;
    background: var(--el-bg-color);
    border-bottom: 1px solid var(--el-border-color);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

    .left {
      display: flex;
      align-items: center;
      gap: 16px;

      .page-title {
        font-size: 18px;
        font-weight: 600;
        color: var(--el-text-color-primary);
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
      display: flex;
      flex-direction: column;
      padding: 20px;
      overflow: hidden;

      .editor-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;

        h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: var(--el-text-color-primary);
        }

        .tip {
          font-size: 13px;
          color: var(--el-text-color-secondary);
        }
      }
    }

    .settings-panel {
      width: 380px;
      background: var(--el-bg-color);
      border-left: 1px solid var(--el-border-color);
      position: relative;
      transition: width 0.3s ease;

      &.collapsed {
        width: 40px;

        .panel-content {
          opacity: 0;
        }
      }

      .collapse-trigger {
        position: absolute;
        left: -12px;
        top: 50%;
        transform: translateY(-50%);
        width: 24px;
        height: 48px;
        background: var(--el-bg-color);
        border: 1px solid var(--el-border-color);
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s;
        z-index: 10;

        &:hover {
          background: var(--el-fill-color-light);
        }
      }

      .panel-content {
        height: 100%;
        transition: opacity 0.3s ease;
      }

      .panel-inner {
        padding: 20px;
      }
    }
  }

  .form-section {
    margin-bottom: 24px;

    h4 {
      margin: 0 0 16px 0;
      font-size: 15px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }
  }

  .cover-upload,
  .images-manager {
    width: 100%;

    .cover-preview {
      margin-top: 12px;
      position: relative;
      width: 100%;
      height: 160px;
      border-radius: 8px;
      overflow: hidden;

      .el-image {
        width: 100%;
        height: 100%;
      }

      .remove-btn {
        position: absolute;
        top: 8px;
        right: 8px;
        background: rgba(0, 0, 0, 0.6);
        color: white;
        border: none;

        &:hover {
          background: rgba(0, 0, 0, 0.8);
        }
      }
    }

    .image-error {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      background: var(--el-fill-color-light);
      color: var(--el-text-color-placeholder);
      font-size: 14px;

      .el-icon {
        font-size: 32px;
        margin-bottom: 8px;
      }
    }
  }

  .images-list {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;

    .image-item {
      position: relative;
      aspect-ratio: 1;
      border-radius: 8px;
      overflow: hidden;
      cursor: pointer;

      .el-image {
        width: 100%;
        height: 100%;
      }

      .remove-btn {
        position: absolute;
        top: 4px;
        right: 4px;
        background: rgba(0, 0, 0, 0.6);
        color: white;
        border: none;

        &:hover {
          background: rgba(0, 0, 0, 0.8);
        }
      }

      .image-error-small {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        background: var(--el-fill-color-light);
        color: var(--el-text-color-placeholder);
        font-size: 24px;
      }
    }

    .add-image-btn {
      aspect-ratio: 1;
      border: 2px dashed var(--el-border-color);
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;
      color: var(--el-text-color-secondary);
      font-size: 13px;

      &:hover {
        border-color: var(--el-color-primary);
        color: var(--el-color-primary);
      }
    }
  }

  .setting-item {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .setting-label {
      display: flex;
      flex-direction: column;
      gap: 4px;

      .tip {
        font-size: 12px;
        color: var(--el-text-color-secondary);
      }
    }
  }

  .project-info {
    h4 {
      margin: 0 0 12px 0;
      font-size: 15px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }

    .info-item {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      font-size: 13px;
      border-bottom: 1px solid var(--el-border-color-lighter);

      &:last-child {
        border-bottom: none;
      }

      .label {
        color: var(--el-text-color-secondary);
      }

      .value {
        color: var(--el-text-color-primary);
        font-weight: 500;
      }
    }
  }
}
</style>
