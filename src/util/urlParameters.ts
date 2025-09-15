import { watch } from 'vue'
import { useUrlSearchParams } from '@vueuse/core'
export const params = useUrlSearchParams('hash')
import * as base64 from '@juanelas/base64'

async function handleObfuscatedMessage () {
  if (typeof params._ !== 'string') return
  let obfuscatedMessage: string | Uint8Array | undefined = base64.decode(params._)
  params._ = null
  if (!obfuscatedMessage) return

  // Try decompressing using deflate-raw
  try {
    obfuscatedMessage = await new Response(
      new Response(obfuscatedMessage as unknown as BodyInit)
        .body
        .pipeThrough(new window.DecompressionStream('deflate-raw'))
    ).text()
  } catch {}

  if (typeof obfuscatedMessage !== 'string') {
    obfuscatedMessage = new TextDecoder().decode(obfuscatedMessage)
  }

  if (!obfuscatedMessage.includes('|')) return
  const [style, ...message] = obfuscatedMessage.split('|')
  params.style = style
  params.message = message.join('|')
}

watch(() => params._, handleObfuscatedMessage, {
  immediate: true
})

export async function getObfuscatedUrl ({ style, message }: { style: string, message: string }) {
  const mergedMessage = new TextEncoder().encode(style + '|' + message)
  const compressed = new Uint8Array(await new Response(new Response(mergedMessage).body.pipeThrough(new CompressionStream('deflate-raw'))).arrayBuffer())
  const chosenMessage = compressed.length < mergedMessage.length ? compressed : mergedMessage
  return '#?_=' + base64.encode(chosenMessage, true, false)
}
