import { RadioGroup, Tab } from "@headlessui/react"
import { CheckCircleIcon } from "@heroicons/react/20/solid"
import { InformationCircleIcon } from "@heroicons/react/24/outline"
import { Spinner, Tooltip } from "@nextui-org/react"
import { ArtStyle, Category } from "@prisma/client"
import { Await } from "@remix-run/react"
import { ComponentPropsWithoutRef, Suspense } from "react"

import { getCategoryEmoji } from "~/utils/project"

type Option = Pick<
  ArtStyle,
  "id" | "name" | "category" | "description" | "exampleUrl"
>

function getDefaultTabIndex(
  groupedOptions: Record<Category, Option[]>,
  defaultValue: string | undefined,
) {
  const defaultTabIndex = Object.values(groupedOptions).findIndex((options) =>
    options.find((option) => option.id === defaultValue),
  )

  // If we can't find the default value, default to the first tab
  if (defaultTabIndex === -1) {
    return 0
  }

  // Since we have two additional tabs (All and Recommended), we need to add 2
  // to the defaultTabIndex to account for them
  return defaultTabIndex + 2
}

export default function ArtStylePicker({
  defaultValue,
  id,
  name,
  options,
  recommendations,
}: {
  defaultValue?: string
  options: Option[]
  recommendations?: Promise<string[]>
} & ComponentPropsWithoutRef<"input">) {
  const groupedOptions = options.reduce<Record<Category, Option[]>>(
    (acc, artStyle) => {
      if (!artStyle.category) return acc

      acc[artStyle.category].push(artStyle)

      return acc
    },
    {
      [Category.Abstract]: [],
      [Category.Digital]: [],
      [Category.Fantasy]: [],
      [Category.Geometric]: [],
      [Category.Historical]: [],
      [Category.Illustrative]: [],
      [Category.Modern]: [],
      [Category.Nature]: [],
      [Category.SciFi]: [],
      [Category.Technological]: [],
      [Category.Traditional]: [],
    },
  )
  const defaultTabIndex = getDefaultTabIndex(groupedOptions, defaultValue)

  return (
    <div className="w-full">
      <Tab.Group defaultIndex={defaultTabIndex}>
        <Tab.List className="flex flex-wrap  justify-center space-x-4">
          <Tab className="mb-2 rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 ui-selected:bg-gray-500 ui-selected:text-white">
            ✨ All
          </Tab>
          <Tab className="mb-2 flex items-center rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 ui-selected:bg-gray-500 ui-selected:text-white">
            <Suspense fallback={<Spinner color="current" size="sm" />}>
              <Await resolve={recommendations}>{() => "🤖 Recommended"}</Await>
            </Suspense>
          </Tab>
          {Object.keys(groupedOptions).map((category) => (
            <Tab
              className="mb-2 rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 ui-selected:bg-gray-500 ui-selected:text-white"
              key={category}
            >
              {getCategoryEmoji(category as Category)} {category}
            </Tab>
          ))}
        </Tab.List>
        <Tab.Panels className="mt-2">
          <Tab.Panel className="p-3">
            <RadioGroup defaultValue={defaultValue} id={id} name={name}>
              <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-3 sm:gap-x-4">
                {options.map((option) => (
                  <Option key={option.id} option={option} />
                ))}
              </div>
            </RadioGroup>
          </Tab.Panel>
          <Suspense
            fallback={
              <Tab.Panel className="flex h-48 items-center justify-center gap-x-2 p-3">
                <Spinner className="text-xs" color="current" />
                <span>Calculating recommendations...</span>
              </Tab.Panel>
            }
          >
            <Await resolve={recommendations}>
              {(resolved) => (
                <Tab.Panel className="p-3">
                  <RadioGroup defaultValue={defaultValue} id={id} name={name}>
                    <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-3 sm:gap-x-4">
                      {options
                        .filter((option) => resolved?.includes(option.name))
                        .map((option) => (
                          <Option key={option.id} option={option} />
                        ))}
                    </div>
                  </RadioGroup>
                </Tab.Panel>
              )}
            </Await>
          </Suspense>

          {Object.values(groupedOptions).map((options, idx) => (
            <Tab.Panel className="p-3" key={idx}>
              <RadioGroup defaultValue={defaultValue} id={id} name={name}>
                <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-3 sm:gap-x-4">
                  {options.map((option) => (
                    <Option key={option.id} option={option} />
                  ))}
                </div>
              </RadioGroup>
            </Tab.Panel>
          ))}
        </Tab.Panels>
      </Tab.Group>
    </div>
  )
}

function Option({ option }: { option: Option }) {
  return (
    <RadioGroup.Option
      className="relative flex cursor-pointer flex-col rounded-lg border border-gray-300 bg-white  shadow-sm focus:outline-none ui-active:border-gray-600 ui-active:ring-2 ui-active:ring-gray-600"
      key={option.id}
      value={option.id}
    >
      <div>
        <img
          alt=""
          className="h-auto w-full rounded-t-lg object-fill"
          loading="lazy"
          src={option.exampleUrl ?? ""}
        />
      </div>
      <div className="flex p-4">
        <span className="flex flex-1">
          <span className="flex items-center">
            <RadioGroup.Label
              as="span"
              className="block align-middle text-sm font-medium leading-4 text-gray-900"
            >
              {option.name}

              <Tooltip
                className="w-56 bg-white p-4 text-gray-700"
                content={option.description}
                placement="bottom"
                showArrow
                size="sm"
              >
                <InformationCircleIcon className="ml-1 inline-block h-4 w-4 text-gray-900" />
              </Tooltip>
            </RadioGroup.Label>
          </span>
        </span>
        <CheckCircleIcon
          aria-hidden="true"
          className="invisible h-5 w-5 text-gray-600 ui-checked:visible"
        />
      </div>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -inset-px rounded-lg border-2 border-transparent ui-checked:border-gray-600 ui-active:border"
      />
    </RadioGroup.Option>
  )
}
