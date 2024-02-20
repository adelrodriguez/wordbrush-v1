import { getFormProps, getInputProps, useForm } from "@conform-to/react"
import { parseWithZod } from "@conform-to/zod"
import { RadioGroup } from "@headlessui/react"
import { Button } from "@nextui-org/react"
import { ActionFunctionArgs, json, redirect } from "@remix-run/node"
import { Form, useLoaderData, useNavigation } from "@remix-run/react"
import { posthog } from "posthog-js"
import { z } from "zod"

import db from "~/modules/db.server"
import { notFound } from "~/utils/http.server"

const schema = z.object({
  productId: z.string(),
})

export async function loader() {
  const products = await db.product.findMany({
    orderBy: { price: "asc" },
    where: { checkoutUrl: { not: null } },
  })

  return json({ products })
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  const submission = parseWithZod(formData, { schema })

  if (submission.status !== "success") {
    return json(submission.reply())
  }

  const product = await db.product.findUnique({
    where: { id: submission.value.productId },
  })

  if (!product?.checkoutUrl) {
    return notFound({
      message: "The product you requested is not available.",
      title: "Product not found",
    })
  }

  return redirect(product.checkoutUrl)
}

export default function Route() {
  const { products } = useLoaderData<typeof loader>()
  const [form, fields] = useForm({
    defaultValue: { productId: products[0]?.id },
    onValidate: ({ formData }) => parseWithZod(formData, { schema }),
  })
  const navigation = useNavigation()
  const isSubmitting = navigation.state === "submitting"

  return (
    <div className="px-6 py-24 sm:py-32 lg:px-8">
      <div className="mx-auto mb-20 max-w-2xl text-center lg:max-w-4xl">
        <h2 className="text-5xl font-black tracking-tight text-gray-900">
          Start creating today
        </h2>
        <h3 className="mt-4 text-2xl font-light text-gray-600">
          Start with free 5 credits — no credit card required. Then buy more as
          you go.
        </h3>
      </div>

      <Form
        {...getFormProps(form)}
        className="mx-auto flex max-w-2xl flex-col gap-y-6"
        method="POST"
      >
        <RadioGroup {...getInputProps(fields.productId, { type: "text" })}>
          <RadioGroup.Label className="sr-only">Server size</RadioGroup.Label>
          <div className="space-y-4">
            {products.map((product) => (
              <RadioGroup.Option
                className="relative flex cursor-pointer items-center justify-between rounded-lg border border-gray-300 bg-white px-6 py-4 shadow-sm focus:outline-none ui-active:border-gray-600 ui-active:ring-2 ui-active:ring-gray-600"
                key={product.id}
                onClick={() => {
                  posthog.capture("select_product", { productId: product.id })
                }}
                value={product.id}
              >
                <span className="flex items-center">
                  <span className="flex flex-col">
                    <RadioGroup.Label
                      as="span"
                      className="font-medium text-gray-900"
                    >
                      {product.name}
                    </RadioGroup.Label>
                    <RadioGroup.Description as="span" className="text-gray-500">
                      <span className="block text-xs sm:inline">
                        {product.description}
                      </span>{" "}
                    </RadioGroup.Description>
                  </span>
                </span>
                <RadioGroup.Description as="span" className="text-sm">
                  <span className="text-lg font-medium text-gray-900">
                    ${product.price}
                  </span>
                </RadioGroup.Description>
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -inset-px rounded-lg border-2 border-transparent ui-checked:border-gray-600 ui-active:border"
                />
              </RadioGroup.Option>
            ))}
          </div>
        </RadioGroup>
        <Button
          className="background-animated font-semibold text-white shadow-xl transition-all duration-500 hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
          disabled={isSubmitting}
          fullWidth
          isLoading={isSubmitting}
          size="lg"
          type="submit"
        >
          {isSubmitting ? "Processing..." : "Buy credits"}
        </Button>
      </Form>
    </div>
  )
}
