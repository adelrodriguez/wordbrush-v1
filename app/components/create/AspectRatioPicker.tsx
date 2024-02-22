import { RadioGroup } from "@headlessui/react"
import { CheckCircleIcon } from "@heroicons/react/20/solid"
import { ComponentPropsWithoutRef } from "react"

import { aspectRatios } from "~/config/consts"
import { getImageSize } from "~/utils/ai"

export default function AspectRatioPicker({
  defaultValue,
  id,
  name,
}: ComponentPropsWithoutRef<"input">) {
  return (
    <RadioGroup defaultValue={defaultValue} id={id} name={name}>
      <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-3 sm:gap-x-4">
        {aspectRatios.map((aspectRatio) => (
          <RadioGroup.Option
            className="relative flex cursor-pointer rounded-lg border border-gray-300 bg-white p-4 shadow-sm focus:outline-none ui-active:border-gray-600 ui-active:ring-2 ui-active:ring-gray-600"
            key={aspectRatio}
            value={aspectRatio}
          >
            <span className="flex flex-1">
              <span className="flex flex-col">
                <RadioGroup.Label
                  as="span"
                  className="flex items-center text-sm font-medium text-gray-900"
                >
                  {aspectRatio}
                </RadioGroup.Label>
                <RadioGroup.Description
                  as="span"
                  className="mt-3 flex items-center text-sm text-gray-500"
                >
                  {getImageSize(aspectRatio)}
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
