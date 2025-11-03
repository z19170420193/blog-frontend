import type { RouteRecordRaw } from 'vue-router'

/**
 * 后台路由
 */
export const adminRoutes: RouteRecordRaw[] = [
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('@/views/admin/Layout.vue'),
    meta: { title: '管理后台', requiresAuth: true },
    redirect: '/admin/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/admin/Dashboard.vue'),
        meta: { title: '控制台', requiresAuth: true },
      },
      {
        path: 'articles',
        name: 'Articles',
        component: () => import('@/views/admin/ArticleList.vue'),
        meta: { title: '文章管理', requiresAuth: true },
      },
      {
        path: 'articles/create',
        name: 'ArticleCreate',
        component: () => import('@/views/admin/ArticleEdit.vue'),
        meta: { title: '创建文章', requiresAuth: true },
      },
      {
        path: 'articles/edit/:id',
        name: 'ArticleEdit',
        component: () => import('@/views/admin/ArticleEdit.vue'),
        meta: { title: '编辑文章', requiresAuth: true },
      },
      {
        path: 'categories',
        name: 'CategoryManage',
        component: () => import('@/views/admin/CategoryManagement.vue'),
        meta: { title: '分类管理', requiresAuth: true },
      },
      {
        path: 'tags',
        name: 'TagManage',
        component: () => import('@/views/admin/TagManage.vue'),
        meta: { title: '标签管理', requiresAuth: true },
      },
      {
        path: 'comments',
        name: 'CommentManage',
        component: () => import('@/views/admin/CommentManage.vue'),
        meta: { title: '评论管理', requiresAuth: true },
      },
      {
        path: 'media',
        name: 'MediaManage',
        component: () => import('@/views/admin/MediaManage.vue'),
        meta: { title: '媒体管理', requiresAuth: true },
      },
      {
        path: 'moments',
        name: 'MomentManage',
        component: () => import('@/views/admin/MomentManage.vue'),
        meta: { title: '说说管理', requiresAuth: true },
      },
      {
        path: 'projects',
        name: 'ProjectManage',
        component: () => import('@/views/admin/ProjectManage.vue'),
        meta: { title: '项目管理', requiresAuth: true },
      },
      {
        path: 'projects/create',
        name: 'ProjectCreate',
        component: () => import('@/views/admin/ProjectEdit.vue'),
        meta: { title: '创建项目', requiresAuth: true },
      },
      {
        path: 'projects/:id/edit',
        name: 'ProjectEdit',
        component: () => import('@/views/admin/ProjectEdit.vue'),
        meta: { title: '编辑项目', requiresAuth: true },
      },
      {
        path: 'messages',
        name: 'MessageManage',
        component: () => import('@/views/admin/MessageManage.vue'),
        meta: { title: '留言管理', requiresAuth: true },
      },
      // {
      //   path: 'profile',
      //   name: 'Profile',
      //   component: () => import('@/views/admin/Profile.vue'),
      //   meta: { title: '个人设置', requiresAuth: true },
      // },
    ],
  },
]
