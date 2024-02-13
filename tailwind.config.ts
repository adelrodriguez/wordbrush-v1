import HeadlessUIPlugin from "@headlessui/tailwindcss"
import { nextui } from "@nextui-org/react"
import FormsPlugin from "@tailwindcss/forms"
import type { Config } from "tailwindcss"

export default {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  plugins: [
    FormsPlugin({ strategy: "class" }),
    HeadlessUIPlugin({ prefix: "ui" }),
    nextui(),
  ],
  theme: {
    extend: {},
  },
} satisfies Config
