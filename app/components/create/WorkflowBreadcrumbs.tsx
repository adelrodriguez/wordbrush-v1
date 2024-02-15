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
  const projectRoute = route("/create/:projectId", { projectId })
  const templateRoute = route("/create/:projectId/brush/:templateId", {
    projectId,
    templateId: templateId ?? "",
  })
  const detailsRoute = route("/create/:projectId/brush/:templateId/details", {
    projectId,
    templateId: templateId ?? "",
  })

  return (
    <Breadcrumbs className="font-semibold" size="lg">
      <BreadcrumbItem
        href={projectRoute}
        isCurrent={location.pathname === projectRoute}
      >
        <PencilSquareIcon className="h-5 w-5" />
        Show us your writing
      </BreadcrumbItem>
      <BreadcrumbItem
        href={templateRoute}
        isCurrent={location.pathname === templateRoute}
        isDisabled={!templateId}
      >
        <PaintBrushIcon className="h-5 w-5" />
        Pick a style
      </BreadcrumbItem>
      <BreadcrumbItem
        href={detailsRoute}
        isCurrent={location.pathname === detailsRoute}
        isDisabled={!templateId}
      >
        <AdjustmentsHorizontalIcon className="h-5 w-5" />
        Choose the details
      </BreadcrumbItem>
    </Breadcrumbs>
  )
}
