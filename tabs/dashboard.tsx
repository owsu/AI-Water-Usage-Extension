import { useState, useEffect } from "react"
import MetricCardProps from 'components/metriccard';
import "~/style.css"

function Dashboard() {
  const [rawData, setRawData] = useState({
    numWaterLiters: 0,
    numTokens: 0,
    waterBottles: 0,
    lakePercent: 0,
  })

  const [timeFilter, setTimeFilter] = useState("Today")

  const [displayWater, setDisplayWater] = useState(0)
  const [displayBottles, setDisplayBottles] = useState(0)
  

  // 🔥 Listen for backend events (cleaned up properly)
  useEffect(() => {
    const loadData = () => {
      chrome.storage.local.get(
        ["numWaterLiters", "numTokens", "waterBottles", "lakePercent"],
        (result) => {
          setRawData({
            numWaterLiters: result.numWaterLiters || 0,
            numTokens: result.numTokens || 0,
            waterBottles: result.waterBottles || 0,
            lakePercent: result.lakePercent || 0
          })
        }
      )
    }

    loadData()

    chrome.storage.onChanged.addListener(loadData)

    return () => {
      chrome.storage.onChanged.removeListener(loadData)
    }
  }, [])

  // 🚀 Fake time filtering multiplier
  const getMultiplier = () => {
    switch (timeFilter) {
      case "This Week":
        return 7
      case "This Month":
        return 30
      case "This Year":
        return 365
      default:
        return 1
    }
  }

  const multiplier = getMultiplier()

  const filteredWater = rawData.numWaterLiters * multiplier
  const filteredBottles = rawData.waterBottles * multiplier
  const filteredTokens = rawData.numTokens * multiplier
  const GLOBAL_USERS = 100000

  const globalWater = filteredWater * GLOBAL_USERS
  const globalBottles = filteredBottles * GLOBAL_USERS
  const globalTokens = filteredTokens * GLOBAL_USERS
  const globalLakePercent = Math.min(rawData.lakePercent * GLOBAL_USERS, 100)

  // 💎 Smooth animated counter (better logic)
  const animateValue = (
    target: number,
    setter: React.Dispatch<React.SetStateAction<number>>
  ) => {
    let start: number
    setter(prev => {
      start = prev
      return prev
    })

    const duration = 800
    const startTime = performance.now()

    const step = (currentTime: number) => {
      const progress = Math.min((currentTime - startTime) / duration, 1)
      const value = start + (target - start) * progress
      setter(value)
      if (progress < 1) requestAnimationFrame(step)
    }

    requestAnimationFrame(step)
  }

  useEffect(() => {
    animateValue(filteredWater, setDisplayWater)
  }, [filteredWater])

  useEffect(() => {
    animateValue(filteredBottles, setDisplayBottles)
  }, [filteredBottles])

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#1e2c46] via-[#0f2a47] to-[#163354] text-white p-8 overflow-hidden">

      {/* Premium radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[900px] bg-cyan-500/10 blur-3xl rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto space-y-10">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-3">
            <h1 className="text-3xl font-semibold tracking-wide">
              Live Metrics
            </h1>

            {/* Time Filters */}
            <div className="flex gap-3">
              {["Today", "This Week", "This Month", "This Year"].map(label => (
                <button
                  key={label}
                  onClick={() => setTimeFilter(label)}
                  className={`px-4 py-1 text-sm rounded-full transition
                    ${
                      timeFilter === label
                        ? "bg-cyan-500 text-black"
                        : "bg-[#132c4a] text-gray-400 hover:text-cyan-400 hover:bg-[#1b3a5c]"
                    }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="text-sm text-cyan-400 flex items-center gap-2">
            <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
            LIVE
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

          {/* Water */}
          <MetricCardProps
            title="Total Water Used"
            value={`${Math.round(displayWater).toLocaleString()} L`}
            subtitle={`${filteredTokens.toLocaleString()} tokens processed`}
          />

          {/* Bottles */}
          <MetricCardProps
            title="Water Bottles (500ml)"
            value={Math.round(displayBottles).toLocaleString()}
          />

          {/* Lake Usage */}
          <div className="bg-[#0f2238] border border-cyan-500/20 rounded-2xl p-6 space-y-4 shadow-lg transition duration-300 hover:border-cyan-400/40 hover:shadow-cyan-500/10 hover:-translate-y-1">
            <div className="text-gray-500 text-xs uppercase tracking-widest">
              Lake Mendota Usage
            </div>

            <div className="text-5xl font-bold text-cyan-400 tracking-tight">
              {Math.floor(rawData.lakePercent)}%
            </div>

            <div className="w-full bg-[#1a2f4d] rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-cyan-400 to-cyan-600 h-3 transition-all duration-700"
                style={{ width: `${Math.min(rawData.lakePercent, 100)}%` }}
              />
            </div>
          </div>

          {/* Showers */}
          <MetricCardProps
            title="10 Min Showers"
            value={(filteredWater / 65).toFixed(2)}
          />

        </div>
        {/* Global Impact Section */}
        <div className="space-y-6 pt-10">

          <div>
            <h2 className="text-2xl font-semibold tracking-wide">
              If 100,000 People Had Your Activity
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              Simulated large-scale environmental impact
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

            <MetricCardProps
              title="Total Water Used (Global)"
              value={`${Math.round(globalWater).toLocaleString()} L`}
              subtitle={`${globalTokens.toLocaleString()} tokens processed`}
            />

            <MetricCardProps
              title="Water Bottles (500ml)"
              value={Math.round(globalBottles).toLocaleString()}
            />

            <div className="bg-[#0f2238] border border-cyan-500/20 rounded-2xl p-6 space-y-4 shadow-lg transition duration-300 hover:border-cyan-400/40 hover:shadow-cyan-500/10 hover:-translate-y-1">
              <div className="text-gray-500 text-xs uppercase tracking-widest">
                Lake Mendota Usage
              </div>

              <div className="text-5xl font-bold text-cyan-400 tracking-tight">
                {Math.floor(globalLakePercent)}%
              </div>

              <div className="w-full bg-[#1a2f4d] rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-cyan-400 to-cyan-600 h-3 transition-all duration-700"
                  style={{ width: `${globalLakePercent}%` }}
                />
              </div>
            </div>

            <MetricCardProps
              title="10 Min Showers"
              value={(globalWater / 65).toFixed(0)}
            />

          </div>
        </div>
      </div>
    </div>
  )
}



export default Dashboard