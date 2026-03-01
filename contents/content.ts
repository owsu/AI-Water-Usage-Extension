//export {}

//console.log('[Token Tracker] Content script loaded...')

//const LAKE_MENDOTA_LITERS = 500000000000
//const WATER_BOTTLE_LITERS = 0.5

//const WATER_RATES: Record<string, number> = {
  //chatgpt: 25,
  //claude:  20,
  //gemini:  18,
  //default: 20
//}

//const SELECTORS: Record<string, string> = {
  //chatgpt: '.prose',
  //claude:  '.prose',
  //gemini:  '.response-content',
  //default: '.prose'
//}

//function detectSite(): string {
  //const host = window.location.hostname
  //if (host.includes('chatgpt.com') || host.includes('openai.com')) return 'chatgpt'
  //if (host.includes('claude.ai')) return 'claude'
  //if (host.includes('gemini.google')) return 'gemini'
  //return 'default'
//}

//const SITE = detectSite()
//let totalTokens = 0
//let totalWaterLiters = 0

//function estimateTokens(text: string): number {
  //return Math.ceil(text.length / 4)
//}

//function calculateWater(tokens: number) {
  //const rate = WATER_RATES[SITE] || WATER_RATES.default
  //const ml = (tokens / 1000) * rate
  //const liters = ml / 1000
  //return { ml, liters }
//}

//const seenResponses = new WeakMap()

//function processResponse(element: Element, inputText: string) {
  //const outputText = element.textContent?.trim() || ''
  //if (!outputText) return
  //if (seenResponses.get(element) === outputText) return
  //seenResponses.set(element, outputText)

  //const inputTokens = inputText ? estimateTokens(inputText) : 0
  //const outputTokens = estimateTokens(outputText)
  //const responseTokens = inputTokens + outputTokens
  //const water = calculateWater(responseTokens)

  //totalTokens += responseTokens
  //totalWaterLiters += water.liters

  //const waterBottles = totalWaterLiters / WATER_BOTTLE_LITERS
  //const mendotaPercent = (totalWaterLiters / LAKE_MENDOTA_LITERS) * 100

  //console.log('[Token Tracker] Response processed!')
  //console.log('  Input tokens:   ' + inputTokens)
  //console.log('  Output tokens:  ' + outputTokens)
  //console.log('  Session tokens: ' + totalTokens)
  //console.log('  Session water:  ' + totalWaterLiters.toFixed(6) + ' L')

  //chrome.runtime.sendMessage({
    //type: "tokenData",
    //detail: {
      //numWaterLiters: totalWaterLiters.toFixed(4),
      //numTokens: totalTokens,
      //waterBottles: waterBottles.toFixed(2),
      //numVariable: mendotaPercent.toExponential(4),
    //}
  //})
//}

//function getLastUserInput(): string {
  //const selectors = [
    //'[data-message-author-role="user"]',
    //'.human-turn',
    //'.user-query'
  //]
  //for (const sel of selectors) {
    //const msgs = document.querySelectorAll(sel)
    //if (msgs.length > 0) return msgs[msgs.length - 1].textContent?.trim() || ''
  //}
  //return ''
//}

//function watchForCompletion(element: Element) {
  //const lastUserInput = getLastUserInput()
  //let debounceTimer: ReturnType<typeof setTimeout> | null = null

  //const textObserver = new MutationObserver(() => {
    //if (debounceTimer) clearTimeout(debounceTimer)
    //debounceTimer = setTimeout(() => {
      //textObserver.disconnect()
      //processResponse(element, lastUserInput)
    //}, 600)
  //})

  //textObserver.observe(element, { childList: true, characterData: true, subtree: true })

  //setTimeout(() => {
    //textObserver.disconnect()
    //processResponse(element, lastUserInput)
  //}, 10000)
//}

//const selector = SELECTORS[SITE] || SELECTORS.default

//const observer = new MutationObserver((mutations) => {
  //mutations.forEach(mutation => {
    //mutation.addedNodes.forEach(node => {
      //if (node.nodeType !== Node.ELEMENT_NODE) return
      //const el = node as Element
      // also search upward for already-present containers
      //const target = el.matches(selector) ? el : el.querySelector(selector)
      //if (target) watchForCompletion(target)
    //})
  //})
//})

//observer.observe(document.body, { childList: true, subtree: true })
//console.log('[Token Tracker] Watching for responses using selector: ' + selector)

export {}

console.log('[Token Tracker] Content script loaded...')

// ─── Constants ───────────────────────────────────────────────────────────────

const LAKE_MENDOTA_LITERS = 500_000_000_000
const WATER_BOTTLE_LITERS = 0.5

// ml per 1,000 *weighted* tokens (output tokens are weighted 15x vs input)
// Sources: Li et al. 2023 (UC Riverside), SemiAnalysis 2024
const WATER_RATES: Record<string, number> = {
  // ChatGPT: GPT-4 class models
  'chatgpt-4':     34.6,  // GPT-4, ~519ml/1k output tokens / 15 weight factor
  'chatgpt-3.5':    8.0,  // GPT-3.5-Turbo, much smaller model
  'chatgpt':       34.6,  // default to GPT-4 class if model undetected

  // Claude: Anthropic models
  'claude-3-5':    24.0,  // Claude 3.5 Sonnet
  'claude-3':      26.7,  // Claude 3 Opus
  'claude':        24.0,  // default to 3.5 class

  // Gemini: Google models
  'gemini-pro':    23.3,  // Gemini Pro
  'gemini-nano':   10.0,  // Gemini Nano, lightweight
  'gemini':        23.3,  // default to Pro

  'default':       24.0
}

// Datacenter regional water multipliers (evaporative cooling varies by climate)
// Source: Li et al. 2023, Microsoft datacenter WUE reports
const DATACENTER_MULTIPLIER: Record<string, number> = {
  'us-east':  1.0,   // baseline (Virginia)
  'us-west':  0.7,   // cooler climate, less cooling needed (Oregon)
  'us-south': 1.8,   // hot/humid, high evaporative cooling (Texas, Arizona)
  'eu':       0.6,   // generally more efficient, cooler climates
  'default':  1.0
}

// CSS selectors for AI response elements per site
const SELECTORS: Record<string, string> = {
  chatgpt: '.prose',
  claude:  '.prose',
  gemini:  '.response-content',
  default: '.prose'
}

// User message selectors per site
const USER_SELECTORS: Record<string, string[]> = {
  chatgpt: ['[data-message-author-role="user"]', '.human-turn'],
  claude:  ['[data-message-author-role="user"]', '.human-turn', '.user-query'],
  gemini:  ['.user-query', '.human-turn'],
  default: ['[data-message-author-role="user"]', '.human-turn', '.user-query']
}

// ─── Site & Model Detection ───────────────────────────────────────────────────

function detectSite(): string {
  const host = window.location.hostname
  if (host.includes('chatgpt.com') || host.includes('openai.com')) return 'chatgpt'
  if (host.includes('claude.ai')) return 'claude'
  if (host.includes('gemini.google')) return 'gemini'
  return 'default'
}

// Attempts to detect the active model from the page DOM
function detectModel(site: string): string {
  try {
    if (site === 'chatgpt') {
      // ChatGPT shows active model in a button/selector near top of page
      const modelEl =
        document.querySelector('[data-testid="model-switcher-dropdown-button"]') ||
        document.querySelector('.model-switcher') ||
        document.querySelector('[aria-label*="Model"]')
      const modelText = modelEl?.textContent?.toLowerCase() || ''
      if (modelText.includes('3.5')) return 'chatgpt-3.5'
      if (modelText.includes('4o') || modelText.includes('gpt-4')) return 'chatgpt-4'
      return 'chatgpt'
    }

    if (site === 'claude') {
      const modelEl =
        document.querySelector('[data-testid="model-selector"]') ||
        document.querySelector('.model-selector')
      const modelText = modelEl?.textContent?.toLowerCase() || ''
      if (modelText.includes('3-5') || modelText.includes('3.5')) return 'claude-3-5'
      if (modelText.includes('opus') || modelText.includes('3')) return 'claude-3'
      return 'claude'
    }

    if (site === 'gemini') {
      const modelEl = document.querySelector('.model-selector, [aria-label*="Gemini"]')
      const modelText = modelEl?.textContent?.toLowerCase() || ''
      if (modelText.includes('nano')) return 'gemini-nano'
      if (modelText.includes('pro')) return 'gemini-pro'
      return 'gemini'
    }
  } catch (e) {
    // DOM detection failed, fall back to site default
  }
  return site
}

const SITE = detectSite()

// ─── Session State ────────────────────────────────────────────────────────────

let totalTokens       = 0
let totalWaterLiters  = 0
let totalQueries      = 0

// ─── Token Estimation ─────────────────────────────────────────────────────────

// Word-based estimation is closer to real BPE tokenization than char/4
// Rule of thumb: ~1.33 tokens per word (from OpenAI tokenizer benchmarks)
function estimateTokens(text: string): number {
  if (!text) return 0
  const words = text.trim().split(/\s+/).filter(Boolean).length
  return Math.ceil(words * 1.33)
}

// ─── Water Calculation ────────────────────────────────────────────────────────

// Output tokens are ~15x more compute-intensive than input tokens
// (decode phase vs prefill phase — source: SemiAnalysis 2024)
// We weight accordingly before applying the per-site water rate
function calculateWater(
  inputTokens: number,
  outputTokens: number,
  model: string,
  datacenter: string = 'default'
): { ml: number; liters: number } {
  const rate       = WATER_RATES[model]      ?? WATER_RATES.default
  const multiplier = DATACENTER_MULTIPLIER[datacenter] ?? DATACENTER_MULTIPLIER.default

  // Weight output tokens 15x vs input (compute intensity ratio)
  const weightedTokens = (inputTokens * 1) + (outputTokens * 15)
  const ml             = (weightedTokens / 1000) * rate * multiplier
  const liters         = ml / 1000

  return { ml, liters }
}

// ─── Response Processing ──────────────────────────────────────────────────────

const seenResponses = new WeakMap<Element, string>()

function processResponse(element: Element, inputText: string) {
  const outputText = element.textContent?.trim() || ''
  if (!outputText) return
  if (seenResponses.get(element) === outputText) return
  seenResponses.set(element, outputText)

  const model       = detectModel(SITE)
  const inputTokens = estimateTokens(inputText)
  const outputTokens = estimateTokens(outputText)
  const water       = calculateWater(inputTokens, outputTokens, model)

  totalTokens      += inputTokens + outputTokens
  totalWaterLiters += water.liters
  totalQueries     += 1

  const waterBottles       = totalWaterLiters / WATER_BOTTLE_LITERS
  const mendotaPercent     = (totalWaterLiters / LAKE_MENDOTA_LITERS) * 100
  const sessionQueriesPerLiter = totalQueries / (totalWaterLiters || 1)

  console.log('[Token Tracker] Response processed!')
  console.log('  Model:          ' + model)
  console.log('  Input tokens:   ' + inputTokens)
  console.log('  Output tokens:  ' + outputTokens)
  console.log('  Session tokens: ' + totalTokens)
  console.log('  Session water:  ' + totalWaterLiters.toFixed(6) + ' L')
  console.log('  Queries/liter:  ' + sessionQueriesPerLiter.toFixed(2))

  chrome.runtime.sendMessage({
    type: 'tokenData',
    detail: {
      numWaterLiters:       totalWaterLiters.toFixed(4),
      numTokens:            totalTokens,
      waterBottles:         waterBottles.toFixed(2),
      numVariable:          mendotaPercent.toExponential(4),
      queriesPerLiter:      sessionQueriesPerLiter.toFixed(2),
      totalQueries,
      model,
      inputTokens,
      outputTokens,
      preview:              outputText.slice(0, 80),
      timestamp:            Date.now()
    }
  }).catch(() => {
    // Background context unavailable — silently ignore to prevent
    // "context invalidated" errors from crashing the content script
  })
}

// ─── User Input Detection ─────────────────────────────────────────────────────

function getLastUserInput(): string {
  const selectors = USER_SELECTORS[SITE] || USER_SELECTORS.default
  for (const sel of selectors) {
    const msgs = document.querySelectorAll(sel)
    if (msgs.length > 0) return msgs[msgs.length - 1].textContent?.trim() || ''
  }
  return ''
}

// ─── Response Observation ─────────────────────────────────────────────────────

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

  // Hard timeout fallback in case streaming never fully stops
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
      const el     = node as Element
      const target = el.matches(selector) ? el : el.querySelector(selector)
      if (target) watchForCompletion(target)
    })
  })
})

observer.observe(document.body, { childList: true, subtree: true })
console.log('[Token Tracker] Watching for responses on ' + SITE + ' using selector: ' + selector)