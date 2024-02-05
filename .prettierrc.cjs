/** @type {import("prettier").Config} */
module.exports = {
  importOrder: ["<THIRD_PARTY_MODULES>", "^[~/]", "^[./]"],
  importOrderSeparation: true,
  plugins: [
    "@trivago/prettier-plugin-sort-imports",
    "prettier-plugin-tailwindcss",
  ],
  semi: false,
}
