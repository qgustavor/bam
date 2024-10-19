<template>
  <span class="text-fit" ref="balancedElement">
    <slot />
  </span>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import balanceTextBreaks from '../util/balanceText'

const balancedElement = ref(null)
onMounted(() => {
  balanceTextBreaks(balancedElement.value)
})
</script>

<style scoped>
.text-fit {
  text-wrap: nowrap;
}
</style>
