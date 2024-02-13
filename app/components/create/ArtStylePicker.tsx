import { RadioGroup, Tab } from "@headlessui/react"
import { CheckCircleIcon } from "@heroicons/react/20/solid"
import { InformationCircleIcon } from "@heroicons/react/24/outline"
import { Tooltip } from "@nextui-org/react"
import { ArtStyle, Category } from "@prisma/client"
import { ComponentPropsWithoutRef } from "react"

type Option = Pick<
  ArtStyle,
  "id" | "name" | "category" | "description" | "exampleUrl"
>

export default function ArtStylePicker({
  defaultValue,
  id,
  name,
  options,
}: {
  options: Option[]
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
  const defaultTabIndex = Object.values(groupedOptions).findIndex((options) =>
    options.find((option) => option.id === defaultValue),
  )

  return (
    <div className="w-full">
      <Tab.Group defaultIndex={defaultTabIndex}>
        <Tab.List className="flex flex-wrap justify-center sm:space-x-4">
          {Object.keys(groupedOptions).map((category) => (
            <Tab
              className="rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 ui-selected:bg-gray-200 ui-selected:text-gray-800"
              key={category}
            >
              {category}
            </Tab>
          ))}
        </Tab.List>
        <Tab.Panels className="mt-2">
          {Object.values(groupedOptions).map((options, idx) => (
            <Tab.Panel className="p-3" key={idx}>
              <RadioGroup defaultValue={defaultValue} id={id} name={name}>
                <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-3 sm:gap-x-4">
                  {options.map((option) => (
                    <RadioGroup.Option
                      className="relative flex cursor-pointer flex-col rounded-lg border border-gray-300 bg-white  shadow-sm focus:outline-none ui-active:border-gray-600 ui-active:ring-2 ui-active:ring-gray-600"
                      key={option.id}
                      value={option.id}
                    >
                      <div>
                        <img
                          alt=""
                          className="h-auto w-full rounded-t-lg object-fill"
                          src={option.exampleUrl ?? ""}
                          loading="lazy"
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
                                content={option.description}
                                showArrow
                                size="sm"
                                placement="bottom"
                                className="w-56 bg-white p-4 text-gray-700"
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
