<template>
  <header 
    class="blog-header" 
    :class="{ 
      'is-scrolled': isScrolled, 
      'is-mobile-open': mobileMenuOpen,
      'is-hidden': !isHeaderVisible
    }"
  >
    <div class="header-container">
      <!-- Logo 区域 -->
      <div class="header-logo" @click="router.push('/')">
        <img src="@/assets/logo.png" alt="Logo" class="logo-image" />
        <span class="logo-text">我的博客</span>
      </div>

      <!-- 桌面端导航菜单 -->
      <nav class="header-nav desktop-nav">
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="nav-item"
          :class="{ 'is-active': isActive(item.path) }"
        >
          <Icon :icon="item.icon" :width="18" />
          <span>{{ item.label }}</span>
        </router-link>
      </nav>

      <!-- 搜索区域 -->
      <div class="header-search desktop-search">
        <!-- 搜索按钮（未展开时） -->
        <button 
          v-if="!showDesktopSearch" 
          class="search-toggle-btn" 
          @click="toggleDesktopSearch"
        >
          <Icon icon="lucide:search" :width="20" />
        </button>
        
        <!-- 搜索框（展开后） -->
        <transition name="search-expand">
          <div v-if="showDesktopSearch" class="search-wrapper">
            <Icon icon="lucide:search" :width="18" class="search-icon" />
            <input
              ref="searchInputRef"
              v-model="searchKeyword"
              type="text"
              placeholder="搜索文章..."
              @keyup.enter="handleSearch"
              @blur="handleSearchBlur"
              class="search-input"
            />
            <Icon 
              v-if="searchKeyword" 
              icon="lucide:x" 
              :width="16" 
              class="search-clear"
              @mousedown.prevent
              @click="searchKeyword = ''"
            />
          </div>
        </transition>
      </div>

      <!-- 用户操作区 -->
      <div class="header-actions">
        <!-- 搜索按钮（移动端显示） -->
        <button class="action-btn mobile-search-btn" @click="showMobileSearch = !showMobileSearch">
          <Icon icon="lucide:search" :width="20" />
        </button>

        <!-- 未登录状态 -->
        <template v-if="!userStore.isLoggedIn">
          <button class="login-btn" @click="router.push('/login')">
            <Icon icon="lucide:user" :width="18" />
            <span class="btn-text">登录</span>
          </button>
        </template>

        <!-- 已登录状态 -->
        <template v-else>
          <el-dropdown trigger="click" @command="handleUserCommand">
            <div class="user-avatar-wrapper">
              <el-avatar :size="36" :src="userStore.user?.avatar">
                <Icon icon="lucide:user" :width="20" />
              </el-avatar>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">
                  <Icon icon="lucide:user" :width="16" />
                  个人中心
                </el-dropdown-item>
                <el-dropdown-item command="admin" v-if="userStore.user?.role === 'admin'">
                  <Icon icon="lucide:settings" :width="16" />
                  后台管理
                </el-dropdown-item>
                <el-dropdown-item divided command="logout">
                  <Icon icon="lucide:log-out" :width="16" />
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>

        <!-- 移动端菜单按钮 -->
        <button class="action-btn mobile-menu-btn" @click="toggleMobileMenu">
          <Icon :icon="mobileMenuOpen ? 'lucide:x' : 'lucide:menu'" :width="20" />
        </button>
      </div>
    </div>

    <!-- 移动端搜索栏 -->
    <transition name="slide-down">
      <div v-show="showMobileSearch" class="mobile-search-bar">
        <div class="search-wrapper">
          <Icon icon="lucide:search" :width="20" class="search-icon" />
          <input
            v-model="searchKeyword"
            type="text"
            placeholder="搜索文章..."
            @keyup.enter="handleSearch"
            class="search-input"
          />
          <Icon 
            v-if="searchKeyword" 
            icon="lucide:x" 
            :width="18" 
            class="search-clear"
            @click="searchKeyword = ''"
          />
        </div>
      </div>
    </transition>

    <!-- 移动端菜单 -->
    <transition name="slide-down">
      <nav v-show="mobileMenuOpen" class="mobile-nav">
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="mobile-nav-item"
          :class="{ 'is-active': isActive(item.path) }"
          @click="closeMobileMenu"
        >
          <Icon :icon="item.icon" :width="20" />
          <span>{{ item.label }}</span>
        </router-link>
      </nav>
    </transition>

    <!-- 遮罩层 -->
    <transition name="fade">
      <div v-show="mobileMenuOpen" class="mobile-overlay" @click="closeMobileMenu"></div>
    </transition>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores'
import { Icon } from '@iconify/vue'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// 导航项配置
const navItems = [
  { path: '/', label: '首页', icon: 'lucide:home' },
  { path: '/article', label: '文章', icon: 'lucide:book-open' },
  { path: '/projects', label: '项目', icon: 'lucide:briefcase' },
  { path: '/moments', label: '说说', icon: 'lucide:message-circle' },
  { path: '/guestbook', label: '留言', icon: 'lucide:message-square' },
  { path: '/categories', label: '分类', icon: 'lucide:layout-grid' },
  { path: '/tags', label: '标签', icon: 'lucide:tags' },
  { path: '/about', label: '关于', icon: 'lucide:info' },
]

// 状态
const isScrolled = ref(false)
const mobileMenuOpen = ref(false)
const showMobileSearch = ref(false)
const showDesktopSearch = ref(false)
const searchKeyword = ref('')
const isHeaderVisible = ref(true)
const searchInputRef = ref<HTMLInputElement | null>(null)

// 判断是否在首页
const isHomePage = computed(() => route.path === '/')

// 判断当前路由是否激活
const isActive = (path: string) => {
  if (path === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(path)
}

// 滚动监听
const handleScroll = () => {
  const scrollY = window.scrollY
  
  // 基础滚动效果
  isScrolled.value = scrollY > 50
  
  // 首页特殊处理：滚动超过80vh时显示导航栏
  if (isHomePage.value) {
    // 获取视口高度的80%作为临界点
    const threshold = window.innerHeight * 0.8
    isHeaderVisible.value = scrollY > threshold
  } else {
    // 非首页始终显示
    isHeaderVisible.value = true
  }
}

// 切换移动端菜单
const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
  // 防止背景滚动
  if (mobileMenuOpen.value) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
}

// 关闭移动端菜单
const closeMobileMenu = () => {
  mobileMenuOpen.value = false
  document.body.style.overflow = ''
}

// 切换桌面端搜索框
const toggleDesktopSearch = () => {
  showDesktopSearch.value = !showDesktopSearch.value
  if (showDesktopSearch.value) {
    // 延迟聚焦，等待动画完成
    setTimeout(() => {
      searchInputRef.value?.focus()
    }, 100)
  }
}

// 搜索框失焦处理
const handleSearchBlur = () => {
  // 如果没有输入内容，关闭搜索框
  if (!searchKeyword.value.trim()) {
    setTimeout(() => {
      showDesktopSearch.value = false
    }, 200)
  }
}

// 搜索处理
const handleSearch = () => {
  if (!searchKeyword.value.trim()) {
    ElMessage.warning('请输入搜索关键词')
    return
  }
  router.push({
    path: '/article',
    query: { keyword: searchKeyword.value },
  })
  showMobileSearch.value = false
  showDesktopSearch.value = false
  searchKeyword.value = ''
}

// 用户菜单命令处理
const handleUserCommand = (command: string) => {
  switch (command) {
    case 'profile':
      router.push('/profile')
      break
    case 'admin':
      router.push('/admin')
      break
    case 'logout':
      userStore.logout()
      ElMessage.success('退出登录成功')
      router.push('/')
      break
  }
}

// 监听路由变化，重置导航栏状态
watch(
  () => route.path,
  () => {
    handleScroll()
  },
  { immediate: true }
)

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  // 初始化时检查滚动位置
  handleScroll()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  document.body.style.overflow = ''
})
</script>

<style scoped lang="scss">
.blog-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);

  &.is-scrolled {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    box-shadow: 0 2px 20px rgba(0, 0, 0, 0.08);
  }

  // 首页隐藏状态
  &.is-hidden {
    transform: translateY(-100%);
    opacity: 0;
    pointer-events: none;
  }
}

.header-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
  height: 64px;
  display: flex;
  align-items: center;
  gap: 32px;
  position: relative; /* 为绝对居中导航提供定位上下文 */
}

/* ==================== Logo ==================== */
.header-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.3s;
  flex-shrink: 0;

  &:hover {
    transform: translateY(-2px);

    .logo-image {
      transform: rotate(5deg) scale(1.05);
    }
  }

  .logo-image {
    width: 36px;
    height: 36px;
    object-fit: contain;
    transition: transform 0.3s;
  }

  .logo-text {
    font-size: 20px;
    font-weight: 700;
    color: #303133;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
}

/* ==================== 导航菜单 ==================== */
.header-nav {
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
  position: absolute; /* 绝对居中，左右留白均衡 */
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  white-space: nowrap; /* 防止换行导致偏移 */
  pointer-events: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 8px;
  color: #606266;
  text-decoration: none;
  font-size: 15px;
  font-weight: 500;
  transition: all 0.3s;
  position: relative;

  &:hover {
    color: #409eff;
    background: rgba(64, 158, 255, 0.1);
  }

  &.is-active {
    color: #409eff;

    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 20px;
      height: 3px;
      background: linear-gradient(90deg, #409eff, #667eea);
      border-radius: 2px;
    }
  }
}

/* ==================== 搜索栏 ==================== */
.header-search {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  margin-left: auto; /* 将搜索与右侧操作区推到右边，实现左右留白均衡 */
}

.search-toggle-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.04);
  color: #606266;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background: rgba(64, 158, 255, 0.1);
    color: #409eff;
    transform: scale(1.05);
  }
}

.search-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  width: 260px;
  background: rgba(0, 0, 0, 0.03);
  border: 1px solid transparent;
  border-radius: 20px;
  padding: 8px 16px;
  transition: all 0.3s;

  &:hover {
    background: rgba(0, 0, 0, 0.05);
  }

  &:focus-within {
    background: #fff;
    border-color: #409eff;
    box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
  }

  .search-icon {
    color: #909399;
    flex-shrink: 0;
    margin-right: 8px;
  }

  .search-input {
    flex: 1;
    border: none;
    outline: none;
    background: transparent;
    font-size: 14px;
    color: #303133;
    min-width: 0;

    &::placeholder {
      color: #a8abb2;
    }
  }

  .search-clear {
    color: #909399;
    cursor: pointer;
    flex-shrink: 0;
    margin-left: 8px;
    transition: color 0.3s;

    &:hover {
      color: #606266;
    }
  }
}

/* ==================== 用户操作区 ==================== */
.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.04);
  color: #606266;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background: rgba(64, 158, 255, 0.1);
    color: #409eff;
    transform: translateY(-2px);
  }
}

.login-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  border: none;
  border-radius: 20px;
  font-weight: 500;
  background: #409eff;
  color: #fff;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;

  &:hover {
    background: #337ecc;
    transform: translateY(-2px);
  }

  .btn-text {
    display: inline;
  }
}

.user-avatar-wrapper {
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-2px);
  }

  :deep(.el-avatar) {
    border: 2px solid #fff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
}

/* ==================== 移动端适配 ==================== */
.mobile-menu-btn,
.mobile-search-btn {
  display: none;
}

.mobile-nav,
.mobile-search-bar {
  display: none;
}

@media (max-width: 1024px) {
  .header-search {
    width: 200px;
  }
}

@media (max-width: 768px) {
  .header-container {
    padding: 0 16px;
    gap: 16px;
  }

  .logo-text {
    font-size: 18px;
  }

  /* 隐藏桌面端元素 */
  .desktop-nav,
  .desktop-search {
    display: none !important;
  }

  /* 显示移动端按钮 */
  .mobile-menu-btn,
  .mobile-search-btn {
    display: flex;
  }

  .login-btn .btn-text {
    display: none;
  }

  .login-btn {
    padding: 10px;
    width: 40px;
    height: 40px;
    border-radius: 50%;
  }

  /* 移动端搜索栏 */
  .mobile-search-bar {
    display: block;
    position: absolute;
    top: 64px;
    left: 0;
    right: 0;
    background: rgba(255, 255, 255, 0.98);
    backdrop-filter: blur(20px);
    padding: 16px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);

    .search-input {
      font-size: 16px;
      padding: 12px 0;
    }
  }

  /* 移动端菜单 */
  .mobile-nav {
    display: flex;
    flex-direction: column;
    position: absolute;
    top: 64px;
    left: 0;
    right: 0;
    background: rgba(255, 255, 255, 0.98);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
    max-height: calc(100vh - 64px);
    overflow-y: auto;
  }

  .mobile-nav-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 24px;
    color: #303133;
    text-decoration: none;
    font-size: 16px;
    font-weight: 500;
    border-bottom: 1px solid rgba(0, 0, 0, 0.04);
    transition: all 0.3s;

    &:hover {
      background: rgba(64, 158, 255, 0.08);
      color: #409eff;
    }

    &.is-active {
      background: linear-gradient(90deg, rgba(64, 158, 255, 0.1), transparent);
      color: #409eff;
      border-left: 3px solid #409eff;
    }

    &:last-child {
      border-bottom: none;
    }
  }

  /* 遮罩层 */
  .mobile-overlay {
    position: fixed;
    top: 64px;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: -1;
  }
}

/* ==================== 动画 ==================== */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

// 搜索框展开动画
.search-expand-enter-active,
.search-expand-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.search-expand-enter-from {
  opacity: 0;
  width: 40px;
  transform: translateX(-10px);
}

.search-expand-leave-to {
  opacity: 0;
  width: 40px;
  transform: translateX(-10px);
}

/* ==================== 下拉菜单样式 ==================== */
:deep(.el-dropdown-menu) {
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  padding: 8px;

  .el-dropdown-menu__item {
    border-radius: 8px;
    padding: 10px 16px;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.3s;

    &:hover {
      background: rgba(64, 158, 255, 0.1);
      color: #409eff;
    }
  }
}
</style>