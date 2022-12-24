<script setup lang="ts">
import { useStore } from '../stores/index'
import { ref } from 'vue'
import { useRandomColor } from '../hooks/randomColor'
import { onBeforeMount } from 'vue'

const store = useStore()
const subtitles = store.subtitles
const index = ref(0)
const duration = 2
const randColor = ref('#fff')
onBeforeMount(() => {
  setInterval(() => {
    randColor.value = useRandomColor()
  }, duration * 1000)
})

store.$subscribe((_, state) => {
  index.value = state.showSubtitles
})
</script>
<template>
  <div>
    <p class="flicker">{{ subtitles[index].content }}</p>
  </div>
</template>
<style scoped lang="less">
.flicker {
  color: v-bind(randColor); /*设置文字颜色*/
  font-size: 64px; /*设置字体大小*/
  font-weight: bolder; /*设置字体粗细*/
  text-align: center;
  animation: flicker 2s infinite;
}
@keyframes flicker {
  /*创建动画*/
  0% {
    opacity: 0.5;
  }

  50% {
    opacity: 1;
  }

  100% {
    opacity: 0.5;
  }
}
</style>
