import { Slider } from "@nextui-org/react"
import { ComponentPropsWithoutRef } from "react"

export default function DetailSlider({
  defaultValue,
  name,
}: ComponentPropsWithoutRef<"input">) {
  return (
    <Slider
      aria-label="Level of detail"
      classNames={{
        base: "w-full",
      }}
      color="foreground"
      defaultValue={Number(defaultValue ?? 50)}
      endContent={
        <div className="text-md font-light text-gray-700">Realistic</div>
      }
      maxValue={100}
      minValue={1}
      name={name}
      size="md"
      startContent={
        <div className="text-md font-light text-gray-700">Abstract</div>
      }
      step={1}
    />
  )
}
