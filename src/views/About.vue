<template>
  <div class="about-page">
    <!-- 全屏英雄区 -->
    <div class="hero-section">
      <!-- 星空背景 -->
      <div class="stars-bg">
        <div class="stars-layer stars-small"></div>
        <div class="stars-layer stars-medium"></div>
        <div class="stars-layer stars-large"></div>
        
        <!-- 流星 -->
        <div class="shooting-star" style="--delay: 2s; --duration: 3s; --start-x: 20%; --start-y: 10%;"></div>
        <div class="shooting-star" style="--delay: 5s; --duration: 2.5s; --start-x: 60%; --start-y: 5%;"></div>
        <div class="shooting-star" style="--delay: 8s; --duration: 3.5s; --start-x: 80%; --start-y: 15%;"></div>
        
        <!-- 闪亮的星星 -->
        <div class="bright-star" style="--pos-x: 15%; --pos-y: 20%; --delay: 0s; --color: #93c5fd;"></div>
        <div class="bright-star" style="--pos-x: 85%; --pos-y: 30%; --delay: 0.5s; --color: #fbbf24;"></div>
        <div class="bright-star" style="--pos-x: 25%; --pos-y: 70%; --delay: 1s; --color: #c4b5fd;"></div>
        <div class="bright-star" style="--pos-x: 75%; --pos-y: 65%; --delay: 1.5s; --color: #fca5a5;"></div>
        <div class="bright-star" style="--pos-x: 50%; --pos-y: 15%; --delay: 2s; --color: #ffffff;"></div>
        <div class="bright-star" style="--pos-x: 90%; --pos-y: 80%; --delay: 2.5s; --color: #a5f3fc;"></div>
      </div>
      
      <div class="hero-content">
        <div class="avatar-wrapper">
          <img :src="profileData.avatar" alt="Avatar" class="hero-avatar" />
          <!-- 动态光效光环 -->
          <div class="light-ring">
            <div class="light-orb light-orb-1"></div>
          </div>
          <div class="light-ring light-ring-2">
            <div class="light-orb light-orb-2"></div>
          </div>
          <!-- 环绕星星 -->
          <div class="orbit-star orbit-star-1"></div>
          <div class="orbit-star orbit-star-2"></div>
          <div class="orbit-star orbit-star-3"></div>
          <div class="orbit-star orbit-star-4"></div>
          <div class="orbit-star orbit-star-5"></div>
        </div>
        <h1 class="hero-name">{{ profileData.name }}</h1>
        <p class="hero-title">{{ profileData.title }}</p>
        <div class="hero-social-links">
          <a v-for="link in socialLinks" 
             :key="link.name" 
             :href="link.url" 
             target="_blank" 
             class="hero-social-link"
             :title="link.name">
            <Icon :icon="link.icon" :width="24" />
          </a>
        </div>
        <div class="scroll-indicator">
          <Icon icon="mdi:chevron-down" :width="24" />
        </div>
      </div>
    </div>

    <!-- 个人介绍部分 -->
    <div class="about-content">
      <div id="profile" class="profile-section">
        <div class="container">
          <h2 class="section-title">
            <Icon icon="mdi:account" :width="28" /> 关于我
          </h2>
          <p class="bio">{{ profileData.bio }}</p>
          
          <!-- 个人标签 -->
          <div class="profile-tags">
            <span v-for="tag in profileData.tags" :key="tag" class="profile-tag">
              <Icon icon="mdi:tag" :width="14" /> {{ tag }}
            </span>
          </div>
          
          <div class="info-grid">
            <div class="info-item">
              <Icon icon="mdi:map-marker" :width="20" />
              <span>{{ profileData.location }}</span>
            </div>
            <div class="info-item">
              <Icon icon="mdi:email" :width="20" />
              <span>{{ profileData.email }}</span>
            </div>
            <div class="info-item">
              <Icon icon="mdi:school" :width="20" />
              <span>{{ profileData.status }}</span>
            </div>
            <div class="info-item">
              <Icon icon="mdi:school-outline" :width="20" />
              <span>{{ profileData.education }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 技术栈展示部分 -->
      <TechStack />

      <!-- 项目开发历程部分 -->
      <div id="timeline" class="timeline-section">
        <div class="container">
          <Timeline
            :items="developmentTimeline"
            title="📚 项目开发历程"
            description="记录博客系统从构思到上线的完整旅程"
            :reverse="true"
            :show-animation="true"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Icon } from '@iconify/vue'
import Timeline from '@/components/timeline/Timeline.vue'
import TechStack from '@/components/tech/TechStack.vue'
import type { TimelineItem } from '@/types/timeline'

// 个人资料数据
const profileData = ref({
  name: '张三',
  title: '全栈开发工程师',
  avatar: new URL('@/assets/avatar.jpg', import.meta.url).href,
  bio: '热爱编程,专注于Web开发领域。积极学习前后端技术,喜欢探索新技术,致力于通过代码创造价值。在学习中实践,在实践中成长。',
  location: '北京,中国',
  email: 'contact@example.com',
  status: '在校学生 / 积极求职中',
  education: '计算机科学与技术 学士',
  tags: ['前端开发', 'Vue.js', 'Node.js', '开源爱好者', '快速学习']
})

// 社交链接
const socialLinks = ref([
  { name: 'GitHub', icon: 'mdi:github', url: 'https://github.com' },
  { name: 'QQ', icon: 'ri:qq-fill', url: 'https://qm.qq.com/q/your-qq-link' },
  { name: '哔哩哔哩', icon: 'ri:bilibili-fill', url: 'https://space.bilibili.com/your-uid' },
  { name: 'WeChat', icon: 'ri:wechat-fill', url: '#' }
])

// 项目开发时间线数据
const developmentTimeline = ref<TimelineItem[]>([
  {
    id: 1,
    date: '2025-11-02',
    title: '博客系统 v1.0 正式完成',
    description: '经过一个月的全栈开发，个人博客系统所有核心功能开发完毕，实现了完整的前台展示和后台管理双模块系统。',
    type: 'success',
    icon: 'mdi:trophy',
    tags: ['里程碑', 'v1.0', '全栈开发'],
    highlight: true,
    content: '<p>v1.0 核心功能清单:</p><ul><li>📝 文章完整 CRUD（草稿/发布、置顶、Markdown 编辑）</li><li>🏷️ 分类和标签系统（N:N 关联）</li><li>💬 评论系统（嵌套回复、审核、点赞）</li><li>🖼️ 媒体库管理（上传、Sharp 图片处理、批量删除）</li><li>📊 管理后台控制台（ECharts 数据可视化）</li><li>🔐 JWT 认证与角色权限（admin/user）</li><li>🛡️ XSS/CSRF 防护（DOMPurify + Token）</li><li>📱 响应式设计（适配移动端和平板）</li><li>⚡ 自动导入（unplugin-auto-import）</li><li>🎨 圆形悬浮菜单与返回顶部</li></ul>',
  },
  {
    id: 2,
    date: '2025-10-30',
    title: '完善项目文档',
    description: '完成前后端完整文档编写，包含详细的技术栈说明、API 文档、部署指南和开发规范，项目更加规范和易于维护。',
    type: 'success',
    icon: 'mdi:file-document-edit-outline',
    tags: ['文档', '规范化'],
    highlight: true,
    content: '<p>文档体系完善:</p><ul><li>✅ 前端 README（技术栈、项目结构、路由说明、功能特性）</li><li>✅ 后端 README（API 文档、数据库设计、部署指南）</li><li>✅ DESIGN.md 完整设计文档（35+ 页）</li><li>✅ 数据库初始化脚本和示例数据</li><li>✅ 环境配置和开发规范说明</li><li>✅ 安全特性和注意事项详解</li></ul>',
  },
  {
    id: 3,
    date: '2025-10-15',
    title: '前端架构设计完成',
    description: '使用 Vue 3 + TypeScript + Vite 搭建现代化前端项目，完成路由配置、Pinia 状态管理、Axios 封装、自动导入和 Element Plus 集成。',
    type: 'primary',
    icon: 'mdi:vuejs',
    tags: ['前端架构', 'Vue 3', 'TypeScript'],
    highlight: true,
    content: '<p>前端技术栈选型与配置:</p><ul><li>⚡ Vue 3.3.8（Composition API + &lt;script setup&gt;）</li><li>🔷 TypeScript 5.2.2（严格模式 + 类型安全）</li><li>🎨 Element Plus 2.4.3（UI 组件库）</li><li>🎭 @iconify/vue + @element-plus/icons-vue</li><li>📦 Pinia 2.1.7（状态管理）</li><li>🛣️ Vue Router 4.2.5（前后台路由分离）</li><li>🌐 Axios 1.6.2（HTTP 客户端 + 拦截器）</li><li>🚀 Vite 5.0.2（快速构建 + HMR）</li><li>🔌 unplugin-auto-import（自动导入 Vue API）</li><li>🔧 unplugin-vue-components（按需导入组件）</li></ul>',
  },
  {
    id: 4,
    date: '2025-10-10',
    title: '后端架构设计完成',
    description: '设计并实现 Node.js + Express + Sequelize 后端架构，完成 MySQL 数据库设计、RESTful API 规范、中间件体系和错误处理机制。',
    type: 'primary',
    icon: 'mdi:server',
    tags: ['后端', 'Express', 'MySQL'],
    highlight: true,
    content: '<p>后端技术架构:</p><ul><li>🚀 Node.js 18+ + Express 4.x 框架</li><li>🗄️ MySQL 8.0 + Sequelize 6.x ORM</li><li>🔐 JWT + bcryptjs 认证加密</li><li>📡 RESTful API 设计（/api/v1）</li><li>✅ 统一响应格式（code/message/data）</li><li>❌ 全局错误处理中间件</li><li>📤 Multer 文件上传 + Sharp 图片处理</li><li>🔍 express-validator 数据验证</li><li>🌐 CORS 跨域配置</li><li>📊 7 张数据表设计（用户/文章/分类/标签/评论/媒体/关联表）</li></ul>',
  },
  {
    id: 5,
    date: '2025-10-01',
    title: '项目启动',
    description: '个人博客系统项目正式启动，学习 Vue 3 和 TypeScript 新技术，搭建前后端开发环境，配置 Git 版本控制，开启全栈开发之旅。',
    type: 'info',
    icon: 'mdi:rocket-launch-outline',
    tags: ['项目启动', '环境搭建'],
    highlight: true,
    content: '<p>项目启动工作:</p><ul><li>🎓 学习 Vue 3 Composition API 和 &lt;script setup&gt; 语法</li><li>📚 学习 TypeScript 类型系统和严格模式</li><li>🛠️ 安装 Node.js 18 + MySQL 8.0 + VS Code</li><li>📦 初始化前后端项目（npm init + vite create）</li><li>🔧 配置 Git 版本控制（.gitignore + GIT_GUIDE.md）</li><li>💡 确定项目方向（个人博客 + 后台管理）</li><li>🎯 设定学习目标（全栈开发能力提升）</li><li>📖 创建 README 和 DESIGN 文档</li></ul>',
  },
])
</script>

<style scoped>
.about-page {
  min-height: 100vh;
}

/* 全屏英雄区 */
.hero-section {
  height: 100vh;
  background: radial-gradient(ellipse at bottom, #1b2735 0%, #090a0f 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

/* 星空背景 */
.stars-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.stars-layer {
  position: absolute;
  width: 100%;
  height: 100%;
  background-repeat: repeat;
}

/* 小星星 */
.stars-small {
  background-image: 
    radial-gradient(2px 2px at 20px 30px, white, transparent),
    radial-gradient(2px 2px at 60px 70px, white, transparent),
    radial-gradient(1px 1px at 50px 50px, white, transparent),
    radial-gradient(1px 1px at 130px 80px, white, transparent),
    radial-gradient(2px 2px at 90px 10px, white, transparent);
  background-size: 200px 200px;
  animation: twinkle 4s ease-in-out infinite;
}

/* 中星星 */
.stars-medium {
  background-image:
    radial-gradient(3px 3px at 100px 50px, rgba(255, 255, 255, 0.8), transparent),
    radial-gradient(2px 2px at 150px 150px, rgba(255, 255, 255, 0.7), transparent),
    radial-gradient(3px 3px at 50px 120px, rgba(255, 255, 255, 0.8), transparent);
  background-size: 300px 300px;
  animation: twinkle 5s ease-in-out infinite 1s;
}

/* 大星星 */
.stars-large {
  background-image:
    radial-gradient(4px 4px at 80px 80px, rgba(147, 197, 253, 0.9), transparent),
    radial-gradient(3px 3px at 200px 150px, rgba(196, 181, 253, 0.8), transparent),
    radial-gradient(4px 4px at 140px 40px, rgba(254, 202, 202, 0.8), transparent);
  background-size: 400px 400px;
  animation: twinkle 6s ease-in-out infinite 2s;
}

@keyframes twinkle {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.3;
  }
}

/* 流星效果 */
.shooting-star {
  position: absolute;
  top: var(--start-y, 10%);
  left: var(--start-x, 50%);
  width: 2px;
  height: 2px;
  background: white;
  border-radius: 50%;
  box-shadow: 0 0 8px 2px rgba(255, 255, 255, 0.8);
  opacity: 0;
  animation: shooting var(--duration, 3s) ease-out infinite var(--delay, 0s);
  z-index: 1;
}

.shooting-star::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 100px;
  height: 1px;
  background: linear-gradient(to right, rgba(255, 255, 255, 0.8), transparent);
  transform-origin: right;
}

@keyframes shooting {
  0% {
    opacity: 0;
    transform: translate(0, 0) rotate(-45deg);
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 0.5;
  }
  100% {
    opacity: 0;
    transform: translate(-200px, 200px) rotate(-45deg);
  }
}

/* 闪亮的星星 */
.bright-star {
  position: absolute;
  top: var(--pos-y, 50%);
  left: var(--pos-x, 50%);
  width: 3px;
  height: 3px;
  background: var(--color, white);
  border-radius: 50%;
  box-shadow: 
    0 0 4px 1px var(--color, white),
    0 0 8px 2px var(--color, white),
    0 0 12px 3px rgba(255, 255, 255, 0.4);
  animation: naturalSparkle 4s ease-in-out infinite var(--delay, 0s);
  z-index: 2;
}

/* 柔和的光晕 */
.bright-star::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 20px;
  height: 20px;
  background: radial-gradient(circle, var(--color, white), transparent 70%);
  border-radius: 50%;
  opacity: 0;
  animation: glow 4s ease-in-out infinite var(--delay, 0s);
}

/* 自然闪烁动画 */
@keyframes naturalSparkle {
  0%, 100% {
    transform: scale(1);
    opacity: 0.6;
    filter: brightness(1);
  }
  25% {
    transform: scale(1.2);
    opacity: 1;
    filter: brightness(1.5);
  }
  50% {
    transform: scale(0.9);
    opacity: 0.4;
    filter: brightness(0.8);
  }
  75% {
    transform: scale(1.1);
    opacity: 0.9;
    filter: brightness(1.3);
  }
}

/* 光晕脉冲 */
@keyframes glow {
  0%, 100% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.8);
  }
  25% {
    opacity: 0.4;
    transform: translate(-50%, -50%) scale(1.2);
  }
  50% {
    opacity: 0.1;
    transform: translate(-50%, -50%) scale(0.9);
  }
  75% {
    opacity: 0.3;
    transform: translate(-50%, -50%) scale(1.1);
  }
}

.hero-content {
  text-align: center;
  z-index: 1;
  position: relative;
  animation: fadeInUp 1s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.avatar-wrapper {
  position: relative;
  display: inline-block;
  margin-bottom: 30px;
  animation: zoomIn 0.8s ease-out;
  transform-style: preserve-3d;
  perspective: 1000px;
}

@keyframes zoomIn {
  from {
    opacity: 0;
    transform: scale(0.5);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.hero-avatar {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  object-fit: cover;
  border: 5px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  position: relative;
  z-index: 2;
}

/* 动态光效光环 */
.light-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 240px;
  height: 240px;
  margin: -120px 0 0 -120px;
  border-radius: 50%;
  border: 2px solid rgba(147, 197, 253, 0.3);
  box-shadow: 
    inset 0 0 20px rgba(147, 197, 253, 0.2),
    0 0 20px rgba(147, 197, 253, 0.2);
  animation: pulseRing 4s ease-in-out infinite;
  z-index: 1;
}

.light-ring-2 {
  width: 260px;
  height: 260px;
  margin: -130px 0 0 -130px;
  border-color: rgba(196, 181, 253, 0.3);
  box-shadow: 
    inset 0 0 20px rgba(196, 181, 253, 0.2),
    0 0 20px rgba(196, 181, 253, 0.2);
  animation: pulseRing 4s ease-in-out infinite 2s;
}

/* 光环脉冲动画 */
@keyframes pulseRing {
  0%, 100% {
    opacity: 0.6;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.05);
  }
}

/* 光球 */
.light-orb {
  position: absolute;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(147, 197, 253, 1) 0%, rgba(147, 197, 253, 0.4) 50%, transparent 100%);
  box-shadow: 
    0 0 15px 5px rgba(147, 197, 253, 0.8),
    0 0 30px 10px rgba(147, 197, 253, 0.5),
    inset 0 0 10px rgba(255, 255, 255, 0.8);
  top: -8px;
  left: 50%;
  margin-left: -8px;
  animation: orbitLight 6s linear infinite;
  z-index: 3;
}

/* 光球拖尾效果 */
.light-orb::before {
  content: '';
  position: absolute;
  width: 60px;
  height: 4px;
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(147, 197, 253, 0.6) 50%, 
    rgba(147, 197, 253, 1) 100%);
  border-radius: 2px;
  top: 50%;
  right: 100%;
  margin-top: -2px;
  filter: blur(2px);
  opacity: 0.8;
}

.light-orb-2 {
  background: radial-gradient(circle, rgba(196, 181, 253, 1) 0%, rgba(196, 181, 253, 0.4) 50%, transparent 100%);
  box-shadow: 
    0 0 15px 5px rgba(196, 181, 253, 0.8),
    0 0 30px 10px rgba(196, 181, 253, 0.5),
    inset 0 0 10px rgba(255, 255, 255, 0.8);
  animation: orbitLight 8s linear infinite reverse;
}

.light-orb-2::before {
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(196, 181, 253, 0.6) 50%, 
    rgba(196, 181, 253, 1) 100%);
}

/* 光球轨道动画 */
@keyframes orbitLight {
  from {
    transform: rotate(0deg) translateX(120px) rotate(0deg);
  }
  to {
    transform: rotate(360deg) translateX(120px) rotate(-360deg);
  }
}

/* 环绕星星 - 3D效果 */
.orbit-star {
  position: absolute;
  width: 10px;
  height: 10px;
  background: white;
  border-radius: 50%;
  box-shadow: 
    0 0 8px 3px rgba(255, 255, 255, 0.8),
    0 0 16px 6px rgba(255, 255, 255, 0.5);
  top: 50%;
  left: 50%;
  margin: -5px 0 0 -5px;
  will-change: transform, opacity, filter;
}

/* 不同的星星配置 */
.orbit-star-1 {
  animation: orbit3D-1 8s linear infinite;
  background: radial-gradient(circle, rgba(147, 197, 253, 1), rgba(147, 197, 253, 0.6));
  box-shadow: 
    0 0 8px 3px rgba(147, 197, 253, 0.9),
    0 0 16px 6px rgba(147, 197, 253, 0.6);
}

.orbit-star-2 {
  animation: orbit3D-2 10s linear infinite;
  background: radial-gradient(circle, rgba(251, 191, 36, 1), rgba(251, 191, 36, 0.6));
  box-shadow: 
    0 0 8px 3px rgba(251, 191, 36, 0.9),
    0 0 16px 6px rgba(251, 191, 36, 0.6);
}

.orbit-star-3 {
  animation: orbit3D-3 12s linear infinite;
  background: radial-gradient(circle, rgba(196, 181, 253, 1), rgba(196, 181, 253, 0.6));
  box-shadow: 
    0 0 8px 3px rgba(196, 181, 253, 0.9),
    0 0 16px 6px rgba(196, 181, 253, 0.6);
}

.orbit-star-4 {
  animation: orbit3D-4 9s linear infinite;
  background: radial-gradient(circle, rgba(252, 165, 165, 1), rgba(252, 165, 165, 0.6));
  box-shadow: 
    0 0 8px 3px rgba(252, 165, 165, 0.9),
    0 0 16px 6px rgba(252, 165, 165, 0.6);
}

.orbit-star-5 {
  animation: orbit3D-5 11s linear infinite;
  background: radial-gradient(circle, rgba(165, 243, 252, 1), rgba(165, 243, 252, 0.6));
  box-shadow: 
    0 0 8px 3px rgba(165, 243, 252, 0.9),
    0 0 16px 6px rgba(165, 243, 252, 0.6);
}

/* 3D椭圆轨道动画 - 多层次错开 */
/* 轨道 1: 水平轨道 */
@keyframes orbit3D-1 {
  0% {
    transform: rotateX(0deg) rotateY(0deg) translateX(140px) rotateY(0deg);
    opacity: 1;
    filter: brightness(1.2) blur(0px);
    z-index: 10;
  }
  25% {
    transform: rotateX(0deg) rotateY(90deg) translateX(140px) rotateY(-90deg);
    opacity: 0.4;
    filter: brightness(0.6) blur(1px);
    z-index: 0;
  }
  50% {
    transform: rotateX(0deg) rotateY(180deg) translateX(140px) rotateY(-180deg);
    opacity: 0.3;
    filter: brightness(0.4) blur(1.5px);
    z-index: 0;
  }
  75% {
    transform: rotateX(0deg) rotateY(270deg) translateX(140px) rotateY(-270deg);
    opacity: 0.4;
    filter: brightness(0.6) blur(1px);
    z-index: 0;
  }
  100% {
    transform: rotateX(0deg) rotateY(360deg) translateX(140px) rotateY(-360deg);
    opacity: 1;
    filter: brightness(1.2) blur(0px);
    z-index: 10;
  }
}

/* 轨道 2: 倒斜 30° */
@keyframes orbit3D-2 {
  0% {
    transform: rotateX(30deg) rotateZ(15deg) rotateY(72deg) translateX(135px) rotateY(-72deg);
    opacity: 0.9;
    filter: brightness(1.1) blur(0px);
    z-index: 8;
  }
  25% {
    transform: rotateX(30deg) rotateZ(15deg) rotateY(162deg) translateX(135px) rotateY(-162deg);
    opacity: 0.4;
    filter: brightness(0.5) blur(1.3px);
    z-index: 0;
  }
  50% {
    transform: rotateX(30deg) rotateZ(15deg) rotateY(252deg) translateX(135px) rotateY(-252deg);
    opacity: 0.35;
    filter: brightness(0.4) blur(1.5px);
    z-index: 0;
  }
  75% {
    transform: rotateX(30deg) rotateZ(15deg) rotateY(342deg) translateX(135px) rotateY(-342deg);
    opacity: 0.7;
    filter: brightness(0.9) blur(0.5px);
    z-index: 5;
  }
  100% {
    transform: rotateX(30deg) rotateZ(15deg) rotateY(432deg) translateX(135px) rotateY(-432deg);
    opacity: 0.9;
    filter: brightness(1.1) blur(0px);
    z-index: 8;
  }
}

/* 轨道 3: 正斜 45° */
@keyframes orbit3D-3 {
  0% {
    transform: rotateX(-45deg) rotateZ(-20deg) rotateY(144deg) translateX(145px) rotateY(-144deg);
    opacity: 0.5;
    filter: brightness(0.6) blur(1.2px);
    z-index: 1;
  }
  25% {
    transform: rotateX(-45deg) rotateZ(-20deg) rotateY(234deg) translateX(145px) rotateY(-234deg);
    opacity: 0.8;
    filter: brightness(1) blur(0.5px);
    z-index: 6;
  }
  50% {
    transform: rotateX(-45deg) rotateZ(-20deg) rotateY(324deg) translateX(145px) rotateY(-324deg);
    opacity: 1;
    filter: brightness(1.2) blur(0px);
    z-index: 10;
  }
  75% {
    transform: rotateX(-45deg) rotateZ(-20deg) rotateY(414deg) translateX(145px) rotateY(-414deg);
    opacity: 0.6;
    filter: brightness(0.7) blur(1px);
    z-index: 3;
  }
  100% {
    transform: rotateX(-45deg) rotateZ(-20deg) rotateY(504deg) translateX(145px) rotateY(-504deg);
    opacity: 0.5;
    filter: brightness(0.6) blur(1.2px);
    z-index: 1;
  }
}

/* 轨道 4: 垂直斜角 60° */
@keyframes orbit3D-4 {
  0% {
    transform: rotateX(60deg) rotateZ(10deg) rotateY(216deg) translateX(138px) rotateY(-216deg);
    opacity: 0.4;
    filter: brightness(0.5) blur(1.4px);
    z-index: 0;
  }
  25% {
    transform: rotateX(60deg) rotateZ(10deg) rotateY(306deg) translateX(138px) rotateY(-306deg);
    opacity: 0.95;
    filter: brightness(1.15) blur(0.2px);
    z-index: 9;
  }
  50% {
    transform: rotateX(60deg) rotateZ(10deg) rotateY(396deg) translateX(138px) rotateY(-396deg);
    opacity: 0.7;
    filter: brightness(0.8) blur(0.8px);
    z-index: 4;
  }
  75% {
    transform: rotateX(60deg) rotateZ(10deg) rotateY(486deg) translateX(138px) rotateY(-486deg);
    opacity: 0.35;
    filter: brightness(0.45) blur(1.5px);
    z-index: 0;
  }
  100% {
    transform: rotateX(60deg) rotateZ(10deg) rotateY(576deg) translateX(138px) rotateY(-576deg);
    opacity: 0.4;
    filter: brightness(0.5) blur(1.4px);
    z-index: 0;
  }
}

/* 轨道 5: 复合斜角 -35° */
@keyframes orbit3D-5 {
  0% {
    transform: rotateX(-35deg) rotateZ(25deg) rotateY(288deg) translateX(142px) rotateY(-288deg);
    opacity: 0.6;
    filter: brightness(0.7) blur(1px);
    z-index: 2;
  }
  25% {
    transform: rotateX(-35deg) rotateZ(25deg) rotateY(378deg) translateX(142px) rotateY(-378deg);
    opacity: 0.4;
    filter: brightness(0.5) blur(1.4px);
    z-index: 0;
  }
  50% {
    transform: rotateX(-35deg) rotateZ(25deg) rotateY(468deg) translateX(142px) rotateY(-468deg);
    opacity: 0.85;
    filter: brightness(1.05) blur(0.3px);
    z-index: 7;
  }
  75% {
    transform: rotateX(-35deg) rotateZ(25deg) rotateY(558deg) translateX(142px) rotateY(-558deg);
    opacity: 1;
    filter: brightness(1.2) blur(0px);
    z-index: 10;
  }
  100% {
    transform: rotateX(-35deg) rotateZ(25deg) rotateY(648deg) translateX(142px) rotateY(-648deg);
    opacity: 0.6;
    filter: brightness(0.7) blur(1px);
    z-index: 2;
  }
}

.hero-name {
  font-size: 3.5rem;
  font-weight: 700;
  color: white;
  margin-bottom: 10px;
  text-shadow: 2px 4px 8px rgba(0, 0, 0, 0.2);
  animation: fadeInUp 1s ease-out 0.2s both;
}

.hero-title {
  font-size: 1.5rem;
  color: rgba(255, 255, 255, 0.95);
  margin-bottom: 40px;
  font-weight: 300;
  animation: fadeInUp 1s ease-out 0.3s both;
}

.hero-social-links {
  display: flex;
  gap: 20px;
  justify-content: center;
  margin-bottom: 60px;
  animation: fadeInUp 1s ease-out 0.4s both;
}

.hero-social-link {
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  color: white;
  border-radius: 50%;
  transition: all 0.3s;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.hero-social-link:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-5px) scale(1.1);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.scroll-indicator {
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  color: white;
  font-size: 24px;
  animation: bounce 2s infinite;
  cursor: pointer;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateX(-50%) translateY(0);
  }
  40% {
    transform: translateX(-50%) translateY(-10px);
  }
  60% {
    transform: translateX(-50%) translateY(-5px);
  }
}

/* 内容区域 */
.about-content {
  background: linear-gradient(to bottom, 
    #1b2735 0%,
    #3d5a7a 15%,
    #7aa3c7 35%,
    #a8c9e8 55%,
    #d0e7f9 75%,
    #e8f4fd 100%);
  padding-top: 0;
  position: relative;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* 个人介绍部分 */
.profile-section {
  padding: 80px 0;
  background: transparent;
  margin-bottom: 0;
}

.section-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 20px;
  text-align: center;
  color: rgba(255, 255, 255, 0.95);
  animation: fadeInUp 0.8s ease-out;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3), 0 4px 16px rgba(0, 0, 0, 0.2);
}

.section-title i {
  margin-right: 10px;
  color: #667eea;
}

.bio {
  font-size: 1.25rem;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.9;
  margin-bottom: 30px;
  text-align: center;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
  animation: fadeInUp 0.8s ease-out 0.1s both;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(0, 0, 0, 0.2);
}

/* 个人标签 */
.profile-tags {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
  margin-bottom: 40px;
  max-width: 900px;
  margin-left: auto;
  margin-right: auto;
  animation: fadeInUp 0.8s ease-out 0.2s both;
}

.profile-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 18px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  color: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  border: 1px solid rgba(255, 255, 255, 0.4);
  transition: all 0.3s ease;
  cursor: default;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.profile-tag:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.6);
}

.profile-tag i {
  font-size: 0.8rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
  max-width: 900px;
  margin: 0 auto;
  animation: fadeInUp 0.8s ease-out 0.3s both;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 15px;
  color: rgba(255, 255, 255, 0.95);
  font-size: 1.05rem;
  padding: 15px 20px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(12px);
  border-radius: 12px;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.3);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.info-item:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: translateX(5px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  border-color: rgba(255, 255, 255, 0.5);
}

.info-item i {
  color: rgba(255, 255, 255, 0.9);
  width: 24px;
  font-size: 20px;
  flex-shrink: 0;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

/* 响应式设计 */
@media (max-width: 768px) {
  .hero-avatar {
    width: 150px;
    height: 150px;
  }

  .hero-name {
    font-size: 2.5rem;
  }

  .hero-title {
    font-size: 1.2rem;
  }

  .hero-social-links {
    gap: 15px;
  }

  .hero-social-link {
    width: 45px;
    height: 45px;
  }

  .profile-section {
    padding: 60px 20px;
  }

  .bio {
    font-size: 1.1rem;
    padding: 0 20px;
  }

  .info-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .info-item {
    font-size: 0.95rem;
  }

  .section-title {
    font-size: 1.75rem;
  }
}

/* 时间线部分 */
.timeline-section {
  padding: 80px 0;
  background: transparent;
  min-height: 600px;
}

@media (max-width: 768px) {
  .timeline-section {
    padding: 60px 0;
  }
}
</style>