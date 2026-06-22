import { Pool } from "pg"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../generated/prisma/client"
import { DATABASE_URL } from "./env"

const globalForPrisma = global as unknown as {
    prisma: PrismaClient
}

const pool = new Pool({
    connectionString: DATABASE_URL,
    max: 15,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 15000,
})

const prisma = globalForPrisma.prisma || new PrismaClient({
    adapter: new PrismaPg(pool),
})

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

export default prisma
