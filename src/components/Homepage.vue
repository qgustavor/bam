<template>
  <div class="flex content-center items-center justify-center min-h-screen" :class="[params.style && 'hidden']">
    <div class="w-full lg:w-4/12 px-4">
      <img src="../assets/logo.svg" alt="BAM logo" class="w-1/2 mx-auto">

      <form>
        <div class="relative w-full mb-3">
          <label
            class="block uppercase text-gray-300 text-xs font-bold mb-2"
            for="message"
            >Message
          </label>
          <input
            type="text"
            id="message"
            class="border-0 px-3 py-3 placeholder-gray-400 text-gray-700 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full"
            placeholder="Message"
            v-model="message"
          />
        </div>
        <div class="relative w-full mb-3">
          <label
            class="block uppercase text-gray-300 text-xs font-bold mb-2"
            for="style"
            >Style
          </label>
          <select
            id="style"
            class="border-0 px-3 py-3 text-gray-700 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full"
            v-model="style"
          >
            <option
              v-for="(styleName, styleKey) in styles"
              :value="styleKey"
              :key="styleKey"
            >{{ styleName }}
            </option>
          </select>
        </div>
        <div
          v-if="currentStyleParameters.length"
          class="relative w-full mb-3"
        >
          <details class="text-gray-300">
            <summary class="cursor-pointer text-xs uppercase font-bold select-none">
              Customize this style
            </summary>
            <div class="mt-3">
              <StyleParamsForm
                :parameters="currentStyleParameters"
                v-model="paramValues"
              />
            </div>
          </details>
        </div>
        <div class="text-center mt-6">
          <StyledButton class="w-1/3" @click.prevent="previewMessage">
            Preview
          </StyledButton>
          <StyledButton class="w-1/3" @click.prevent="shareUrl">
            Share
          </StyledButton>
          <div class="flex items-center justify-center mt-4">
              <input id="onbuscated" type="checkbox" v-model="obfuscated" class="w-4 h-4 text-blue-600 rounded focus:ring-blue-600 ring-offset-gray-800 focus:ring-2 bg-gray-700 border-gray-600">
              <label for="onbuscated" class="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300 select-none">Obfuscate URL before sharing</label>
          </div>
        </div>
      </form>
      <footer class="text-center text-gray-500 mt-2">
        Inspired by <StyledLink href="https://bigassmessage.com">BIG-ASS MESSAGE</StyledLink> and hosted at <StyledLink href="https://github.com/qgustavor/bam/">GitHub</StyledLink>.
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { params, getObfuscatedUrl } from '../util/urlParameters'
import StyledButton from './StyledButton.vue'
import StyledLink from './StyledLink.vue'
import StyleParamsForm from './StyleParamsForm.vue'
import { styles } from '../util/styles'
import { styleParameters } from '../util/styleParameters'
import { isValidHexColor } from '../util/color'

const message = ref(params.message ?? '')
const style = ref(styles[params.style] ? params.style : 'basic')
const obfuscated = ref(false)

// All parameter keys used across every style (including companion color
// pickers), so we know which ones to clear from the URL when they no
// longer apply to the selected style.
const allStyleParamKeys = [...new Set(
  Object.values(styleParameters).flat().flatMap(p => p.colorPicker ? [p.key, p.colorPicker.key] : [p.key])
)]

const currentStyleParameters = computed(() => styleParameters[style.value] ?? [])

// Current values for the selected style's parameters, seeded from the URL
// (so editing a shared link keeps its settings) or each parameter's default.
const paramValues = reactive({})

function resetParamValues () {
  for (const key of Object.keys(paramValues)) delete paramValues[key]
  for (const param of currentStyleParameters.value) {
    if (param.type === 'range') {
      const raw = Number(params[param.key])
      paramValues[param.key] = Number.isFinite(raw) ? clamp(raw, param.min, param.max) : param.default
      continue
    }

    const urlValue = params[param.key]
    const isValid = typeof urlValue === 'string' && param.options.some(o => o.value === urlValue)
    paramValues[param.key] = isValid ? urlValue : param.default

    if (param.colorPicker) {
      const urlColor = params[param.colorPicker.key]
      paramValues[param.colorPicker.key] = isValidHexColor(urlColor) ? urlColor : param.colorPicker.default
    }
  }
}

function clamp (value, min, max) {
  return Math.min(max, Math.max(min, value))
}
resetParamValues()
watch(style, resetParamValues)

function applyParamsToUrl () {
  for (const key of allStyleParamKeys) {
    params[key] = key in paramValues ? paramValues[key] : null
  }
}

function previewMessage () {
  params.message = message.value
  params.style = style.value
  applyParamsToUrl()
}

async function shareUrl (evt) {
  const url = new URL(location.href)
  if (obfuscated.value) {
    const obfuscatedHash = await getObfuscatedUrl({
      message: message.value,
      style: style.value
    })
    const extraParams = new URLSearchParams(paramValues).toString()
    url.hash = extraParams ? `${obfuscatedHash}&${extraParams}` : obfuscatedHash
  } else {
    url.hash = new URLSearchParams({
      message: message.value,
      style: style.value,
      ...paramValues
    })
  }
  navigator.share({
    title: 'A BIG MESSAGE',
    text: 'Here is a big message for you!',
    url: url.href
  }, {
    copy: true,
    email: true,
    print: false,
    sms: false,
    twitter: false,
    skype: false,
    pinterest: false
  })
}
</script>
