import clsx from "clsx"

const steps: {
  name: string
  description: string
  emoji: string
  video: string
}[] = [
  {
    description:
      "Or write it directly in the editor. Choose your intended use and give your project a name.",
    emoji: "1️⃣",
    name: "Paste your text.",
    video: "/assets/videos/demo-1.mp4",
  },
  {
    description:
      "Choose a either a recommended style or one from several categories. Choose an aspect ratio. Change the level of detail.",
    emoji: "2️⃣",
    name: "Pick a style.",
    video: "/assets/videos/demo-2.mp4",
  },
  {
    description:
      "Add a mood, mention anything you want to be in the image, and anything you want to exclude.",
    emoji: "3️⃣",
    name: "Add some details.",
    video: "/assets/videos/demo-3.mp4",
  },
]
export default function HowItWorks() {
  return (
    <section className="py-24 sm:py-32" id="how-it-works">
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-black leading-7 text-[#fe9125]">
              How it works
            </h2>
            <p className="font-headline text-3xl tracking-wide text-white sm:text-5xl sm:leading-tight">
              As easy as 1, 2, 3
            </p>
            <p className="mt-6 text-lg font-light leading-8 text-gray-200">
              Just paste your text, choose a style. Maybe add some details. And
              that&apos;s it.
            </p>
          </div>
        </div>
      </div>

      <dl className="mx-auto mt-16 flex max-w-xl flex-col gap-y-24 px-8 lg:max-w-none">
        {steps.map((step, index) => (
          <div
            className={clsx(
              "flex flex-col items-center justify-center gap-x-8 gap-y-8",
              index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse",
            )}
            key={step.name}
          >
            <div className="aspect-video max-h-72 rounded-xl bg-black">
              <video
                autoPlay
                className="h-full rounded-xl"
                loop
                muted
                src={step.video}
              />
            </div>
            <div className="flex max-w-xl flex-col">
              <dt className="text-base font-semibold leading-7 text-white">
                <span className="pr-2">{step.emoji}</span>
                {step.name}
              </dt>
              <dd className="mt-1 flex flex-auto flex-col text-base leading-7 text-gray-200">
                <p className="flex-auto">{step.description}</p>
              </dd>
            </div>
          </div>
        ))}
      </dl>
    </section>
  )
}
