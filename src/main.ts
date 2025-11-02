import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import { useUserStore } from './stores'

// Element Plus 样式（必须导入）
import 'element-plus/dist/index.css'

// 创建应用实例
const app = createApp(App)

// 使用 Pinia
const pinia = createPinia()
app.use(pinia)

// 使用 Vue Router
app.use(router)

// 初始化用户信息
const userStore = useUserStore()
userStore.initUser()

// 挂载应用
app.mount('#app')
