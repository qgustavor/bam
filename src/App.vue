<template>
  <main class="absolute w-full min-h-screen bg-gray-900 text-gray-100">
    <MessageRenderer/>
    <Homepage />
  </main>
</template>

<script setup>
import Homepage from './components/Homepage.vue'
import MessageRenderer from './components/MessageRenderer.vue'
</script>

<style>
html {
  color-scheme: dark;
}
</style>
