import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
  XMarkIcon,
} from "@heroicons/react/20/solid"
import clsx from "clsx"
import type { ReactNode } from "react"

type AlertType = "error" | "success" | "info" | "warning"

function getIcon(type: AlertType) {
  switch (type) {
    case "error":
      return <XCircleIcon aria-hidden="true" className="h-5 w-5 text-red-400" />
    case "success":
      return (
        <CheckCircleIcon
          aria-hidden="true"
          className="h-5 w-5 text-green-400"
        />
      )
    case "info":
      return (
        <InformationCircleIcon
          aria-hidden="true"
          className="h-5 w-5 text-blue-400"
        />
      )
    case "warning":
      return (
        <ExclamationTriangleIcon
          aria-hidden="true"
          className="h-5 w-5 text-yellow-400"
        />
      )
    default:
      return null
  }
}

export default function Alert({
  children,
  onClose,
  title,
  type,
}: {
  children: ReactNode
  title?: string
  type: AlertType
  onClose?: () => void
}) {
  return (
    <div
      className={clsx("rounded-md p-4", {
        "bg-blue-50": type === "info",
        "bg-green-50": type === "success",
        "bg-red-50": type === "error",
        "bg-yellow-50": type === "warning",
      })}
    >
      <div className="flex">
        <div className="flex-shrink-0">{getIcon(type)}</div>
        <div className="ml-3 min-w-0">
          {title && (
            <h3
              className={clsx("text-sm font-medium", {
                "text-blue-800": type === "info",
                "text-green-800": type === "success",
                "text-red-800": type === "error",
                "text-yellow-800": type === "warning",
              })}
            >
              {title}
            </h3>
          )}
          <div
            className={clsx("text-sm", {
              "mt-2": !!title,
              "text-blue-700": type === "info",
              "text-green-700": type === "success",
              "text-red-700": type === "error",
              "text-yellow-700": type === "warning",
            })}
          >
            {children}
          </div>
        </div>
        {onClose && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                className={clsx(
                  "inline-flex rounded-md p-1.5  focus:outline-none focus:ring-2  focus:ring-offset-2",
                  {
                    "bg-blue-50 text-blue-500 hover:bg-blue-100 focus:ring-blue-600 focus:ring-offset-blue-50":
                      type === "info",
                    "bg-green-50 text-green-500 hover:bg-green-100 focus:ring-green-600 focus:ring-offset-green-50":
                      type === "success",
                    "bg-red-50 text-red-500 hover:bg-red-100 focus:ring-red-600 focus:ring-offset-red-50":
                      type === "error",
                    "bg-yellow-50 text-yellow-500 hover:bg-yellow-100 focus:ring-yellow-600 focus:ring-offset-yellow-50":
                      type === "warning",
                  },
                )}
                onClick={onClose}
                type="button"
              >
                <span className="sr-only">Dismiss</span>
                <XMarkIcon aria-hidden="true" className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
