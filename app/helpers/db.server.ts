import { remember } from "@epic-web/remember"
import { PrismaClient } from "@prisma/client"

const db = remember("prisma", () => new PrismaClient())

export default db
