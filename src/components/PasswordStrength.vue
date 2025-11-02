<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { usePasswordStrength } from '@/composables/usePasswordStrength'

const props = withDefaults(defineProps<{ password: string; minLength?: number; minScore?: number }>(), {
  minLength: 12,
  minScore: 3,
})

const emit = defineEmits<{ (e: 'validity', ok: boolean): void }>()

const { score, percent, label, color, feedback, assessPassword } = usePasswordStrength()

onMounted(() => assessPassword(props.password))
watch(
  () => props.password,
  (v) => assessPassword(v),
  { flush: 'post' }
)
watch([score], () => {
  const ok = (props.password?.length || 0) >= props.minLength && score.value >= props.minScore
  emit('validity', ok)
})
</script>

<template>
  <div class="pwd-strength" role="status" aria-live="polite">
    <div class="bar">
      <div class="fill" :style="{ width: percent + '%', background: color }" />
    </div>
    <div class="meta">
      <span class="label" :style="{ color }">{{ label }}</span>
      <span class="len">{{ (props.password?.length || 0) + ' / ' + props.minLength }}</span>
    </div>
    <ul class="tips" v-if="feedback.length">
      <li v-for="t in feedback" :key="t">{{ t }}</li>
    </ul>
  </div>
</template>

<style scoped>
.pwd-strength { margin-top: 6px; }
.bar { height: 6px; border-radius: 6px; background: rgba(255, 255, 255, 0.25); overflow: hidden; }
.fill { height: 100%; transition: width 0.2s ease; }
.meta { display: flex; justify-content: space-between; margin-top: 6px; font-size: 12px; color: rgba(255, 255, 255, 0.85); }
.tips { margin: 6px 0 0; padding-left: 16px; font-size: 12px; color: rgba(255, 255, 255, 0.9); }
</style>
