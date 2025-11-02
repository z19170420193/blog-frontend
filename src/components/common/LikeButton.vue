<template>
  <div class="like-dislike-container">
    <div class="icons-box">
      <!-- 点赞按钮 -->
      <div class="icons like-icon">
        <input 
          type="checkbox" 
          :id="`like-${id}`" 
          class="input-box"
          v-model="isLiked"
          @change="handleLike"
        >
        <label class="btn-label round" :for="`like-${id}`">
          <svg 
            id="icon-like-regular" 
            class="svgs"
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24"
          >
            <path d="M7.493 18.75c-.425 0-.82-.236-.975-.632A7.48 7.48 0 0 1 6 15.375c0-1.75.599-3.358 1.602-4.634.151-.192.373-.309.6-.397.473-.183.89-.514 1.212-.924a9.042 9.042 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V3a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H14.23c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23h-.777ZM2.331 10.727a11.969 11.969 0 0 0-.831 4.398 12 12 0 0 0 .52 3.507c.26.85 1.084 1.368 1.973 1.368H4.9c.445 0 .72-.498.523-.898a8.963 8.963 0 0 1-.924-3.977c0-1.708.476-3.305 1.302-4.666.245-.403-.028-.959-.5-.959H4.25c-.832 0-1.612.453-1.918 1.227Z" />
          </svg>
          <svg 
            id="icon-like-solid" 
            class="svgs"
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24"
          >
            <path d="M7.493 18.5c-.425 0-.82-.236-.975-.632A7.48 7.48 0 0 1 6 15.125c0-1.75.599-3.358 1.602-4.634.151-.192.373-.309.6-.397.473-.183.89-.514 1.212-.924a9.042 9.042 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23h-.777ZM2.331 10.477a11.969 11.969 0 0 0-.831 4.398 12 12 0 0 0 .52 3.507C2.28 19.482 3.105 20 3.994 20H4.9c.445 0 .72-.498.523-.898a8.963 8.963 0 0 1-.924-3.977c0-1.708.476-3.305 1.302-4.666.245-.403-.028-.959-.5-.959H4.25c-.832 0-1.612.453-1.918 1.227Z" />
          </svg>
          <div class="fireworks">
            <div class="checked-like-fx"></div>
          </div>
        </label>
      </div>

      <!-- 点踩按钮（可选） -->
      <div v-if="showDislike" class="icons dislike-icon">
        <label class="btn-label" :for="`dislike-${id}`">
          <svg 
            id="icon-dislike-regular" 
            class="svgs"
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24"
          >
            <path d="M15.73 5.25h1.035A7.465 7.465 0 0 1 18 9.375a7.465 7.465 0 0 1-1.235 4.125h-.148c-.806 0-1.534.446-2.031 1.08a9.04 9.04 0 0 1-2.861 2.4c-.723.384-1.35.956-1.653 1.715a4.498 4.498 0 0 0-.322 1.672v.633A.75.75 0 0 1 9 21a2.25 2.25 0 0 1-2.25-2.25c0-1.152.26-2.243.723-3.218.266-.558-.107-1.282-.725-1.282H3.622c-1.026 0-1.945-.694-2.054-1.715A12.137 12.137 0 0 1 1.5 12.25c0-2.848.992-5.464 2.649-7.521C4.537 4.247 5.136 4 5.754 4H9.77a4.5 4.5 0 0 1 1.423.23l3.114 1.04a4.5 4.5 0 0 0 1.423.23ZM21.669 14.023c.536-1.362.831-2.845.831-4.398 0-1.22-.182-2.398-.52-3.507-.26-.85-1.084-1.368-1.973-1.368H19.1c-.445 0-.72.498-.523.898.591 1.2.924 2.55.924 3.977a8.958 8.958 0 0 1-1.302 4.666c-.245.403.028.959.5.959h1.053c.832 0 1.612-.453 1.918-1.227Z" />
          </svg>
          <svg 
            id="icon-dislike-solid" 
            class="svgs"
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24"
          >
            <path d="M15.73 5h1.035A7.465 7.465 0 0 1 18 9.125a7.465 7.465 0 0 1-1.235 4.125h-.148c-.806 0-1.534.446-2.031 1.08a9.04 9.04 0 0 1-2.861 2.4c-.723.384-1.35.956-1.653 1.715a4.498 4.498 0 0 0-.322 1.672v.633A.75.75 0 0 1 9 21a2.25 2.25 0 0 1-2.25-2.25c0-1.152.26-2.243.723-3.218.266-.558-.107-1.282-.725-1.282H3.622c-1.026 0-1.945-.694-2.054-1.715A12.137 12.137 0 0 1 1.5 12c0-2.848.992-5.464 2.649-7.521C4.537 3.997 5.136 3.75 5.754 3.75H9.02a4.5 4.5 0 0 1 1.423.23l3.114 1.04a4.5 4.5 0 0 0 1.423.23h.75ZM21.669 13.773c.536-1.362.831-2.845.831-4.398 0-1.22-.182-2.398-.52-3.507-.26-.85-1.084-1.368-1.973-1.368H19.1c-.445 0-.72.498-.523.898.591 1.2.924 2.55.924 3.977a8.958 8.958 0 0 1-1.302 4.666c-.245.403.028.959.5.959h1.053c.832 0 1.612-.453 1.918-1.227Z" />
          </svg>
          <div class="fireworks">
            <div class="checked-dislike-fx"></div>
          </div>
        </label>
        <input 
          type="checkbox" 
          :id="`dislike-${id}`" 
          class="input-box"
          v-model="isDisliked"
          @change="handleDislike"
        >
        <label class="btn-label" :for="`dislike-${id}`">
          <span class="dislike-text-content">{{ displayDislikeCount }}</span>
        </label>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface Props {
  id: string | number
  likeCount?: number
  dislikeCount?: number
  liked?: boolean
  disliked?: boolean
  showDislike?: boolean
}

interface Emits {
  (e: 'like', liked: boolean): void
  (e: 'dislike', disliked: boolean): void
}

const props = withDefaults(defineProps<Props>(), {
  likeCount: 0,
  dislikeCount: 0,
  liked: false,
  disliked: false,
  showDislike: false,
})

const emit = defineEmits<Emits>()

// 本地状态
const isLiked = ref(props.liked)
const isDisliked = ref(props.disliked)
const localLikeCount = ref(props.likeCount)
const localDislikeCount = ref(props.dislikeCount)

// 显示的计数
const displayLikeCount = computed(() => {
  return localLikeCount.value > 0 ? localLikeCount.value : ''
})

const displayDislikeCount = computed(() => {
  return localDislikeCount.value > 0 ? localDislikeCount.value : ''
})

// 处理点赞
const handleLike = () => {
  if (isLiked.value) {
    localLikeCount.value++
    // 如果之前点了踩，取消踩
    if (isDisliked.value) {
      isDisliked.value = false
      localDislikeCount.value = Math.max(0, localDislikeCount.value - 1)
    }
  } else {
    localLikeCount.value = Math.max(0, localLikeCount.value - 1)
  }
  emit('like', isLiked.value)
}

// 处理点踩
const handleDislike = () => {
  if (isDisliked.value) {
    localDislikeCount.value++
    // 如果之前点了赞，取消赞
    if (isLiked.value) {
      isLiked.value = false
      localLikeCount.value = Math.max(0, localLikeCount.value - 1)
    }
  } else {
    localDislikeCount.value = Math.max(0, localDislikeCount.value - 1)
  }
  emit('dislike', isDisliked.value)
}

// 监听外部变化
watch(() => props.liked, (val) => {
  isLiked.value = val
})

watch(() => props.disliked, (val) => {
  isDisliked.value = val
})

watch(() => props.likeCount, (val) => {
  localLikeCount.value = val
})

watch(() => props.dislikeCount, (val) => {
  localDislikeCount.value = val
})
</script>

<style scoped>
.like-dislike-container {
  --dark-grey: #353535;
  --middle-grey: #767676;
  --border-radius-icon: 50px;
  position: relative;
  display: inline-flex;
  align-items: center;
  cursor: default;
  opacity: .9;
}

.icons-box {
  display: flex;
  gap: 8px;
}

.icons {
  position: relative;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  opacity: .9;
  cursor: pointer;
  user-select: none;
  border: none;
  border-radius: 50%;
  transition: .2s ease all;
  background: #ffffff;
  width: 44px;
  height: 44px;
}

.icons:hover {
  opacity: 1;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.18);
  transform: translateY(-2px);
}

.icons:active {
  opacity: .95;
  transform: translateY(0);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.14);
}

.icons .btn-label {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: 44px;
  height: 44px;
  padding: 0;
  cursor: pointer;
  position: relative;
  border-radius: 50%;
}

.icons .btn-label.round {
  border-radius: 50%;
}

/* removed: like count inside button for round style */
.like-text-content {
  border-right: 1px solid var(--dark-grey);
  padding: 0 0.6rem 0 0.5rem;
  pointer-events: none;
  min-width: 30px;
  text-align: center;
  font-weight: 500;
  color: var(--dark-grey);
}

.dislike-text-content {
  border-left: 1px solid var(--dark-grey);
  padding: 0 0.5rem 0 0.6rem;
  pointer-events: none;
  min-width: 30px;
  text-align: center;
  font-weight: 500;
  color: var(--dark-grey);
}

.icons .svgs {
  width: 20px;
  fill: #303133;
  box-sizing: content-box;
  padding: 0;
  transition: .2s ease all;
}

.input-box {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.icons #icon-like-regular {
  display: block;
}

.icons #icon-like-solid {
  display: none;
  fill: #ff6b6b;
}

.icons:hover :is(#icon-like-solid, #icon-like-regular) {
  animation: rotate-icon-like 0.7s ease-in-out both;
}

.icons input:checked ~ label #icon-like-regular {
  display: none;
}

.icons input:checked ~ label #icon-like-solid {
  display: block;
  animation: checked-icon-like 0.5s;
}

.icons #icon-dislike-regular {
  display: block;
  transform: rotate(180deg);
}

.icons #icon-dislike-solid {
  display: none;
  transform: rotate(180deg);
  fill: #4dabf7;
}

.icons:hover :is(#icon-dislike-solid, #icon-dislike-regular) {
  animation: rotate-icon-dislike 0.7s ease-in-out both;
}

.icons input:checked ~ label #icon-dislike-regular {
  display: none;
}

.icons input:checked ~ label #icon-dislike-solid {
  display: block;
  animation: checked-icon-dislike 0.5s;
}

.fireworks {
  transform: scale(0.5);
  pointer-events: none;
}

.icons input:checked ~ label .fireworks > .checked-like-fx {
  position: absolute;
  width: 10px;
  height: 10px;
right: 22px;
  border-radius: 50%;
  box-shadow: 0 0 #fff, 0 0 #fff, 0 0 #fff;
  animation: 1s fireworks-bang ease-out forwards, 1s fireworks-gravity ease-in forwards, 5s fireworks-position linear forwards;
  animation-duration: 1.25s, 1.25s, 6.25s;
}

.icons input:checked ~ label .fireworks > .checked-dislike-fx {
  position: absolute;
  width: 10px;
  height: 10px;
left: 22px;
  border-radius: 50%;
  box-shadow: 0 0 #fff, 0 0 #fff, 0 0 #fff;
  animation: 1s fireworks-bang ease-out forwards, 1s fireworks-gravity ease-in forwards, 5s fireworks-position linear forwards;
  animation-duration: 1.25s, 1.25s, 6.25s;
}

@keyframes rotate-icon-like {
  0% { transform: rotate(0deg) translate3d(0, 0, 0); }
  25% { transform: rotate(3deg) translate3d(0, 0, 0); }
  50% { transform: rotate(-3deg) translate3d(0, 0, 0); }
  75% { transform: rotate(1deg) translate3d(0, 0, 0); }
  100% { transform: rotate(0deg) translate3d(0, 0, 0); }
}

@keyframes rotate-icon-dislike {
  0% { transform: rotate(180deg) translate3d(0, 0, 0); }
  25% { transform: rotate(183deg) translate3d(0, 0, 0); }
  50% { transform: rotate(177deg) translate3d(0, 0, 0); }
  75% { transform: rotate(181deg) translate3d(0, 0, 0); }
  100% { transform: rotate(180deg) translate3d(0, 0, 0); }
}

@keyframes checked-icon-like {
  0% { transform: scale(0); opacity: 0; }
  50% { transform: scale(1.2) rotate(-10deg); }
  100% { transform: scale(1) rotate(0deg); opacity: 1; }
}

@keyframes checked-icon-dislike {
  0% { transform: scale(0) rotate(180deg); opacity: 0; }
  50% { transform: scale(1.2) rotate(170deg); }
  100% { transform: scale(1) rotate(180deg); opacity: 1; }
}

@keyframes fireworks-position {
  0%, 19.9% { margin-top: 10%; margin-left: 40%; }
  20%, 39.9% { margin-top: 40%; margin-left: 30%; }
  40%, 59.9% { margin-top: 20%; margin-left: 70%; }
  60%, 79.9% { margin-top: 30%; margin-left: 20%; }
  80%, 99.9% { margin-top: 30%; margin-left: 80%; }
}

@keyframes fireworks-gravity {
  to { transform: translateY(200px); opacity: 0; }
}

@keyframes fireworks-bang {
  to {
    box-shadow: 
      -70px -35px #ff006a, 44px -16px #8b00ff, 74px 21px #ff0000,
      -49px 7px #00ffc8, -60px -37px #ff00d5, 47px -32px #00ff62,
      15px -62px #00ff91, 27px -49px #fffb00, -50px -75px #b7ff00,
      52px -72px #0015ff, -42px -26px #ff00a6, 13px -64px #00ff22;
  }
}
</style>
