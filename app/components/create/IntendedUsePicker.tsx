import { RadioGroup } from "@headlessui/react"
import { CheckCircleIcon } from "@heroicons/react/20/solid"
import type { IntendedUse } from "@prisma/client"
import { ComponentPropsWithoutRef } from "react"

import { intendedUses } from "~/config/consts"
import { getIntendedUseIcon, getIntendedUseLabel } from "~/utils/project"

const descriptions: Record<IntendedUse, string> = {
  BookCover: "Generate a cover for your book.",
  BookInterior: "Generate a visual from an excerpt of your book.",
  CompanyBlog: "Generate a banner for your company blog.",
  Newsletter: "Generate a cover for your newsletter.",
  Other: "Generate a visual for another use.",
  PersonalBlog: "Generate a banner for your personal blog.",
  PodcastCover: "Generate a cover for your podcast.",
  PodcastEpisode: "Generate graphics for your podcast episodes.",
  SocialMedia: "Generate a graphic for social media.",
}

export default function IntendedUsePicker({
  defaultValue,
  id,
  name,
}: ComponentPropsWithoutRef<"input">) {
  return (
    <RadioGroup defaultValue={defaultValue} id={id} name={name}>
      <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-3 sm:gap-x-4">
        {intendedUses.map((intendedUse) => (
          <RadioGroup.Option
            className="relative flex cursor-pointer rounded-lg border border-gray-300 bg-white p-4 shadow-sm focus:outline-none ui-active:border-gray-600 ui-active:ring-2 ui-active:ring-gray-600"
            key={intendedUse}
            value={intendedUse}
          >
            <span className="flex flex-1">
              <span className="flex flex-col">
                <RadioGroup.Label
                  as="span"
                  className="flex items-center text-sm font-medium text-gray-900"
                >
                  {getIntendedUseIcon(intendedUse, "h-6 w-6 mr-2")}{" "}
                  {getIntendedUseLabel(intendedUse)}
                </RadioGroup.Label>
                <RadioGroup.Description
                  as="span"
                  className="mt-3 flex items-center text-sm text-gray-500"
                >
                  {descriptions[intendedUse]}
                </RadioGroup.Description>
              </span>
            </span>
            <CheckCircleIcon
              aria-hidden="true"
              className="h-5 w-5 text-gray-600 ui-not-checked:invisible"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -inset-px rounded-lg border-2 border-transparent ui-checked:border-gray-600 ui-active:border"
            />
          </RadioGroup.Option>
        ))}
      </div>
    </RadioGroup>
  )
}
