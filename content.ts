export {}

console.log('[Token Tracker] Content script loaded...')

const LAKE_MENDOTA_LITERS = 500000000000
const WATER_BOTTLE_LITERS = 0.5

const WATER_RATES: Record<string, number> = {
  chatgpt: 500,
  claude:  400,
  gemini:  350,
  default: 400
}

const SELECTORS: Record<string, string> = {
  chatgpt: '.markdown',
  claude:  '.prose',
  gemini:  '.response-content',
  default: '.markdown'
}

function detectSite(): string {
  const host = window.location.hostname
  if (host.includes('chatgpt.com') || host.includes('openai.com')) return 'chatgpt'
  if (host.includes('claude.ai')) return 'claude'
  if (host.includes('gemini.google')) return 'gemini'
  return 'default'
}

const SITE = detectSite()
let totalTokens = 0
let totalWaterLiters = 0

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4)
}

function calculateWater(tokens: number) {
  const rate = WATER_RATES[SITE] || WATER_RATES.default
  const ml = (tokens / 1000) * rate
  const liters = ml / 1000
  return { ml, liters }
}

const seenResponses = new WeakMap()

function processResponse(element: Element, inputText: string) {
  const outputText = element.textContent?.trim() || ''
  if (!outputText) return
  if (seenResponses.get(element) === outputText) return
  seenResponses.set(element, outputText)

  const inputTokens = inputText ? estimateTokens(inputText) : 0
  const outputTokens = estimateTokens(outputText)
  const responseTokens = inputTokens + outputTokens
  const water = calculateWater(responseTokens)

  totalTokens += responseTokens
  totalWaterLiters += water.liters

  const waterBottles = totalWaterLiters / WATER_BOTTLE_LITERS
  const mendotaPercent = (totalWaterLiters / LAKE_MENDOTA_LITERS) * 100

  console.log('[Token Tracker] Response processed!')
  console.log('  Input tokens:   ' + inputTokens)
  console.log('  Output tokens:  ' + outputTokens)
  console.log('  Session tokens: ' + totalTokens)
  console.log('  Session water:  ' + totalWaterLiters.toFixed(6) + ' L')

  window.dispatchEvent(new CustomEvent('tokenData', {
    detail: {
      numWaterLiters: totalWaterLiters.toFixed(4),
      numTokens: totalTokens,
      waterBottles: waterBottles.toFixed(2),
      numVariable: mendotaPercent.toExponential(4),
      site: SITE,
      inputTokens,
      outputTokens,
      preview: outputText.slice(0, 80),
      timestamp: Date.now()
    }
  }))
}

function getLastUserInput(): string {
  const selectors = [
    '[data-message-author-role="user"]',
    '.human-turn',
    '.user-query'
  ]
  for (const sel of selectors) {
    const msgs = document.querySelectorAll(sel)
    if (msgs.length > 0) return msgs[msgs.length - 1].textContent?.trim() || ''
  }
  return ''
}

function watchForCompletion(element: Element) {
  const lastUserInput = getLastUserInput()
  let debounceTimer: ReturnType<typeof setTimeout> | null = null

  const textObserver = new MutationObserver(() => {
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      textObserver.disconnect()
      processResponse(element, lastUserInput)
    }, 600)
  })

  textObserver.observe(element, { childList: true, characterData: true, subtree: true })

  setTimeout(() => {
    textObserver.disconnect()
    processResponse(element, lastUserInput)
  }, 10000)
}

const selector = SELECTORS[SITE] || SELECTORS.default

const observer = new MutationObserver((mutations) => {
  mutations.forEach(mutation => {
    mutation.addedNodes.forEach(node => {
      if (node.nodeType !== Node.ELEMENT_NODE) return
      const el = node as Element
      if (el.matches && el.matches(selector)) {
        watchForCompletion(el)
        return
      }
      const nested = el.querySelector && el.querySelector(selector)
      if (nested) watchForCompletion(nested)
    })
  })
})

observer.observe(document.body, { childList: true, subtree: true })
console.log('[Token Tracker] Watching for responses using selector: ' + selector)