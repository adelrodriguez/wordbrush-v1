import { Link, Outlet } from "@remix-run/react"

export default function Route() {
  return (
    <>
      <div className="flex min-h-full flex-1">
        <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
          <div className="mx-auto w-full max-w-sm lg:w-96">
            <div className="mb-5">
              <Link to="/">
                <img
                  alt="Your Company"
                  className="h-48 w-auto"
                  src="/assets/images/logo.png"
                />
              </Link>
              <h2 className="mt-2 text-2xl font-black leading-9 tracking-tight text-gray-900">
                Sign in to your account
              </h2>
            </div>

            <Outlet />
          </div>
        </div>
        <div className="relative hidden w-0 flex-1 lg:block">
          <img
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-bottom"
            src="/assets/images/flowers.webp"
          />
        </div>
      </div>
    </>
  )
}
