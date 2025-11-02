<template>
  <div class="favorite-container">
    <div class="icons">
      <input
        type="checkbox"
        :id="`fav-${id}`"
        class="input"
        v-model="isFav"
        @change="onToggle"
      >
      <label class="btn" :for="`fav-${id}`" :aria-pressed="isFav.toString()" :title="isFav ? '已收藏' : '收藏'">
        <!-- 空心星 -->
        <svg id="star-regular" class="svg" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path fill="none" stroke="#303133" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"
            d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
        </svg>
        <!-- 实心星 -->
        <svg id="star-solid" class="svg" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path fill="#FFC107" d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
        </svg>
        <!-- 闪光粒子 -->
        <div class="sparkles">
          <i class="p s1"></i>
          <i class="p s2"></i>
          <i class="p s3"></i>
          <i class="p s4"></i>
        </div>
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
  id: string | number
  favorited?: boolean
}

interface Emits {
  (e: 'toggle', favorited: boolean): void
}

const props = withDefaults(defineProps<Props>(), {
  favorited: false,
})
const emit = defineEmits<Emits>()

const isFav = ref(props.favorited)

watch(() => props.favorited, v => (isFav.value = v))

const onToggle = () => {
  emit('toggle', isFav.value)
}
</script>

<style scoped>
.favorite-container { display: inline-flex; }

.icons {
  position: relative;
  display: inline-flex;
  width: 44px; height: 44px;
  border-radius: 50%;
  background: #ffffff;
  box-shadow: none; /* 默认无阴影 */
  transition: .2s ease all;
}
.icons:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(0,0,0,.18); }
.icons:active { transform: translateY(0); box-shadow: 0 3px 8px rgba(0,0,0,.14); }

.input { position:absolute; opacity:0; width:0; height:0; }

.btn { display:inline-flex; justify-content:center; align-items:center; width:44px; height:44px; border-radius:50%; cursor:pointer; position:relative; }

.svg { width:20px; transition:.25s ease all; }
#star-solid { display:none; }

/* 切换图标 */
.input:checked ~ .btn #star-regular { display:none; }
.input:checked ~ .btn #star-solid { display:block; animation:pop .45s ease; }

/* 闪光粒子 */
.sparkles { position:absolute; inset:0; pointer-events:none; }
.p { position:absolute; width:6px; height:6px; border-radius:50%; background: radial-gradient(circle, #FFE082 0 60%, transparent 60%); opacity:0; }
.s1 { top:8px; left:12px; }
.s2 { top:12px; right:10px; }
.s3 { bottom:10px; left:14px; }
.s4 { bottom:8px; right:12px; }

.input:checked ~ .btn .p { animation:spark 700ms ease-out forwards; }

@keyframes pop { 0% { transform:scale(0); opacity:0 } 60% { transform:scale(1.2) rotate(-8deg) } 100% { transform:scale(1); opacity:1 } }
@keyframes spark { 0% { transform:scale(.2); opacity:0 } 50% { opacity:1 } 100% { transform:translateY(-10px) scale(1.2); opacity:0 } }
</style>
