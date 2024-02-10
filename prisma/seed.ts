import { Category, PrismaClient } from "@prisma/client"
import fs from "node:fs"

import { hashPassword } from "~/utils/auth.server"

const db = new PrismaClient()

async function seed() {
  await Promise.all([generateUsers(), generateArtStyles()])
}

async function generateUsers() {
  await db.user.create({
    data: {
      email: "hello@adelrodriguez.com",
      password: {
        create: {
          hash: await hashPassword("password"),
        },
      },
    },
  })
}

async function generateArtStyles() {
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
