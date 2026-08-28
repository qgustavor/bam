<template>
  <div
    v-for="param in parameters"
    :key="param.key"
    class="relative w-full mb-3"
  >
    <label
      class="block uppercase text-gray-300 text-xs font-bold mb-2"
      :for="param.key"
      >{{ param.label }}
    </label>
    <select
      v-if="param.type === 'select'"
      :id="param.key"
      class="border-0 px-3 py-3 text-gray-700 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full"
      v-model="values[param.key]"
    >
      <option
        v-for="option in param.options"
        :value="option.value"
        :key="option.value"
      >{{ option.label }}
      </option>
    </select>
    <div v-else class="flex items-center gap-3">
      <input
        type="range"
        :id="param.key"
        :min="param.min"
        :max="param.max"
        :step="param.step ?? 1"
        v-model.number="values[param.key]"
        class="w-full"
      />
      <span class="text-gray-300 text-xs whitespace-nowrap w-12 text-right">{{ values[param.key] }}{{ param.unit ?? '' }}</span>
    </div>
    <p v-if="warningFor(param)" class="text-yellow-400 text-xs mt-2">
      ⚠️ {{ warningFor(param) }}
    </p>
    <div
      v-if="param.colorPicker && values[param.key] === 'custom'"
      class="flex items-center gap-2 mt-2"
    >
      <input
        type="color"
        :id="param.colorPicker.key"
        v-model="values[param.colorPicker.key]"
        class="h-9 w-14 rounded border-0 cursor-pointer bg-white p-0.5"
      />
      <label :for="param.colorPicker.key" class="text-gray-300 text-xs">{{ param.colorPicker.label }}</label>
    </div>
  </div>
</template>

<script setup>
defineProps({
  parameters: {
    type: Array,
    required: true
  }
})

// Two-way binding for the { [paramKey]: value } map — a plain object is
// enough here, no need for the parent to manage each field separately.
const values = defineModel({ type: Object, required: true })

function warningFor (param) {
  if (param.type === 'range') {
    return param.warningFor?.(values.value[param.key])
  }
  const option = param.options.find(o => o.value === values.value[param.key])
  return option?.warning
}
</script>
