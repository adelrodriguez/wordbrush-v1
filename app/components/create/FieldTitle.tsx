import { ReactNode } from "react"

export default function FieldTitle({
  children,
  description,
}: {
  children: ReactNode
  description?: string
}) {
  return (
    <div className="flex flex-col gap-y-1">
      <h3 className="text-2xl font-bold leading-6 text-gray-900">{children}</h3>
      {description && (
        <p className="text-xl font-light text-gray-400">{description}</p>
      )}
    </div>
  )
}
