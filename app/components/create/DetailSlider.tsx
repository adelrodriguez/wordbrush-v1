import { Slider } from "@nextui-org/react"
import { ComponentPropsWithoutRef } from "react"

export default function DetailSlider({
  name,
  defaultValue,
  "aria-label": ariaLabel,
}: ComponentPropsWithoutRef<"input">) {
  return (
    <Slider
      aria-label="Level of detail"
      name={name}
      size="md"
      startContent={
        <div className="text-md font-light text-gray-700">Abstract</div>
      }
      endContent={
        <div className="text-md font-light text-gray-700">Realistic</div>
      }
      classNames={{
        base: "w-full",
      }}
      color="foreground"
      defaultValue={Number(defaultValue)}
      step={1}
      minValue={1}
      maxValue={5}
    />
  )
}
