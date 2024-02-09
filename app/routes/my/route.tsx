import { Dialog, Menu, Transition } from "@headlessui/react"
import { ChevronDownIcon, MagnifyingGlassIcon } from "@heroicons/react/20/solid"
import {
  Bars3Icon,
  Cog6ToothIcon,
  FolderIcon,
  Squares2X2Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline"
import { LoaderFunctionArgs, json } from "@remix-run/node"
import {
  Form,
  Link,
  NavLink,
  Outlet,
  UIMatch,
  useLoaderData,
  useMatches,
} from "@remix-run/react"
import clsx from "clsx"
import { Fragment, useState } from "react"
import { useDebounceSubmit } from "remix-utils/use-debounce-submit"
import { route } from "routes-gen"

import auth from "~/helpers/auth.server"
import { RouteHandle } from "~/utils/remix"

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await auth.isAuthenticated(request, {
    failureRedirect: "/login",
  })

  return json({ user })
}

const navigation = [
  { href: route("/my/words"), icon: FolderIcon, name: "Projects" },
  {
    href: route("/my/images"),
    icon: Squares2X2Icon,
    name: "All Images",
  },
  {
    href: route("/my/settings"),
    icon: Cog6ToothIcon,
    name: "Settings",
  },
]

const userNavigation = [
  { href: route("/my/profile"), name: "Your profile" },
  { href: route("/logout"), name: "Sign out" },
]

type Match = UIMatch<unknown, RouteHandle | undefined>

export default function Route() {
  const { user } = useLoaderData<typeof loader>()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const submit = useDebounceSubmit()
  const matches = useMatches() as Match[]
  const showSearch = !!matches[matches.length - 1]?.handle?.search

  return (
    <div>
      <Transition.Root as={Fragment} show={sidebarOpen}>
        <Dialog
          as="div"
          className="relative z-50 lg:hidden"
          onClose={setSidebarOpen}
        >
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-900/80" />
          </Transition.Child>

          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                <Transition.Child
                  as={Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                    <button
                      className="-m-2.5 p-2.5"
                      onClick={() => {
                        setSidebarOpen(false)
                      }}
                      type="button"
                    >
                      <span className="sr-only">Close sidebar</span>
                      <XMarkIcon
                        aria-hidden="true"
                        className="h-6 w-6 text-white"
                      />
                    </button>
                  </div>
                </Transition.Child>

                <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gray-900 px-6 pb-2 ring-1 ring-white/10">
                  <div className="flex h-16 shrink-0 items-center">
                    <img
                      alt="Your Company"
                      className="h-8 w-auto"
                      src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=500"
                    />
                  </div>
                  <nav className="flex flex-1 flex-col">
                    <ul className="-mx-2 flex-1 space-y-1">
                      {navigation.map((item) => (
                        <li key={item.name}>
                          <NavLink
                            className={({ isActive }) =>
                              clsx(
                                "group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6",
                                isActive
                                  ? "bg-gray-800 text-white"
                                  : "text-gray-400 hover:bg-gray-800 hover:text-white",
                              )
                            }
                            to={item.href}
                          >
                            <item.icon
                              aria-hidden="true"
                              className="h-6 w-6 shrink-0"
                            />
                            {item.name}
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  </nav>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:block lg:w-20 lg:overflow-y-auto lg:bg-gray-900 lg:pb-4">
        <div className="flex h-16 shrink-0 items-center justify-center">
          <img
            alt="Your Company"
            className="h-8 w-auto"
            src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=500"
          />
        </div>
        <nav className="mt-8">
          <ul className="flex flex-col items-center space-y-1">
            {navigation.map((item) => (
              <li key={item.name}>
                <NavLink
                  className={({ isActive }) =>
                    clsx(
                      "group flex gap-x-3 rounded-md p-3 text-sm font-semibold leading-6",
                      isActive
                        ? "bg-gray-800 text-white"
                        : "text-gray-400 hover:bg-gray-800 hover:text-white",
                    )
                  }
                  to={item.href}
                >
                  <item.icon aria-hidden="true" className="h-6 w-6 shrink-0" />
                  <span className="sr-only">{item.name}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="lg:pl-20">
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
            onClick={() => {
              setSidebarOpen(true)
            }}
            type="button"
          >
            <span className="sr-only">Open sidebar</span>
            <Bars3Icon aria-hidden="true" className="h-6 w-6" />
          </button>

          {/* Separator */}
          <div
            aria-hidden="true"
            className="h-6 w-px bg-gray-900/10 lg:hidden"
          />

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            {showSearch ? (
              <Form action="#" className="relative flex flex-1" method="GET">
                <label className="sr-only" htmlFor="search-field">
                  Search
                </label>
                <MagnifyingGlassIcon
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-gray-400"
                />
                <input
                  className="block h-full w-full border-0 py-0 pl-8 pr-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm"
                  id="search-field"
                  name="search"
                  onChange={(event) => {
                    submit(event.target.form, {
                      debounceTimeout: 500,
                    })
                  }}
                  placeholder="Search..."
                  type="search"
                />
              </Form>
            ) : (
              <div className="flex flex-1" />
            )}
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              {/* Separator */}
              <div
                aria-hidden="true"
                className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-900/10"
              />

              <Menu as="div" className="relative">
                <Menu.Button className="-m-1.5 flex items-center p-1.5">
                  <span className="sr-only">Open user menu</span>
                  <img
                    alt=""
                    className="h-8 w-8 rounded-full bg-gray-50"
                    src={
                      "https://source.boringavatars.com/pixel/32/" +
                      encodeURIComponent(user.id)
                    }
                  />
                  <span className="hidden lg:flex lg:items-center">
                    <span
                      aria-hidden="true"
                      className="ml-4 text-sm font-semibold leading-6 text-gray-900"
                    >
                      {user.email}
                    </span>
                    <ChevronDownIcon
                      aria-hidden="true"
                      className="ml-2 h-5 w-5 text-gray-400"
                    />
                  </span>
                </Menu.Button>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 z-10 mt-2.5 w-32 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 focus:outline-none">
                    {userNavigation.map((item) => (
                      <Menu.Item key={item.name}>
                        <Link
                          className="ui-active:bg-gray-50 block px-3 py-1 text-sm leading-6 text-gray-900"
                          to={item.href}
                        >
                          {item.name}
                        </Link>
                      </Menu.Item>
                    ))}
                  </Menu.Items>
                </Transition>
              </Menu>
            </div>
          </div>
        </div>

        <main className="px-4 py-10 sm:px-6 lg:px-10 lg:py-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
