<!-- Adapted from https://github.com/w3c/csswg-drafts/issues/2528#issuecomment-2319701067 -->
 
<template>
  <span class="text-fit">
    <span><span><slot /></span></span>

    <span aria-hidden="true"><slot /></span>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
const props = defineProps<{
  maxFontSize?: string
}>();

const maxfontsize = computed(() => {
  return props.maxFontSize || '100vh';
});
</script>

<style scoped>
.text-fit {
  --max-font-size: v-bind(maxfontsize);

  display: flex;
  container-type: inline-size;
  width: 100%;

  --captured-length: initial;
  --support-sentinel: var(--captured-length, 9999px);

  & > [aria-hidden] {
    visibility: hidden;
  }

  & > :not([aria-hidden]) {
    flex-grow: 1;
    container-type: inline-size;

    --captured-length: 100cqi;
    --available-space: var(--captured-length);

    & > * {
      --support-sentinel: inherit;
      --captured-length: 100cqi;
      --ratio:
        tan(
          atan2(
            var(--available-space),
            var(--available-space) - var(--captured-length)
          )
        );
      --font-size:
        clamp(
          1em,
          1em * var(--ratio),
          var(--max-font-size)
          -
          var(--support-sentinel)
        );

      inline-size: var(--available-space);

      &:not(.text-fit) {
        display: block;
        font-size: var(--font-size);
        translate: 0 calc(((-1em / 1.5) + 1ex) / 2);

        /* stylelint-disable-next-line */
        @container (inline-size > 0) {
          white-space: nowrap;
        }
      }

      &.text-fit {
        --captured-length2: var(--font-size);

        font-variation-settings:
          "opsz"
          tan(
            atan2(var(--captured-length2), 1px)
          );
      }
    }
  }
}

.text-fit:not(.text-fit *) {
  --max-font-size: v-bind(maxfontsize);

  margin: 0.25em 0;
  line-height: 0.95;
}

@property --captured-length {
  syntax: "<length>";
  initial-value: 0;
  inherits: true;
}

@property --captured-length2 {
  syntax: "<length>";
  initial-value: 0;
  inherits: true;
}
</style>
