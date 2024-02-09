import HeadlessUIPlugin from "@headlessui/tailwindcss"
import FormsPlugin from "@tailwindcss/forms"
import type { Config } from "tailwindcss"

export default {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  plugins: [FormsPlugin, HeadlessUIPlugin({ prefix: "ui" })],
  theme: {
    extend: {},
  },
} satisfies Config
