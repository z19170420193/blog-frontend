import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores'
import { frontendRoutes } from './frontend'
import { adminRoutes } from './admin'

// 合并所有路由
const routes: RouteRecordRaw[] = [
  ...frontendRoutes,
  ...adminRoutes,
  // 404 页面
  // {
  //   path: '/:pathMatch(.*)*',
  //   name: 'NotFound',
  //   component: () => import('@/views/NotFound.vue'),
  //   meta: { title: '404' },
  // },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  },
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()

  // 设置页面标题
  document.title = to.meta.title ? `${to.meta.title} - 个人博客` : '个人博客'

  // 检查是否需要认证
  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    next({
      path: '/login',
      query: { redirect: to.fullPath },
    })
  } else {
    next()
  }
})

export default router
