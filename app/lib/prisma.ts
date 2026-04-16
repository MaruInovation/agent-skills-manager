import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error("DATABASE_URL 未设置");
}

const prismaClient = new PrismaClient({
    adapter: new PrismaMariaDb(connectionString),
});

const globalForPrisma = globalThis as typeof globalThis & {
    prisma?: typeof prismaClient;
};

export const prisma = globalForPrisma.prisma ?? prismaClient;

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
}

export default prisma;
