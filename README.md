Inspiration
We noticed that while people are becoming more aware of AI's environmental impact, there's no easy way to visualize it in real time. Every time you send a message to an AI such as ChatGPT, it consumes water to cool the data centers running those models. We wanted to make that invisible cost visible. This tool will allow us to be both more environmentally knowledgeable.

What it does
AWU Tracker is a Firefox extension that tracks how much water is consumed by your AI usage in real time. It counts output tokens from sites like ChatGPT and Claude, converts them to an estimated water usage figure, and displays your stats in a clean sidebar and dashboard. You can see your total water used, water bottles equivalent, and even what percentage of Lake Mendota you've consumed.

How we built it
We built it using Plasmo, a browser extension framework that lets you write extensions in React and TypeScript. The frontend is built with React and Tailwind CSS. Content scripts detect AI responses on ChatGPT and Claude, count tokens using a tokenizer library, and store the data in chrome.storage. The sidebar and dashboard read from that storage and update in real time.

Challenges we ran into
Finding accurate research data on how much water is consumed by AI was tricky. Another issue is that without an API key to ChatGPT, there would only be an estimate on how many tokens were used unless we were to use our own LLM thereby consuming more water. To counteract this we decided to use DOM scrapping on the ChatGPT website to get a more estimated figure, and allow for non-tech savvy users to use the extension.

Getting the Firefox sidebar API working with Plasmo was tricky since Plasmo is primarily designed for Chrome. We also had to figure out how to detect when an AI response finished streaming before counting tokens, since these sites load responses dynamically.

Accomplishments that we're proud of
Creating a web extension and being able to connect the frontend and the backend is what we are most proud of. Every process from the research, to the innovative solutions, to the actual implementation is what we are proud of.

What we learned
We learned a lot about how browser extensions work under the hood such as content scripts, background workers, and extension storage. We also got hands on experience with React, Tailwind, and TypeScript as a team. We honestly also learned the more accurate usage of water per prompt, as AI becomes more infamous a lot of misinformation spreads quickly of how much/little water AI actually uses.

What's next for AWU Tracker
Some features that we did not have time for include: allowing the scrapper to read images, creating a chrome version for a bigger userbase, even more detailed breakdowns by model and session, and perhaps even settings to toggle things like including water training costs.

This is a Plasmo extension project bootstrapped with plasmo init.

## Getting Started

First, run the development server:

```bash
pnpm dev
# or
npm run dev
```

Open your browser and load the appropriate development build. For example, if you are developing for the chrome browser, using manifest v3, use: `build/chrome-mv3-dev`.

You can start editing the popup by modifying `popup.tsx`. It should auto-update as you make changes. To add an options page, simply add a `options.tsx` file to the root of the project, with a react component default exported. Likewise to add a content page, add a `content.ts` file to the root of the project, importing some module and do some logic, then reload the extension on your browser.

For further guidance, [visit our Documentation](https://docs.plasmo.com/)

## Making production build

Run the following:

```bash
pnpm build
# or
npm run build
```

This should create a production bundle for your extension, ready to be zipped and published to the stores.

## Submit to the webstores

The easiest way to deploy your Plasmo extension is to use the built-in [bpp](https://bpp.browser.market) GitHub action. Prior to using this action however, make sure to build your extension and upload the first version to the store to establish the basic credentials. Then, simply follow [this setup instruction](https://docs.plasmo.com/framework/workflows/submit) and you should be on your way for automated submission!



sources used:
https://www.eesi.org/articles/view/data-centers-and-water-consumption

https://www.ceres.org/resources/reports/drained-by-data-the-cumulative-impact-of-data-centers-on-regional-water-stress?utm_source=google-ad-grant&utm_medium=paid&utm_campaign=ceres_evergreen_keywords&utm_term=googleadgrant&gad_source=1&gad_campaignid=15876522884&gbraid=0AAAAADlebsLUm1ToorvSgKtGcAIx8gDr9&gclid=Cj0KCQiA5I_NBhDVARIsAOrqIsZANlHCOIVQkNG3C_Xz9zTsoCb9uyPyMaMIT5xeCv8JBnGW-GBpS9QaAuOnEALw_wcB

https://theconversation.com/ai-has-a-hidden-water-cost-heres-how-to-calculate-yours-263252

## How the Extension Works

The core goal of this project is to estimate the environmental "water cost" of
using large language models in the browser and present live metrics to the user
via a sidebar and dashboard.  The implementation consists of three cooperating
pieces:

(NOTE: the extension only keeps track of your current session, once you exit the extension the data resets.)

1. **Content script (`contents/content.ts`)** – injected into the AI site
	(ChatGPT) and watches for new response text.  When a
	block of output finishes, it estimates the number of tokens based on the
	length of the input/response pair, converts tokens into milliliters of water
	using per-model rates, and keeps running totals.  Each time a response is
	processed the script sends a `tokenData` message to the rest of the
	extension containing:
	- total tokens seen so far
	- total water used (liters)
	- equivalent number of 500 mL water bottles
	- percentage of Lake Mendota consumed


2. **Sidebar panel (`sidepanel.tsx`)** – a React component rendered by Plasmo in
	the browser sidebar.  It listens for `chrome.runtime` messages from the
	content script, updates a small state object, and displays the latest
	metrics.  A couple of short-lived CSS animations (waterfall / water-falling)
	play whenever new data arrives.  A button opens the full dashboard in a new
	tab.

3. **Dashboard page (`tabs/dashboard.tsx`)** – another React view that shows the
	same data but with richer formatting, time filters, and counters.
	It also listens for `tokenData` events and multiplies the raw totals by a
	multiplier to demonstrate multiple users with your inputs to demonstrate the 
    impact of many people on water consumption.

Additionally, a minimal `background.js` toggles the sidebar when the extension
icon is clicked, and a couple of shared components (`components/card.tsx` and
`components/metriccard.tsx`) handle reusable card styles.

The majority of the logic lives in the content script; the UI layers simply
display whatever numbers are sent by the background logic.  This separation
keeps the metrics calculation independent of the presentation and makes it easy
to extend or port to other UIs later.
