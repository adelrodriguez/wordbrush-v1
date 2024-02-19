import { useState } from "react"

export default function Text({ content }: { content: string | null }) {
  const [collapsed, setCollapsed] = useState(true)

  if (!content) {
    return (
      <div className="py-10 text-center text-red-500">
        No text available. This might happen if you have cleared your browser
        storage, or if you are visiting this page from a different device.
      </div>
    )
  }

  const isCollapsible = content.length > 200
  const displayContent = collapsed ? content.slice(0, 200) : content

  return (
    <div className="text-">
      {displayContent.split("\n").map((t, i) => (
        <p className="mb-2" key={i}>
          {t}
        </p>
      ))}
      {isCollapsible && collapsed && <p>...</p>}
      {isCollapsible && (
        <button
          className={"text-xs hover:underline"}
          onClick={() => {
            setCollapsed(!collapsed)
          }}
        >
          {collapsed ? "Show more" : "Show less"}
        </button>
      )}
    </div>
  )
}
