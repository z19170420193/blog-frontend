<template>
  <div class="circular-menu-wrapper">
    <div 
      class="circular-menu"
      @mouseenter="menuExpanded = true"
      @mouseleave="menuExpanded = false"
    >
      <!-- 中心 Logo -->
      <div class="menu-center">
        <img src="@/assets/logo.png" alt="Logo" class="logo-image" />
      </div>
      
      <!-- 环形菜单项 -->
      <router-link
        v-for="(link, index) in menuItems"
        :key="link.path"
        :to="link.path"
        class="menu-item"
        :class="{ 'is-expanded': menuExpanded }"
        :style="getMenuItemStyle(index)"
      >
        <el-tooltip :content="link.label" placement="top" effect="light">
          <el-icon :size="20">
            <component :is="link.icon" />
          </el-icon>
        </el-tooltip>
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  Link,
  Reading,
  HomeFilled,
  Document,
  Folder,
  CollectionTag,
  User,
} from '@element-plus/icons-vue'

// 菜单展开状态
const menuExpanded = ref(false)

// 菜单项配置
const menuItems = [
  { path: '/', label: '首页', icon: HomeFilled },
  { path: '/article', label: '文章列表', icon: Document },
  { path: '/categories', label: '分类目录', icon: Folder },
  { path: '/tags', label: '标签云', icon: CollectionTag },
  { path: '/about', label: '关于我', icon: User },
]

// 计算菜单项位置
const getMenuItemStyle = (index: number) => {
  const total = menuItems.length
  const radius = 80 // 半径
  const startAngle = -90 // 起始角度（从顶部开始）
  const angleStep = 360 / total // 角度步长
  const finalAngle = startAngle + angleStep * index
  
  return {
    '--index': index,
    '--rotate-angle': `${finalAngle}deg`,
    '--final-angle': `${finalAngle}deg`,
  }
}
</script>

<style scoped lang="scss">
.circular-menu-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.circular-menu {
  position: relative;
  width: 200px;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.menu-center {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  background: rgba(255, 255, 255, 0.15);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  backdrop-filter: blur(10px);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 8px;

  .logo-image {
    width: 100%;
    height: 100%;
    object-fit: contain;
    transition: transform 0.4s;
  }
}

.circular-menu:hover .menu-center {
  transform: scale(1.1);
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
}

.menu-item {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  color: #fff;
  text-decoration: none;
  opacity: 0;
  transform-origin: center center;
  backdrop-filter: blur(10px);
  
  left: 50%;
  top: 50%;
  margin-left: -22px;
  margin-top: -22px;
  
  &::before {
    content: '';
    position: absolute;
    width: 80px;
    height: 80px;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%) rotate(0deg);
    transition: transform 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  }

  &.is-expanded {
    animation: rotateExpand 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    animation-delay: calc(var(--index) * 0.06s);
  }
  
  &:not(.is-expanded) {
    animation: rotateCollapse 0.4s cubic-bezier(0.4, 0, 0.6, 1) forwards;
    animation-delay: calc((4 - var(--index)) * 0.05s);
  }

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.15);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }

  .el-icon {
    font-size: 20px;
    position: relative;
    z-index: 1;
  }
}

// 圆周旋转展开关键帧动画
@keyframes rotateExpand {
  0% {
    transform: rotate(0deg) translateX(0) rotate(0deg) scale(0);
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    transform: rotate(var(--rotate-angle)) translateX(80px) rotate(calc(-1 * var(--rotate-angle))) scale(1);
    opacity: 1;
  }
}

// 螺旋式收回关键帧动画
@keyframes rotateCollapse {
  0% {
    transform: rotate(var(--rotate-angle)) translateX(80px) rotate(calc(-1 * var(--rotate-angle))) scale(1);
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    transform: rotate(0deg) translateX(0) rotate(0deg) scale(0);
    opacity: 0;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .circular-menu {
    width: 180px;
    height: 180px;

    .menu-center {
      width: 50px;
      height: 50px;

      .logo-icon {
        font-size: 24px;
      }
    }

    .menu-item {
      width: 40px;
      height: 40px;

      .el-icon {
        font-size: 18px;
      }
    }
  }
}
</style>
