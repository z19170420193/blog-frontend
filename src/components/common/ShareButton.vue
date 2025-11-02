<template>
  <div class="share-container">
    <div class="btn-wrap">
      <button class="btn" :class="{ anim }" type="button" @click="handleShare" :aria-label="ariaLabel" :title="ariaLabel">
        <!-- Share Icon -->
        <svg class="icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path fill="#303133" d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7a3.27 3.27 0 0 0 0-1.39l7.02-4.11A3 3 0 1 0 14 5a3.01 3.01 0 0 0 .09.72L7.06 9.83A3 3 0 1 0 7 14.17l7.03 4.11c-.06.23-.09.47-.09.72a3 3 0 1 0 3-2.92Z"/>
        </svg>
        <!-- Burst lines -->
        <div class="burst" aria-hidden="true">
          <i v-for="n in 8" :key="n" class="l" />
        </div>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

interface Props {
  title?: string
  text?: string
  url?: string
}

interface SuccessPayload { method: 'native' | 'copy' }
interface Emits {
  (e: 'success', p: SuccessPayload): void
  (e: 'error', err: any): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const shareUrl = ref('')
const anim = ref(false)

onMounted(() => {
  shareUrl.value = props.url || window.location.href
})

const ariaLabel = computed(() => '分享')

const triggerAnim = () => {
  anim.value = false
  requestAnimationFrame(() => (anim.value = true))
  setTimeout(() => (anim.value = false), 600)
}

const handleShare = async () => {
  try {
    triggerAnim()
    const data = { title: props.title, text: props.text, url: shareUrl.value }
    // Native share
    // @ts-ignore
    if (navigator.share) {
      // @ts-ignore
      await navigator.share(data)
      emit('success', { method: 'native' })
      return
    }
    // Fallback: copy link
    await navigator.clipboard.writeText(shareUrl.value)
    emit('success', { method: 'copy' })
  } catch (err) {
    emit('error', err)
  }
}
</script>

<style scoped>
.share-container { display: inline-flex; }
.btn-wrap { display:inline-flex; }

.btn {
  width: 44px; height: 44px;
  border-radius: 50%;
  border: none;
  background: #ffffff;
  cursor: pointer;
  display: inline-flex; align-items:center; justify-content:center;
  transition: .2s ease all;
  box-shadow: none;
  position: relative;
  outline: none;
}
.btn:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(0,0,0,.18); }
.btn:active { transform: translateY(0); box-shadow: 0 3px 8px rgba(0,0,0,.14); }

.icon { width: 20px; pointer-events: none; }

/* Ripple ring */
.btn::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 2px solid rgba(64,158,255,.25);
  transform: scale(0.6);
  opacity: 0;
}
.btn.anim::after { animation: ring .5s ease-out; }

/* Burst lines */
.burst { position:absolute; inset:0; pointer-events:none; }
.l { position:absolute; top:50%; left:50%; width:2px; height:8px; background: rgba(64,158,255,.45); transform-origin: center -8px; opacity:0; }
.btn.anim .l { animation: burst .6s ease-out forwards; }
.l:nth-child(1){ transform: translate(-50%,-50%) rotate(0deg); }
.l:nth-child(2){ transform: translate(-50%,-50%) rotate(45deg); }
.l:nth-child(3){ transform: translate(-50%,-50%) rotate(90deg); }
.l:nth-child(4){ transform: translate(-50%,-50%) rotate(135deg); }
.l:nth-child(5){ transform: translate(-50%,-50%) rotate(180deg); }
.l:nth-child(6){ transform: translate(-50%,-50%) rotate(225deg); }
.l:nth-child(7){ transform: translate(-50%,-50%) rotate(270deg); }
.l:nth-child(8){ transform: translate(-50%,-50%) rotate(315deg); }

@keyframes ring {
  0% { transform: scale(.6); opacity: 0 }
  40% { opacity: 1 }
  100% { transform: scale(1.15); opacity: 0 }
}
@keyframes burst {
  0% { opacity:1; transform: translate(-50%,-50%) rotate(var(--r,0)) scale(.6); }
  100% { opacity:0; transform: translate(-50%,-120%) rotate(var(--r,0)) scale(1); }
}
</style>
