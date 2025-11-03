import type { RouteRecordRaw } from 'vue-router'

/**
 * 前台路由
 */
export const frontendRoutes: RouteRecordRaw[] = [
  // 使用 FrontendLayout 的页面
  {
    path: '/',
    component: () => import('@/layouts/FrontendLayout.vue'),
    children: [
      {
        path: '',
        name: 'Home',
        component: () => import('@/views/Home.vue'),
        meta: { title: '首页' },
      },
      {
        path: 'article',
        name: 'ArticleList',
        component: () => import('@/views/ArticleList.vue'),
        meta: { title: '文章列表' },
      },
      {
        path: 'article/:id',
        name: 'ArticleDetail',
        component: () => import('@/views/ArticleDetail.vue'),
        meta: { title: '文章详情' },
      },
      {
        path: 'categories',
        name: 'Categories',
        component: () => import('@/views/Categories.vue'),
        meta: { title: '分类总览' },
      },
      {
        path: 'category/:id',
        name: 'CategoryList',
        component: () => import('@/views/CategoryDetail.vue'),
        meta: { title: '分类' },
      },
      {
        path: 'tags',
        name: 'Tags',
        component: () => import('@/views/Tags.vue'),
        meta: { title: '标签总览' },
      },
      {
        path: 'tag/:id',
        name: 'TagList',
        component: () => import('@/views/TagDetail.vue'),
        meta: { title: '标签' },
      },
      {
        path: 'about',
        name: 'About',
        component: () => import('@/views/About.vue'),
        meta: { title: '关于' },
      },
      {
        path: 'moments',
        name: 'Moments',
        component: () => import('@/views/Moments.vue'),
        meta: { title: '说说' },
      },
    ],
  },
  // 独立页面（无布局）
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { title: '登录' },
  },
]
