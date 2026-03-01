// content.js
// Scrapes AI responses, estimates tokens, calculates water usage
// and compares to Lake Mendota volume

console.log('[Token Tracker] Content script loaded...');

// ── Lake Mendota & Water Constants ────────────────────────────────
// Lake Mendota volume: ~500,000,000,000 liters (5 × 10^11 L)
const LAKE_MENDOTA_LITERS = 500_000_000_000;

// Water usage per 1k tokens (in ml) based on UC Riverside research
const WATER_RATES = {
  chatgpt: 500,   // ml per 1k tokens
  claude:  400,
  gemini:  350,
  default: 400
};

// ── Detect which AI site we're on ────────────────────────────────
function detectSite() {
  const host = window.location.hostname;
  if (host.includes('chatgpt.com') || host.includes('openai.com')) return 'chatgpt';
  if (host.includes('claude.ai'))   return 'claude';
  if (host.includes('gemini.google')) return 'gemini';
  return 'default';
}

const SITE = detectSite();
console.log('[Token Tracker] Detected site: ' + SITE);

// ── CSS Selectors per site ────────────────────────────────────────
// These are the elements that wrap the AI response text
const SELECTORS = {
  chatgpt: '.markdown',           // ChatGPT response container
  claude:  '.prose',              // Claude response container (best guess, fix if needed)
  gemini:  '.response-content',  // Gemini response container (best guess, fix if needed)
  default: '.markdown'
};

// ── Token Estimation ──────────────────────────────────────────────
function estimateTokens(text) {
  // ~4 characters per token is the industry rule of thumb
  return Math.ceil(text.length / 4);
}

// ── Water Usage Calculation ───────────────────────────────────────
function calculateWater(tokens) {
  const rate = WATER_RATES[SITE] || WATER_RATES.default;
  const ml   = (tokens / 1000) * rate;
  const liters = ml / 1000;

  // What percentage of Lake Mendota is this?
  const mendotaPercent = (liters / LAKE_MENDOTA_LITERS) * 100;

  // Relatable comparison
  let comparison = '';
  if (ml < 250) {
    comparison = `less than a glass of water (${ml.toFixed(1)}ml)`;
  } else if (ml < 500) {
    comparison = `about half a water bottle (${ml.toFixed(1)}ml)`;
  } else if (ml < 1000) {
    comparison = `almost a full water bottle (${ml.toFixed(1)}ml)`;
  } else {
    comparison = `${liters.toFixed(2)} liters of water`;
  }

  return {
    ml:             parseFloat(ml.toFixed(2)),
    liters:         parseFloat(liters.toFixed(4)),
    comparison,
    mendotaPercent: mendotaPercent.toExponential(4), // e.g. "1.2000e-10"
    mendotaFraction: `1 in ${Math.round(LAKE_MENDOTA_LITERS / liters).toLocaleString()}`
  };
}

// ── Track what we've already processed ───────────────────────────
const seenResponses = new WeakMap();

// ── Process a completed AI response ──────────────────────────────
function processResponse(element, inputText) {
  const outputText = element.textContent.trim();
  if (!outputText) return;

  // Don't double count the same element
  if (seenResponses.get(element) === outputText) return;
  seenResponses.set(element, outputText);

  const inputTokens  = inputText ? estimateTokens(inputText) : 0;
  const outputTokens = estimateTokens(outputText);
  const totalTokens  = inputTokens + outputTokens;
  const water        = calculateWater(totalTokens);

  console.log('[Token Tracker] ─────────────────────────────');
  console.log('[Token Tracker] New response processed!');
  console.log('  Site:          ' + SITE);
  console.log('  Input tokens:  ' + inputTokens);
  console.log('  Output tokens: ' + outputTokens);
  console.log('  Total tokens:  ' + totalTokens);
  console.log('  Water used:    ' + water.comparison);
  console.log('  Mendota %:     ' + water.mendotaPercent + '%');
  console.log('  Mendota ratio: ' + water.mendotaFraction + ' parts of Lake Mendota');

  // Dispatch event so the frontend (dashboard.tsx) can listen for it
  window.dispatchEvent(new CustomEvent('tokenData', {
    detail: {
      site:          SITE,
      inputTokens,
      outputTokens,
      totalTokens,
      waterMl:       water.ml,
      waterLiters:   water.liters,
      comparison:    water.comparison,
      mendotaPercent: water.mendotaPercent,
      mendotaFraction: water.mendotaFraction,
      preview:       outputText.slice(0, 80)
    }
  }));
}

// ── Get the last user message for input token estimation ──────────
function getLastUserInput() {
  // Works for ChatGPT — update selector for Claude/Gemini if needed
  const selectors = [
    '[data-message-author-role="user"]',  // ChatGPT
    '.human-turn',                         // Claude (best guess)
    '.user-query'                          // Gemini (best guess)
  ];

  for (const sel of selectors) {
    const msgs = document.querySelectorAll(sel);
    if (msgs.length > 0) {
      return msgs[msgs.length - 1].textContent.trim();
    }
  }
  return '';
}

// ── Wait for streaming to finish before processing ────────────────
function watchForCompletion(element) {
  console.log('[Token Tracker] Response streaming started...');
  const lastUserInput = getLastUserInput();
  let debounceTimer   = null;

  const textObserver = new MutationObserver(() => {
    clearTimeout(debounceTimer);
    // 600ms pause in new characters = response is done streaming
    debounceTimer = setTimeout(() => {
      textObserver.disconnect();
      processResponse(element, lastUserInput);
    }, 600);
  });

  textObserver.observe(element, {
    childList:     true,
    characterData: true,
    subtree:       true
  });

  // Safety net in case streaming never triggers mutations
  setTimeout(() => {
    textObserver.disconnect();
    processResponse(element, lastUserInput);
  }, 10000);
}

// ── Main MutationObserver: watches for new AI response elements ───
const selector = SELECTORS[SITE] || SELECTORS.default;

const observer = new MutationObserver((mutations) => {
  mutations.forEach(mutation => {
    mutation.addedNodes.forEach(node => {
      if (node.nodeType !== Node.ELEMENT_NODE) return;

      // Check if the added node itself is a response container
      if (node.matches && node.matches(selector)) {
        watchForCompletion(node);
        return;
      }

      // Check if it contains a response container
      const nested = node.querySelector && node.querySelector(selector);
      if (nested) watchForCompletion(nested);
    });
  });
});

observer.observe(document.body, { childList: true, subtree: true });
console.log('[Token Tracker] Watching for responses using selector: ' + selector);