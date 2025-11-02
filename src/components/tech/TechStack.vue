<template>
  <div class="tech-stack-section">
    <div class="container">
      <!-- 标题区 -->
      <div class="section-header">
        <h2 class="section-title">
          <Icon icon="mdi:code-braces" :width="32" />
          技术栈 & 工具链
        </h2>
        <p class="section-subtitle">Tech Stack & Tools</p>
      </div>

      <!-- 技术分类展示 -->
      <div class="tech-categories">
        <!-- 前端开发 -->
        <div class="tech-category">
          <h3 class="category-title">
            <Icon icon="mdi:laptop" :width="24" />
            前端开发
          </h3>
          <div class="tech-grid">
            <template v-for="tech in techStack.frontend" :key="tech.name">
              <!-- 有项目的技术 - 带弹窗 -->
              <el-popover
                v-if="tech.projects && tech.projects.length"
                placement="top"
                :width="340"
                trigger="hover"
                :show-after="200"
              >
                <template #reference>
                  <div 
                    class="tech-card has-projects"
                    :style="{ '--tech-color': tech.color }"
                  >
                    <div class="tech-icon">
                      <Icon :icon="tech.icon" :width="32" />
                    </div>
                    <h4 class="tech-name">{{ tech.name }}</h4>
                    <div class="tech-level">
                      <div class="level-bar">
                        <div 
                          class="level-fill" 
                          :style="{ width: tech.level + '%' }"
                        ></div>
                      </div>
                      <span class="level-text">{{ tech.level }}%</span>
                    </div>
                    <p class="tech-desc">{{ tech.description }}</p>
                    <div class="hover-hint">
                      <Icon icon="mdi:information-outline" :width="16" />
                      悬停查看项目
                    </div>
                  </div>
                </template>
                
                <template #default>
                  <div class="popover-content">
                    <h4 class="popover-title">
                      <Icon :icon="tech.icon" :width="22" />
                      {{ tech.name }} 项目经验
                    </h4>
                    <div class="projects-list">
                      <div 
                        v-for="project in tech.projects" 
                        :key="project.name" 
                        class="project-item"
                      >
                        <Icon icon="mdi:folder-open" :width="18" class="project-icon" />
                        <div class="project-info">
                          <div class="project-name">{{ project.name }}</div>
                          <div class="project-meta">
                            <span class="project-role">{{ project.role }}</span>
                            <span v-if="project.period" class="project-period">{{ project.period }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </template>
              </el-popover>
              
              <!-- 无项目的技术 - 普通卡片 -->
              <div 
                v-else
                class="tech-card"
                :style="{ '--tech-color': tech.color }"
              >
                <div class="tech-icon">
                  <Icon :icon="tech.icon" :width="32" />
                </div>
                <h4 class="tech-name">{{ tech.name }}</h4>
                <div class="tech-level">
                  <div class="level-bar">
                    <div 
                      class="level-fill" 
                      :style="{ width: tech.level + '%' }"
                    ></div>
                  </div>
                  <span class="level-text">{{ tech.level }}%</span>
                </div>
                <p class="tech-desc">{{ tech.description }}</p>
              </div>
            </template>
          </div>
        </div>

        <!-- 后端开发 -->
        <div class="tech-category">
          <h3 class="category-title">
            <Icon icon="mdi:server" :width="24" />
            后端开发
          </h3>
          <div class="tech-grid">
            <template v-for="tech in techStack.backend" :key="tech.name">
              <el-popover
                v-if="tech.projects && tech.projects.length"
                placement="top"
                :width="340"
                trigger="hover"
                :show-after="200"
              >
                <template #reference>
                  <div 
                    class="tech-card has-projects"
                    :style="{ '--tech-color': tech.color }"
                  >
                    <div class="tech-icon">
                      <Icon :icon="tech.icon" :width="32" />
                    </div>
                    <h4 class="tech-name">{{ tech.name }}</h4>
                    <div class="tech-level">
                      <div class="level-bar">
                        <div 
                          class="level-fill" 
                          :style="{ width: tech.level + '%' }"
                        ></div>
                      </div>
                      <span class="level-text">{{ tech.level }}%</span>
                    </div>
                    <p class="tech-desc">{{ tech.description }}</p>
                    <div class="hover-hint">
                      <Icon icon="mdi:information-outline" :width="16" />
                      悬停查看项目
                    </div>
                  </div>
                </template>
                
                <template #default>
                  <div class="popover-content">
                    <h4 class="popover-title">
                      <Icon :icon="tech.icon" :width="22" />
                      {{ tech.name }} 项目经验
                    </h4>
                    <div class="projects-list">
                      <div 
                        v-for="project in tech.projects" 
                        :key="project.name" 
                        class="project-item"
                      >
                        <Icon icon="mdi:folder-open" :width="18" class="project-icon" />
                        <div class="project-info">
                          <div class="project-name">{{ project.name }}</div>
                          <div class="project-meta">
                            <span class="project-role">{{ project.role }}</span>
                            <span v-if="project.period" class="project-period">{{ project.period }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </template>
              </el-popover>
              
              <div 
                v-else
                class="tech-card"
                :style="{ '--tech-color': tech.color }"
              >
                <div class="tech-icon">
                  <Icon :icon="tech.icon" :width="32" />
                </div>
                <h4 class="tech-name">{{ tech.name }}</h4>
                <div class="tech-level">
                  <div class="level-bar">
                    <div 
                      class="level-fill" 
                      :style="{ width: tech.level + '%' }"
                    ></div>
                  </div>
                  <span class="level-text">{{ tech.level }}%</span>
                </div>
                <p class="tech-desc">{{ tech.description }}</p>
              </div>
            </template>
          </div>
        </div>

        <!-- 工具 & 其他 -->
        <div class="tech-category">
          <h3 class="category-title">
            <Icon icon="mdi:tools" :width="24" />
            工具 & 其他
          </h3>
          <div class="tech-grid">
            <template v-for="tech in techStack.tools" :key="tech.name">
              <el-popover
                v-if="tech.projects && tech.projects.length"
                placement="top"
                :width="340"
                trigger="hover"
                :show-after="200"
              >
                <template #reference>
                  <div 
                    class="tech-card has-projects"
                    :style="{ '--tech-color': tech.color }"
                  >
                    <div class="tech-icon">
                      <Icon :icon="tech.icon" :width="32" />
                    </div>
                    <h4 class="tech-name">{{ tech.name }}</h4>
                    <div class="tech-level">
                      <div class="level-bar">
                        <div 
                          class="level-fill" 
                          :style="{ width: tech.level + '%' }"
                        ></div>
                      </div>
                      <span class="level-text">{{ tech.level }}%</span>
                    </div>
                    <p class="tech-desc">{{ tech.description }}</p>
                    <div class="hover-hint">
                      <Icon icon="mdi:information-outline" :width="16" />
                      悬停查看项目
                    </div>
                  </div>
                </template>
                
                <template #default>
                  <div class="popover-content">
                    <h4 class="popover-title">
                      <Icon :icon="tech.icon" :width="22" />
                      {{ tech.name }} 项目经验
                    </h4>
                    <div class="projects-list">
                      <div 
                        v-for="project in tech.projects" 
                        :key="project.name" 
                        class="project-item"
                      >
                        <Icon icon="mdi:folder-open" :width="18" class="project-icon" />
                        <div class="project-info">
                          <div class="project-name">{{ project.name }}</div>
                          <div class="project-meta">
                            <span class="project-role">{{ project.role }}</span>
                            <span v-if="project.period" class="project-period">{{ project.period }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </template>
              </el-popover>
              
              <div 
                v-else
                class="tech-card"
                :style="{ '--tech-color': tech.color }"
              >
                <div class="tech-icon">
                  <Icon :icon="tech.icon" :width="32" />
                </div>
                <h4 class="tech-name">{{ tech.name }}</h4>
                <div class="tech-level">
                  <div class="level-bar">
                    <div 
                      class="level-fill" 
                      :style="{ width: tech.level + '%' }"
                    ></div>
                  </div>
                  <span class="level-text">{{ tech.level }}%</span>
                </div>
                <p class="tech-desc">{{ tech.description }}</p>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Icon } from '@iconify/vue'

interface Project {
  name: string
  role: string
  period?: string
}

interface Tech {
  name: string
  icon: string
  level: number
  color: string
  description: string
  projects?: Project[]
}

interface TechStack {
  frontend: Tech[]
  backend: Tech[]
  tools: Tech[]
}

const techStack = ref<TechStack>({
  frontend: [
    {
      name: 'Vue 3',
      icon: 'logos:vue',
      level: 90,
      color: '#42b883',
      description: '组合式API与响应式系统',
      projects: [
        { name: '个人博客系统', role: '全栈开发', period: '2024.10 - 2024.11' },
      ]
    },
    {
      name: 'TypeScript',
      icon: 'logos:typescript-icon',
      level: 85,
      color: '#3178c6',
      description: '类型安全的JavaScript',
      projects: [
        { name: '个人博客系统', role: '全栈开发', period: '2024.10 - 2024.11' },
      ]
    },
    {
      name: 'Element Plus',
      icon: 'logos:element',
      level: 90,
      color: '#409eff',
      description: 'Vue 3 组件库'
    },
    {
      name: 'Vite',
      icon: 'logos:vitejs',
      level: 85,
      color: '#646cff',
      description: '下一代前端构建工具'
    },
    {
      name: 'Pinia',
      icon: 'logos:pinia',
      level: 88,
      color: '#ffd859',
      description: 'Vue 状态管理'
    },
    {
      name: 'CSS3/SCSS',
      icon: 'logos:css-3',
      level: 92,
      color: '#1572b6',
      description: '现代化样式设计'
    }
  ],
  backend: [
    {
      name: 'Node.js',
      icon: 'logos:nodejs-icon',
      level: 80,
      color: '#339933',
      description: 'JavaScript 运行时',
      projects: [
        { name: '博客API服务', role: '后端开发', period: '2024.10 - 2024.11' },
      ]
    },
    {
      name: 'Express',
      icon: 'simple-icons:express',
      level: 78,
      color: '#000000',
      description: 'Web 应用框架'
    },
    {
      name: 'MySQL',
      icon: 'logos:mysql',
      level: 75,
      color: '#4479a1',
      description: '关系型数据库'
    },
    {
      name: 'RESTful API',
      icon: 'mdi:api',
      level: 85,
      color: '#61dafb',
      description: 'API 设计规范'
    }
  ],
  tools: [
    {
      name: 'Git',
      icon: 'logos:git-icon',
      level: 90,
      color: '#f05032',
      description: '版本控制系统',
      projects: [
        { name: '博客项目', role: '版本管理', period: '2024.10 - 至今' },
      ]
    },
    {
      name: 'VS Code',
      icon: 'logos:visual-studio-code',
      level: 95,
      color: '#007acc',
      description: '代码编辑器'
    },
    {
      name: 'npm',
      icon: 'logos:npm-icon',
      level: 88,
      color: '#cb3837',
      description: '包管理工具'
    },
    {
      name: 'Webpack',
      icon: 'logos:webpack',
      level: 75,
      color: '#8dd6f9',
      description: '模块打包工具'
    },
    {
      name: 'ESLint',
      icon: 'logos:eslint',
      level: 85,
      color: '#4b32c3',
      description: '代码质量检查'
    },
    {
      name: 'Postman',
      icon: 'logos:postman-icon',
      level: 82,
      color: '#ff6c37',
      description: 'API 测试工具'
    }
  ]
})
</script>

<style scoped>
.tech-stack-section {
  padding: 80px 0;
  background: transparent;
  position: relative;
  overflow: hidden;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* 标题区 */
.section-header {
  text-align: center;
  margin-bottom: 60px;
  animation: fadeInUp 0.8s ease-out;
}

.section-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  font-size: 2rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 12px;
  text-shadow: 0 3px 8px rgba(0, 0, 0, 0.4), 0 1px 3px rgba(0, 0, 0, 0.3);
}

.section-title i {
  color: #667eea;
  font-size: 1.8rem;
}

.section-subtitle {
  font-size: 16px;
  color: #e0e7ff;
  font-weight: 400;
  letter-spacing: 2px;
  text-transform: uppercase;
  opacity: 1;
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.35), 0 1px 2px rgba(0, 0, 0, 0.25);
}

/* 技术分类 */
.tech-categories {
  display: flex;
  flex-direction: column;
  gap: 60px;
}

.tech-category {
  animation: fadeInUp 0.8s ease-out;
}

.category-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 1.5rem;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 30px;
  padding-bottom: 12px;
  border-bottom: 2px solid rgba(255, 255, 255, 0.3);
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.4), 0 1px 3px rgba(0, 0, 0, 0.3);
}

.category-title i {
  color: #667eea;
  font-size: 1.3rem;
}

/* 技术卡片网格 */
.tech-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

/* 技术卡片 */
.tech-card {
  position: relative;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(12px);
  border-radius: 16px;
  padding: 28px 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15), 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: default;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.25);
}

/* 悬停效果 - 上移 + 光晕 */
.tech-card::before {
  content: '';
  position: absolute;
  inset: -3px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 16px;
  opacity: 0;
  z-index: -1;
  filter: blur(20px);
  transition: opacity 0.4s ease;
}

.tech-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 32px rgba(102, 126, 234, 0.25);
}

.tech-card:hover::before {
  opacity: 0.6;
  animation: pulse 2s ease-in-out infinite;
}

/* 图标 */
.tech-icon {
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
  transition: all 0.3s ease;
}

.tech-card:hover .tech-icon {
  transform: scale(1.1) rotate(5deg);
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.2), rgba(118, 75, 162, 0.2));
}

.tech-icon i {
  font-size: 32px;
  color: var(--tech-color, #667eea);
  transition: all 0.3s ease;
}

.tech-card:hover .tech-icon i {
  transform: scale(1.1);
}

/* 技术名称 */
.tech-name {
  font-size: 1.25rem;
  font-weight: 600;
  color: #303133;
  text-align: center;
  margin-bottom: 16px;
  transition: color 0.3s ease;
}

.tech-card:hover .tech-name {
  color: #667eea;
}

/* 熟练度 */
.tech-level {
  margin-bottom: 12px;
}

.level-bar {
  height: 6px;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 8px;
}

.level-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  border-radius: 3px;
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

/* 进度条动画 */
.tech-card:hover .level-fill {
  animation: progressShine 1.5s ease-in-out infinite;
}

.level-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  animation: shimmer 2s infinite;
}

.level-text {
  font-size: 0.875rem;
  font-weight: 600;
  color: #667eea;
  display: block;
  text-align: right;
}

/* 描述 */
.tech-desc {
  font-size: 0.875rem;
  color: #606266;
  text-align: center;
  line-height: 1.6;
  margin: 0;
}

/* 悬停提示 */
.hover-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px dashed rgba(102, 126, 234, 0.2);
  color: #667eea;
  font-size: 0.85rem;
  font-weight: 500;
  opacity: 0.8;
  transition: opacity 0.3s;
}

.has-projects {
  cursor: pointer;
}

.has-projects:hover .hover-hint {
  opacity: 1;
}

/* 弹窗内容 */
.popover-content {
  padding: 8px;
}

.popover-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.05rem;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid rgba(102, 126, 234, 0.1);
}

.projects-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.project-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  background: rgba(102, 126, 234, 0.05);
  border-radius: 10px;
  transition: all 0.3s ease;
}

.project-item:hover {
  background: rgba(102, 126, 234, 0.12);
  transform: translateX(4px);
}

.project-icon {
  color: #667eea;
  flex-shrink: 0;
  margin-top: 2px;
}

.project-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.project-name {
  font-size: 0.95rem;
  font-weight: 600;
  color: #303133;
  line-height: 1.4;
}

.project-meta {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
}

.project-role {
  font-size: 0.85rem;
  color: #667eea;
  font-weight: 500;
  padding: 2px 8px;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 4px;
}

.project-period {
  font-size: 0.8rem;
  color: #909399;
}

/* 动画定义 */
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

@keyframes pulse {
  0%, 100% {
    opacity: 0.6;
  }
  50% {
    opacity: 0.8;
  }
}

@keyframes shimmer {
  0% {
    left: -100%;
  }
  100% {
    left: 200%;
  }
}

@keyframes progressShine {
  0%, 100% {
    filter: brightness(1);
  }
  50% {
    filter: brightness(1.2);
  }
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .tech-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 20px;
  }
}

@media (max-width: 768px) {
  .tech-stack-section {
    padding: 60px 0;
  }

  .section-header {
    margin-bottom: 40px;
  }

  .section-title {
    font-size: 1.75rem;
  }

  .tech-categories {
    gap: 40px;
  }

  .category-title {
    font-size: 1.25rem;
    margin-bottom: 20px;
  }

  .tech-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 16px;
  }

  .tech-card {
    padding: 20px 16px;
  }

  .tech-icon {
    width: 56px;
    height: 56px;
    margin-bottom: 16px;
  }

  .tech-icon i {
    font-size: 28px;
  }

  .tech-name {
    font-size: 1.1rem;
    margin-bottom: 12px;
  }
}

@media (max-width: 480px) {
  .tech-grid {
    grid-template-columns: 1fr;
  }
}
</style>
