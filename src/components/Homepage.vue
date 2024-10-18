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
        <div class="text-center mt-6">
          <StyledButton class="w-1/3" @click.prevent="previewMessage">
            Preview
          </StyledButton>
          <StyledButton class="w-1/3" @click.prevent="shareUrl">
            Share
          </StyledButton>
        </div>
      </form>
      <footer class="text-center text-gray-500 mt-2">
        Inspired by <StyledLink href="https://bigassmessage.com">BIG-ASS MESSAGE</StyledLink> and hosted at <StyledLink href="https://github.com/qgustavor/bam/">GitHub</StyledLink>.
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { params } from '../util/urlParameters'
import StyledButton from './StyledButton.vue'
import StyledLink from './StyledLink.vue'
import { styles } from '../util/styles'

const message = ref(params.message ?? '')
const style = ref(styles[params.style] ? params.style : 'basic')

function previewMessage () {
  params.message = message.value
  params.style = style.value
}

function shareUrl () {
  const url = new URL(location.href)
  url.hash = new URLSearchParams({
    message: message.value,
    style: style.value
  })
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
