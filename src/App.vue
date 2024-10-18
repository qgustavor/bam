<template>
  <main class="absolute w-full min-h-screen bg-gray-900 text-gray-100">
    <div class="container mx-auto px-4">
      <div class="flex content-center items-center justify-center h-full">
        <div class="w-full lg:w-4/12 px-4">
          <img src="./assets/logo.svg" alt="BAM logo" class="w-1/2 mx-auto">

          <form>
            <div class="relative w-full mb-3">
              <label
                class="block uppercase text-gray-300 text-xs font-bold mb-2"
                for="message"
                >Message
              </label>
              <input
                type="email"
                id="message"
                class="border-0 px-3 py-3 placeholder-gray-400 text-gray-700 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full"
                placeholder="Message"
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
              >
                <option
                  v-for="(styleName, styleKey) in styles"
                  :value="styleKey"
                >{{ styleName }}
                </option>
              </select>
            </div>
            <div class="text-center mt-6">
              <button
                class="bg-gray-100 text-gray-900 active:bg-gray-300 text-sm font-bold uppercase px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 w-1/3"
              >
                Preview
              </button>
              <button
                class="bg-gray-100 text-gray-900 active:bg-gray-300 text-sm font-bold uppercase px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 w-1/3"
              >
                Share URL
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
const styles = {
  basic: 'Basic',
  magic: 'Magic',
  jprdy: 'JPRDY',
  heart: 'Heart',
  hypno: 'Hypno'
}
</script>

<style>
html {
  color-scheme: dark;
}
</style>
