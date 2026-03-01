interface MetricCardProps {
  title: string
  value: string
  subtitle?: string
}

export default function Card({ title, value, subtitle }: MetricCardProps) {
  return (
    <div className="bg-[#0f2238] border border-cyan-500/20 rounded-2xl p-6 space-y-4 shadow-lg transition duration-300 hover:border-cyan-400/40 hover:shadow-cyan-500/10 hover:-translate-y-1">
      <div className="text-gray-500 text-xs uppercase tracking-widest">
        {title}
      </div>

      <div className="text-5xl font-bold text-cyan-400 tracking-tight">
        {value}
      </div>

      {subtitle && (
        <div className="text-gray-500 text-sm">
          {subtitle}
        </div>
      )}
    </div>
  )
}