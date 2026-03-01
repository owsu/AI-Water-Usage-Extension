interface CardProps {
  children: React.ReactNode
}

export default function Card({ children }: CardProps) {
  return (
    <div className="bg-white rounded-xl p-3 mb-3 shadow-sm">
      {children}
    </div>
  )
}