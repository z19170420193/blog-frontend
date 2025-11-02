<template>
  <footer class="blog-footer">
    <!-- 主要内容区 - 三栏布局 -->
    <div class="footer-main">
      <div class="footer-container">
        <!-- 第一栏:关于我们 -->
        <div class="footer-column">
          <h4 class="column-title">
            <Icon icon="lucide:info" :width="18" />
            关于我们
          </h4>
          <p class="about-description">
            记录技术成长,分享编程心得。专注于Web开发技术,帮助更多开发者成长。
          </p>
          <!-- 技术栈图标 -->
          <div class="tech-stack">
            <a 
              v-for="tech in techStack" 
              :key="tech.name"
              :href="tech.url" 
              target="_blank"
              :title="tech.name"
              class="tech-icon"
            >
              <Icon :icon="tech.icon" :width="24" />
            </a>
          </div>
        </div>

        <!-- 第二栏:环形菜单 -->
        <div class="footer-column footer-column-center">
          <CircularMenu />
        </div>

        <!-- 第三栏:联系方式 & 社交媒体 -->
        <div class="footer-column">
          <h4 class="column-title">
            <Icon icon="lucide:contact" :width="18" />
            联系我们
          </h4>
          <div class="contact-info">
            <div class="contact-item">
              <Icon icon="lucide:mail" :width="18" />
              <span>contact@example.com</span>
            </div>
            <div class="contact-item">
              <Icon icon="lucide:map-pin" :width="18" />
              <span>北京, 中国</span>
            </div>
          </div>

          <!-- 社交媒体链接 -->
          <div class="social-section">
            <h5 class="social-title">关注我们</h5>
            <div class="social-links">
              <a 
                v-for="social in socialLinks" 
                :key="social.name"
                :href="social.url" 
                target="_blank"
                :title="social.name"
                class="social-link"
              >
                <Icon :icon="social.icon" :width="20" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部版权信息 -->
    <div class="footer-bottom">
      <div class="footer-container">
        <div class="footer-bottom-content">
          <!-- 版权信息 -->
          <div class="copyright">
            <Icon icon="lucide:heart" :width="14" />
            <span>Made with Love by <strong>我的博客</strong></span>
          </div>
          
          <!-- 分隔线 -->
          <div class="divider"></div>
          
          <!-- 元信息 -->
          <div class="footer-meta">
            <span class="meta-item">
              <Icon icon="lucide:copyright" :width="14" />
              2024 All Rights Reserved
            </span>
            <span class="meta-divider">·</span>
            <a href="https://beian.miit.gov.cn/" target="_blank" class="meta-item meta-link">
              <Icon icon="lucide:shield-check" :width="14" />
              京ICP备xxxxxxxx号
            </a>
            <span class="meta-divider">·</span>
            <span class="meta-item">
              <Icon icon="lucide:zap" :width="14" />
              Powered by Vue 3
            </span>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Icon } from '@iconify/vue'
import CircularMenu from './CircularMenu.vue'

// 技术栈(图标展示)
const techStack = ref([
  { name: 'Vue 3', icon: 'logos:vue', url: 'https://vuejs.org' },
  { name: 'TypeScript', icon: 'logos:typescript-icon', url: 'https://www.typescriptlang.org' },
  { name: 'Vite', icon: 'logos:vitejs', url: 'https://vitejs.dev' },
  { name: 'Element Plus', icon: 'logos:element', url: 'https://element-plus.org' },
  { name: 'Pinia', icon: 'logos:pinia', url: 'https://pinia.vuejs.org' },
  { name: 'Node.js', icon: 'logos:nodejs-icon', url: 'https://nodejs.org' },
])

// 社交媒体链接
const socialLinks = ref([
  { name: 'GitHub', icon: 'mdi:github', url: 'https://github.com' },
  { name: 'Gitee', icon: 'simple-icons:gitee', url: 'https://gitee.com' },
  { name: 'CSDN', icon: 'simple-icons:csdn', url: 'https://blog.csdn.net' },
  { name: 'Bilibili', icon: 'ri:bilibili-fill', url: 'https://space.bilibili.com' },
  { name: 'QQ', icon: 'ri:qq-fill', url: 'https://qm.qq.com' },
  { name: 'WeChat', icon: 'ri:wechat-fill', url: '#' },
])
</script>

<style scoped lang="scss">
.blog-footer {
  position: relative;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: rgba(255, 255, 255, 0.95);
  margin-top: auto;
  overflow: hidden;

  // 背景装饰
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 70%, rgba(255, 255, 255, 0.08) 0%, transparent 50%);
    pointer-events: none;
  }
}

/* ==================== 主要内容区 ==================== */
.footer-main {
  position: relative;
  padding: 60px 0 40px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
}

.footer-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 60px;
}

/* ==================== 栏目通用样式 ==================== */
.footer-column {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.about-description {
  font-size: 14px;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.85);
  margin: 0 0 16px 0;
}

/* 技术栈图标 */
.tech-stack {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.tech-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  opacity: 0.9;

  &:hover {
    transform: translateY(-4px) scale(1.15);
    opacity: 1;
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
  }
}

/* ==================== 栏目标题 ==================== */
.column-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
  color: #fff;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

/* 中间栏居中对齐 */
.footer-column-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ==================== 联系信息 ==================== */
.contact-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 4px;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 10px;
  color: rgba(255, 255, 255, 0.85);
  font-size: 14px;
  transition: all 0.3s;

  &:hover {
    color: #fff;
    transform: translateX(4px);
  }
}

/* 社交媒体区域 */
.social-section {
  margin-top: 12px;
}

.social-title {
  font-size: 15px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  margin: 0 0 12px 0;
}

.social-links {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  max-width: 156px;
}

.social-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  color: #fff;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(255, 255, 255, 0.2);

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-4px) scale(1.05);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
    border-color: rgba(255, 255, 255, 0.4);
  }
}

/* ==================== 底部版权区 ==================== */
 .footer-bottom {
  position: relative;
  padding: 24px 0;
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);

  // 覆盖上方 .footer-container 的三栏栅格，避免子元素落在左侧 1/3
  .footer-container {
    display: block; // 不使用 grid
  }
}

.footer-bottom-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.copyright {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  
  strong {
    font-weight: 600;
    color: #fff;
  }
  
  .iconify {
    color: #ff6b9d;
    animation: heartbeat 1.5s ease-in-out infinite;
  }
}

.divider {
  width: 60px;
  height: 1px;
  background: linear-gradient(
    to right,
    transparent,
    rgba(255, 255, 255, 0.3),
    transparent
  );
}

.footer-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  flex-wrap: wrap;
  justify-content: center;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  color: rgba(255, 255, 255, 0.75);
  
  &.meta-link {
    text-decoration: none;
    transition: all 0.3s;
    
    &:hover {
      color: #fff;
      transform: translateY(-1px);
    }
  }
}

.meta-divider {
  color: rgba(255, 255, 255, 0.4);
  font-weight: 300;
}

/* 心跳动画 */
@keyframes heartbeat {
  0%, 100% {
    transform: scale(1);
  }
  10%, 30% {
    transform: scale(1.1);
  }
  20%, 40% {
    transform: scale(1.05);
  }
}

/* ==================== 响应式设计 ==================== */
@media (max-width: 1024px) {
  .footer-container {
    grid-template-columns: 1fr;
    gap: 48px;
  }
}

@media (max-width: 768px) {
  .footer-main {
    padding: 40px 0 30px;
  }

  .footer-container {
    padding: 0 16px;
    gap: 40px;
  }

  .footer-bottom-content {
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }

  .footer-meta {
    justify-content: center;
  }

  .column-title {
    font-size: 16px;
  }
}

@media (max-width: 480px) {
  .footer-main {
    padding: 32px 0 24px;
  }

  .footer-container {
    gap: 32px;
  }

  .column-title {
    font-size: 15px;
  }

  .link-item,
  .contact-item {
    font-size: 13px;
  }

  .copyright,
  .meta-link {
    font-size: 12px;
  }

  .social-links {
    gap: 8px;
  }

  .social-link {
    width: 36px;
    height: 36px;
  }
}
</style>