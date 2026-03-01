interface CardProps {
  children: React.ReactNode
}

export default function Card({ children }: CardProps) {
  return (
    <div className="bg-gray-100 rounded-xl p-3 mb-10 shadow p-5">
      {children}
    </div>
  )
}