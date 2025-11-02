<template>
  <div class="markdown-editor">
    <div class="editor-toolbar">
      <el-button-group>
        <el-tooltip content="加粗" placement="top">
          <el-button size="small" @click="insertText('**', '**')">
            <strong>B</strong>
          </el-button>
        </el-tooltip>

        <el-tooltip content="斜体" placement="top">
          <el-button size="small" @click="insertText('*', '*')">
            <em>I</em>
          </el-button>
        </el-tooltip>

        <el-tooltip content="删除线" placement="top">
          <el-button size="small" @click="insertText('~~', '~~')">
            <s>S</s>
          </el-button>
        </el-tooltip>
      </el-button-group>

      <el-button-group style="margin-left: 10px">
        <el-tooltip content="标题1" placement="top">
          <el-button size="small" @click="insertLine('# ')">H1</el-button>
        </el-tooltip>

        <el-tooltip content="标题2" placement="top">
          <el-button size="small" @click="insertLine('## ')">H2</el-button>
        </el-tooltip>

        <el-tooltip content="标题3" placement="top">
          <el-button size="small" @click="insertLine('### ')">H3</el-button>
        </el-tooltip>
      </el-button-group>

      <el-button-group style="margin-left: 10px">
        <el-tooltip content="无序列表" placement="top">
          <el-button size="small" @click="insertLine('- ')">
            <el-icon><List /></el-icon>
          </el-button>
        </el-tooltip>

        <el-tooltip content="有序列表" placement="top">
          <el-button size="small" @click="insertLine('1. ')">
            <el-icon><Tickets /></el-icon>
          </el-button>
        </el-tooltip>

        <el-tooltip content="引用" placement="top">
          <el-button size="small" @click="insertLine('> ')">
            <el-icon><ChatLineSquare /></el-icon>
          </el-button>
        </el-tooltip>
      </el-button-group>

      <el-button-group style="margin-left: 10px">
        <el-tooltip content="代码块" placement="top">
          <el-button size="small" @click="insertCodeBlock">
            <el-icon><Tickets /></el-icon>
            Code
          </el-button>
        </el-tooltip>

        <el-tooltip content="插入链接" placement="top">
          <el-button size="small" @click="insertLink">
            <el-icon><Link /></el-icon>
          </el-button>
        </el-tooltip>

        <el-tooltip content="插入图片" placement="top">
          <el-button size="small" @click="insertImage">
            <el-icon><Picture /></el-icon>
          </el-button>
        </el-tooltip>
      </el-button-group>

      <div style="margin-left: auto">
        <el-button-group>
          <el-tooltip content="编辑模式" placement="top">
            <el-button
              size="small"
              :type="viewMode === 'edit' ? 'primary' : ''"
              @click="viewMode = 'edit'"
            >
              <el-icon><Edit /></el-icon>
            </el-button>
          </el-tooltip>

          <el-tooltip content="分屏模式" placement="top">
            <el-button
              size="small"
              :type="viewMode === 'split' ? 'primary' : ''"
              @click="viewMode = 'split'"
            >
              <el-icon><Grid /></el-icon>
            </el-button>
          </el-tooltip>

          <el-tooltip content="预览模式" placement="top">
            <el-button
              size="small"
              :type="viewMode === 'preview' ? 'primary' : ''"
              @click="viewMode = 'preview'"
            >
              <el-icon><View /></el-icon>
            </el-button>
          </el-tooltip>
        </el-button-group>

        <el-tooltip content="全屏" placement="top" style="margin-left: 10px">
          <el-button size="small" @click="toggleFullscreen">
            <el-icon><FullScreen /></el-icon>
          </el-button>
        </el-tooltip>
      </div>
    </div>

    <div class="editor-container" :class="{ fullscreen: isFullscreen }">
      <!-- 编辑区 -->
      <div v-show="viewMode === 'edit' || viewMode === 'split'" class="editor-pane">
        <el-input
          ref="textareaRef"
          v-model="content"
          type="textarea"
          :rows="20"
          placeholder="请输入Markdown内容..."
          @input="handleInput"
        />
      </div>

      <!-- 预览区 -->
      <div v-show="viewMode === 'preview' || viewMode === 'split'" class="preview-pane">
        <div class="markdown-body" v-html="renderedHtml"></div>
      </div>
    </div>

    <!-- 媒体选择器 -->
    <MediaSelector
      ref="mediaSelectorRef"
      mode="multiple"
      :max-count="5"
      return-type="url"
      dialog-title="插入图片"
      @select="handleImageInsert"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css'
import {
  Edit,
  Grid,
  View,
  FullScreen,
  List,
  Tickets,
  ChatLineSquare,
  Link,
  Picture,
} from '@element-plus/icons-vue'
import MediaSelector from '@/components/media/MediaSelector.vue'

// Props
interface Props {
  modelValue: string
  height?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  height: '500px',
})

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

// 状态
const content = ref(props.modelValue)
const textareaRef = ref()
const mediaSelectorRef = ref()
const viewMode = ref<'edit' | 'split' | 'preview'>('split')
const isFullscreen = ref(false)

// 配置marked
marked.setOptions({
  highlight: function (code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(code, { language: lang }).value
    }
    return hljs.highlightAuto(code).value
  },
  breaks: true,
  gfm: true,
})

// 渲染Markdown为HTML
const renderedHtml = computed(() => {
  try {
    const html = marked(content.value || '')
    return DOMPurify.sanitize(html as string)
  } catch (error) {
    console.error('Markdown解析错误:', error)
    return '<p>解析错误</p>'
  }
})

// 监听外部值变化
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal !== content.value) {
      content.value = newVal
    }
  }
)

// 输入处理
const handleInput = (value: string) => {
  emit('update:modelValue', value)
}

// 获取选中文本
const getSelection = () => {
  const textarea = textareaRef.value?.$el?.querySelector('textarea')
  if (!textarea) return { start: 0, end: 0, text: '' }

  return {
    start: textarea.selectionStart,
    end: textarea.selectionEnd,
    text: textarea.value.substring(textarea.selectionStart, textarea.selectionEnd),
  }
}

// 设置选中位置
const setSelection = (start: number, end: number) => {
  const textarea = textareaRef.value?.$el?.querySelector('textarea')
  if (!textarea) return

  textarea.focus()
  textarea.setSelectionRange(start, end)
}

// 插入文本（两侧包裹）
const insertText = (prefix: string, suffix: string) => {
  const { start, end, text } = getSelection()
  const before = content.value.substring(0, start)
  const after = content.value.substring(end)

  if (text) {
    // 有选中文本，包裹它
    content.value = before + prefix + text + suffix + after
    setSelection(start + prefix.length, end + prefix.length)
  } else {
    // 无选中文本，插入占位符
    const placeholder = '文本'
    content.value = before + prefix + placeholder + suffix + after
    setSelection(start + prefix.length, start + prefix.length + placeholder.length)
  }

  emit('update:modelValue', content.value)
}

// 插入行首标记
const insertLine = (prefix: string) => {
  const { start } = getSelection()
  const before = content.value.substring(0, start)
  const after = content.value.substring(start)

  // 找到当前行的开始位置
  const lastNewLine = before.lastIndexOf('\n')
  const lineStart = lastNewLine === -1 ? 0 : lastNewLine + 1

  content.value =
    content.value.substring(0, lineStart) + prefix + content.value.substring(lineStart)
  setSelection(start + prefix.length, start + prefix.length)

  emit('update:modelValue', content.value)
}

// 插入代码块
const insertCodeBlock = () => {
  const { start, end, text } = getSelection()
  const before = content.value.substring(0, start)
  const after = content.value.substring(end)

  const codeBlock = text
    ? `\`\`\`\n${text}\n\`\`\``
    : `\`\`\`javascript\n// 在这里输入代码\n\`\`\``

  content.value = before + codeBlock + after
  emit('update:modelValue', content.value)
}

// 插入链接
const insertLink = () => {
  const { start, end, text } = getSelection()
  const before = content.value.substring(0, start)
  const after = content.value.substring(end)

  const linkText = text || '链接文本'
  const linkUrl = 'https://example.com'
  const link = `[${linkText}](${linkUrl})`

  content.value = before + link + after
  emit('update:modelValue', content.value)
}

// 插入图片
const insertImage = () => {
  // 打开媒体选择器
  mediaSelectorRef.value?.open()
}

// 图片选择完成
const handleImageInsert = (urls: string | string[]) => {
  const { start } = getSelection()
  const before = content.value.substring(0, start)
  const after = content.value.substring(start)

  // 处理单个或多个图片
  const urlArray = Array.isArray(urls) ? urls : [urls]
  const images = urlArray.map(url => `![图片](${url})`).join('\n')

  content.value = before + images + after
  emit('update:modelValue', content.value)

  // 显示成功提示
  ElMessage.success(`已插入 ${urlArray.length} 张图片`)
}

// 切换全屏
const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
}
</script>

<style scoped lang="scss">
.markdown-editor {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;

  .editor-toolbar {
    display: flex;
    align-items: center;
    padding: 10px;
    background-color: #f5f7fa;
    border-bottom: 1px solid #dcdfe6;
    flex-wrap: wrap;
    gap: 5px;
  }

  .editor-container {
    display: flex;
    height: 500px;
    overflow: hidden;

    &.fullscreen {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 9999;
      height: 100vh;
      background: white;
    }

    .editor-pane,
    .preview-pane {
      flex: 1;
      overflow: auto;
    }

    .editor-pane {
      border-right: 1px solid #dcdfe6;

      :deep(.el-textarea) {
        height: 100%;

        .el-textarea__inner {
          height: 100% !important;
          border: none;
          border-radius: 0;
          resize: none;
          font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
          font-size: 14px;
          line-height: 1.6;
        }
      }
    }

    .preview-pane {
      padding: 20px;
      background-color: #fff;
      overflow-y: auto;
    }
  }
}

// Markdown样式
.markdown-body {
  font-size: 14px;
  line-height: 1.6;
  color: #333;

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    margin: 20px 0 10px;
    font-weight: 600;
    line-height: 1.4;
  }

  h1 {
    font-size: 28px;
    border-bottom: 1px solid #eee;
    padding-bottom: 10px;
  }

  h2 {
    font-size: 24px;
    border-bottom: 1px solid #eee;
    padding-bottom: 8px;
  }

  h3 {
    font-size: 20px;
  }

  h4 {
    font-size: 18px;
  }

  p {
    margin: 10px 0;
  }

  code {
    background-color: #f5f7fa;
    padding: 2px 6px;
    border-radius: 3px;
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
    font-size: 13px;
    color: #e83e8c;
  }

  pre {
    background-color: #f6f8fa;
    padding: 16px;
    border-radius: 6px;
    overflow-x: auto;
    margin: 10px 0;

    code {
      background: none;
      padding: 0;
      color: inherit;
    }
  }

  blockquote {
    margin: 10px 0;
    padding: 10px 20px;
    border-left: 4px solid #dcdfe6;
    background-color: #f5f7fa;
    color: #666;
  }

  ul,
  ol {
    padding-left: 30px;
    margin: 10px 0;
  }

  li {
    margin: 5px 0;
  }

  table {
    border-collapse: collapse;
    width: 100%;
    margin: 10px 0;

    th,
    td {
      border: 1px solid #dcdfe6;
      padding: 8px 12px;
      text-align: left;
    }

    th {
      background-color: #f5f7fa;
      font-weight: 600;
    }

    tr:nth-child(even) {
      background-color: #fafafa;
    }
  }

  img {
    max-width: 100%;
    height: auto;
    margin: 10px 0;
  }

  a {
    color: #409eff;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }

  hr {
    border: none;
    border-top: 1px solid #dcdfe6;
    margin: 20px 0;
  }
}
</style>
