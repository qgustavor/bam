<template>
  <div v-if="params.style" @click="resetToHomepage"
    class="absolute w-full min-h-screen select-none"
    :class="[
      isDark ? 'bg-gray-900 text-gray-100' : 'bg-gray-100 text-gray-900',
    ]"
    :style="[
      magicBgColor && `background-color: ${magicBgColor}`,
      themeOverride
    ]"
  >
    <div v-if="params.style === 'magic'" class="h-screen flex items-center justify-center text-center">
      <TextFit>
        {{ params.message || defaultMessages.magic }}
      </TextFit>
    </div>
    <div v-else-if="params.style === 'jprdy'" class="h-screen flex items-center justify-center text-center bg-blue-700 text-gray-100" :style="accentOverride">
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

    <div
      v-if="activeWarning && !warningAcknowledged"
      class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 text-gray-100 px-6 text-center"
      @click.stop
    >
      <div class="max-w-md">
        <p class="text-3xl mb-4">⚠️</p>
        <p class="mb-6">{{ activeWarning.warning }}</p>
        <div class="flex flex-wrap justify-center gap-2">
          <StyledButton @click.stop="acknowledgeWarning">Continue anyway</StyledButton>
          <StyledButton @click.stop="useSaferValue">Use a safer setting instead</StyledButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { watch, ref, computed, h } from 'vue'
import { params } from '../util/urlParameters'
import { defaultMessages } from '../util/styles'
import { styleParameters } from '../util/styleParameters'
import { pickReadableColor } from '../util/color'

import TextFit from './TextFit.vue'
import StyledButton from './StyledButton.vue'

const isDark = ref(false)
const magicBgColor = ref(null)
const hypnoCanvas = ref(null)
const warningAcknowledged = ref(false)

// Resolves the current style's configured value for a given parameter key,
// falling back to that parameter's default when unset/invalid, and
// clamped to [min, max] for range parameters.
function resolveParam (styleKey, paramKey) {
  const paramDef = styleParameters[styleKey]?.find(p => p.key === paramKey)
  if (!paramDef) return undefined

  if (paramDef.type === 'range') {
    const raw = Number(params[paramKey])
    if (!Number.isFinite(raw)) return paramDef.default
    return Math.min(paramDef.max, Math.max(paramDef.min, raw))
  }

  const value = params[paramKey]
  const isValid = paramDef.options.some(o => o.value === value)
  return isValid ? value : paramDef.default
}

// If the current style/parameter combination resolves to an option flagged
// with a warning (e.g. a fast flashing speed), surface it here. Generic
// across styles: any future style parameter with a `warning` on one of its
// options gets this same full-screen confirmation for free.
const activeWarning = computed(() => {
  const paramDefs = styleParameters[params.style]
  if (!paramDefs) return null

  for (const paramDef of paramDefs) {
    const currentValue = resolveParam(params.style, paramDef.key)

    if (paramDef.type === 'range') {
      const warning = paramDef.warningFor?.(currentValue)
      if (warning) {
        return { paramKey: paramDef.key, warning, safeValue: paramDef.default }
      }
      continue
    }

    const option = paramDef.options.find(o => o.value === currentValue)
    if (option?.warning) {
      return { paramKey: paramDef.key, warning: option.warning, safeValue: paramDef.default }
    }
  }
  return null
})

watch(() => params.style, randomizeValues, {
 immediate: true 
})

// Re-arm the warning whenever the relevant parameter changes, so switching
// speeds (e.g. via the homepage's live "Preview") re-triggers it too.
watch(() => activeWarning.value && params[activeWarning.value.paramKey], () => {
  warningAcknowledged.value = false
})

function acknowledgeWarning () {
  warningAcknowledged.value = true
}

function useSaferValue () {
  if (activeWarning.value) {
    params[activeWarning.value.paramKey] = activeWarning.value.safeValue
  }
  warningAcknowledged.value = true
}

// Resolves whether a style should render dark (bg-gray-900/text-gray-100)
// or light (bg-gray-100/text-gray-900), honoring an explicit `theme`
// override where one exists and otherwise preserving the original
// random coin-flip. Irrelevant when theme === 'custom' since that's
// handled by themeOverride below instead.
function computeIsDark (styleKey) {
  const theme = resolveParam(styleKey, 'theme')
  if (theme === 'light') return false
  if (theme === 'dark') return true
  return Math.random() > 0.5
}

// A raw CSS style string overriding a style's default color(s) when a
// select-type color parameter (theme, accentColor, ...) is set to
// 'custom'. `mode: 'text'` pins just the text color (for styles whose
// background is already animated, like magic's flashing); the default
// mode sets the background and auto-picks a legible contrasting text
// color via culori. Generic across any style/parameter pair that follows
// the colorParameter/themeParameter shape.
function computeColorOverride (styleKey, paramKey, mode = 'background') {
  const paramDef = styleParameters[styleKey]?.find(p => p.key === paramKey)
  if (!paramDef?.colorPicker) return null
  if (resolveParam(styleKey, paramKey) !== 'custom') return null

  const color = params[paramDef.colorPicker.key] || paramDef.colorPicker.default

  if (mode === 'text') return `color: ${color}`
  return `background-color: ${color}; color: ${pickReadableColor(color)}`
}

const themeOverride = computed(() => {
  return computeColorOverride(params.style, 'theme', params.style === 'magic' ? 'text' : 'background')
})

const accentOverride = computed(() => computeColorOverride('jprdy', 'accentColor'))

function randomizeValues (style) {
  isDark.value = computeIsDark(style)
  warningAcknowledged.value = false

  if (style === 'magic') {
    magicAnimation()
  } else if (style === 'hypno') {
    startHypnoAnimation()
  }
  
  document.documentElement.style.overflow = style ? 'hidden' : ''
}

// Interval between color changes at 100% speed (the safe default, ~1.4
// flashes/sec). Actual interval scales inversely with the `speed`
// percentage: 200% is twice as fast (half the interval), 50% is half as
// fast (double the interval), and so on continuously.
const magicBaseIntervalMs = 700
let lastMagicChange = 0

function magicAnimation (timestamp = 0) {
  if (params.style !== 'magic') {
    magicBgColor.value = null
    return
  }

  // Content behind the warning overlay is fully hidden, but we still hold
  // off actually changing colors while it's up rather than flashing unseen.
  if (!(activeWarning.value && !warningAcknowledged.value)) {
    const speedPercent = resolveParam('magic', 'speed')
    const interval = magicBaseIntervalMs * (100 / speedPercent)

    if (timestamp - lastMagicChange >= interval) {
      magicBgColor.value = '#' + Math.random().toString(16).slice(2, 8)
      isDark.value = computeIsDark('magic')
      lastMagicChange = timestamp
    }
  }

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
  const angleSpeed = -Math.PI / 3 * (resolveParam('hypno', 'speed') / 100)
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

// Multiplies the scroll duration: >1 is slower, <1 is faster. Derived
// continuously from the `speed` percentage (100% = original duration).
const bannerTime = computed(() => {
  const baseSeconds = Math.round((params.message || defaultMessages.banner).length / 5)
  const speedPercent = resolveParam('banner', 'speed')
  const duration = baseSeconds * (100 / speedPercent)
  return Math.max(duration, 0.1) + 's'
})

// Same pattern as bannerTime: 100% keeps the original .25s beat.
const heartBeatDuration = computed(() => {
  const speedPercent = resolveParam('heart', 'speed')
  return (0.25 * (100 / speedPercent)) + 's'
})
</script>

<style>
.heart-animation {
	animation: beat v-bind(heartBeatDuration) infinite alternate;
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
