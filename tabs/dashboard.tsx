import { useState, useEffect } from "react"
import CardProp from "~components/card"
import "~/style.css"

function Dashboard() {
  const [numWaterLiters, setNumWaterLiters] = useState(0)
  const [numTokens, setNumTokens]           = useState(0)
  const [waterBottles, setWaterBottles]     = useState(0)
  const [numVariable, setNumVariable]       = useState(0)

  useEffect(() => {
    window.addEventListener("tokenData", (e: any) => {
      setNumWaterLiters(e.detail.numWaterLiters)
      setNumTokens(e.detail.numTokens)
      setWaterBottles(e.detail.waterBottles)
      setNumVariable(e.detail.numVariable)
    })
  }, [])

  return (
    <>
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4 ">
      <CardProp>
        <h1 className="text-lg font-semibold mb-1">AI Water Tracker</h1>
        <div className="text-gray-500 text-xs">
          Tracks estimated water usage from your AI tokens/requests.
        </div>
      </CardProp>
      <CardProp>
        <div className="text-gray-500 text-sm">Total water used</div>
        <div className="text-2xl font-semibold text-blue-500">{numWaterLiters} L</div>
        <div className="text-gray-500 text-xs">{numTokens} tokens</div>
      </CardProp>
      <CardProp>
        <div className="text-gray-500 text-sm">Total water bottles consumed</div>
        <div className="text-2xl font-semibold text-blue-500">{waterBottles}</div>
      </CardProp>
      <CardProp>
        <div className="text-gray-500 text-sm text-center">
          You have used up <span className="font-semibold">{numVariable}</span>% of Lake Mendota.
        </div>
        <div className = "w-full bg-gray-200 rounded-full h-3 mt-2"></div>
        <div className = "bg-blue-700 h-3 rounded-full" style={{ width: `${Math.min(numVariable, 100)}%` }}></div>
      </CardProp>
    </div>
    </>
  )
}

export default Dashboard