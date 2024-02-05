import { PrismaClient } from "@prisma/client"
import bcrypt from "bcrypt"

const db = new PrismaClient()

async function seed() {
  await db.user.create({
    data: {
      email: "hello@adelrodriguez.com",
      password: {
        create: {
          hash: await bcrypt.hash("password", 10),
        },
      },
      projects: {
        create: {
          name: "My first project",
        },
      },
    },
  })
}

void seed()
