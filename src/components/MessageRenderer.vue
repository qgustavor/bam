<template>
  <div v-if="params.style" @click="resetToHomepage"
    class="absolute w-full min-h-screen select-none"
    :class="[
      isDark ? 'bg-gray-900 text-gray-100' : 'bg-gray-100 text-gray-900',
    ]"
    :style="[
      magicBgColor && `background-color: ${magicBgColor}`
    ]"
  >
    <div v-if="params.style === 'magic'" class="h-screen flex items-center justify-center text-center">
      <TextFit>
        {{ params.message || defaultMessages.magic }}
      </TextFit>
    </div>
    <div v-else-if="params.style === 'jprdy'" class="h-screen flex items-center justify-center text-center bg-blue-700 text-gray-100">
      <TextFit :style="{textShadow: '0.5rem 0.5rem 1rem black'}">
        {{ params.message || defaultMessages.jprdy }}
      </TextFit>
    </div>
    <div v-else-if="params.style === 'heart'" class="h-screen flex items-center justify-center text-center bg-gray-100 text-gray-900">
      <TextFit>
        <component :is="renderHeart"></component>
      </TextFit>
    </div>
    <div v-else-if="params.style === 'hypno'" class="h-screen flex items-center justify-center text-center bg-gray-900 text-gray-100">
      <canvas
        ref="hypnoCanvas"
        class="absolute h-screen w-full"
      ></canvas>
      <TextFit class="mix-blend-difference">
        {{ params.message || defaultMessages.hypno }}
      </TextFit>
    </div>
    <div v-else-if="params.style === 'banner'" class="h-screen flex items-center justify-center text-center">
      <div class="banner-wrapper">
        <div class="banner-inner">
          <div class="banner-text">{{ params.message || defaultMessages.banner }}</div>
          <div class="banner-text">{{ params.message || defaultMessages.banner }}</div>
        </div>
      </div>
    </div>
    <div v-else class="h-screen flex items-center justify-center text-center">
      <TextFit>
        {{ params.message || defaultMessages.basic }}
      </TextFit>
    </div>
  </div>
</template>

<script setup>
import { watch, ref, computed, h } from 'vue'
import { params } from '../util/urlParameters'
import { defaultMessages } from '../util/styles'

import TextFit from './TextFit.vue'

const isDark = ref(false)
const magicBgColor = ref(null)
const hypnoCanvas = ref(null)

watch(() => params.style, randomizeValues, {
 immediate: true 
})

function randomizeValues (style) {
  isDark.value = Math.random() > 0.5

  if (style === 'magic') {
    magicAnimation()
  } else if (style === 'hypno') {
    startHypnoAnimation()
  }
  
  document.documentElement.style.overflow = style ? 'hidden' : ''
}

function magicAnimation () {
  if (params.style !== 'magic') {
    magicBgColor.value = null
    return
  }

  magicBgColor.value = '#' + Math.random().toString(16).slice(2, 8)
  isDark.value = Math.random() > 0.5

  requestAnimationFrame(magicAnimation)
}

function renderHeart () {
  const message = params.message || defaultMessages.heart
  const parts = message.split(/(heart|love)/gi)

  return h('div', parts.map((part, index) => {
    if (index % 2 === 1) {
      return h('span', {class: 'text-red-200 heart-animation'}, '❤')
    }
    return h('span', part)
  }))
}

function startHypnoAnimation () {
  if (!hypnoCanvas.value) {
    watch(hypnoCanvas, startHypnoAnimation, {
      once: true
    })
    return
  }

  const canvas = hypnoCanvas.value
  const ctx = canvas.getContext('2d')
  const width = canvas.width = canvas.offsetWidth
  const height = canvas.height = canvas.offsetHeight

  // Parameters
  const numBranches = 10
  const centerX = width / 2
  const centerY = height / 2
  const angleSpeed = -Math.PI / 3
  let baseAngle = 0
  let lastTimestamp = 0

  function getSpiralPoint (angle, steps) {
    const distance = Math.exp(steps / 10) / 20
    return {
      x: distance * Math.cos(angle + steps / 5) + centerX,
      y: distance * Math.sin(angle + steps / 5) + centerY
    }
  }

  function loop (timestamp) {
    if (params.style !== 'hypno') return

    // Calculate time delta for smooth animation
    const deltaTime = (timestamp - lastTimestamp) / 1000 // convert ms to seconds
    lastTimestamp = timestamp

    // Adjust baseAngle using delta time for smoother animation
    baseAngle += angleSpeed * deltaTime

    ctx.fillStyle = 'black'
    ctx.fillRect(0, 0, width, height)
    
    for (let branch = 0; branch < numBranches; branch++) {
      const startAngle = (branch * Math.PI * 2) / numBranches + baseAngle
      
      ctx.beginPath()
      let steps = 0

      // Draw outer edge of branch
      let prevPoint = getSpiralPoint(startAngle, steps)
      ctx.moveTo(prevPoint.x, prevPoint.y)
      
      while (true) {
        steps++
        const point = getSpiralPoint(startAngle, steps)

        const midPoint = {
          x: (prevPoint.x + point.x) / 2,
          y: (prevPoint.y + point.y) / 2
        }
        ctx.quadraticCurveTo(prevPoint.x, prevPoint.y, midPoint.x, midPoint.y)

        prevPoint = point
        if (point.x < -height) break
        if (steps > 1000) break
      }

      // Draw inner edge of branch (coming back to center)
      while (steps--) {
        const point = getSpiralPoint(startAngle + Math.PI / numBranches, steps)
        const midPoint = {
          x: (prevPoint.x + point.x) / 2,
          y: (prevPoint.y + point.y) / 2
        }
        ctx.quadraticCurveTo(prevPoint.x, prevPoint.y, midPoint.x, midPoint.y)
        prevPoint = point
      }

      ctx.closePath()
      ctx.fillStyle = 'white'
      ctx.fill()
    }

    // Request the next frame
    requestAnimationFrame(loop)
  }

  requestAnimationFrame(loop)
}

function resetToHomepage () {
  params.message = null
  params.style = null
}

const bannerTime = computed(() => {
  return Math.round((params.message || defaultMessages.banner).length / 5) + 's'
})
</script>

<style>
.heart-animation {
	animation: beat .25s infinite alternate;
	transform-origin: center;
  display: inline-block;
}
@keyframes beat {
	to { transform: scale(1.2); }
}
.banner-wrapper {
  /* I guess I got annoyed at Tailwind */
  font-size: 90vh;
  text-align: left;
  white-space: nowrap;
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  font-family: ui-sans-serif, system-ui, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
}
.banner-inner {
  animation: banner v-bind(bannerTime) linear infinite;
}
@keyframes banner {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}
.banner-text {
  display: inline-block;
  padding-right: 1ch;
}
</style>
