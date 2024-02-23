import { Disclosure, Transition } from "@headlessui/react"
import { MinusIcon, PlusIcon } from "@heroicons/react/24/outline"
import clsx from "clsx"

const faqs = [
  {
    answer:
      "I don't know, but the flag is a big plus. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quas cupiditate laboriosam fugiat.",
    question: "What's the best thing about Switzerland?",
  },
  {
    answer:
      "I don't know, but the flag is a big plus. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quas cupiditate laboriosam fugiat.",
    question: "What's the best thing about Switzerland?",
  },
  {
    answer:
      "I don't know, but the flag is a big plus. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quas cupiditate laboriosam fugiat.",
    question: "What's the best thing about Switzerland?",
  },
  {
    answer:
      "I don't know, but the flag is a big plus. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quas cupiditate laboriosam fugiat.",
    question: "What's the best thing about Switzerland?",
  },
]

export default function FAQ() {
  return (
    <section
      className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8 lg:py-40"
      id="faq"
    >
      <div className="mx-auto grid grid-cols-5 gap-y-10 divide-y divide-white/10 md:flex-row md:gap-x-12 md:divide-y-0">
        <div className="col-span-5 md:col-span-2">
          <h2 className="font-headline text-4xl leading-tight tracking-wide text-white">
            Frequently asked questions
          </h2>
          <p className="mt-5 text-sm font-semibold text-gray-200">
            Have any more questions?{" "}
            <a className="text-[#fe9125]" href="mailto:contact@wordbrush.art">
              Contact us
            </a>
          </p>
        </div>

        <dl className="col-span-5 max-w-4xl space-y-6 divide-y divide-white/10 md:col-span-3">
          {faqs.map((faq, index) => (
            <Disclosure
              as="div"
              className={clsx("pt-6", { "pt-6 md:pt-0": index === 0 })}
              key={faq.question}
            >
              {({ open }) => (
                <>
                  <dt>
                    <Disclosure.Button className="flex w-full items-start justify-between text-left text-white">
                      <span className="text-base font-semibold leading-7">
                        {faq.question}
                      </span>
                      <span className="ml-6 flex h-7 items-center">
                        {open ? (
                          <MinusIcon aria-hidden="true" className="h-6 w-6" />
                        ) : (
                          <PlusIcon aria-hidden="true" className="h-6 w-6" />
                        )}
                      </span>
                    </Disclosure.Button>
                  </dt>
                  <Transition
                    enter="transition duration-1000 ease-out"
                    enterFrom="transform scale-95 opacity-0"
                    enterTo="transform scale-100 opacity-100"
                    leave="transition duration-100 ease-out"
                    leaveFrom="transform scale-100 opacity-100"
                    leaveTo="transform scale-95 opacity-0"
                    show={open}
                  >
                    <Disclosure.Panel as="dd" className="mt-2 pr-12">
                      <p className="text-base leading-7 text-gray-200">
                        {faq.answer}
                      </p>
                    </Disclosure.Panel>
                  </Transition>
                </>
              )}
            </Disclosure>
          ))}
        </dl>
      </div>
    </section>
  )
}
