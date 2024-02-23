import { ArtStyle } from "@prisma/client"
import Autoscroll from "embla-carousel-auto-scroll"
import useEmblaCarousel from "embla-carousel-react"
import { ReactNode } from "react"

type DisplayArtStyle = Pick<ArtStyle, "name" | "exampleUrl" | "id">

export default function Showcase({
  artStyles,
}: {
  artStyles: DisplayArtStyle[]
}) {
  // Separate art styles into 3 groups
  const groupedArtStyles = artStyles.reduce<
    [DisplayArtStyle[], DisplayArtStyle[], DisplayArtStyle[]]
  >(
    (acc, curr, index) => {
      if (index % 3 === 0) {
        acc[0].push(curr)
      } else if (index % 3 === 1) {
        acc[1].push(curr)
      } else {
        acc[2].push(curr)
      }

      return acc
    },
    [[], [], []],
  )

  return (
    <section className="py-24 sm:py-32" id="styles">
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-black leading-7 text-[#fe9125]">
              Art styles
            </h2>
            <p className="font-headline text-3xl tracking-wide text-white sm:text-5xl sm:leading-tight">
              Pick from over 50+ art styles
            </p>
            <p className="mt-6 text-lg font-light leading-8 text-gray-200">
              Or create your own custom style to match your brand.
            </p>
          </div>
        </div>
      </div>
      <div className="py-8">
        {groupedArtStyles.map((group, index) => (
          <Carousel backwards={index % 2 === 0} key={index}>
            {group.map((artStyle) => (
              <div
                className="group relative mx-4 my-4 flex min-w-0 shrink-0 grow-0 basis-24 items-center md:my-8 md:basis-48"
                key={artStyle.id}
              >
                <img
                  alt={artStyle.name}
                  className="h-full w-full rounded-xl object-cover shadow-lg"
                  src={artStyle.exampleUrl ?? ""}
                />
                <div className="absolute bottom-0 left-0 flex h-[100px] w-full items-end justify-center rounded-xl bg-gradient-to-b from-transparent to-black/70 px-2 pb-4 text-center opacity-0 transition-opacity duration-150 group-hover:opacity-100"></div>
                <p className="absolute bottom-2 left-1/2 -translate-x-1/2 text-center text-xs text-white opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                  {artStyle.name}
                </p>
              </div>
            ))}
          </Carousel>
        ))}
      </div>
    </section>
  )
}

function Carousel({
  backwards,
  children,
}: {
  children: ReactNode
  backwards: boolean
}) {
  const [emblaRef] = useEmblaCarousel({ loop: true, watchDrag: false }, [
    Autoscroll({
      direction: backwards ? "backward" : "forward",
      speed: 0.2,
      startDelay: 0,
      stopOnInteraction: false,
    }),
  ])

  return (
    <div className="w-full select-none overflow-hidden" ref={emblaRef}>
      <div className="flex">{children}</div>
    </div>
  )
}
