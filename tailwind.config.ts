import FormsPlugin from "@tailwindcss/forms"
import type { Config } from "tailwindcss"

export default {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  plugins: [FormsPlugin],
  theme: {
    extend: {},
  },
} satisfies Config
