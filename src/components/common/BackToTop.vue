<template>
  <Transition name="back-to-top-fade">
    <div
      v-show="visible"
      class="back-to-top"
      :class="{ 'back-to-top--mobile': isMobile }"
      :style="positionStyle"
      @click="scrollToTop"
      @keydown.enter="scrollToTop"
      role="button"
      tabindex="0"
      :aria-label="ariaLabel"
    >
      <!-- 进度环（默认隐藏，悬停时显示） -->
      <svg class="back-to-top__progress" viewBox="0 0 100 100">
        <circle
          class="back-to-top__progress-bg"
          cx="50"
          cy="50"
          r="46"
          fill="none"
          stroke-width="4"
        />
        <circle
          class="back-to-top__progress-bar"
          cx="50"
          cy="50"
          r="46"
          fill="none"
          stroke-width="4"
          :stroke-dasharray="circumference"
          :stroke-dashoffset="progressOffset"
          transform="rotate(-90 50 50)"
        />
      </svg>

      <!-- 图标 -->
      <div class="back-to-top__icon">
        <img 
          v-if="customIcon" 
          :src="customIcon" 
          alt="返回顶部"
          class="back-to-top__icon-img"
        />
        <el-icon v-else :size="iconSize">
          <component :is="icon" />
        </el-icon>
        
        <!-- 滚动百分比（悬停时显示） -->
        <div class="back-to-top__percentage">
          {{ Math.round(scrollProgress) }}%
        </div>
      </div>

      <!-- 悬停提示文本 -->
      <div class="back-to-top__tooltip">
        {{ text || '返回顶部' }}
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { ArrowUpBold } from '@element-plus/icons-vue'
import backToTopIcon from '@/assets/返回顶部 .png'

interface Props {
  /** 显示按钮的滚动距离阈值 */
  visibilityHeight?: number
  /** 按钮距离底部的距离 */
  bottom?: number
  /** 按钮距离右侧的距离 */
  right?: number
  /** 自定义图标 */
  icon?: any
  /** 图标大小 */
  iconSize?: number
  /** 提示文本 */
  text?: string
  /** 滚动动画持续时间（毫秒） */
  duration?: number
  /** ARIA 标签 */
  ariaLabel?: string
  /** 移动端断点 */
  mobileBreakpoint?: number
  /** 是否使用自定义图片 */
  useCustomIcon?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  visibilityHeight: 300,
  bottom: 40,
  right: 40,
  icon: ArrowUpBold,
  iconSize: 20,
  text: '返回顶部',
  duration: 500,
  ariaLabel: '返回顶部',
  mobileBreakpoint: 768,
  useCustomIcon: true
})

// 状态
const visible = ref(false)
const scrollTop = ref(0)
const isMobile = ref(false)

// 自定义图标
const customIcon = computed(() => props.useCustomIcon ? backToTopIcon : null)

// 圆形进度条计算
const circumference = 2 * Math.PI * 46 // r=46
const scrollProgress = computed(() => {
  const docHeight = document.documentElement.scrollHeight - window.innerHeight
  return docHeight > 0 ? (scrollTop.value / docHeight) * 100 : 0
})
const progressOffset = computed(() => {
  return circumference - (scrollProgress.value / 100) * circumference
})

// 位置样式
const positionStyle = computed(() => ({
  bottom: `${props.bottom}px`,
  right: `${props.right}px`
}))

// 节流函数
const throttle = (func: Function, delay: number) => {
  let lastCall = 0
  return (...args: any[]) => {
    const now = Date.now()
    if (now - lastCall >= delay) {
      lastCall = now
      func(...args)
    }
  }
}

// 处理滚动事件
const handleScroll = throttle(() => {
  scrollTop.value = window.pageYOffset || document.documentElement.scrollTop
  visible.value = scrollTop.value >= props.visibilityHeight
}, 100)

// 检查是否为移动端
const checkMobile = () => {
  isMobile.value = window.innerWidth <= props.mobileBreakpoint
}

// 平滑滚动到顶部
const scrollToTop = () => {
  const startPosition = window.pageYOffset
  const startTime = performance.now()

  const easeInOutQuad = (t: number): number => {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
  }

  const animation = (currentTime: number) => {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / props.duration, 1)
    const ease = easeInOutQuad(progress)

    window.scrollTo(0, startPosition * (1 - ease))

    if (progress < 1) {
      requestAnimationFrame(animation)
    }
  }

  requestAnimationFrame(animation)
}

// 生命周期
onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  window.addEventListener('resize', checkMobile, { passive: true })
  checkMobile()
  handleScroll()
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('resize', checkMobile)
})
</script>

<style scoped lang="scss">
.back-to-top {
  position: fixed;
  z-index: 1000;
  width: 50px;
  height: 50px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  user-select: none;
  -webkit-tap-highlight-color: transparent;

  &:hover {
    transform: translateY(-4px);
    
    // 悬停时显示进度环
    .back-to-top__progress {
      opacity: 1;
    }
    
    // 显示提示文本
    .back-to-top__tooltip {
      opacity: 1;
      transform: translateX(-50%) translateY(-8px);
    }
  }

  &:active {
    transform: translateY(-2px) scale(0.98);
  }

  &:focus-visible {
    outline: 2px solid var(--el-color-primary);
    outline-offset: 4px;
  }

  // 移动端样式
  &--mobile {
    width: 46px;
    height: 46px;
    bottom: 20px !important;
    right: 20px !important;

    .back-to-top__icon {
      width: 38px;
      height: 38px;
      
      :deep(.el-icon) {
        font-size: 18px;
      }
    }
    
    // 移动端不显示提示
    .back-to-top__tooltip {
      display: none;
    }
  }
}

// 进度环（默认隐藏）
.back-to-top__progress {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.back-to-top__progress-bg {
  stroke: rgba(0, 0, 0, 0.08);
  transition: stroke 0.3s;

  .dark & {
    stroke: rgba(255, 255, 255, 0.12);
  }
}

.back-to-top__progress-bar {
  stroke: var(--el-color-primary);
  stroke-linecap: round;
  transition: stroke-dashoffset 0.15s ease;
}

// 图标
.back-to-top__icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  background: #fff;
  border-radius: 50%;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  .dark & {
    background: var(--el-bg-color);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
  }

  :deep(.el-icon) {
    color: var(--el-color-primary);
    transition: all 0.3s;
  }
  
  // 自定义图片图标
  .back-to-top__icon-img {
    width: 75%;
    height: 75%;
    object-fit: contain;
    transition: all 0.3s;
  }

  .back-to-top:hover & {
    background: var(--el-color-primary);
    box-shadow: 0 6px 20px rgba(64, 158, 255, 0.4);

    :deep(.el-icon) {
      color: #fff;
      transform: translateY(-2px);
    }
    
    .back-to-top__icon-img {
      opacity: 0;
      transform: scale(0.8);
    }
  }
}

// 百分比显示
.back-to-top__percentage {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 13px;
  font-weight: bold;
  color: #fff;
  opacity: 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: none;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  
  .back-to-top:hover & {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1.1);
  }
}

// 悬停提示
.back-to-top__tooltip {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%) translateY(0);
  margin-bottom: 12px;
  padding: 6px 12px;
  background: rgba(0, 0, 0, 0.85);
  color: #fff;
  font-size: 13px;
  border-radius: 4px;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  
  // 小三角
  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 5px solid transparent;
    border-top-color: rgba(0, 0, 0, 0.85);
  }
  
  .dark & {
    background: rgba(255, 255, 255, 0.95);
    color: #333;
    
    &::after {
      border-top-color: rgba(255, 255, 255, 0.95);
    }
  }
}

// 过渡动画
.back-to-top-fade-enter-active,
.back-to-top-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.back-to-top-fade-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.8);
}

.back-to-top-fade-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.8);
}

// 深色模式适配
@media (prefers-color-scheme: dark) {
  .back-to-top__progress-bg {
    stroke: rgba(255, 255, 255, 0.1);
  }

  .back-to-top__icon {
    background: var(--el-bg-color);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
  }
}

// 移动端优化
@media (max-width: 768px) {
  .back-to-top {
    width: 46px;
    height: 46px;

    &__icon {
      width: 38px;
      height: 38px;
    }
  }
}
</style>
