import { RadioGroup } from "@headlessui/react"
import { CheckCircleIcon } from "@heroicons/react/20/solid"
import { IntendedUse } from "@prisma/client"
import clsx from "clsx"
import { ComponentPropsWithoutRef } from "react"

import { getIntendedUseIcon, getIntendedUseLabel } from "~/utils/project"

const descriptions = {
  [IntendedUse.PersonalBlog]: "Design a banner for your personal blog.",
  [IntendedUse.CompanyBlog]:
    "Publish your company blog and share posts with your customers.",
  [IntendedUse.Newsletter]: "Send a newsletter to your subscribers.",
  [IntendedUse.BookCover]: "Design a cover for your book.",
  [IntendedUse.BookInterior]: "Design the interior of your book.",
  [IntendedUse.SocialMedia]:
    "Create graphics for your social media profiles and posts.",
  [IntendedUse.PodcastCover]: "Design a cover for your podcast.",
  [IntendedUse.PodcastEpisode]: "Design graphics for your podcast episodes.",
  [IntendedUse.Other]: "Other intended use.",
}

export default function IntendedUsePicker({
  defaultValue,
  id,
  name,
}: ComponentPropsWithoutRef<"input">) {
  return (
    <RadioGroup defaultValue={defaultValue} id={id} name={name}>
      <RadioGroup.Label className="text-2xl font-bold leading-6 text-gray-900">
        Intended Use
      </RadioGroup.Label>
      <RadioGroup.Description className="text-xl font-light text-gray-400">
        Where are you publishing this story?
      </RadioGroup.Description>

      <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-3 sm:gap-x-4">
        {Object.values(IntendedUse).map((intendedUse) => (
          <RadioGroup.Option
            className={({ active }) =>
              clsx(
                active
                  ? "border-indigo-600 ring-2 ring-indigo-600"
                  : "border-gray-300",
                "relative flex cursor-pointer rounded-lg border bg-white p-4 shadow-sm focus:outline-none",
              )
            }
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
              className="h-5 w-5 text-indigo-600 ui-not-checked:invisible"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -inset-px rounded-lg border-2 border-transparent ui-checked:border-indigo-600 ui-active:border"
            />
          </RadioGroup.Option>
        ))}
      </div>
    </RadioGroup>
  )
}
