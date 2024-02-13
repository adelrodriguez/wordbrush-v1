import {
  AdjustmentsHorizontalIcon,
  PaintBrushIcon,
  PencilSquareIcon,
} from "@heroicons/react/20/solid"
import { BreadcrumbItem, Breadcrumbs } from "@nextui-org/react"
import { useLocation } from "@remix-run/react"
import { route } from "routes-gen"

export default function WorkflowBreadcrumbs({
  projectId,
  templateId,
}: {
  projectId: string
  templateId?: string
}) {
  const location = useLocation()
  const firstRoute = route("/create/:projectId", { projectId })
  const secondRoute = route("/create/:projectId/brush/:templateId", {
    projectId,
    templateId: templateId || "",
  })
  const thirdRoute = route("/create/:projectId/brush/:templateId/details", {
    projectId,
    templateId: templateId || "",
  })

  return (
    <Breadcrumbs size="lg" className="font-semibold">
      <BreadcrumbItem
        href={firstRoute}
        isCurrent={location.pathname === firstRoute}
      >
        <PencilSquareIcon className="h-5 w-5" />
        Show us your writing
      </BreadcrumbItem>
      <BreadcrumbItem
        href={secondRoute}
        isCurrent={location.pathname === secondRoute}
        isDisabled={!templateId}
      >
        <PaintBrushIcon className="h-5 w-5" />
        Pick a style
      </BreadcrumbItem>
      <BreadcrumbItem
        href={thirdRoute}
        isCurrent={location.pathname === thirdRoute}
        isDisabled={!templateId}
      >
        <AdjustmentsHorizontalIcon className="h-5 w-5" />
        Choose the details
      </BreadcrumbItem>
    </Breadcrumbs>
  )
}
