import {useState, useEffect} from 'react';
import CardProp from 'components/card';
import "./style.css"
import "waterfall-animation.css"
import "waterFalling-animation.css"


function SidePanel() {
  const [showWaterFalling, setShowWaterFalling] = useState(false);
  const [showWaterfall, setShowWaterfall] = useState(false);

  const [numWaterLiters, setNumWaterLiters] = useState(0)
  const [numTokens, setNumTokens]           = useState(0)
  const [waterBottles, setWaterBottles]     = useState(0)
  const [numVariable, setNumVariable]       = useState(0)

  useEffect(() => {
    chrome.runtime.onMessage.addListener((message: any) => {
      if (message.type === "tokenData") {
        setNumWaterLiters(message.detail.numWaterLiters)
        setNumTokens(message.detail.numTokens)
        setWaterBottles(message.detail.waterBottles)
        setNumVariable(message.detail.numVariable)
      }
    })
  }, [])

  function handleWaterAnimationsEvent() {
    setShowWaterfall(true);
    setShowWaterFalling(true);
    setTimeout(() => {setShowWaterFalling(false); setShowWaterfall(false);}, 5000);
  }

  function openWebpage() {
    chrome.tabs.create({ url: chrome.runtime.getURL("tabs/dashboard.html") })
  }

  return (
    <>
      <div className="w-[340px] p-4">
        <button onClick={handleWaterAnimationsEvent}>
        Trigger water Animation
      </button>
      <p className='waterFalling'></p>
      <p className='waterfall'></p>
      </div>
      <CardProp>
        <h1 className="text-xl font-semibold mb-1">AI Water Tracker</h1>
        <div className="text-gray-500 text-s">
          Tracks estimated water usage from your AI tokens/requests.
        </div>
      </CardProp>

      <CardProp>
        <div className="text-gray-500 text-m">Total water used</div>
        <div className="text-2xl font-semibold text-blue-500">
          {numWaterLiters + " L"}
        </div>
        <div className="text-gray-500 text-m">{numTokens} tokens</div>
      </CardProp>

      <CardProp>
        <div className="text-gray-500 text-sm">Total water bottles consumed</div>
        <div className="text-3xl font-semibold text-blue-500">{waterBottles}</div>
      </CardProp>

      <CardProp>
        <div className="text-gray-500 text-sm text-center">
          You have used up <span className="font-semibold">{numVariable}</span>% of Lake Mendota.
        </div>
      </CardProp>

      <CardProp>
        <div className="flex justify-between items-center">
          <div>
            <div className="text-gray-500 text-l">History</div>
            <div className="text-gray-500 text-m">Recent additions</div>
          </div>
 
        </div> 
      </CardProp>

      <div className="text-m text-gray-700 mb-3">
        Conversion note: uses liters-per-token multiplier stored locally.
      </div>

      <button
        onClick={openWebpage}
        className="text-2xl w-full bg-blue-500 text-white px-3 py-2 rounded-lg cursor-pointer text-center">
        Dashboard
      </button>  
    </>
  )
}

export default SidePanel