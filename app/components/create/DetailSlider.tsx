import { Slider } from "@nextui-org/react"
import { ComponentPropsWithoutRef } from "react"

export default function DetailSlider({
  name,
  defaultValue,
  "aria-label": ariaLabel,
}: ComponentPropsWithoutRef<"input">) {
  return (
    <div className="flex flex-col">
      <div className="mb-2">
        <h2 className="text-2xl font-bold leading-6 text-gray-900">
          Art Style
        </h2>
        <p className="text-xl font-light text-gray-400">Choose an art style</p>
      </div>

      <Slider
        aria-label="Level of detail"
        name={name}
        size="md"
        startContent={<div>Abstract</div>}
        endContent={<div>Realistic</div>}
        classNames={{
          base: "w-full",
        }}
        color="secondary"
        defaultValue={Number(defaultValue)}
        step={1}
        minValue={1}
        maxValue={5}
      />
    </div>
  )
}
