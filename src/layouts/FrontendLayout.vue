<template>
  <div class="frontend-layout">
    <HeaderNav />
    <!-- 为固定导航栏预留空间(首页不需要) -->
    <div class="header-spacer" v-if="!isHomePage"></div>
    <main class="main-container" :class="{ 'no-padding': isHomePage }">
      <div class="content-wrapper" :class="{ 'full-width': isHomePage }">
        <router-view />
      </div>
    </main>
    <FooterSection />
    
    <!-- 返回顶部组件 -->
    <BackToTop />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import HeaderNav from '@/components/layout/Header.vue'
import FooterSection from '@/components/layout/Footer.vue'
import BackToTop from '@/components/common/BackToTop.vue'

const route = useRoute()
// 判断是否为首页
const isHomePage = computed(() => route.path === '/')
</script>

<style scoped>
.frontend-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* 为固定导航栏预留空间 */
.header-spacer {
  height: 64px;
  flex-shrink: 0;
}

.main-container {
  flex: 1;
  background: #f5f7fa;
  /* 移除上下内边距，让各页面自行控制间距 */
}

/* 首页特殊处理：无内边距 */
.main-container.no-padding {
  background: transparent;
}

.content-wrapper {
  /* 取消全局约束与左右内边距，交由各页面自行控制 */
  padding: 0;
  margin: 0;
  max-width: none;
  width: 100%;
}

/* 首页特殊处理：全宽 */
.content-wrapper.full-width {
  max-width: 100%;
  padding: 0;
  margin: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  /* 移除移动端左右内边距，保持一致性 */
  .content-wrapper {
    padding: 0;
  }
  
  .content-wrapper.full-width {
    padding: 0;
  }
}
</style>
