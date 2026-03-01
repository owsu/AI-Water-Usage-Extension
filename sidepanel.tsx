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

  const SHOWER_LITERS = 65
  const showers = numWaterLiters / SHOWER_LITERS

  useEffect(() => {
    const listener = (message: any) => {
      if (message.type === "tokenData") {
        setNumWaterLiters(Number(message.detail.numWaterLiters))
        setNumTokens(Number(message.detail.numTokens))
        setWaterBottles(Number(message.detail.waterBottles))
        setNumVariable(Number(message.detail.numVariable))
        const newWater = Number(message.detail.numWaterLiters)
        const newTokens = Number(message.detail.numTokens)
        const newBottles = Number(message.detail.waterBottles)
        const newLake = Number(message.detail.numVariable)

        setNumWaterLiters(newWater)
        setNumTokens(newTokens)
        setWaterBottles(newBottles)
        setNumVariable(newLake)

        chrome.storage.local.set({
          numWaterLiters: newWater,
          numTokens: newTokens,
          waterBottles: newBottles,
          lakePercent: newLake
        })
      }
    }

    chrome.runtime.onMessage.addListener(listener)

    return () => {
      chrome.runtime.onMessage.removeListener(listener)
    }
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
    // ✅ Changed min-h-full → min-h-screen so gradient fills the entire panel
    <div className="min-h-screen bg-gradient-to-b from-blue-200 to-blue-50 p-6">
    <div className="space-y-6">

      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">
          AI Water Tracker
        </h1>
        <p className="text-gray-500 text-sm">
          Estimated environmental impact of your AI usage
        </p>
      </div>

      <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-6 text-center transition-transform duration-200 hover:scale-[1.02]">
        <div className="text-gray-500 text-xs uppercase tracking-wide">
          Total Water Used
        </div>
        <div className="text-4xl font-bold text-blue-600 mt-2">
          💧 {numWaterLiters.toFixed(4)} L
        </div>
        <div className="text-gray-400 text-sm mt-1">
          {numTokens} tokens
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow p-5 text-center">
          <div className="text-gray-500 text-sm">Water Bottles</div>
          <div className="text-2xl font-semibold text-blue-600 mt-1">
            {waterBottles}
          </div>
      </div>
        

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow p-5 text-center">
          <div className="text-gray-500 text-sm">Number of 10 Minute Showers</div>
          <div className="text-2xl font-semibold text-blue-600 mt-1">
            {showers.toFixed(3)}
          </div>
        </div>
      </div>
      
      

        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow p-5 text-center">
          <div className="text-gray-500 text-sm">Lake Mendota Used</div>
          <div className="text-2xl font-semibold text-blue-600 mt-1">
            {Math.floor(numVariable)}%
          </div>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow p-6">
        <div className="text-gray-500 text-sm mb-2">
          Percentage of Lake Mendota
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-400 to-blue-600 h-3 transition-all duration-700"
            style={{ width: `${Math.min(numVariable, 100)}%` }}
          />
        </div>
      </div>

      {/* ✅ Reformatted button: rounder, subtle shadow, better padding, icon added */}
      <div className="pt-4">
        <button
          onClick={openWebpage}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 px-4 rounded-2xl font-semibold text-2xl shadow-md shadow-blue-300/40 transition duration-200 hover:opacity-90 hover:shadow-lg hover:shadow-blue-300/50 active:scale-95"
        >
          Open Dashboard
        </button>
      </div>

    </div>
  </div>
  )
}

export default SidePanel