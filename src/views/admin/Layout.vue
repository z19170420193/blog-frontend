<template>
  <el-container class="admin-layout">
    <!-- 侧边栏 -->
    <el-aside :width="isCollapse ? '64px' : '200px'" class="admin-sidebar">
      <div class="logo-container">
        <el-icon v-if="!isCollapse" class="logo-icon" :size="28">
          <Management />
        </el-icon>
        <el-icon v-else class="logo-icon" :size="28">
          <Management />
        </el-icon>
        <span v-if="!isCollapse" class="logo-title">博客管理</span>
      </div>

      <el-menu
        :default-active="activeMenu"
        class="sidebar-menu"
        :collapse="isCollapse"
        :router="true"
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409eff"
      >
        <el-menu-item index="/admin/dashboard">
          <el-icon><DataAnalysis /></el-icon>
          <template #title>控制台</template>
        </el-menu-item>

        <el-menu-item index="/admin/articles">
          <el-icon><Document /></el-icon>
          <template #title>文章管理</template>
        </el-menu-item>

        <el-menu-item index="/admin/categories">
          <el-icon><Folder /></el-icon>
          <template #title>分类管理</template>
        </el-menu-item>

        <el-menu-item index="/admin/tags">
          <el-icon><Collection /></el-icon>
          <template #title>标签管理</template>
        </el-menu-item>

        <el-menu-item index="/admin/comments">
          <el-icon><ChatDotRound /></el-icon>
          <template #title>评论管理</template>
        </el-menu-item>

        <el-menu-item index="/admin/moments">
          <el-icon><ChatLineRound /></el-icon>
          <template #title>说说管理</template>
        </el-menu-item>

        <el-menu-item index="/admin/projects">
          <el-icon><Briefcase /></el-icon>
          <template #title>项目管理</template>
        </el-menu-item>

        <el-menu-item index="/admin/media">
          <el-icon><Picture /></el-icon>
          <template #title>媒体管理</template>
        </el-menu-item>

        <el-menu-item index="/admin/profile">
          <el-icon><User /></el-icon>
          <template #title>个人设置</template>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <!-- 主容器 -->
    <el-container class="main-container">
      <!-- 顶部导航栏 -->
      <el-header class="admin-header">
        <div class="header-left">
          <el-icon
            class="collapse-icon"
            :size="20"
            @click="toggleCollapse"
            style="cursor: pointer"
          >
            <Expand v-if="isCollapse" />
            <Fold v-else />
          </el-icon>

          <!-- 面包屑 -->
          <el-breadcrumb separator="/" class="breadcrumb">
            <el-breadcrumb-item
              v-for="(item, index) in breadcrumbList"
              :key="index"
              :to="item.path ? { path: item.path } : undefined"
            >
              {{ item.title }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>

        <div class="header-right">
          <!-- 用户下拉菜单 -->
          <el-dropdown @command="handleCommand">
            <div class="user-info">
              <el-avatar :size="32" :src="userStore.user?.avatar || ''">
                <el-icon><User /></el-icon>
              </el-avatar>
              <span class="username">{{ userStore.user?.username }}</span>
              <el-icon class="arrow-icon"><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">
                  <el-icon><User /></el-icon>
                  个人设置
                </el-dropdown-item>
                <el-dropdown-item command="frontend">
                  <el-icon><HomeFilled /></el-icon>
                  返回前台
                </el-dropdown-item>
                <el-dropdown-item divided command="logout">
                  <el-icon><SwitchButton /></el-icon>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- 主内容区 -->
      <el-main class="admin-main">
        <router-view />
      </el-main>
    </el-container>
    
    <!-- 返回顶部组件 -->
    <BackToTop :right="30" :bottom="30" />
  </el-container>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  DataAnalysis,
  Document,
  Folder,
  Collection,
  ChatDotRound,
  Picture,
  User,
  Expand,
  Fold,
  ArrowDown,
  HomeFilled,
  SwitchButton,
  Management,
  ChatLineRound,
  Briefcase,
} from '@element-plus/icons-vue'
import BackToTop from '@/components/common/BackToTop.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// 侧边栏折叠状态
const isCollapse = ref(false)

// 当前激活的菜单
const activeMenu = computed(() => route.path)

// 面包屑数据
interface BreadcrumbItem {
  title: string
  path?: string
}

const breadcrumbList = computed<BreadcrumbItem[]>(() => {
  const matched = route.matched.filter((item) => item.meta && item.meta.title)
  const breadcrumbs: BreadcrumbItem[] = [{ title: '首页', path: '/admin/dashboard' }]

  matched.forEach((item) => {
    if (item.path !== '/admin' && item.meta?.title) {
      breadcrumbs.push({
        title: item.meta.title as string,
        path: item.path,
      })
    }
  })

  return breadcrumbs
})

// 切换侧边栏折叠状态
const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
}

// 下拉菜单命令处理
const handleCommand = async (command: string) => {
  switch (command) {
    case 'profile':
      router.push('/admin/profile')
      break
    case 'frontend':
      router.push('/')
      break
    case 'logout':
      try {
        await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        })
        await userStore.logout()
        ElMessage.success('已退出登录')
        router.push('/login')
      } catch {
        // 取消操作
      }
      break
  }
}
</script>

<style scoped lang="scss">
.admin-layout {
  height: 100vh;
  overflow: hidden;
}

.admin-sidebar {
  background-color: #304156;
  transition: width 0.3s;
  overflow-x: hidden;

  .logo-container {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 60px;
    background-color: #2b3a4a;
    color: #fff;
    gap: 8px;

    .logo-icon {
      color: #409eff;
    }

    .logo-title {
      font-size: 18px;
      font-weight: bold;
    }
  }

  .sidebar-menu {
    border-right: none;
    height: calc(100vh - 60px);
  }
}

.main-container {
  background-color: #f0f2f5;
}

.admin-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #fff;
  border-bottom: 1px solid #e8e8e8;
  padding: 0 20px;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);

  .header-left {
    display: flex;
    align-items: center;
    gap: 20px;

    .collapse-icon {
      transition: transform 0.3s;

      &:hover {
        color: #409eff;
      }
    }

    .breadcrumb {
      font-size: 14px;
    }
  }

  .header-right {
    .user-info {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      padding: 5px 10px;
      border-radius: 4px;
      transition: background-color 0.3s;

      &:hover {
        background-color: #f0f2f5;
      }

      .username {
        font-size: 14px;
        color: #333;
      }

      .arrow-icon {
        font-size: 12px;
        color: #999;
      }
    }
  }
}

.admin-main {
  padding: 20px;
  overflow-y: auto;
}
</style>
