import { Category, PrismaClient } from "@prisma/client"
import fs from "node:fs"

const db = new PrismaClient()

async function seed() {
  await Promise.all([createArtStyles(), createProducts()])
}

async function createArtStyles() {
  const styles = JSON.parse(
    fs.readFileSync("./prisma/art-styles.json", "utf-8"),
  ) as {
    name: string
    description: string
    keywords: string[]
    category: string
  }[]

  await db.artStyle.createMany({
    data: styles.map(
      (style: {
        name: string
        description: string
        keywords: string[]
        category: string
      }) => ({
        category: getCategory(style.category),
        description: style.description,
        keywords: style.keywords,
        name: style.name,
        prompt: style.name,
      }),
    ),
  })
}

async function createProducts() {
  await db.product.createMany({
    data: [
      {
        creditAmount: 20,
        description: "$0.25 per credit",
        externalId: "191412",
        name: "20 credits",
        price: 5,
      },
      {
        creditAmount: 50,
        description: "$0.20 per credit",
        externalId: "191415",
        name: "50 credits",
        price: 10,
      },
      {
        creditAmount: 120,
        description: "$0.16 per credit",
        externalId: "191942",
        name: "120 credits",
        price: 20,
      },
      {
        creditAmount: 1000,
        description: "$0.05 per credit",
        externalId: "191944",
        name: "1000 credits",
        price: 50,
      },
    ],
  })
}

function getCategory(category: string): Category | null {
  switch (category) {
    case "Abstract":
      return Category.Abstract
    case "Digital":
      return Category.Digital
    case "Fantasy":
      return Category.Fantasy
    case "Geometric":
      return Category.Geometric
    case "Historical":
      return Category.Historical
    case "Illustrative":
      return Category.Illustrative
    case "Modern":
      return Category.Modern
    case "Nature":
      return Category.Nature
    case "SciFi":
      return Category.SciFi
    case "Technological":
      return Category.Technological
    case "Traditional":
      return Category.Traditional
    default:
      return null // Return undefined for invalid strings
  }
}

void seed()
