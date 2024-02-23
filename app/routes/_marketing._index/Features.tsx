import {
  LightBulbIcon,
  PaintBrushIcon,
  SparklesIcon,
} from "@heroicons/react/24/solid"

const features = [
  {
    description:
      "Unlike other AI image generators, you don't need to worry about complicated prompts; just give us your writing. We'll take care of the rest.",
    icon: LightBulbIcon,
    name: "Forget prompts",
  },
  {
    description:
      "Choose from a variety of art styles to match your message. Don't know what to choose? We'll recommend some for you.",
    icon: PaintBrushIcon,
    name: "Dozens of styles",
  },
  {
    description:
      "Create your own custom styles to match your brand. Just give us an example image and tell us what you like about it.",
    icon: SparklesIcon,
    name: "Custom styles",
  },
]

export default function Features() {
  return (
    <section className="py-24 sm:py-32" id="features">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-black leading-7 text-[#fe9125]">
              Features
            </h2>
            <p className="font-headline text-3xl tracking-wide text-white sm:text-5xl sm:leading-tight">
              Stop using stock photos
            </p>
            <p className="mt-6 text-lg font-light leading-8 text-gray-200">
              Make your writing stand out from the rest. Generate high-quality,
              custom illustrations straight from your writing.
            </p>
          </div>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-7xl">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            {features.map((feature) => (
              <div className="flex flex-col" key={feature.name}>
                <dt className="text-base font-semibold leading-7 text-white">
                  <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-lg bg-[#fe9125]">
                    <feature.icon
                      aria-hidden="true"
                      className="h-6 w-6 text-white"
                    />
                  </div>
                  {feature.name}
                </dt>
                <dd className="mt-1 flex flex-auto flex-col text-base leading-7 text-gray-200">
                  <p className="flex-auto">{feature.description}</p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
}
