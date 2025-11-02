<template>
  <div class="login-page">
    <!-- 背景装饰 -->
    <div class="bg-decoration">
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
      <div class="circle circle-3"></div>
    </div>

    <!-- 翻转卡片容器 -->
    <div class="card-container">
      <div :class="['flip-card', { flipped: isFlipped }]">
        <!-- 正面 - 登录 -->
        <div class="flip-card-front">
          <el-card class="auth-card" shadow="always">
            <div class="card-header">
              <h2 class="title">欢迎回来</h2>
              <p class="subtitle">登录您的账号</p>
            </div>

            <el-form
              ref="loginFormRef"
              :model="loginForm"
              :rules="loginRules"
              class="auth-form"
              @submit.prevent="handleLogin"
            >
              <el-form-item prop="email">
                <div class="wave-group">
                  <span class="wave-icon"><el-icon><Message /></el-icon></span>
                  <input
                    id="login-email"
                    class="input"
                    type="email"
                    name="email"
                    v-model="loginForm.email"
                    required
                    autocomplete="email"
                  />
                  <span class="bar"></span>
                  <label class="label" for="login-email">
                    <span
                      v-for="(ch, i) in '邮箱地址'.split('')"
                      :key="i"
                      class="label-char"
                      :style="{ '--index': i }"
                    >{{ ch }}</span>
                  </label>
                </div>
              </el-form-item>

              <el-form-item prop="password">
                <div class="wave-group">
                  <span class="wave-icon"><el-icon><Lock /></el-icon></span>
                  <input
                    id="login-password"
                    class="input"
                    type="password"
                    name="password"
                    v-model="loginForm.password"
                    required
                    autocomplete="current-password"
                    @keyup.enter="handleLogin"
                  />
                  <span class="bar"></span>
                  <label class="label" for="login-password">
                    <span
                      v-for="(ch, i) in '密码'.split('')"
                      :key="i"
                      class="label-char"
                      :style="{ '--index': i }"
                    >{{ ch }}</span>
                  </label>
                </div>
              </el-form-item>

              <el-form-item class="remember-item">
                <div class="form-footer">
                  <el-checkbox v-model="loginForm.remember">记住我</el-checkbox>
                  <el-link type="primary" :underline="false" class="forgot-link">忘记密码?</el-link>
                </div>
              </el-form-item>

              <el-form-item>
                <el-button
                  type="primary"
                  size="large"
                  :loading="loginLoading"
                  class="submit-btn"
                  @click="handleLogin"
                >
                  登录
                </el-button>
              </el-form-item>
            </el-form>

            <div class="card-footer">
              <span class="footer-text">还没有账号？</span>
              <el-link type="primary" :underline="false" @click="flipCard">
                立即注册
              </el-link>
            </div>
          </el-card>
        </div>

        <!-- 背面 - 注册 -->
        <div class="flip-card-back">
          <el-card class="auth-card" shadow="always">
            <div class="card-header">
              <h2 class="title">创建账号</h2>
              <p class="subtitle">加入我们开始分享</p>
            </div>

            <el-form
              ref="registerFormRef"
              :model="registerForm"
              :rules="registerRules"
              class="auth-form"
              @submit.prevent="handleRegister"
            >
              <el-form-item prop="username">
                <div class="wave-group">
                  <span class="wave-icon"><el-icon><User /></el-icon></span>
                  <input
                    id="reg-username"
                    class="input"
                    type="text"
                    name="username"
                    v-model="registerForm.username"
                    required
                    autocomplete="username"
                  />
                  <span class="bar"></span>
                  <label class="label" for="reg-username">
                    <span
                      v-for="(ch, i) in '用户名'.split('')"
                      :key="i"
                      class="label-char"
                      :style="{ '--index': i }"
                    >{{ ch }}</span>
                  </label>
                </div>
              </el-form-item>

              <el-form-item prop="email">
                <div class="wave-group">
                  <span class="wave-icon"><el-icon><Message /></el-icon></span>
                  <input
                    id="reg-email"
                    class="input"
                    type="email"
                    name="email"
                    v-model="registerForm.email"
                    required
                    autocomplete="email"
                  />
                  <span class="bar"></span>
                  <label class="label" for="reg-email">
                    <span
                      v-for="(ch, i) in '邮箱地址'.split('')"
                      :key="i"
                      class="label-char"
                      :style="{ '--index': i }"
                    >{{ ch }}</span>
                  </label>
                </div>
              </el-form-item>

              <el-form-item prop="password">
                <div class="wave-group">
                  <span class="wave-icon"><el-icon><Lock /></el-icon></span>
                  <input
                    id="reg-password"
                    class="input"
                    type="password"
                    name="password"
                    v-model="registerForm.password"
                    required
                    autocomplete="new-password"
                    @input="showPwdStrength = !!registerForm.password"
                    @blur="showPwdStrength = false"
                  />
                  <span class="bar"></span>
                  <label class="label" for="reg-password">
                    <span
                      v-for="(ch, i) in '密码'.split('')"
                      :key="i"
                      class="label-char"
                      :style="{ '--index': i }"
                    >{{ ch }}</span>
                  </label>
                </div>
                <PasswordStrength v-if="showPwdStrength" :password="registerForm.password" @validity="isPasswordStrong = $event" />
              </el-form-item>

              <el-form-item prop="confirmPassword">
                <div class="wave-group">
                  <span class="wave-icon"><el-icon><Lock /></el-icon></span>
                  <input
                    id="reg-confirm"
                    class="input"
                    type="password"
                    name="confirmPassword"
                    v-model="registerForm.confirmPassword"
                    required
                    autocomplete="new-password"
                    @keyup.enter="handleRegister"
                  />
                  <span class="bar"></span>
                  <label class="label" for="reg-confirm">
                    <span
                      v-for="(ch, i) in '确认密码'.split('')"
                      :key="i"
                      class="label-char"
                      :style="{ '--index': i }"
                    >{{ ch }}</span>
                  </label>
                </div>
              </el-form-item>

              <el-form-item>
                <el-button
                  type="primary"
                  size="large"
                  :disabled="!isPasswordStrong"
                  :loading="registerLoading"
                  class="submit-btn"
                  @click="handleRegister"
                >
                  注册
                </el-button>
              </el-form-item>
            </el-form>

            <div class="card-footer">
              <span class="footer-text">已有账号？</span>
              <el-link type="primary" :underline="false" @click="flipCard">
                立即登录
              </el-link>
            </div>
          </el-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { User, Message, Lock } from '@element-plus/icons-vue'
import PasswordStrength from '@/components/PasswordStrength.vue'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// 翻转状态
const isFlipped = ref(false)

// 表单引用
const loginFormRef = ref<FormInstance>()
const registerFormRef = ref<FormInstance>()

// 加载状态
const loginLoading = ref(false)
const registerLoading = ref(false)

// 密码强度合规
const isPasswordStrong = ref(false)
const showPwdStrength = ref(false)

// 登录表单
const loginForm = reactive({
  email: '',
  password: '',
  remember: false,
})

// 注册表单
const registerForm = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
})

// 邮箱验证规则
const validateEmail = (rule: any, value: any, callback: any) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!value) {
    callback(new Error('请输入邮箱地址'))
  } else if (!emailRegex.test(value)) {
    callback(new Error('请输入正确的邮箱格式'))
  } else {
    callback()
  }
}

// 密码验证规则（登录）
const validatePassword = (rule: any, value: any, callback: any) => {
  if (!value) {
    callback(new Error('请输入密码'))
  } else if (value.length < 8) {
    callback(new Error('密码长度不能少于8位'))
  } else {
    callback()
  }
}

// 注册密码规则（与强度条一致，建议≥12位）
const validateRegisterPassword = (rule: any, value: any, callback: any) => {
  if (!value) {
    callback(new Error('请输入密码'))
  } else if (value.length < 12) {
    callback(new Error('密码长度不能少于12位'))
  } else {
    callback()
  }
}

// 确认密码验证
const validateConfirmPassword = (rule: any, value: any, callback: any) => {
  if (!value) {
    callback(new Error('请再次输入密码'))
  } else if (value !== registerForm.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

// 登录表单验证规则
const loginRules: FormRules = {
  email: [{ validator: validateEmail, trigger: 'blur' }],
  password: [{ validator: validatePassword, trigger: 'blur' }],
}

// 注册表单验证规则
const registerRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '用户名长度为2-20个字符', trigger: 'blur' },
  ],
  email: [{ validator: validateEmail, trigger: 'blur' }],
  password: [{ validator: validateRegisterPassword, trigger: 'blur' }],
  confirmPassword: [{ validator: validateConfirmPassword, trigger: 'blur' }],
}

// 翻转卡片
const flipCard = () => {
  isFlipped.value = !isFlipped.value
}

// 处理登录
const handleLogin = async () => {
  if (!loginFormRef.value) return

  try {
    await loginFormRef.value.validate()

    loginLoading.value = true

    await userStore.login({
      email: loginForm.email,
      password: loginForm.password,
    })

    // 登录成功，跳转到来源页面或首页
    const redirect = (route.query.redirect as string) || '/'
    router.push(redirect)
  } catch (error: any) {
    console.error('登录失败:', error)
    if (error.message) {
      ElMessage.error(error.message)
    }
  } finally {
    loginLoading.value = false
  }
}

// 处理注册
const handleRegister = async () => {
  if (!registerFormRef.value) return

  try {
    await registerFormRef.value.validate()

    registerLoading.value = true

    await userStore.register({
      username: registerForm.username,
      email: registerForm.email,
      password: registerForm.password,
    })

    // 注册成功，跳转到首页
    router.push('/')
  } catch (error: any) {
    console.error('注册失败:', error)
    if (error.message) {
      ElMessage.error(error.message)
    }
  } finally {
    registerLoading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
  padding: 20px;
}

/* 背景装饰 */
.bg-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  z-index: 0;
}

.circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  animation: float 20s infinite ease-in-out;
}

.circle-1 {
  width: 300px;
  height: 300px;
  top: -100px;
  left: -100px;
  animation-delay: 0s;
}

.circle-2 {
  width: 200px;
  height: 200px;
  bottom: -50px;
  right: -50px;
  animation-delay: 5s;
}

.circle-3 {
  width: 150px;
  height: 150px;
  top: 50%;
  right: 10%;
  animation-delay: 10s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-30px) rotate(180deg);
  }
}

/* 卡片容器 */
.card-container {
  position: relative;
  z-index: 1;
  perspective: 1500px;
}

/* 翻转卡片 */
.flip-card {
  width: 420px;
  height: 580px;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.8s cubic-bezier(0.4, 0.2, 0.2, 1);
}

.flip-card.flipped {
  transform: rotateY(180deg);
}

/* 卡片正反面 */
.flip-card-front,
.flip-card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

.flip-card-front {
  transform: rotateY(0deg);
}

.flip-card-back {
  transform: rotateY(180deg);
}

/* 认证卡片 - 玻璃态态效果 */
.auth-card {
  border-radius: 24px;
  backdrop-filter: blur(20px) saturate(180%);
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.25);
  box-shadow: 
    0 8px 32px rgba(31, 38, 135, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.5),
    inset 0 -1px 0 rgba(255, 255, 255, 0.1);
  height: 100%;
  position: relative;
  overflow: hidden;
}

/* 液态动画背景 */
.auth-card::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(
    circle at center,
    rgba(255, 255, 255, 0.2) 0%,
    transparent 50%
  );
  animation: liquid 15s infinite linear;
  pointer-events: none;
}

@keyframes liquid {
  0%, 100% {
    transform: translate(0, 0) rotate(0deg);
  }
  25% {
    transform: translate(5%, 5%) rotate(90deg);
  }
  50% {
    transform: translate(-5%, 5%) rotate(180deg);
  }
  75% {
    transform: translate(-5%, -5%) rotate(270deg);
  }
}

.auth-card :deep(.el-card__body) {
  padding: 40px;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 1;
}

/* 卡片头部 */
.card-header {
  text-align: center;
  margin-bottom: 32px;
}

.title {
  font-size: 28px;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 8px;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.subtitle {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
}

/* 表单 */
.auth-form {
  flex: 1;
}

.auth-form :deep(.el-form-item) {
  margin-bottom: 24px;
}

.auth-form :deep(.el-input__wrapper) {
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 
    0 2px 8px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.4);
  transition: all 0.3s;
}

.auth-form :deep(.el-input__wrapper:hover) {
  background: rgba(255, 255, 255, 0.25);
  border-color: rgba(255, 255, 255, 0.4);
}

.auth-form :deep(.el-input__wrapper.is-focus) {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.5);
}

.auth-form :deep(.el-input__inner) {
  padding-left: 12px;
  color: #ffffff;
}

.auth-form :deep(.el-input__inner::placeholder) {
  color: rgba(255, 255, 255, 0.6);
}

.auth-form :deep(.el-input__prefix) {
  color: rgba(255, 255, 255, 0.8);
}

/* 记住我区域 */
.remember-item {
  margin-bottom: 16px !important;
}

.form-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.submit-btn {
  width: 100%;
  border-radius: 12px;
  height: 44px;
  font-size: 16px;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  color: #ffffff;
  box-shadow: 
    0 4px 16px rgba(0, 0, 0, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.5);
  transition: all 0.3s;
}

.submit-btn:hover {
  background: rgba(255, 255, 255, 0.35);
  transform: translateY(-2px);
  box-shadow: 
    0 6px 20px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
}

/* 卡片底部 */
.card-footer {
  text-align: center;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.footer-text {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  margin-right: 8px;
}

.card-footer :deep(.el-link) {
  color: #ffffff;
  font-weight: 600;
}

.form-footer :deep(.el-checkbox__label) {
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
}

.form-footer :deep(.el-checkbox__inner) {
  border-color: rgba(255, 255, 255, 0.4);
  background: rgba(255, 255, 255, 0.1);
}

.forgot-link {
  font-size: 14px;
  transition: all 0.3s;
}

.forgot-link:hover {
  transform: translateX(2px);
}

.form-footer :deep(.el-link) {
  color: rgba(255, 255, 255, 0.95);
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .login-page {
    padding: 12px;
  }

  .flip-card {
    width: 100%;
    max-width: 380px;
    height: auto;
    min-height: 520px;
  }

  .auth-card :deep(.el-card__body) {
    padding: 28px 24px;
  }

  .title {
    font-size: 24px;
  }

  .circle {
    display: none;
  }
}

@media (max-width: 480px) {
  .flip-card {
    max-width: 100%;
  }

  .auth-card :deep(.el-card__body) {
    padding: 24px 20px;
  }

  .title {
    font-size: 22px;
  }

  .subtitle {
    font-size: 13px;
  }
}

/* Wave input styles */
.wave-group {
  position: relative;
  width: 100%;
}

.wave-group .input {
  font-size: 16px;
  padding: 10px 10px 10px 5px;
  display: block;
  width: 100%;
  border: none;
  border-bottom: 1px solid rgba(255, 255, 255, 0.7);
  background: transparent;
  color: #ffffff;
  padding-left: 36px;
}

.wave-group .input:focus {
  outline: none;
}

.wave-group .label {
  color: rgba(255, 255, 255, 0.8);
  font-size: 18px;
  font-weight: normal;
  position: absolute;
  pointer-events: none;
  left: 36px;
  top: 10px;
  display: flex;
}

.wave-group .label-char {
  transition: 0.2s ease all;
  transition-delay: calc(var(--index) * .05s);
}

.wave-group .input:focus ~ label .label-char,
.wave-group .input:valid ~ label .label-char {
  transform: translateY(-20px);
  font-size: 14px;
  color: #ffffff;
}

.wave-group .bar {
  position: relative;
  display: block;
  width: 100%;
}

.wave-group .bar:before,
.wave-group .bar:after {
  content: '';
  height: 2px;
  width: 0;
  bottom: 1px;
  position: absolute;
  background: #ffffff;
  transition: 0.2s ease all;
}

.wave-icon {
  position: absolute;
  left: 6px;
  top: 10px;
  display: flex;
  align-items: center;
  color: rgba(255, 255, 255, 0.9);
  pointer-events: none;
}

.wave-group .bar:before {
  left: 50%;
}

.wave-group .bar:after {
  right: 50%;
}

.wave-group .input:focus ~ .bar:before,
.wave-group .input:focus ~ .bar:after {
  width: 50%;
}
</style>
