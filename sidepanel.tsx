import {useState} from 'react';
import CardProp from 'components/card';
import "./style.css"

function SidePanel() {

  const [showWaterfall, setShowWaterfall] = useState(false);

  function handleWaterfall

  function openWebpage() {
    chrome.tabs.create({ url: chrome.runtime.getURL("tabs/dashboard.html") })
  }

  return (
    <>
      <div className="w-[340px] p-4">

      <CardProp>
        <h1 className="text-lg font-semibold mb-1">AI Water Tracker</h1>
        <div className="text-gray-500 text-xs">
          Tracks estimated water usage from your AI tokens/requests.
        </div>
      </CardProp>

      <CardProp>
        <div className="text-gray-500 text-sm">Total water used</div>
        <div className="text-2xl font-semibold text-blue-500">
          {"0 L"}
        </div>
        <div className="text-gray-500 text-xs">{"{numTokens}"} tokens</div>
      </CardProp>

      <CardProp>
        <div className="flex justify-between items-center">
          <div>
            <div className="text-gray-500 text-sm">History</div>
            <div className="text-gray-500 text-xs">Recent additions</div>
          </div>
 
        </div> 
      </CardProp>

      <CardProp>
        <div className="text-gray-500 text-sm">Total water bottles consumed</div>
        <div className="text-2xl font-semibold text-blue-500">{"waterBottles"}</div>
      </CardProp>

      <div className="text-xs text-gray-700 mb-3">
        Conversion note: uses liters-per-token multiplier stored locally.
      </div>

      <CardProp>
        <div className="text-gray-500 text-sm text-center">
          You have used up <span className="font-semibold">"numVariable"</span>% of Lake Mendota.
        </div>
      </CardProp>

      <button
        onClick={openWebpage}
        className="w-full bg-blue-500 text-white px-3 py-2 rounded-lg cursor-pointer text-sm">
        Dashboard
      </button>

    </div>
      
    </>
  )
}

export default SidePanel